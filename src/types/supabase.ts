
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          role: "admin" | "storage" | "visits" | "projects"
          created_at: string
        }
        Insert: {
          id: string
          username: string
          role: "admin" | "storage" | "visits" | "projects"
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: "admin" | "storage" | "visits" | "projects"
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          numberId: string
          status: "on-hold" | "in-process" | "completed"
          initialDate: string | null
          finalDate: string | null
          income: number
          categories: Json
          observations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          numberId: string
          status: "on-hold" | "in-process" | "completed"
          initialDate?: string | null
          finalDate?: string | null
          income: number
          categories: Json
          observations?: string | null
          created_at?: string
          updated_at: string
        }
        Update: {
          id?: string
          name?: string
          numberId?: string
          status?: "on-hold" | "in-process" | "completed"
          initialDate?: string | null
          finalDate?: string | null
          income?: number
          categories?: Json
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      storage_items: {
        Row: {
          id: string
          categoryname: string
          name: string
          cost: number
          unit: string | null
          ivaamount: number | null
          created_at: string
        }
        Insert: {
          id: string
          categoryname: string
          name: string
          cost: number
          unit?: string | null
          ivaamount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          categoryname?: string
          name?: string
          cost?: number
          unit?: string | null
          ivaamount?: number | null
          created_at?: string
        }
      }
    }
  }
}
