import React, { createContext, useContext, useState } from "react";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (username: string, role?: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  USER: {
    id: "usr_001",
    name: "Muhammad Riyansyah",
    username: "user_procurement",
    role: "USER",
    email: "riyansyah@cafestock.local",
  },
  APPROVER: {
    id: "usr_002",
    name: "Riko Toni (Manager)",
    username: "approver_manager",
    role: "APPROVER",
    email: "riko.toni@cafestock.local",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    DEFAULT_USERS.USER,
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const switchRole = (newRole: UserRole): void => {
    setCurrentUser(DEFAULT_USERS[newRole]);
  };

  const login = (username: string, role: UserRole = "USER"): void => {
    setCurrentUser({
      ...DEFAULT_USERS[role],
      username: username || DEFAULT_USERS[role].username,
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
