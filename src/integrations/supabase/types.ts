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
      keepa_daily_stats: {
        Row: {
          alert_level: string
          created_at: string
          date: string
          total_cache_hits: number
          total_real_calls: number
          total_tokens_consumed: number
          unique_users: number
        }
        Insert: {
          alert_level?: string
          created_at?: string
          date: string
          total_cache_hits?: number
          total_real_calls?: number
          total_tokens_consumed?: number
          unique_users?: number
        }
        Update: {
          alert_level?: string
          created_at?: string
          date?: string
          total_cache_hits?: number
          total_real_calls?: number
          total_tokens_consumed?: number
          unique_users?: number
        }
        Relationships: []
      }
      keepa_product_cache: {
        Row: {
          access_count: number
          asin: string
          bsr_cached_at: string | null
          bsr_data: Json | null
          catalog_cached_at: string | null
          catalog_data: Json | null
          created_at: string
          history_cached_at: string | null
          history_data: Json | null
          last_accessed_at: string
          marketplace: string
          price_cached_at: string | null
          price_data: Json | null
          tokens_total_saved: number
          updated_at: string
        }
        Insert: {
          access_count?: number
          asin: string
          bsr_cached_at?: string | null
          bsr_data?: Json | null
          catalog_cached_at?: string | null
          catalog_data?: Json | null
          created_at?: string
          history_cached_at?: string | null
          history_data?: Json | null
          last_accessed_at?: string
          marketplace?: string
          price_cached_at?: string | null
          price_data?: Json | null
          tokens_total_saved?: number
          updated_at?: string
        }
        Update: {
          access_count?: number
          asin?: string
          bsr_cached_at?: string | null
          bsr_data?: Json | null
          catalog_cached_at?: string | null
          catalog_data?: Json | null
          created_at?: string
          history_cached_at?: string | null
          history_data?: Json | null
          last_accessed_at?: string
          marketplace?: string
          price_cached_at?: string | null
          price_data?: Json | null
          tokens_total_saved?: number
          updated_at?: string
        }
        Relationships: []
      }
      keepa_token_usage: {
        Row: {
          asin: string
          cache_hit: boolean
          cache_layers_hit: string[] | null
          created_at: string
          endpoint: string | null
          id: string
          marketplace: string
          response_time_ms: number | null
          tokens_consumed: number
          user_id: string | null
        }
        Insert: {
          asin: string
          cache_hit?: boolean
          cache_layers_hit?: string[] | null
          created_at?: string
          endpoint?: string | null
          id?: string
          marketplace?: string
          response_time_ms?: number | null
          tokens_consumed?: number
          user_id?: string | null
        }
        Update: {
          asin?: string
          cache_hit?: boolean
          cache_layers_hit?: string[] | null
          created_at?: string
          endpoint?: string | null
          id?: string
          marketplace?: string
          response_time_ms?: number | null
          tokens_consumed?: number
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          last_active: string | null
          name: string
          plan: string
          status: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id: string
          last_active?: string | null
          name?: string
          plan?: string
          status?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_active?: string | null
          name?: string
          plan?: string
          status?: string
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          backend_keywords: string | null
          bullets: Json | null
          category: string
          created_at: string
          description: string | null
          id: string
          input_data: Json | null
          language: string
          marketplace: string
          product_name: string
          seo_score: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backend_keywords?: string | null
          bullets?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          input_data?: Json | null
          language?: string
          marketplace?: string
          product_name: string
          seo_score?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backend_keywords?: string | null
          bullets?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          input_data?: Json | null
          language?: string
          marketplace?: string
          product_name?: string
          seo_score?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_products: {
        Row: {
          asin: string
          bsr: number | null
          category: string | null
          created_at: string
          current_price: number | null
          id: string
          marketplace: string
          notes: string | null
          opportunity_score: number | null
          title: string
          user_id: string
        }
        Insert: {
          asin: string
          bsr?: number | null
          category?: string | null
          created_at?: string
          current_price?: number | null
          id?: string
          marketplace?: string
          notes?: string | null
          opportunity_score?: number | null
          title?: string
          user_id: string
        }
        Update: {
          asin?: string
          bsr?: number | null
          category?: string | null
          created_at?: string
          current_price?: number | null
          id?: string
          marketplace?: string
          notes?: string | null
          opportunity_score?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_search_quota: {
        Row: {
          cache_hits_today: number
          created_at: string
          last_daily_reset: string
          last_weekly_reset: string
          plan_tier: string
          searches_this_week: number
          searches_today: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_hits_today?: number
          created_at?: string
          last_daily_reset?: string
          last_weekly_reset?: string
          plan_tier?: string
          searches_this_week?: number
          searches_today?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_hits_today?: number
          created_at?: string
          last_daily_reset?: string
          last_weekly_reset?: string
          plan_tier?: string
          searches_this_week?: number
          searches_today?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
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
    Enums: {
      app_role: ["super_admin", "admin", "user"],
    },
  },
} as const
