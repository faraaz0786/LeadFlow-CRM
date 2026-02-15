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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      email_logs: {
        Row: {
          body: string | null
          id: string
          lead_id: string | null
          sent_at: string | null
          sent_by: string | null
          template_id: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          template_id?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string | null
          id: string
          name: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          name?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          name?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lead_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_followups: {
        Row: {
          created_at: string | null
          created_by: string | null
          followup_at: string
          id: string
          lead_id: string | null
          note: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          followup_at: string
          id?: string
          lead_id?: string | null
          note?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          followup_at?: string
          id?: string
          lead_id?: string | null
          note?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_followups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          id: string
          lead_id: string | null
          tag: string | null
        }
        Insert: {
          id?: string
          lead_id?: string | null
          tag?: string | null
        }
        Update: {
          id?: string
          lead_id?: string | null
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_score: number | null
          ai_score_reason: string | null
          assigned_rep_id: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          expected_value: number | null
          id: string
          location: string | null
          name: string
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_score?: number | null
          ai_score_reason?: string | null
          assigned_rep_id?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expected_value?: number | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_score?: number | null
          ai_score_reason?: string | null
          assigned_rep_id?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expected_value?: number | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_rep_id_fkey"
            columns: ["assigned_rep_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          id: string
          name: string
          stage_order: number
        }
        Insert: {
          id?: string
          name: string
          stage_order: number
        }
        Update: {
          id?: string
          name?: string
          stage_order?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
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
