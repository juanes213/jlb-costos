
import { User as SupabaseUser } from "@supabase/supabase-js";

export type User = {
  username: string;
  role: "admin" | "storage" | "visits" | "projects";
  id: string;
} | null;

export type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

// Mock users for fallback authentication
export const MOCK_USERS: Record<string, { password: string; role: "admin" | "storage" | "visits" | "projects" }> = {
  "admin": { password: "admin123", role: "admin" },
  "gerenteadm@jorgebedoya.com": { password: "juan02isa08", role: "admin" },
  "gerenciacomercial@jorgebedoya.com": { password: "Valentino280606", role: "admin" },
  "adminjlb2002": { password: "adminjlb2002", role: "admin" },
  "doperaciones@jorgebedoya.com": {password: "Dojlb2025", role: "admin"},
  "cfinanciero@jorgebedoya.com": {password: "cfinanciero453", role: "admin"},
  "cps@jorgebedoya.com": {password: "chg1234567", role: "admin"}
};
