export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      games: {
        Row: {
          clip_archive_status: Database["public"]["Enums"]["approval_status"]
          created_at: string
          genres: string[]
          guideline_scope: Database["public"]["Enums"]["guideline_scope"]
          header_image_url: string | null
          id: string
          last_verified_at: string | null
          monetization_status: Database["public"]["Enums"]["approval_status"]
          music_restriction: Database["public"]["Enums"]["music_status"]
          notes: string | null
          prior_application: Database["public"]["Enums"]["application_status"]
          published: boolean
          publisher_id: string
          release_date: string | null
          slug: string
          spoiler_restriction: Database["public"]["Enums"]["spoiler_status"]
          steam_app_id: number | null
          streaming_status: Database["public"]["Enums"]["approval_status"]
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          clip_archive_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
          genres?: string[]
          guideline_scope?: Database["public"]["Enums"]["guideline_scope"]
          header_image_url?: string | null
          id?: string
          last_verified_at?: string | null
          monetization_status?: Database["public"]["Enums"]["approval_status"]
          music_restriction?: Database["public"]["Enums"]["music_status"]
          notes?: string | null
          prior_application?: Database["public"]["Enums"]["application_status"]
          published?: boolean
          publisher_id: string
          release_date?: string | null
          slug: string
          spoiler_restriction?: Database["public"]["Enums"]["spoiler_status"]
          steam_app_id?: number | null
          streaming_status?: Database["public"]["Enums"]["approval_status"]
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          clip_archive_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
          genres?: string[]
          guideline_scope?: Database["public"]["Enums"]["guideline_scope"]
          header_image_url?: string | null
          id?: string
          last_verified_at?: string | null
          monetization_status?: Database["public"]["Enums"]["approval_status"]
          music_restriction?: Database["public"]["Enums"]["music_status"]
          notes?: string | null
          prior_application?: Database["public"]["Enums"]["application_status"]
          published?: boolean
          publisher_id?: string
          release_date?: string | null
          slug?: string
          spoiler_restriction?: Database["public"]["Enums"]["spoiler_status"]
          steam_app_id?: number | null
          streaming_status?: Database["public"]["Enums"]["approval_status"]
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      publishers: {
        Row: {
          created_at: string
          default_monetization_status:
            | Database["public"]["Enums"]["approval_status"]
            | null
          default_streaming_status:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guideline_summary: string | null
          guideline_url: string | null
          id: string
          name: string
          name_en: string | null
          official_site_url: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_monetization_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          default_streaming_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guideline_summary?: string | null
          guideline_url?: string | null
          id?: string
          name: string
          name_en?: string | null
          official_site_url?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_monetization_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          default_streaming_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          guideline_summary?: string | null
          guideline_url?: string | null
          id?: string
          name?: string
          name_en?: string | null
          official_site_url?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          game_id: string
          id: string
          label: string | null
          noted_at: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          url: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          label?: string | null
          noted_at?: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          url: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          label?: string | null
          noted_at?: string | null
          source_type?: Database["public"]["Enums"]["source_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
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
      application_status: "not_required" | "required" | "unknown"
      approval_status: "allowed" | "conditional" | "prohibited" | "unknown"
      guideline_scope: "publisher_wide" | "title_specific"
      music_status: "ok" | "partial_mute" | "restricted" | "unknown"
      source_type: "guideline" | "eula" | "faq" | "dev_statement" | "other"
      spoiler_status: "none" | "restricted" | "unknown"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["not_required", "required", "unknown"],
      approval_status: ["allowed", "conditional", "prohibited", "unknown"],
      guideline_scope: ["publisher_wide", "title_specific"],
      music_status: ["ok", "partial_mute", "restricted", "unknown"],
      source_type: ["guideline", "eula", "faq", "dev_statement", "other"],
      spoiler_status: ["none", "restricted", "unknown"],
    },
  },
} as const
