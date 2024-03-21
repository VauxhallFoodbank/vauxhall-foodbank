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
      clients: {
        Row: {
          address_1: string
          address_2: string
          address_county: string
          address_postcode: string
          address_town: string
          baby_food: boolean | null
          delivery_instructions: string
          dietary_requirements: string[]
          extra_information: string
          family_id: string
          feminine_products: string[]
          flagged_for_attention: boolean
          full_name: string
          other_items: string[]
          pet_food: string[]
          phone_number: string
          primary_key: string
          signposting_call_required: boolean
        }
        Insert: {
          address_1?: string
          address_2?: string
          address_county?: string
          address_postcode?: string
          address_town?: string
          baby_food?: boolean | null
          delivery_instructions?: string
          dietary_requirements?: string[]
          extra_information?: string
          family_id?: string
          feminine_products?: string[]
          flagged_for_attention?: boolean
          full_name?: string
          other_items?: string[]
          pet_food?: string[]
          phone_number?: string
          primary_key?: string
          signposting_call_required?: boolean
        }
        Update: {
          address_1?: string
          address_2?: string
          address_county?: string
          address_postcode?: string
          address_town?: string
          baby_food?: boolean | null
          delivery_instructions?: string
          dietary_requirements?: string[]
          extra_information?: string
          family_id?: string
          feminine_products?: string[]
          flagged_for_attention?: boolean
          full_name?: string
          other_items?: string[]
          pet_food?: string[]
          phone_number?: string
          primary_key?: string
          signposting_call_required?: boolean
        }
        Relationships: []
      }
      collection_centres: {
        Row: {
          acronym: string
          name: string
          primary_key: string
        }
        Insert: {
          acronym?: string
          name?: string
          primary_key?: string
        }
        Update: {
          acronym?: string
          name?: string
          primary_key?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          event_data: string | null
          event_name: string
          parcel_id: string
          primary_key: string
          timestamp: string
        }
        Insert: {
          event_data?: string | null
          event_name: string
          parcel_id: string
          primary_key?: string
          timestamp?: string
        }
        Update: {
          event_data?: string | null
          event_name?: string
          parcel_id?: string
          primary_key?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          },
        ]
      }
      families: {
        Row: {
          age: number | null
          family_id: string
          gender: Database["public"]["Enums"]["gender"]
          primary_key: string
        }
        Insert: {
          age?: number | null
          family_id: string
          gender?: Database["public"]["Enums"]["gender"]
          primary_key?: string
        }
        Update: {
          age?: number | null
          family_id?: string
          gender?: Database["public"]["Enums"]["gender"]
          primary_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["family_id"]
          },
        ]
      }
      lists: {
        Row: {
          item_name: string
          notes_for_1: string | null
          notes_for_10: string | null
          notes_for_2: string | null
          notes_for_3: string | null
          notes_for_4: string | null
          notes_for_5: string | null
          notes_for_6: string | null
          notes_for_7: string | null
          notes_for_8: string | null
          notes_for_9: string | null
          primary_key: string
          quantity_for_1: string
          quantity_for_10: string
          quantity_for_2: string
          quantity_for_3: string
          quantity_for_4: string
          quantity_for_5: string
          quantity_for_6: string
          quantity_for_7: string
          quantity_for_8: string
          quantity_for_9: string
          row_order: number
        }
        Insert: {
          item_name?: string
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Update: {
          item_name?: string
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Relationships: []
      }
      lists_hotel: {
        Row: {
          item_name: string
          notes_for_1: string | null
          notes_for_10: string | null
          notes_for_2: string | null
          notes_for_3: string | null
          notes_for_4: string | null
          notes_for_5: string | null
          notes_for_6: string | null
          notes_for_7: string | null
          notes_for_8: string | null
          notes_for_9: string | null
          primary_key: string
          quantity_for_1: string
          quantity_for_10: string
          quantity_for_2: string
          quantity_for_3: string
          quantity_for_4: string
          quantity_for_5: string
          quantity_for_6: string
          quantity_for_7: string
          quantity_for_8: string
          quantity_for_9: string
          row_order: number
        }
        Insert: {
          item_name?: string
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Update: {
          item_name?: string
          notes_for_1?: string | null
          notes_for_10?: string | null
          notes_for_2?: string | null
          notes_for_3?: string | null
          notes_for_4?: string | null
          notes_for_5?: string | null
          notes_for_6?: string | null
          notes_for_7?: string | null
          notes_for_8?: string | null
          notes_for_9?: string | null
          primary_key?: string
          quantity_for_1?: string
          quantity_for_10?: string
          quantity_for_2?: string
          quantity_for_3?: string
          quantity_for_4?: string
          quantity_for_5?: string
          quantity_for_6?: string
          quantity_for_7?: string
          quantity_for_8?: string
          quantity_for_9?: string
          row_order?: number
        }
        Relationships: []
      }
      packing_slots: {
        Row: {
          is_shown: boolean
          name: string
          order: number
          primary_key: string
        }
        Insert: {
          is_shown: boolean
          name: string
          order: number
          primary_key?: string
        }
        Update: {
          is_shown?: boolean
          name?: string
          order?: number
          primary_key?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          client_id: string
          collection_centre: string | null
          collection_datetime: string | null
          packing_datetime: string | null
          primary_key: string
          voucher_number: string | null
        }
        Insert: {
          client_id: string
          collection_centre?: string | null
          collection_datetime?: string | null
          packing_datetime?: string | null
          primary_key?: string
          voucher_number?: string | null
        }
        Update: {
          client_id?: string
          collection_centre?: string | null
          collection_datetime?: string | null
          packing_datetime?: string | null
          primary_key?: string
          voucher_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "parcels_collection_centre_fkey"
            columns: ["collection_centre"]
            isOneToOne: false
            referencedRelation: "collection_centres"
            referencedColumns: ["primary_key"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string | null
          last_name: string | null
          primary_key: string
          role: Database["public"]["Enums"]["role"]
          telephone_number: string | null
        }
        Insert: {
          first_name?: string | null
          last_name?: string | null
          primary_key?: string
          role: Database["public"]["Enums"]["role"]
          telephone_number?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          primary_key?: string
          role?: Database["public"]["Enums"]["role"]
          telephone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_key_fkey"
            columns: ["primary_key"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      website_data: {
        Row: {
          name: string
          value: string
        }
        Insert: {
          name?: string
          value?: string
        }
        Update: {
          name?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      packing_slot_order_swap: {
        Args: {
          id1: string
          id2: string
        }
        Returns: undefined
      }
    }
    Enums: {
      gender: "male" | "female" | "other"
      role: "caller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

