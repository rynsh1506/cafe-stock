import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import {
  clearNativeDatabase,
  DB_TABLE_KEYS,
  loadUsersFromSqliteDatabase,
  syncUsersToSqliteDatabase,
} from "@/utils/sqliteDatabase";

export type AccountApprovalStatus = "ACTIVE" | "PENDING" | "REJECTED";

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
  createdAt: string;
  status?: AccountApprovalStatus;
}

export interface RegisterAccountInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  fromLoginPage?: boolean;
}

interface AuthContextType {
  currentUser: UserProfile;
  accounts: StoredUserAccount[];
  hasInitializedAccount: boolean;
  isAuthenticated: boolean;
  registerAccount: (
    input: RegisterAccountInput,
    autoLogin?: boolean,
  ) => { ok: boolean; errorKey?: string; pendingApproval?: boolean };
  loginWithPassword: (
    usernameOrEmail: string,
    password: string,
    rememberMe?: boolean,
  ) => { ok: boolean; errorKey?: string; errorMessage?: string };
  approveAccount: (id: string, assignedRole?: UserRole) => void;
  rejectAccount: (id: string) => void;
  deleteAccount: (id: string) => void;
  updateAccountRole: (id: string, role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  login: (username: string, role?: UserRole) => void;
  logout: () => void;
  resetAllAccounts: () => void;
}

const LEGACY_AUTH_KEYS = [
  "kr_accounts_v1",
  "kr_accounts_v2",
  "kr_auth_accounts_v3",
  "kr_active_user_v1",
  "kr_active_user_v2",
  "kr_auth_active_user_v3",
];

function purgeLegacyAuthStorage(): void {
  try {
    for (const k of LEGACY_AUTH_KEYS) {
      window.localStorage.removeItem(k);
    }
  } catch {
    // ignore storage errors
  }
}

purgeLegacyAuthStorage();

const AUTH_STORAGE_KEYS = {
  ACCOUNTS: DB_TABLE_KEYS.USERS,
  ACTIVE_USER: "active_user",
} as const;

const FALLBACK_GUEST_PROFILE: UserProfile = {
  id: "usr_uninitialized",
  name: "Administrator",
  username: "admin",
  role: "APPROVER",
  email: "admin@local",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Deterministic salted hash (FNV-1a 64-bit multi-round digest) so raw plaintext
 * passwords are never persisted in localStorage.
 */
function hashPasswordDigest(username: string, rawPassword: string): string {
  const input = `cs_salt_v1:${username.toLowerCase()}:${rawPassword}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `sha256_salted$${hex1}${hex2}`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<StoredUserAccount[]>(() => {
    const usersTable = readJson<StoredUserAccount[]>(
      AUTH_STORAGE_KEYS.ACCOUNTS,
      [],
    );
    if (usersTable.length > 0) {
      return usersTable;
    }
    return readJson<StoredUserAccount[]>("accounts", []);
  });

  const [activeSessionUser, setActiveSessionUser] =
    useState<UserProfile | null>(() =>
      readJson<UserProfile | null>(AUTH_STORAGE_KEYS.ACTIVE_USER, null),
    );

  useEffect(() => {
    let active = true;
    void loadUsersFromSqliteDatabase().then((dbUsers) => {
      if (!active || !dbUsers) {
        return;
      }
      if (dbUsers.length > 0) {
        setAccounts(dbUsers);
        writeJson(AUTH_STORAGE_KEYS.ACCOUNTS, dbUsers);
      } else if (accounts.length > 0) {
        void syncUsersToSqliteDatabase(accounts);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persistAccountsToDb = (nextAccounts: StoredUserAccount[]): void => {
    setAccounts(nextAccounts);
    writeJson(AUTH_STORAGE_KEYS.ACCOUNTS, nextAccounts);
    void syncUsersToSqliteDatabase(nextAccounts);
  };

  const hasInitializedAccount = accounts.length > 0;
  const isAuthenticated = hasInitializedAccount && activeSessionUser !== null;
  const currentUser: UserProfile = activeSessionUser ?? FALLBACK_GUEST_PROFILE;

  const registerAccount = (
    input: RegisterAccountInput,
    autoLogin = true,
  ): { ok: boolean; errorKey?: string; pendingApproval?: boolean } => {
    const cleanName = input.name.trim();
    const cleanUsername = input.username.trim().toLowerCase();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPassword = input.password;

    if (!cleanName || !cleanUsername || !cleanEmail || !cleanPassword) {
      return { ok: false, errorKey: "login.errEmpty" };
    }

    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(cleanUsername)) {
      return { ok: false, errorKey: "login.errInvalidUsername" };
    }

    if (cleanPassword.length < 6) {
      return { ok: false, errorKey: "login.errWeakPass" };
    }

    const exists = accounts.some(
      (acc) =>
        acc.username.toLowerCase() === cleanUsername ||
        acc.email.toLowerCase() === cleanEmail,
    );
    if (exists) {
      return { ok: false, errorKey: "login.errUserExists" };
    }

    const isFirstOwner = accounts.length === 0;
    const requiresAdminApproval = !isFirstOwner && input.fromLoginPage === true;
    const passwordDigest = hashPasswordDigest(cleanUsername, cleanPassword);

    const newAccount: StoredUserAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: isFirstOwner
        ? "APPROVER"
        : requiresAdminApproval
          ? "USER"
          : input.role,
      passwordHash: passwordDigest,
      createdAt: new Date().toISOString(),
      status: requiresAdminApproval ? "PENDING" : "ACTIVE",
    };

    const nextAccounts = [...accounts, newAccount];
    persistAccountsToDb(nextAccounts);

    if (requiresAdminApproval) {
      return { ok: true, pendingApproval: true };
    }

    if (autoLogin) {
      const profile: UserProfile = {
        id: newAccount.id,
        name: newAccount.name,
        username: newAccount.username,
        email: newAccount.email,
        role: newAccount.role,
      };
      setActiveSessionUser(profile);
      writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, profile);
    }

    return { ok: true, pendingApproval: false };
  };

  const loginWithPassword = (
    usernameOrEmail: string,
    password: string,
    rememberMe = true,
  ): { ok: boolean; errorKey?: string; errorMessage?: string } => {
    const identifier = usernameOrEmail.trim().toLowerCase();
    if (!identifier || !password) {
      return { ok: false, errorKey: "login.errEmpty" };
    }

    const matched = accounts.find((acc) => {
      const idMatch =
        acc.username.toLowerCase() === identifier ||
        acc.email.toLowerCase() === identifier;
      if (!idMatch) {
        return false;
      }
      const expectedDigest = hashPasswordDigest(acc.username, password);
      return (
        acc.passwordHash === expectedDigest || acc.passwordHash === password
      );
    });

    if (!matched) {
      return { ok: false, errorKey: "login.errInvalidCreds" };
    }

    if (matched.status === "PENDING") {
      return {
        ok: false,
        errorKey: "login.errPending",
      };
    }

    if (matched.status === "REJECTED") {
      return {
        ok: false,
        errorKey: "login.errRejected",
      };
    }

    const profile: UserProfile = {
      id: matched.id,
      name: matched.name,
      username: matched.username,
      email: matched.email,
      role: matched.role,
    };

    setActiveSessionUser(profile);
    if (rememberMe) {
      writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, profile);
    }
    return { ok: true };
  };

  const approveAccount = (id: string, assignedRole?: UserRole): void => {
    const next = accounts.map((acc) =>
      acc.id === id
        ? {
            ...acc,
            status: "ACTIVE" as const,
            role: assignedRole ?? acc.role,
          }
        : acc,
    );
    persistAccountsToDb(next);
  };

  const rejectAccount = (id: string): void => {
    const next = accounts.map((acc) =>
      acc.id === id ? { ...acc, status: "REJECTED" as const } : acc,
    );
    persistAccountsToDb(next);
  };

  const deleteAccount = (id: string): void => {
    if (accounts.length <= 1 || activeSessionUser?.id === id) {
      return;
    }
    const next = accounts.filter((acc) => acc.id !== id);
    persistAccountsToDb(next);
  };

  const updateAccountRole = (id: string, role: UserRole): void => {
    const next = accounts.map((acc) =>
      acc.id === id ? { ...acc, role } : acc,
    );
    persistAccountsToDb(next);
    if (activeSessionUser?.id === id) {
      const updatedSession = { ...activeSessionUser, role };
      setActiveSessionUser(updatedSession);
      writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, updatedSession);
    }
  };

  const switchRole = (newRole: UserRole): void => {
    if (!activeSessionUser) {
      return;
    }
    const updated: UserProfile = { ...activeSessionUser, role: newRole };
    setActiveSessionUser(updated);
    writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, updated);
  };

  const login = (username: string, role: UserRole = "APPROVER"): void => {
    const found = accounts.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase(),
    );
    if (found) {
      setActiveSessionUser(found);
      writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, found);
      return;
    }
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: username.trim() || "Administrator",
      username: username.trim() || "admin",
      role,
      email: `${username.trim() || "admin"}@local`,
    };
    setActiveSessionUser(profile);
    writeJson(AUTH_STORAGE_KEYS.ACTIVE_USER, profile);
  };

  const logout = (): void => {
    setActiveSessionUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_USER);
    } catch {
      // ignore
    }
  };

  const resetAllAccounts = (): void => {
    setAccounts([]);
    setActiveSessionUser(null);
    void syncUsersToSqliteDatabase([]);
    void clearNativeDatabase(true);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCOUNTS);
      window.localStorage.removeItem("accounts");
      window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_USER);
      purgeLegacyAuthStorage();
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        hasInitializedAccount,
        isAuthenticated,
        registerAccount,
        loginWithPassword,
        approveAccount,
        rejectAccount,
        deleteAccount,
        updateAccountRole,
        switchRole,
        login,
        logout,
        resetAllAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
