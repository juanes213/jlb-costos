
import { User as SupabaseUser } from "@supabase/supabase-js";

export type User = {
  username: string;
  id: string;
} | null;

export type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

// Mock users for fallback authentication
export const MOCK_USERS: Record<string, { password: string }> = {
  "admin": { password: "admin123" },
  "gerenteadm@jorgebedoya.com": { password: "juan02isa08" },
  "gerenciacomercial@jorgebedoya.com": { password: "Valentino280606" },
  "adminjlb2002": { password: "adminjlb2002" },
  "doperaciones@jorgebedoya.com": {password: "Dojlb2025"},
  "cfinanciero@jorgebedoya.com": {password: "cfinanciero453"},
  "cps@jorgebedoya.com": {password: "chg1234567"}
};
