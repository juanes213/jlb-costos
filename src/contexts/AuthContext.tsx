
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  username: string;
  role: "admin" | "storage" | "visits" | "projects";
  id: string;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users with different roles for fallback authentication
const MOCK_USERS: Record<string, { password: string; role: "admin" | "storage" | "visits" | "projects" }> = {
  "admin": { password: "admin123", role: "admin" },
  "gerenteadm@jorgebedoya.com": { password: "juan02isa08", role: "admin" },
  "gerenciacomercial@jorgebedoya.com": { password: "Valentino280606", role: "admin" },
  "adminjlb2002": { password: "adminjlb2002", role: "admin" },
  "doperaciones@jorgebedoya.com": {password: "Dojlb2025", role: "admin"},
  "cfinanciero@jorgebedoya.com": {password: "cfinanciero453", role: "projects"}
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Check if user exists in Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.username,
              role: profile.role
            });
          }
        } else {
          // Fall back to localStorage if no Supabase session
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              ...parsedUser,
              id: parsedUser.username // Using username as ID for localStorage users
            });
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const lowercaseUsername = username.toLowerCase();
      
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lowercaseUsername,
        password: password
      });
      
      if (error) {
        // If Supabase login fails, try mock users (fallback)
        console.log("Supabase login failed, trying mock users:", error.message);
        
        const mockUser = MOCK_USERS[lowercaseUsername];
        if (!mockUser) {
          console.log("User not found:", lowercaseUsername);
          throw new Error("Invalid credentials");
        }

        if (mockUser.password !== password) {
          console.log("Invalid password for user:", lowercaseUsername);
          throw new Error("Invalid credentials");
        }

        const user = { 
          username: lowercaseUsername, 
          role: mockUser.role,
          id: lowercaseUsername // Using username as ID for mock users
        };
        
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Try to create a profile in Supabase for this mock user
        try {
          await supabase.from('profiles').upsert({
            id: lowercaseUsername,
            username: lowercaseUsername,
            role: mockUser.role,
            created_at: new Date().toISOString()
          });
        } catch (profileError) {
          console.error("Error creating profile for mock user:", profileError);
        }
      } else if (data.user) {
        // Supabase login successful
        // Get user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError || !profile) {
          // Create a profile if it doesn't exist
          // Default to 'projects' role for new Supabase users
          const newProfile = {
            id: data.user.id,
            username: data.user.email || lowercaseUsername,
            role: 'projects' as const,
            created_at: new Date().toISOString()
          };
          
          await supabase.from('profiles').insert(newProfile);
          setUser(newProfile);
        } else {
          setUser({
            id: profile.id,
            username: profile.username,
            role: profile.role
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Clear local state
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
