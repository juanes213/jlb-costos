
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
  logout: () => Promise<void>;
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
  "cfinanciero@jorgebedoya.com": {password: "cfinanciero453", role: "admin"}
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
          console.log("Found Supabase session:", session.user.id);
          
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
            console.log("User profile loaded from Supabase:", profile);
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
            console.log("User loaded from localStorage:", parsedUser);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("user");
          console.log("User signed out, cleared state and localStorage");
        } else if (event === 'SIGNED_IN' && session) {
          try {
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
              console.log("User signed in, profile loaded:", profile);
            }
          } catch (error) {
            console.error("Error loading profile after sign in:", error);
          }
        }
      }
    );
    
    checkSession();
    
    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
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
        
        // For mock users, we'll skip creating profiles in Supabase
        // This avoids the type mismatch between string emails and bigint IDs
        console.log("Using mock user without creating Supabase profile:", lowercaseUsername);
      } else if (data.user) {
        // Supabase login successful
        console.log("Supabase login successful:", data.user.id);
        
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
          
          const { error: insertError } = await supabase.from('profiles').insert(newProfile);
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
          } else {
            console.log("New profile created:", newProfile);
            setUser(newProfile);
          }
        } else {
          console.log("Existing profile loaded:", profile);
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
      
      // First, clear local state before attempting Supabase signout
      // This ensures the UI updates even if there's an issue with Supabase
      setUser(null);
      localStorage.removeItem("user");
      
      // Try to sign out from Supabase (but don't wait for it to complete)
      supabase.auth.signOut().then(({ error }) => {
        if (error) {
          console.error("Error signing out from Supabase:", error);
        } else {
          console.log("Successfully signed out from Supabase");
        }
      }).catch(error => {
        console.error("Exception during Supabase signOut:", error);
      });
      
      // Clear any session data that might be cached
      sessionStorage.clear();
      
      console.log("Logout complete, all states cleared");
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
