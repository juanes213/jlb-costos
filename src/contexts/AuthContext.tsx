
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
const MOCK_USERS = {
  "admin": {password: "admin123", role: "admin" as const},
  "gerenteadm@jorgebedoya.com": { password: "juan20isa08", role: "admin" as const },
  "gerenciacomercial@jorgebedoya.com": { password: "Valentino280606", role: "admin" as const },
  "adminjlb2002": {password: "adminjlb2025", role: "admin" as const },
  "storage@outlook.com": { password: "storage123", role: "storage" as const },
  "storage2@outlook.com": { password: "storage456", role: "storage" as const },
  "visits@outlook.com": { password: "visits123", role: "visits" as const },
  "visits2@outlook.com": { password: "visits456", role: "visits" as const },
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
    const mockUser = MOCK_USERS[username as keyof typeof MOCK_USERS];
    
    if (mockUser && mockUser.password === password) {
      const user = { username, role: mockUser.role };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      throw new Error("Invalid credentials");
    }
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
