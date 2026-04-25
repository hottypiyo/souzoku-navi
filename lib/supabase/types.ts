export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WillType = "none" | "notarized" | "handwritten" | "unknown";
export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PlanType = "free" | "premium";
export type SpecialistType = "tax_accountant" | "judicial_scrivener" | "administrative_scrivener" | "lawyer";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          plan: string;
          premium_expires_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          line_user_id: string | null;
          notify_email: boolean;
          notify_line: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          plan?: string;
          premium_expires_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          line_user_id?: string | null;
          notify_email?: boolean;
          notify_line?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          plan?: string;
          premium_expires_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          line_user_id?: string | null;
          notify_email?: boolean;
          notify_line?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          mode: string;
          user_role: string;
          deceased_name: string | null;
          death_date: string | null;
          has_real_estate: boolean;
          has_will: string;
          heir_count: number;
          debt_concern: boolean;
          has_securities: boolean;
          has_pension: boolean;
          has_life_insurance: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode?: string;
          user_role?: string;
          deceased_name?: string | null;
          death_date?: string | null;
          has_real_estate?: boolean;
          has_will?: string;
          heir_count?: number;
          debt_concern?: boolean;
          has_securities?: boolean;
          has_pension?: boolean;
          has_life_insurance?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: string;
          user_role?: string;
          deceased_name?: string | null;
          death_date?: string | null;
          has_real_estate?: boolean;
          has_will?: string;
          heir_count?: number;
          debt_concern?: boolean;
          has_securities?: boolean;
          has_pension?: boolean;
          has_life_insurance?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cases_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      specialists: {
        Row: {
          id: string;
          name: string;
          type: SpecialistType;
          office_name: string | null;
          prefecture: string;
          city: string | null;
          email: string;
          phone: string | null;
          website: string | null;
          specialties: string[] | null;
          bio: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: SpecialistType;
          office_name?: string | null;
          prefecture: string;
          city?: string | null;
          email: string;
          phone?: string | null;
          website?: string | null;
          specialties?: string[] | null;
          bio?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: SpecialistType;
          office_name?: string | null;
          prefecture?: string;
          city?: string | null;
          email?: string;
          phone?: string | null;
          website?: string | null;
          specialties?: string[] | null;
          bio?: string | null;
          is_approved?: boolean;
        };
        Relationships: [];
      };
      task_progress: {
        Row: {
          id: string;
          case_id: string;
          task_id: string;
          status: string;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          task_id: string;
          status?: string;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          task_id?: string;
          status?: string;
          notes?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_progress_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
