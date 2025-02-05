
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  username: string;
  role: "admin" | "guest" | "visits";
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extended mock users with different roles
const MOCK_USERS = {
  admin1: { password: "admin123", role: "admin" as const },
  admin2: { password: "admin456", role: "admin" as const },
  admin3: { password: "admin789", role: "admin" as const },
  admin4: { password: "admin321", role: "admin" as const },
  admin5: { password: "admin654", role: "admin" as const },
  storage1: { password: "storage123", role: "guest" as const },
  storage2: { password: "storage456", role: "guest" as const },
  visits: { password: "visits123", role: "visits" as const },
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
