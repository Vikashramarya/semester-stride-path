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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      doubt_answers: {
        Row: {
          answer: string
          created_at: string
          doubt_id: string
          id: string
          upvotes: number
          user_id: string
          user_name: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          doubt_id: string
          id?: string
          upvotes?: number
          user_id: string
          user_name?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          doubt_id?: string
          id?: string
          upvotes?: number
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_answers_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_upvotes: {
        Row: {
          answer_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_upvotes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "doubt_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          created_at: string
          id: string
          question: string
          subject: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          subject: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          subject?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      mock_test_results: {
        Row: {
          answers: Json
          created_at: string
          grading: Json | null
          id: string
          scored_marks: number | null
          sections: Json
          subject: string
          time_taken_seconds: number
          total_marks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          grading?: Json | null
          id?: string
          scored_marks?: number | null
          sections: Json
          subject: string
          time_taken_seconds?: number
          total_marks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          grading?: Json | null
          id?: string
          scored_marks?: number | null
          sections?: Json
          subject?: string
          time_taken_seconds?: number
          total_marks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          branch: string | null
          college_name: string | null
          course: string | null
          created_at: string
          display_name: string | null
          exam_date: string | null
          gender: string | null
          id: string
          onboarding_completed: boolean
          semester: number | null
          specialization: string | null
          study_goal_hours: number | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          age?: number | null
          branch?: string | null
          college_name?: string | null
          course?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          gender?: string | null
          id?: string
          onboarding_completed?: boolean
          semester?: number | null
          specialization?: string | null
          study_goal_hours?: number | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          age?: number | null
          branch?: string | null
          college_name?: string | null
          course?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          gender?: string | null
          id?: string
          onboarding_completed?: boolean
          semester?: number | null
          specialization?: string | null
          study_goal_hours?: number | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          session_date: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          session_date?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          session_date?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_completed: boolean
          subject: string
          task_date: string
          topic: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          subject: string
          task_date?: string
          topic: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          subject?: string
          task_date?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          correct_answers: number
          created_at: string
          id: string
          subject: string
          test_type: string
          time_taken_seconds: number
          total_questions: number
          unit_name: string | null
          user_id: string
          weak_topics: string[] | null
        }
        Insert: {
          correct_answers: number
          created_at?: string
          id?: string
          subject: string
          test_type?: string
          time_taken_seconds: number
          total_questions: number
          unit_name?: string | null
          user_id: string
          weak_topics?: string[] | null
        }
        Update: {
          correct_answers?: number
          created_at?: string
          id?: string
          subject?: string
          test_type?: string
          time_taken_seconds?: number
          total_questions?: number
          unit_name?: string | null
          user_id?: string
          weak_topics?: string[] | null
        }
        Relationships: []
      }
      uploaded_notes: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          subject: string
          unit_name: string | null
          uploaded_by_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          subject: string
          unit_name?: string | null
          uploaded_by_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          subject?: string
          unit_name?: string | null
          uploaded_by_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      uploaded_pyqs: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          semester: number
          uploaded_by_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          semester: number
          uploaded_by_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          semester?: number
          uploaded_by_name?: string | null
          user_id?: string
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
