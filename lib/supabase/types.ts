export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          asset_type: string
          case_id: string
          created_at: string | null
          estimated_value: number | null
          id: string
          institution: string | null
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          case_id: string
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          institution?: string | null
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          case_id?: string
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          institution?: string | null
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_members: {
        Row: {
          case_id: string
          id: string
          invite_token: string | null
          invited_at: string | null
          invited_email: string
          joined_at: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          case_id: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          invited_email: string
          joined_at?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          case_id?: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          invited_email?: string
          joined_at?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_members_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          created_at: string
          death_date: string | null
          debt_concern: boolean
          deceased_name: string | null
          has_life_insurance: boolean
          has_pension: boolean
          has_real_estate: boolean
          has_securities: boolean
          has_will: string
          heir_count: number
          id: string
          mode: string
          updated_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string
          death_date?: string | null
          debt_concern?: boolean
          deceased_name?: string | null
          has_life_insurance?: boolean
          has_pension?: boolean
          has_real_estate?: boolean
          has_securities?: boolean
          has_will?: string
          heir_count?: number
          id?: string
          mode?: string
          updated_at?: string
          user_id: string
          user_role?: string
        }
        Update: {
          created_at?: string
          death_date?: string | null
          debt_concern?: boolean
          deceased_name?: string | null
          has_life_insurance?: boolean
          has_pension?: boolean
          has_real_estate?: boolean
          has_securities?: boolean
          has_will?: string
          heir_count?: number
          id?: string
          mode?: string
          updated_at?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          line_user_id: string | null
          notify_email: boolean
          notify_line: boolean
          plan: string
          premium_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          line_user_id?: string | null
          notify_email?: boolean
          notify_line?: boolean
          plan?: string
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          line_user_id?: string | null
          notify_email?: boolean
          notify_line?: boolean
          plan?: string
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      specialists: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          is_approved: boolean | null
          name: string
          office_name: string | null
          phone: string | null
          prefecture: string
          specialties: string[] | null
          type: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_approved?: boolean | null
          name: string
          office_name?: string | null
          phone?: string | null
          prefecture: string
          specialties?: string[] | null
          type: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_approved?: boolean | null
          name?: string
          office_name?: string | null
          phone?: string | null
          prefecture?: string
          specialties?: string[] | null
          type?: string
          website?: string | null
        }
        Relationships: []
      }
      task_progress: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_progress_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type WillType = "notarized" | "handwritten" | "none" | "unknown";
export type SpecialistType = "lawyer" | "judicial_scrivener" | "tax_accountant" | "social_insurance_labor_consultant" | "administrative_scrivener" | "other";
export type PlanType = "free" | "premium";
export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";
