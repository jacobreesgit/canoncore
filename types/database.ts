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
      universes: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          title: string
          description: string | null
          item_type: 'film' | 'book' | 'episode' | 'series' | 'season' | 'collection' | 'character' | 'location' | 'event' | 'documentary' | 'short' | 'special'
          universe_id: string
          parent_id: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          item_type: 'film' | 'book' | 'episode' | 'series' | 'season' | 'collection' | 'character' | 'location' | 'event' | 'documentary' | 'short' | 'special'
          universe_id: string
          parent_id?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          item_type?: 'film' | 'book' | 'episode' | 'series' | 'season' | 'collection' | 'character' | 'location' | 'event' | 'documentary' | 'short' | 'special'
          universe_id?: string
          parent_id?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      content_versions: {
        Row: {
          id: string
          content_item_id: string
          version_name: string
          version_type: string | null
          release_date: string | null
          runtime_minutes: number | null
          is_primary: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_item_id: string
          version_name: string
          version_type?: string | null
          release_date?: string | null
          runtime_minutes?: number | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_item_id?: string
          version_name?: string
          version_type?: string | null
          release_date?: string | null
          runtime_minutes?: number | null
          is_primary?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      content_links: {
        Row: {
          id: string
          from_item_id: string
          to_item_id: string
          link_type: 'sequel' | 'prequel' | 'spinoff' | 'companion' | 'remake' | 'adaptation' | 'crossover' | 'reference' | 'cameo'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_item_id: string
          to_item_id: string
          link_type: 'sequel' | 'prequel' | 'spinoff' | 'companion' | 'remake' | 'adaptation' | 'crossover' | 'reference' | 'cameo'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_item_id?: string
          to_item_id?: string
          link_type?: 'sequel' | 'prequel' | 'spinoff' | 'companion' | 'remake' | 'adaptation' | 'crossover' | 'reference' | 'cameo'
          description?: string | null
          created_at?: string
        }
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

export type Universe = Database['public']['Tables']['universes']['Row']
export type ContentItem = Database['public']['Tables']['content_items']['Row']
export type ContentVersion = Database['public']['Tables']['content_versions']['Row']
export type ContentLink = Database['public']['Tables']['content_links']['Row']

export type ContentItemWithChildren = ContentItem & {
  children?: ContentItemWithChildren[]
  versions?: ContentVersion[]
}

export type UniverseWithContent = Universe & {
  content_items?: ContentItemWithChildren[]
}