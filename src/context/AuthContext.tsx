import React, { createContext, useContext, useState } from "react";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  currentUser: UserProfile;
  registeredAccounts: UserProfile[];
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (username: string, role?: UserRole) => void;
  logout: () => void;
}

export const REGISTERED_ACCOUNTS: UserProfile[] = [
  {
    id: "usr_001",
    name: "Muhammad Riyansyah",
    username: "user_procurement",
    role: "USER",
    email: "riyansyah@cafestock.local",
  },
  {
    id: "usr_002",
    name: "Riko Toni",
    username: "approver_manager",
    role: "APPROVER",
    email: "riko.toni@cafestock.local",
  },
  {
    id: "usr_003",
    name: "Andika Pratama Nugroho",
    username: "andika_warehouse",
    role: "USER",
    email: "andika@cafestock.local",
  },
  {
    id: "usr_004",
    name: "Darmawan",
    username: "darmawan_inventory",
    role: "USER",
    email: "darmawan@cafestock.local",
  },
  {
    id: "usr_005",
    name: "Reza Adjriel",
    username: "reza_approver",
    role: "APPROVER",
    email: "reza.adjriel@cafestock.local",
  },
];

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  USER: REGISTERED_ACCOUNTS[0],
  APPROVER: REGISTERED_ACCOUNTS[1],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    DEFAULT_USERS.USER,
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const switchRole = (newRole: UserRole): void => {
    setCurrentUser(DEFAULT_USERS[newRole]);
  };

  const login = (username: string, explicitRole?: UserRole): void => {
    const cleanUsername = username.trim().toLowerCase();
    const matchedAccount = REGISTERED_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === cleanUsername,
    );

    if (matchedAccount) {
      setCurrentUser(matchedAccount);
      setIsAuthenticated(true);
      return;
    }

    const inferredRole: UserRole =
      explicitRole ??
      (cleanUsername.includes("approver") ||
      cleanUsername.includes("manager") ||
      cleanUsername.includes("admin")
        ? "APPROVER"
        : "USER");

    setCurrentUser({
      ...DEFAULT_USERS[inferredRole],
      username: username.trim() || DEFAULT_USERS[inferredRole].username,
    });
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registeredAccounts: REGISTERED_ACCOUNTS,
        switchRole,
        isAuthenticated,
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
