import React, { createContext, useContext, useState } from "react";
import { UserProfile, UserRole } from "@/types";

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
  createdAt: string;
}

export interface RegisterAccountInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: UserProfile;
  accounts: StoredUserAccount[];
  hasInitializedAccount: boolean;
  isAuthenticated: boolean;
  registerAccount: (
    input: RegisterAccountInput,
    autoLogin?: boolean,
  ) => { ok: boolean; errorKey?: string };
  loginWithPassword: (
    usernameOrEmail: string,
    password: string,
    rememberMe?: boolean,
  ) => { ok: boolean; errorKey?: string };
  deleteAccount: (id: string) => void;
  updateAccountRole: (id: string, role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  login: (username: string, role?: UserRole) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEYS = {
  ACCOUNTS: "kr_accounts_v2",
  ACTIVE_USER: "kr_active_user_v2",
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<StoredUserAccount[]>(() =>
    readJson<StoredUserAccount[]>(AUTH_STORAGE_KEYS.ACCOUNTS, []),
  );

  const [activeSessionUser, setActiveSessionUser] =
    useState<UserProfile | null>(() =>
      readJson<UserProfile | null>(AUTH_STORAGE_KEYS.ACTIVE_USER, null),
    );

  const hasInitializedAccount = accounts.length > 0;
  const isAuthenticated = hasInitializedAccount && activeSessionUser !== null;
  const currentUser: UserProfile = activeSessionUser ?? FALLBACK_GUEST_PROFILE;

  const registerAccount = (
    input: RegisterAccountInput,
    autoLogin = true,
  ): { ok: boolean; errorKey?: string } => {
    const cleanName = input.name.trim();
    const cleanUsername = input.username.trim().toLowerCase();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPassword = input.password;

    if (!cleanName || !cleanUsername || !cleanEmail || !cleanPassword) {
      return { ok: false, errorKey: "login.errEmpty" };
    }

    const exists = accounts.some(
      (acc) =>
        acc.username.toLowerCase() === cleanUsername ||
        acc.email.toLowerCase() === cleanEmail,
    );
    if (exists) {
      return { ok: false, errorKey: "login.errUserExists" };
    }

    const newAccount: StoredUserAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: input.role,
      passwordHash: cleanPassword,
      createdAt: new Date().toISOString(),
    };

    const nextAccounts = [...accounts, newAccount];
    setAccounts(nextAccounts);
    writeJson(AUTH_STORAGE_KEYS.ACCOUNTS, nextAccounts);

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

    return { ok: true };
  };

  const loginWithPassword = (
    usernameOrEmail: string,
    password: string,
    rememberMe = true,
  ): { ok: boolean; errorKey?: string } => {
    const identifier = usernameOrEmail.trim().toLowerCase();
    if (!identifier || !password) {
      return { ok: false, errorKey: "login.errEmpty" };
    }

    const matched = accounts.find(
      (acc) =>
        (acc.username.toLowerCase() === identifier ||
          acc.email.toLowerCase() === identifier) &&
        acc.passwordHash === password,
    );

    if (!matched) {
      return { ok: false, errorKey: "login.errInvalidCreds" };
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

  const deleteAccount = (id: string): void => {
    if (accounts.length <= 1 || activeSessionUser?.id === id) {
      return;
    }
    const next = accounts.filter((acc) => acc.id !== id);
    setAccounts(next);
    writeJson(AUTH_STORAGE_KEYS.ACCOUNTS, next);
  };

  const updateAccountRole = (id: string, role: UserRole): void => {
    const next = accounts.map((acc) =>
      acc.id === id ? { ...acc, role } : acc,
    );
    setAccounts(next);
    writeJson(AUTH_STORAGE_KEYS.ACCOUNTS, next);
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        hasInitializedAccount,
        isAuthenticated,
        registerAccount,
        loginWithPassword,
        deleteAccount,
        updateAccountRole,
        switchRole,
        login,
        logout,
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
