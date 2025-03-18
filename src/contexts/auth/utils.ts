
import { supabase } from "@/lib/supabase";
import { User, MOCK_USERS } from "./types";

// Helper to check for existing Supabase session
export async function checkSupabaseSession(): Promise<User | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error checking session:", error);
    return null;
  }
  
  if (!session) return null;
  
  console.log("Found Supabase session:", session.user.id);
  
  // Get user profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (!profile) return null;
  
  return {
    id: profile.id,
    username: profile.username,
    role: profile.role
  };
}

// Helper to check for stored session in sessionStorage
export function checkStoredSession(): User | null {
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) return null;
  
  try {
    const parsedUser = JSON.parse(storedUser);
    return {
      ...parsedUser,
      id: parsedUser.username // Using username as ID for localStorage users
    };
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
}

// Helper to validate mock user credentials
export function validateMockUser(username: string, password: string): User | null {
  const lowercaseUsername = username.toLowerCase();
  const mockUser = MOCK_USERS[lowercaseUsername];
  
  if (!mockUser) {
    console.log("User not found:", lowercaseUsername);
    return null;
  }

  if (mockUser.password !== password) {
    console.log("Invalid password for user:", lowercaseUsername);
    return null;
  }

  return { 
    username: lowercaseUsername, 
    role: mockUser.role,
    id: lowercaseUsername // Using username as ID for mock users
  };
}

// Helper to create or get user profile
export async function getOrCreateProfile(user: SupabaseUser, lowercaseUsername: string): Promise<User | null> {
  // Get user profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError || !profile) {
    // Create a profile if it doesn't exist
    // Default to 'projects' role for new Supabase users
    const newProfile = {
      id: user.id,
      username: user.email || lowercaseUsername,
      role: 'projects' as const,
      created_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase.from('profiles').insert(newProfile);
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    } else {
      console.log("New profile created:", newProfile);
      return {
        id: newProfile.id,
        username: newProfile.username,
        role: newProfile.role
      };
    }
  } else {
    console.log("Existing profile loaded:", profile);
    return {
      id: profile.id,
      username: profile.username,
      role: profile.role
    };
  }
}
