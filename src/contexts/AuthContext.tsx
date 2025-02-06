
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  username: string;
  role: "admin" | "storage" | "visits";
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users with different roles
const MOCK_USERS: Record<string, { password: string; role: "admin" | "storage" | "visits" }> = {
  "admin": { password: "admin123", role: "admin" },
  "gerenteadm@jorgebedoya.com": { password: "juan20isa08", role: "admin" },
  "gerenciacomercial@jorgebedoya.com": { password: "Valentino280606", role: "admin" },
  "adminjlb2002": { password: "adminjlb2025", role: "admin" },
  "storage@outlook.com": { password: "storage123", role: "storage" },
  "storage2@outlook.com": { password: "storage456", role: "storage" },
  "visits@outlook.com": { password: "visits123", role: "visits" },
  "visits2@outlook.com": { password: "visits456", role: "visits" }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const lowercaseUsername = username.toLowerCase();
    const mockUser = MOCK_USERS[lowercaseUsername];

    if (!mockUser) {
      console.log("User not found:", lowercaseUsername);
      throw new Error("Invalid credentials");
    }

    if (mockUser.password !== password) {
      console.log("Invalid password for user:", lowercaseUsername);
      throw new Error("Invalid credentials");
    }

    const user = { username: lowercaseUsername, role: mockUser.role };
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
