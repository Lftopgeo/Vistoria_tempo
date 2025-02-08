export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          type: string;
          subtype: string | null;
          area: number | null;
          value: number | null;
          registration_number: string | null;
          street: string | null;
          number: string | null;
          complement: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: string;
          subtype?: string | null;
          area?: number | null;
          value?: number | null;
          registration_number?: string | null;
          street?: string | null;
          number?: string | null;
          complement?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          subtype?: string | null;
          area?: number | null;
          value?: number | null;
          registration_number?: string | null;
          street?: string | null;
          number?: string | null;
          complement?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      inspections: {
        Row: {
          id: string;
          property_id: string;
          inspector_id: string;
          inspection_date: string;
          status: string;
          observations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          inspector_id: string;
          inspection_date: string;
          status: string;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          inspector_id?: string;
          inspection_date?: string;
          status?: string;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          inspection_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      room_items: {
        Row: {
          id: string;
          room_id: string;
          category: string;
          name: string;
          condition: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          category: string;
          name: string;
          condition: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          category?: string;
          name?: string;
          condition?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      item_images: {
        Row: {
          id: string;
          item_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
