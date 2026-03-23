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
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          threshold: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
          threshold?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          threshold?: number | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_id: string | null
          author_name: string
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string
          category: string
          comment_count: number | null
          content: Json
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          like_count: number | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          category?: string
          comment_count?: number | null
          content?: Json
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          like_count?: number | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          category?: string
          comment_count?: number | null
          content?: Json
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          like_count?: number | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      bug_bounty_submissions: {
        Row: {
          code: string
          created_at: string
          id: string
          reward: string | null
          severity: string
          status: string
          submitted_by: string | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          reward?: string | null
          severity?: string
          status?: string
          submitted_by?: string | null
          title?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          reward?: string | null
          severity?: string
          status?: string
          submitted_by?: string | null
          title?: string
        }
        Relationships: []
      }
      case_comments: {
        Row: {
          author_id: string
          case_id: string
          content: string
          created_at: string
          id: string
          is_judge_note: boolean
        }
        Insert: {
          author_id: string
          case_id: string
          content?: string
          created_at?: string
          id?: string
          is_judge_note?: boolean
        }
        Update: {
          author_id?: string
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_judge_note?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      case_evidence: {
        Row: {
          case_id: string
          content: string
          created_at: string
          evidence_type: string
          file_url: string | null
          id: string
          submitted_by: string
          title: string
        }
        Insert: {
          case_id: string
          content?: string
          created_at?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          submitted_by: string
          title?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          submitted_by?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          changes: Json
          created_at: string
          date: string
          highlight: string | null
          id: string
          title: string
          version: string
        }
        Insert: {
          changes?: Json
          created_at?: string
          date?: string
          highlight?: string | null
          id?: string
          title?: string
          version?: string
        }
        Update: {
          changes?: Json
          created_at?: string
          date?: string
          highlight?: string | null
          id?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      click_heatmap: {
        Row: {
          created_at: string
          element_class: string | null
          element_id: string | null
          element_tag: string | null
          element_text: string | null
          id: string
          is_dead_click: boolean
          is_rage_click: boolean
          page_path: string
          session_id: string
          user_id: string | null
          x_percent: number
          y_percent: number
        }
        Insert: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_tag?: string | null
          element_text?: string | null
          id?: string
          is_dead_click?: boolean
          is_rage_click?: boolean
          page_path: string
          session_id: string
          user_id?: string | null
          x_percent?: number
          y_percent?: number
        }
        Update: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_tag?: string | null
          element_text?: string | null
          id?: string
          is_dead_click?: boolean
          is_rage_click?: boolean
          page_path?: string
          session_id?: string
          user_id?: string | null
          x_percent?: number
          y_percent?: number
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          priority: string
          status: string
          subject: string | null
          topic: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          status?: string
          subject?: string | null
          topic?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          status?: string
          subject?: string | null
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: []
      }
      demo_bookings: {
        Row: {
          company_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          team_size: string
          use_case: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          team_size?: string
          use_case?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          team_size?: string
          use_case?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          filed_against: string
          filed_by: string
          id: string
          outcome: string | null
          resolved_at: string | null
          sp_amount: number
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          filed_against: string
          filed_by: string
          id?: string
          outcome?: string | null
          resolved_at?: string | null
          sp_amount?: number
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          filed_against?: string
          filed_by?: string
          id?: string
          outcome?: string | null
          resolved_at?: string | null
          sp_amount?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_filed_against_profiles_fkey"
            columns: ["filed_against"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_filed_against_profiles_fkey"
            columns: ["filed_against"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_filed_by_profiles_fkey"
            columns: ["filed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "disputes_filed_by_profiles_fkey"
            columns: ["filed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      enterprise_accounts: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          max_seats: number
          name: string
          owner_id: string
          plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          max_seats?: number
          name: string
          owner_id: string
          plan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          max_seats?: number
          name?: string
          owner_id?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      enterprise_candidates: {
        Row: {
          candidate_user_id: string
          created_at: string
          id: string
          posted_at: string
          project_id: string | null
          role: string
          stage: string
          urgency: string
          user_id: string
        }
        Insert: {
          candidate_user_id: string
          created_at?: string
          id?: string
          posted_at?: string
          project_id?: string | null
          role?: string
          stage?: string
          urgency?: string
          user_id: string
        }
        Update: {
          candidate_user_id?: string
          created_at?: string
          id?: string
          posted_at?: string
          project_id?: string | null
          role?: string
          stage?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_candidates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "enterprise_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_consultations: {
        Row: {
          created_at: string
          expert_name: string
          expert_user_id: string | null
          id: string
          scheduled_date: string | null
          scheduled_time: string | null
          sp_cost: number
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expert_name?: string
          expert_user_id?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          sp_cost?: number
          status?: string
          topic?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expert_name?: string
          expert_user_id?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          sp_cost?: number
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_members: {
        Row: {
          account_id: string
          created_at: string
          id: string
          invited_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "enterprise_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_projects: {
        Row: {
          budget: number
          created_at: string
          deadline: string | null
          description: string
          id: string
          name: string
          priority: string
          progress: number
          status: string
          team_size: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          name: string
          priority?: string
          progress?: number
          status?: string
          team_size?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          name?: string
          priority?: string
          progress?: number
          status?: string
          team_size?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_quotes: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          source: string
          team_size: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          source?: string
          team_size?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          source?: string
          team_size?: string
        }
        Relationships: []
      }
      error_log: {
        Row: {
          col_number: number | null
          created_at: string
          error_type: string
          filename: string | null
          id: string
          line_number: number | null
          message: string
          metadata: Json | null
          page_path: string
          session_id: string
          stack: string | null
          user_id: string | null
        }
        Insert: {
          col_number?: number | null
          created_at?: string
          error_type?: string
          filename?: string | null
          id?: string
          line_number?: number | null
          message?: string
          metadata?: Json | null
          page_path: string
          session_id: string
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          col_number?: number | null
          created_at?: string
          error_type?: string
          filename?: string | null
          id?: string
          line_number?: number | null
          message?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string
          stack?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      escrow_contracts: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          released_sp: number
          seller_id: string
          status: string
          terms: Json | null
          total_sp: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          released_sp?: number
          seller_id: string
          status?: string
          terms?: Json | null
          total_sp?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          released_sp?: number
          seller_id?: string
          status?: string
          terms?: Json | null
          total_sp?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          end_date: string | null
          event_date: string
          event_type: string
          icon: string
          id: string
          is_featured: boolean
          is_recurring: boolean
          location: string | null
          prize: string | null
          recurrence_rule: string | null
          spots: number | null
          spots_filled: number
          status: string
          tags: string[] | null
          time_label: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          event_date: string
          event_type?: string
          icon?: string
          id?: string
          is_featured?: boolean
          is_recurring?: boolean
          location?: string | null
          prize?: string | null
          recurrence_rule?: string | null
          spots?: number | null
          spots_filled?: number
          status?: string
          tags?: string[] | null
          time_label?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          event_date?: string
          event_type?: string
          icon?: string
          id?: string
          is_featured?: boolean
          is_recurring?: boolean
          location?: string | null
          prize?: string | null
          recurrence_rule?: string | null
          spots?: number | null
          spots_filled?: number
          status?: string
          tags?: string[] | null
          time_label?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_comments: {
        Row: {
          content: string
          created_at: string
          feature_id: string
          id: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          feature_id: string
          id?: string
          user_id: string
          user_name?: string
        }
        Update: {
          content?: string
          created_at?: string
          feature_id?: string
          id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_comments_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          category: string
          comments: number
          created_at: string
          description: string
          hot: boolean
          icon: string
          id: string
          status: string
          title: string
          votes: number
        }
        Insert: {
          category?: string
          comments?: number
          created_at?: string
          description?: string
          hot?: boolean
          icon?: string
          id?: string
          status?: string
          title: string
          votes?: number
        }
        Update: {
          category?: string
          comments?: number
          created_at?: string
          description?: string
          hot?: boolean
          icon?: string
          id?: string
          status?: string
          title?: string
          votes?: number
        }
        Relationships: []
      }
      feature_votes: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          thread_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          thread_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          thread_count?: number | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string | null
          author_name: string
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_id: string | null
          thread_id: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          thread_id: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          thread_id?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_id: string | null
          author_name: string
          category_id: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          category_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          category_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          thread_id: string | null
          user_id: string
          vote_type: number
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string | null
          user_id: string
          vote_type: number
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string | null
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          funnel: string
          id: string
          metadata: Json | null
          session_id: string
          step: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          funnel: string
          id?: string
          metadata?: Json | null
          session_id: string
          step: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          funnel?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          step?: string
          user_id?: string | null
        }
        Relationships: []
      }
      guild_achievements: {
        Row: {
          achievement_id: string
          completed: boolean
          completed_at: string | null
          guild_id: string
          id: string
          progress: number
        }
        Insert: {
          achievement_id: string
          completed?: boolean
          completed_at?: string | null
          guild_id: string
          id?: string
          progress?: number
        }
        Update: {
          achievement_id?: string
          completed?: boolean
          completed_at?: string | null
          guild_id?: string
          id?: string
          progress?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_achievements_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          guild_id: string
          id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          guild_id: string
          id?: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          guild_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_badges_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_channel_messages: {
        Row: {
          attachments: Json | null
          channel_id: string
          content: string
          created_at: string | null
          id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          attachments?: Json | null
          channel_id: string
          content?: string
          created_at?: string | null
          id?: string
          sender_id: string
          sender_name?: string
        }
        Update: {
          attachments?: Json | null
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "guild_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_channels: {
        Row: {
          channel_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          guild_id: string
          id: string
          name: string
          position: number | null
        }
        Insert: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          guild_id: string
          id?: string
          name?: string
          position?: number | null
        }
        Update: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          guild_id?: string
          id?: string
          name?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_channels_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_loans: {
        Row: {
          amount: number
          borrowed_at: string
          borrower_id: string
          due_date: string
          guild_id: string
          id: string
          interest_rate: number
          status: string
        }
        Insert: {
          amount?: number
          borrowed_at?: string
          borrower_id: string
          due_date: string
          guild_id: string
          id?: string
          interest_rate?: number
          status?: string
        }
        Update: {
          amount?: number
          borrowed_at?: string
          borrower_id?: string
          due_date?: string
          guild_id?: string
          id?: string
          interest_rate?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_loans_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guild_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guild_projects: {
        Row: {
          client: string
          created_at: string
          guild_id: string
          id: string
          members_count: number
          progress: number
          sp_pool: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client?: string
          created_at?: string
          guild_id: string
          id?: string
          members_count?: number
          progress?: number
          sp_pool?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client?: string
          created_at?: string
          guild_id?: string
          id?: string
          members_count?: number
          progress?: number
          sp_pool?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_projects_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_treasury_log: {
        Row: {
          amount: number
          created_at: string
          guild_id: string
          id: string
          reason: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          guild_id: string
          id?: string
          reason?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          guild_id?: string
          id?: string
          reason?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_treasury_log_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_wars: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          opponent_guild_id: string | null
          opponent_name: string
          our_score: number
          stakes: number
          start_date: string
          status: string
          their_score: number
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          opponent_guild_id?: string | null
          opponent_name?: string
          our_score?: number
          stakes?: number
          start_date: string
          status?: string
          their_score?: number
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          opponent_guild_id?: string | null
          opponent_name?: string
          our_score?: number
          stakes?: number
          start_date?: string
          status?: string
          their_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_wars_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_wars_opponent_guild_id_fkey"
            columns: ["opponent_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          avatar_url: string | null
          avg_elo: number
          category: string
          created_at: string
          created_by: string
          description: string
          guild_sections: Json | null
          id: string
          is_public: boolean
          name: string
          perks: string[] | null
          rank: number
          requirements: string[] | null
          slogan: string
          total_gigs: number
          total_sp: number
          updated_at: string
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          avg_elo?: number
          category?: string
          created_at?: string
          created_by: string
          description?: string
          guild_sections?: Json | null
          id?: string
          is_public?: boolean
          name: string
          perks?: string[] | null
          rank?: number
          requirements?: string[] | null
          slogan?: string
          total_gigs?: number
          total_sp?: number
          updated_at?: string
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          avg_elo?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          guild_sections?: Json | null
          id?: string
          is_public?: boolean
          name?: string
          perks?: string[] | null
          rank?: number
          requirements?: string[] | null
          slogan?: string
          total_gigs?: number
          total_sp?: number
          updated_at?: string
          win_rate?: number
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string | null
          helpful_count: number
          id: string
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          helpful_count?: number
          id?: string
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          helpful_count?: number
          id?: string
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      help_feedback: {
        Row: {
          created_at: string
          id: string
          rating: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          rating?: string
          user_id?: string | null
        }
        Relationships: []
      }
      help_reports: {
        Row: {
          created_at: string
          description: string
          email: string | null
          id: string
          priority: string
          reference_id: string | null
          report_type: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          email?: string | null
          id?: string
          priority?: string
          reference_id?: string | null
          report_type: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          priority?: string
          reference_id?: string | null
          report_type?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jury_assignments: {
        Row: {
          assigned_at: string
          case_id: string
          deadline: string | null
          id: string
          juror_id: string
          juror_type: string
          status: string
        }
        Insert: {
          assigned_at?: string
          case_id: string
          deadline?: string | null
          id?: string
          juror_id: string
          juror_type?: string
          status?: string
        }
        Update: {
          assigned_at?: string
          case_id?: string
          deadline?: string | null
          id?: string
          juror_id?: string
          juror_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "jury_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      jury_votes: {
        Row: {
          case_id: string
          id: string
          juror_id: string
          reasoning: string
          vote: string
          voted_at: string
          weight: number
        }
        Insert: {
          case_id: string
          id?: string
          juror_id: string
          reasoning?: string
          vote?: string
          voted_at?: string
          weight?: number
        }
        Update: {
          case_id?: string
          id?: string
          juror_id?: string
          reasoning?: string
          vote?: string
          voted_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "jury_votes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_achievements: {
        Row: {
          achieved_at: string
          badge: string
          created_at: string
          id: string
          user_name: string
        }
        Insert: {
          achieved_at?: string
          badge?: string
          created_at?: string
          id?: string
          user_name?: string
        }
        Update: {
          achieved_at?: string
          badge?: string
          created_at?: string
          id?: string
          user_name?: string
        }
        Relationships: []
      }
      listing_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          listing_id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          listing_id: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          listing_id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_interactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          auction_config: Json | null
          bid_count: number
          category: string
          completed_swaps: number | null
          conditions: Json | null
          contest_config: Json | null
          created_at: string
          current_bid: number | null
          delivery_days: number
          description: string
          ends_at: string | null
          flash_config: Json | null
          format: string
          fusion_skills: string[] | null
          gig_faq: Json | null
          hot: boolean
          id: string
          images: string[] | null
          inquiries: number
          is_subscription: boolean | null
          max_revisions: number | null
          points: number
          price: string
          rating: number
          requirements: string[] | null
          revision_cost_sp: number | null
          roles_needed: Json | null
          status: string
          subscription_interval: string | null
          tags: string[] | null
          tiers: Json | null
          title: string
          updated_at: string
          user_id: string
          views: number
          wants: string | null
        }
        Insert: {
          auction_config?: Json | null
          bid_count?: number
          category?: string
          completed_swaps?: number | null
          conditions?: Json | null
          contest_config?: Json | null
          created_at?: string
          current_bid?: number | null
          delivery_days?: number
          description?: string
          ends_at?: string | null
          flash_config?: Json | null
          format?: string
          fusion_skills?: string[] | null
          gig_faq?: Json | null
          hot?: boolean
          id?: string
          images?: string[] | null
          inquiries?: number
          is_subscription?: boolean | null
          max_revisions?: number | null
          points?: number
          price?: string
          rating?: number
          requirements?: string[] | null
          revision_cost_sp?: number | null
          roles_needed?: Json | null
          status?: string
          subscription_interval?: string | null
          tags?: string[] | null
          tiers?: Json | null
          title: string
          updated_at?: string
          user_id: string
          views?: number
          wants?: string | null
        }
        Update: {
          auction_config?: Json | null
          bid_count?: number
          category?: string
          completed_swaps?: number | null
          conditions?: Json | null
          contest_config?: Json | null
          created_at?: string
          current_bid?: number | null
          delivery_days?: number
          description?: string
          ends_at?: string | null
          flash_config?: Json | null
          format?: string
          fusion_skills?: string[] | null
          gig_faq?: Json | null
          hot?: boolean
          id?: string
          images?: string[] | null
          inquiries?: number
          is_subscription?: boolean | null
          max_revisions?: number | null
          points?: number
          price?: string
          rating?: number
          requirements?: string[] | null
          revision_cost_sp?: number | null
          roles_needed?: Json | null
          status?: string
          subscription_interval?: string | null
          tags?: string[] | null
          tiers?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
          wants?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listings_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      page_sessions: {
        Row: {
          clicks_count: number
          created_at: string
          duration_seconds: number | null
          engagement_score: number
          entered_at: string
          exited_at: string | null
          id: string
          idle_seconds: number
          keypresses_count: number
          metadata: Json | null
          mouse_distance_px: number
          page_path: string
          page_title: string
          rage_clicks_count: number
          scroll_depth_avg: number
          scroll_depth_max: number
          session_id: string
          user_id: string | null
          visibility_hidden_seconds: number
        }
        Insert: {
          clicks_count?: number
          created_at?: string
          duration_seconds?: number | null
          engagement_score?: number
          entered_at?: string
          exited_at?: string | null
          id?: string
          idle_seconds?: number
          keypresses_count?: number
          metadata?: Json | null
          mouse_distance_px?: number
          page_path: string
          page_title?: string
          rage_clicks_count?: number
          scroll_depth_avg?: number
          scroll_depth_max?: number
          session_id: string
          user_id?: string | null
          visibility_hidden_seconds?: number
        }
        Update: {
          clicks_count?: number
          created_at?: string
          duration_seconds?: number | null
          engagement_score?: number
          entered_at?: string
          exited_at?: string | null
          id?: string
          idle_seconds?: number
          keypresses_count?: number
          metadata?: Json | null
          mouse_distance_px?: number
          page_path?: string
          page_title?: string
          rage_clicks_count?: number
          scroll_depth_avg?: number
          scroll_depth_max?: number
          session_id?: string
          user_id?: string | null
          visibility_hidden_seconds?: number
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          active_guilds: number
          avg_satisfaction: number
          community_impact: Json
          content_metrics: Json
          created_at: string
          disputes_resolved: number
          economy_health: Json
          enterprise_clients: number
          format_distribution: Json
          hall_of_fame: Json
          id: string
          metric_date: string
          monthly_revenue: string | null
          monthly_signups: number
          platform_uptime: Json
          points_circulated: number
          retention_data: Json
          revenue_breakdown: Json
          total_gigs: number
          total_users: number
          universities: number
        }
        Insert: {
          active_guilds?: number
          avg_satisfaction?: number
          community_impact?: Json
          content_metrics?: Json
          created_at?: string
          disputes_resolved?: number
          economy_health?: Json
          enterprise_clients?: number
          format_distribution?: Json
          hall_of_fame?: Json
          id?: string
          metric_date?: string
          monthly_revenue?: string | null
          monthly_signups?: number
          platform_uptime?: Json
          points_circulated?: number
          retention_data?: Json
          revenue_breakdown?: Json
          total_gigs?: number
          total_users?: number
          universities?: number
        }
        Update: {
          active_guilds?: number
          avg_satisfaction?: number
          community_impact?: Json
          content_metrics?: Json
          created_at?: string
          disputes_resolved?: number
          economy_health?: Json
          enterprise_clients?: number
          format_distribution?: Json
          hall_of_fame?: Json
          id?: string
          metric_date?: string
          monthly_revenue?: string | null
          monthly_signups?: number
          platform_uptime?: Json
          points_circulated?: number
          retention_data?: Json
          revenue_breakdown?: Json
          total_gigs?: number
          total_users?: number
          universities?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_emoji: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          certificates: Json | null
          created_at: string
          display_name: string | null
          education_history: Json | null
          elo: number
          email: string
          full_name: string
          github_url: string | null
          hero_color: string | null
          hourly_rate: string | null
          id: string
          id_verified: boolean | null
          instagram_url: string | null
          interests: string[] | null
          languages: string[] | null
          linkedin_url: string | null
          location: string | null
          needs: string[] | null
          onboarding_complete: boolean | null
          personal_website: string | null
          portfolio_items: Json | null
          portfolio_url: string | null
          preferred_comm: string | null
          profile_sections: Json | null
          referral_code: string | null
          referred_by: string | null
          response_time: string | null
          skill_levels: Json | null
          skills: string[] | null
          slogan: string | null
          sp: number
          streak_days: number | null
          tier: string
          timezone: string | null
          total_gigs_completed: number | null
          twitter_url: string | null
          university: string | null
          updated_at: string
          user_id: string
          work_history: Json | null
          youtube_url: string | null
        }
        Insert: {
          availability?: string | null
          avatar_emoji?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certificates?: Json | null
          created_at?: string
          display_name?: string | null
          education_history?: Json | null
          elo?: number
          email?: string
          full_name?: string
          github_url?: string | null
          hero_color?: string | null
          hourly_rate?: string | null
          id?: string
          id_verified?: boolean | null
          instagram_url?: string | null
          interests?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          needs?: string[] | null
          onboarding_complete?: boolean | null
          personal_website?: string | null
          portfolio_items?: Json | null
          portfolio_url?: string | null
          preferred_comm?: string | null
          profile_sections?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          response_time?: string | null
          skill_levels?: Json | null
          skills?: string[] | null
          slogan?: string | null
          sp?: number
          streak_days?: number | null
          tier?: string
          timezone?: string | null
          total_gigs_completed?: number | null
          twitter_url?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          work_history?: Json | null
          youtube_url?: string | null
        }
        Update: {
          availability?: string | null
          avatar_emoji?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certificates?: Json | null
          created_at?: string
          display_name?: string | null
          education_history?: Json | null
          elo?: number
          email?: string
          full_name?: string
          github_url?: string | null
          hero_color?: string | null
          hourly_rate?: string | null
          id?: string
          id_verified?: boolean | null
          instagram_url?: string | null
          interests?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          needs?: string[] | null
          onboarding_complete?: boolean | null
          personal_website?: string | null
          portfolio_items?: Json | null
          portfolio_url?: string | null
          preferred_comm?: string | null
          profile_sections?: Json | null
          referral_code?: string | null
          referred_by?: string | null
          response_time?: string | null
          skill_levels?: Json | null
          skills?: string[] | null
          slogan?: string | null
          sp?: number
          streak_days?: number | null
          tier?: string
          timezone?: string | null
          total_gigs_completed?: number | null
          twitter_url?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          work_history?: Json | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          completed_at: string | null
          counter_message: string | null
          counter_sp: number | null
          created_at: string
          delivery_days: number
          escrow_terms: Json | null
          expires_at: string | null
          id: string
          listing_id: string
          message: string
          metadata: Json | null
          offered_sp: number
          receiver_id: string
          rejected_at: string | null
          requirements: string | null
          sender_id: string
          stage_config: Json | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          counter_message?: string | null
          counter_sp?: number | null
          created_at?: string
          delivery_days?: number
          escrow_terms?: Json | null
          expires_at?: string | null
          id?: string
          listing_id: string
          message?: string
          metadata?: Json | null
          offered_sp?: number
          receiver_id: string
          rejected_at?: string | null
          requirements?: string | null
          sender_id: string
          stage_config?: Json | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          counter_message?: string | null
          counter_sp?: number | null
          created_at?: string
          delivery_days?: number
          escrow_terms?: Json | null
          expires_at?: string | null
          id?: string
          listing_id?: string
          message?: string
          metadata?: Json | null
          offered_sp?: number
          receiver_id?: string
          rejected_at?: string | null
          requirements?: string | null
          sender_id?: string
          stage_config?: Json | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_reports: {
        Row: {
          created_at: string
          growth: Json
          highlights: Json
          id: string
          kpis: Json
          label: string
          monthly_breakdown: Json
          period: string
          quarter_id: string
          status: string
          top_skills: Json
        }
        Insert: {
          created_at?: string
          growth?: Json
          highlights?: Json
          id?: string
          kpis?: Json
          label?: string
          monthly_breakdown?: Json
          period?: string
          quarter_id: string
          status?: string
          top_skills?: Json
        }
        Update: {
          created_at?: string
          growth?: Json
          highlights?: Json
          id?: string
          kpis?: Json
          label?: string
          monthly_breakdown?: Json
          period?: string
          quarter_id?: string
          status?: string
          top_skills?: Json
        }
        Relationships: []
      }
      ranking_history: {
        Row: {
          category: string
          changes: Json
          created_at: string
          id: string
          rankings: Json
          snapshot_date: string
        }
        Insert: {
          category?: string
          changes?: Json
          created_at?: string
          id?: string
          rankings?: Json
          snapshot_date?: string
        }
        Update: {
          category?: string
          changes?: Json
          created_at?: string
          id?: string
          rankings?: Json
          snapshot_date?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          communication_rating: number | null
          content: string
          created_at: string
          helpful_count: number
          id: string
          is_verified: boolean
          listing_id: string | null
          quality_rating: number | null
          rating: number
          response: string | null
          response_at: string | null
          reviewee_id: string
          reviewer_id: string
          timeliness_rating: number | null
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          communication_rating?: number | null
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          listing_id?: string | null
          quality_rating?: number | null
          rating?: number
          response?: string | null
          response_at?: string | null
          reviewee_id: string
          reviewer_id: string
          timeliness_rating?: number | null
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          communication_rating?: number | null
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          listing_id?: string | null
          quality_rating?: number | null
          rating?: number
          response?: string | null
          response_at?: string | null
          reviewee_id?: string
          reviewer_id?: string
          timeliness_rating?: number | null
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          post_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          post_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          post_type?: string
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          category: string | null
          clicked_result_rank: number | null
          created_at: string
          filters_used: Json | null
          id: string
          metadata: Json | null
          query: string
          results_count: number | null
          session_id: string
          time_to_click_ms: number | null
          user_id: string | null
          zero_results: boolean | null
        }
        Insert: {
          category?: string | null
          clicked_result_rank?: number | null
          created_at?: string
          filters_used?: Json | null
          id?: string
          metadata?: Json | null
          query: string
          results_count?: number | null
          session_id: string
          time_to_click_ms?: number | null
          user_id?: string | null
          zero_results?: boolean | null
        }
        Update: {
          category?: string | null
          clicked_result_rank?: number | null
          created_at?: string
          filters_used?: Json | null
          id?: string
          metadata?: Json | null
          query?: string
          results_count?: number | null
          session_id?: string
          time_to_click_ms?: number | null
          user_id?: string | null
          zero_results?: boolean | null
        }
        Relationships: []
      }
      service_incidents: {
        Row: {
          created_at: string
          duration: string | null
          id: string
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      service_status: {
        Row: {
          created_at: string
          icon: string
          id: string
          last_checked_at: string
          latency: string
          name: string
          region: string
          status: string
          uptime: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          last_checked_at?: string
          latency?: string
          name: string
          region?: string
          status?: string
          uptime?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          last_checked_at?: string
          latency?: string
          name?: string
          region?: string
          status?: string
          uptime?: number
        }
        Relationships: []
      }
      sp_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          metadata: Json | null
          reason: string
          reference_id: string | null
          reference_type: string | null
          tax_amount: number
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          tax_amount?: number
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          tax_amount?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          assigned_admin: string | null
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin?: string | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_system: boolean
          sender_id: string
          translated_content: string | null
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id: string
          translated_content?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id?: string
          translated_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          id: string
          placement: number | null
          registered_at: string
          score: number
          status: string
          team_name: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          placement?: number | null
          registered_at?: string
          score?: number
          status?: string
          team_name?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          placement?: number | null
          registered_at?: string
          score?: number
          status?: string
          team_name?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          end_date: string | null
          entry_fee: number
          format: string
          icon: string
          id: string
          is_quarterly: boolean
          max_teams: number | null
          min_elo: number
          min_gigs: number
          min_tier: string
          name: string
          prize_pool: string
          registration_deadline: string | null
          start_date: string
          status: string
          team_size: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          entry_fee?: number
          format?: string
          icon?: string
          id?: string
          is_quarterly?: boolean
          max_teams?: number | null
          min_elo?: number
          min_gigs?: number
          min_tier?: string
          name: string
          prize_pool?: string
          registration_deadline?: string | null
          start_date: string
          status?: string
          team_size?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          entry_fee?: number
          format?: string
          icon?: string
          id?: string
          is_quarterly?: boolean
          max_teams?: number | null
          min_elo?: number
          min_gigs?: number
          min_tier?: string
          name?: string
          prize_pool?: string
          registration_deadline?: string | null
          start_date?: string
          status?: string
          team_size?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ai_insights: Json
          blockchain_hash: string | null
          buyer_data: Json
          buyer_id: string | null
          category: string
          code: string
          comments: Json
          communication_heatmap: Json
          completed_date: string | null
          compliance: Json
          created_at: string
          date: string
          deliverables: Json
          device_info: Json
          dispute_history: string | null
          duration: string | null
          escrow: Json
          fingerprint: string | null
          format: string
          gig_title: string
          id: string
          performance: Json
          points: Json
          quality: Json
          recommendations: Json
          satisfaction_survey: Json
          security_data: Json
          seller_data: Json
          seller_id: string | null
          skill_impact: Json
          stages: Json
          status: string
          timeline: Json
          workspace: Json
        }
        Insert: {
          ai_insights?: Json
          blockchain_hash?: string | null
          buyer_data?: Json
          buyer_id?: string | null
          category?: string
          code: string
          comments?: Json
          communication_heatmap?: Json
          completed_date?: string | null
          compliance?: Json
          created_at?: string
          date?: string
          deliverables?: Json
          device_info?: Json
          dispute_history?: string | null
          duration?: string | null
          escrow?: Json
          fingerprint?: string | null
          format?: string
          gig_title?: string
          id?: string
          performance?: Json
          points?: Json
          quality?: Json
          recommendations?: Json
          satisfaction_survey?: Json
          security_data?: Json
          seller_data?: Json
          seller_id?: string | null
          skill_impact?: Json
          stages?: Json
          status?: string
          timeline?: Json
          workspace?: Json
        }
        Update: {
          ai_insights?: Json
          blockchain_hash?: string | null
          buyer_data?: Json
          buyer_id?: string | null
          category?: string
          code?: string
          comments?: Json
          communication_heatmap?: Json
          completed_date?: string | null
          compliance?: Json
          created_at?: string
          date?: string
          deliverables?: Json
          device_info?: Json
          dispute_history?: string | null
          duration?: string | null
          escrow?: Json
          fingerprint?: string | null
          format?: string
          gig_title?: string
          id?: string
          performance?: Json
          points?: Json
          quality?: Json
          recommendations?: Json
          satisfaction_survey?: Json
          security_data?: Json
          seller_data?: Json
          seller_id?: string | null
          skill_impact?: Json
          stages?: Json
          status?: string
          timeline?: Json
          workspace?: Json
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_consultations: {
        Row: {
          consultant_id: string | null
          created_at: string
          description: string
          id: string
          requested_by: string
          required_skills: string[] | null
          sp_offered: number
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          consultant_id?: string | null
          created_at?: string
          description?: string
          id?: string
          requested_by: string
          required_skills?: string[] | null
          sp_offered?: number
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          consultant_id?: string | null
          created_at?: string
          description?: string
          id?: string
          requested_by?: string
          required_skills?: string[] | null
          sp_offered?: number
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_deliverables: {
        Row: {
          ai_feedback: string | null
          ai_quality_score: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string
          file_urls: Json | null
          id: string
          max_revisions: number | null
          requirements: Json | null
          reviewer_notes: string | null
          revision_count: number | null
          stage_id: string | null
          status: string
          submitted_by: string
          title: string
          workspace_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_quality_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string
          file_urls?: Json | null
          id?: string
          max_revisions?: number | null
          requirements?: Json | null
          reviewer_notes?: string | null
          revision_count?: number | null
          stage_id?: string | null
          status?: string
          submitted_by: string
          title?: string
          workspace_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_quality_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string
          file_urls?: Json | null
          id?: string
          max_revisions?: number | null
          requirements?: Json | null
          reviewer_notes?: string | null
          revision_count?: number | null
          stage_id?: string | null
          status?: string
          submitted_by?: string
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_deliverables_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "workspace_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_disputes: {
        Row: {
          created_at: string
          evidence: Json | null
          filed_against: string
          filed_by: string
          id: string
          outcome: string | null
          reason: string
          resolved_at: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json | null
          filed_against: string
          filed_by: string
          id?: string
          outcome?: string | null
          reason?: string
          resolved_at?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json | null
          filed_against?: string
          filed_by?: string
          id?: string
          outcome?: string | null
          reason?: string
          resolved_at?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_files: {
        Row: {
          access_level: string | null
          created_at: string
          description: string | null
          file_name: string
          file_size: string
          file_type: string
          file_url: string
          id: string
          tags: string[] | null
          uploaded_by: string
          version: number
          workspace_id: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: string
          file_type?: string
          file_url?: string
          id?: string
          tags?: string[] | null
          uploaded_by: string
          version?: number
          workspace_id: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: string
          file_type?: string
          file_url?: string
          id?: string
          tags?: string[] | null
          uploaded_by?: string
          version?: number
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          token: string
          used_at: string | null
          used_by: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          used_at?: string | null
          used_by?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          used_at?: string | null
          used_by?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["workspace_role"]
          status: string
          user_id: string
          workspace_id: string
          workspace_type: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          user_id: string
          workspace_id: string
          workspace_type?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          user_id?: string
          workspace_id?: string
          workspace_type?: string | null
        }
        Relationships: []
      }
      workspace_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          sender_id: string
          translated_text: Json | null
          workspace_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id: string
          translated_text?: Json | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          translated_text?: Json | null
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string
          order_index: number
          sp_allocated: number
          status: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          sp_allocated?: number
          status?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          sp_allocated?: number
          status?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_voice_messages: {
        Row: {
          audio_url: string
          created_at: string
          duration_seconds: number
          id: string
          sender_id: string
          transcript: string | null
          translated_text: Json | null
          workspace_id: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          duration_seconds?: number
          id?: string
          sender_id: string
          transcript?: string | null
          translated_text?: Json | null
          workspace_id: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          sender_id?: string
          transcript?: string | null
          translated_text?: Json | null
          workspace_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          listing_id: string | null
          metadata: Json | null
          title: string
          workspace_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id: string
          listing_id?: string | null
          metadata?: Json | null
          title?: string
          workspace_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          title?: string
          workspace_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_emoji: string | null
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          elo: number | null
          skills: string[] | null
          tier: string | null
          total_gigs_completed: number | null
          university: string | null
          user_id: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          elo?: number | null
          skills?: string[] | null
          tier?: string | null
          total_gigs_completed?: number | null
          university?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          elo?: number | null
          skills?: string[] | null
          tier?: string | null
          total_gigs_completed?: number | null
          university?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "enterprise"
      workspace_role: "owner" | "editor" | "viewer" | "client" | "consultant"
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
      app_role: ["admin", "moderator", "user", "enterprise"],
      workspace_role: ["owner", "editor", "viewer", "client", "consultant"],
    },
  },
} as const
