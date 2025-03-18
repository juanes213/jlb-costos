
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContextType, User } from "./types";
import { 
  checkSupabaseSession, 
  checkStoredSession, 
  validateMockUser, 
  getOrCreateProfile 
} from "./utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and set up beforeunload event
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // First check Supabase
        const supabaseUser = await checkSupabaseSession();
        
        if (supabaseUser) {
          setUser(supabaseUser);
          console.log("User profile loaded from Supabase:", supabaseUser);
        } else {
          // Fall back to sessionStorage if no Supabase session
          const storedUser = checkStoredSession();
          if (storedUser) {
            setUser(storedUser);
            console.log("User loaded from sessionStorage:", storedUser);
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
          sessionStorage.removeItem("user");
          localStorage.removeItem("user");
          console.log("User signed out, cleared state and storage");
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
    
    // Handle page unload (closing tab/browser)
    const handleBeforeUnload = () => {
      console.log("Page is being closed, cleaning up session");
      sessionStorage.removeItem("user");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    checkSession();
    
    // Clean up the listeners when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
        
        const mockUser = validateMockUser(lowercaseUsername, password);
        if (!mockUser) {
          throw new Error("Invalid credentials");
        }

        setUser(mockUser);
        // Store in sessionStorage instead of localStorage
        sessionStorage.setItem("user", JSON.stringify(mockUser));
        
        // For mock users, we'll skip creating profiles in Supabase
        // This avoids the type mismatch between string emails and bigint IDs
        console.log("Using mock user without creating Supabase profile:", lowercaseUsername);
      } else if (data.user) {
        // Supabase login successful
        console.log("Supabase login successful:", data.user.id);
        
        const userProfile = await getOrCreateProfile(data.user, lowercaseUsername);
        if (userProfile) {
          setUser(userProfile);
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
      sessionStorage.removeItem("user");
      
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

export { AuthContext };
