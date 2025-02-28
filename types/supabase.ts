export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_chain_action_events: {
        Row: {
          action_type: string
          created_at: string | null
          extra_data: string | null
          from_handle: string | null
          id: string
          main_output: string
          story_context: string | null
          to_handle: string | null
          top_level_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          extra_data?: string | null
          from_handle?: string | null
          id?: string
          main_output: string
          story_context?: string | null
          to_handle?: string | null
          top_level_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          extra_data?: string | null
          from_handle?: string | null
          id?: string
          main_output?: string
          story_context?: string | null
          to_handle?: string | null
          top_level_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_action_events_from_handle"
            columns: ["from_handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
          {
            foreignKeyName: "fk_action_events_to_handle"
            columns: ["to_handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_end_users: {
        Row: {
          address: string
          agentCreated: boolean | null
          created_at: string
          id: number
        }
        Insert: {
          address: string
          agentCreated?: boolean | null
          created_at?: string
          id?: number
        }
        Update: {
          address?: string
          agentCreated?: boolean | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      agent_chain_general_agents: {
        Row: {
          agent_type: string
          background: string | null
          created_at: string | null
          created_by: number | null
          description: string | null
          handle: string
          id: string
          is_public: boolean | null
          name: string
          profile_picture: string | null
          system_prompt: string | null
          traits: Json | null
          twitter_handle: string | null
        }
        Insert: {
          agent_type: string
          background?: string | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          handle: string
          id?: string
          is_public?: boolean | null
          name: string
          profile_picture?: string | null
          system_prompt?: string | null
          traits?: Json | null
          twitter_handle?: string | null
        }
        Update: {
          agent_type?: string
          background?: string | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          handle?: string
          id?: string
          is_public?: boolean | null
          name?: string
          profile_picture?: string | null
          system_prompt?: string | null
          traits?: Json | null
          twitter_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_chain_general_agents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_chain_end_users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_chain_saved_tweets: {
        Row: {
          content: string
          created_at: string | null
          handle: string
          id: string
          posted_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          handle: string
          id: string
          posted_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          handle?: string
          id?: string
          posted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_saved_tweets_handle"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_smol_tweets: {
        Row: {
          action_id: string | null
          action_type: string
          content: string
          created_at: string | null
          handle: string
          id: string
          image_url: string | null
          link: string | null
          link_preview_img_url: string | null
          link_title: string | null
        }
        Insert: {
          action_id?: string | null
          action_type: string
          content: string
          created_at?: string | null
          handle: string
          id?: string
          image_url?: string | null
          link?: string | null
          link_preview_img_url?: string | null
          link_title?: string | null
        }
        Update: {
          action_id?: string | null
          action_type?: string
          content?: string
          created_at?: string | null
          handle?: string
          id?: string
          image_url?: string | null
          link?: string | null
          link_preview_img_url?: string | null
          link_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_smol_tweets_action_id"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_chain_action_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_smol_tweets_handle"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_updates_life_context: {
        Row: {
          action_id: string
          created_at: string | null
          handle: string
          id: string
          new_life_context: string
          previous_life_context: string
          summary_of_the_changes: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          handle: string
          id?: string
          new_life_context: string
          previous_life_context: string
          summary_of_the_changes: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          handle?: string
          id?: string
          new_life_context?: string
          previous_life_context?: string
          summary_of_the_changes?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_updates_life_context_action_id"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_chain_action_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_updates_life_context_handle"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_updates_life_goals: {
        Row: {
          action_id: string
          created_at: string | null
          handle: string
          id: string
          new_life_goals: string
          previous_life_goals: string
          summary_of_the_changes: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          handle: string
          id?: string
          new_life_goals: string
          previous_life_goals: string
          summary_of_the_changes: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          handle?: string
          id?: string
          new_life_goals?: string
          previous_life_goals?: string
          summary_of_the_changes?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_updates_life_goals_action_id"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_chain_action_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_updates_life_goals_handle"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_updates_skills: {
        Row: {
          action_id: string
          created_at: string | null
          handle: string
          id: string
          new_skills: string
          previous_skills: string
          summary_of_the_changes: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          handle: string
          id?: string
          new_skills: string
          previous_skills: string
          summary_of_the_changes: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          handle?: string
          id?: string
          new_skills?: string
          previous_skills?: string
          summary_of_the_changes?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_updates_skills_action_id"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_chain_action_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_updates_skills_handle"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
          },
        ]
      }
      agent_chain_users: {
        Row: {
          bio: string | null
          cover_picture: string | null
          created_at: string | null
          creator: string | null
          display_name: string
          handle: string
          life_context: string
          life_goals: string
          profile_picture: string | null
          skills: string
          twitter_id: string | null
        }
        Insert: {
          bio?: string | null
          cover_picture?: string | null
          created_at?: string | null
          creator?: string | null
          display_name: string
          handle: string
          life_context: string
          life_goals: string
          profile_picture?: string | null
          skills: string
          twitter_id?: string | null
        }
        Update: {
          bio?: string | null
          cover_picture?: string | null
          created_at?: string | null
          creator?: string | null
          display_name?: string
          handle?: string
          life_context?: string
          life_goals?: string
          profile_picture?: string | null
          skills?: string
          twitter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_chain_users_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "agent_chain_end_users"
            referencedColumns: ["address"]
          },
        ]
      }
      agent_chain_wallets: {
        Row: {
          address: string
          created_at: string | null
          handle: string
          permit_signature: string
          private_key: string
        }
        Insert: {
          address: string
          created_at?: string | null
          handle: string
          permit_signature: string
          private_key: string
        }
        Update: {
          address?: string
          created_at?: string | null
          handle?: string
          permit_signature?: string
          private_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wallets_handle"
            columns: ["handle"]
            isOneToOne: true
            referencedRelation: "agent_chain_users"
            referencedColumns: ["handle"]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
