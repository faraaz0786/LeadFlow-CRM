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
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          location: string | null
          source: string | null
          status: string
          assigned_rep_id: string | null
          expected_value: number | null
          ai_score: number | null
          ai_score_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          location?: string | null
          source?: string | null
          status: string
          assigned_rep_id?: string | null
          expected_value?: number | null
          ai_score?: number | null
          ai_score_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          location?: string | null
          source?: string | null
          status?: string
          assigned_rep_id?: string | null
          expected_value?: number | null
          ai_score?: number | null
          ai_score_reason?: string | null
          updated_at?: string | null
        }
      }

      users: {
        Row: {
          id: string
          name: string | null
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          role: string
          created_at?: string
        }
        Update: {
          name?: string | null
          email?: string
          role?: string
        }
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
          name?: string
          stage_order?: number
        }
      }

      lead_followups: {
        Row: {
          id: string
          lead_id: string
          followup_at: string
          status: string
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          followup_at: string
          status: string
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          followup_at?: string
          status?: string
          note?: string | null
        }
      }

      lead_activities: {
        Row: {
          id: string
          lead_id: string
          type: string
          description: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          description: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          type?: string
          description?: string
        }
      }

      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          created_at?: string
        }
        Update: {
          name?: string
          subject?: string
          body?: string
        }
      }
    }

    Views: {}
    Functions: {}
    Enums: {}
  }
}
