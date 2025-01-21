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
          created_by: string | null;
          created_at: string;
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
          created_by?: string | null;
          created_at?: string;
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
          created_by?: string | null;
          created_at?: string;
        };
      };
      inspections: {
        Row: {
          id: string;
          property_id: string;
          inspector_id: string;
          inspection_date: string | null;
          status: string | null;
          observations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          inspector_id: string;
          inspection_date?: string | null;
          status?: string | null;
          observations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          inspector_id?: string;
          inspection_date?: string | null;
          status?: string | null;
          observations?: string | null;
          created_at?: string;
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
        };
        Insert: {
          id?: string;
          inspection_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      room_items: {
        Row: {
          id: string;
          room_id: string;
          category: string | null;
          name: string;
          condition: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          category?: string | null;
          name: string;
          condition: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          category?: string | null;
          name?: string;
          condition?: string;
          description?: string | null;
          created_at?: string;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
