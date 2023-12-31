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
            referencedRelation: "parcels"
            referencedColumns: ["primary_key"]
          }
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
            referencedRelation: "clients"
            referencedColumns: ["family_id"]
          }
        ]
      }
      lists: {
        Row: {
          "1_notes": string | null
          "1_quantity": string
          "10_notes": string | null
          "10_quantity": string
          "2_notes": string | null
          "2_quantity": string
          "3_notes": string | null
          "3_quantity": string
          "4_notes": string | null
          "4_quantity": string
          "5_notes": string | null
          "5_quantity": string
          "6_notes": string | null
          "6_quantity": string
          "7_notes": string | null
          "7_quantity": string
          "8_notes": string | null
          "8_quantity": string
          "9_notes": string | null
          "9_quantity": string
          item_name: string
          primary_key: string
          row_order: number
        }
        Insert: {
          "1_notes"?: string | null
          "1_quantity"?: string
          "10_notes"?: string | null
          "10_quantity"?: string
          "2_notes"?: string | null
          "2_quantity"?: string
          "3_notes"?: string | null
          "3_quantity"?: string
          "4_notes"?: string | null
          "4_quantity"?: string
          "5_notes"?: string | null
          "5_quantity"?: string
          "6_notes"?: string | null
          "6_quantity"?: string
          "7_notes"?: string | null
          "7_quantity"?: string
          "8_notes"?: string | null
          "8_quantity"?: string
          "9_notes"?: string | null
          "9_quantity"?: string
          item_name?: string
          primary_key?: string
          row_order?: number
        }
        Update: {
          "1_notes"?: string | null
          "1_quantity"?: string
          "10_notes"?: string | null
          "10_quantity"?: string
          "2_notes"?: string | null
          "2_quantity"?: string
          "3_notes"?: string | null
          "3_quantity"?: string
          "4_notes"?: string | null
          "4_quantity"?: string
          "5_notes"?: string | null
          "5_quantity"?: string
          "6_notes"?: string | null
          "6_quantity"?: string
          "7_notes"?: string | null
          "7_quantity"?: string
          "8_notes"?: string | null
          "8_quantity"?: string
          "9_notes"?: string | null
          "9_quantity"?: string
          item_name?: string
          primary_key?: string
          row_order?: number
        }
        Relationships: []
      }
      lists_hotel: {
        Row: {
          "1_notes": string | null
          "1_quantity": string
          "10_notes": string | null
          "10_quantity": string
          "2_notes": string | null
          "2_quantity": string
          "3_notes": string | null
          "3_quantity": string
          "4_notes": string | null
          "4_quantity": string
          "5_notes": string | null
          "5_quantity": string
          "6_notes": string | null
          "6_quantity": string
          "7_notes": string | null
          "7_quantity": string
          "8_notes": string | null
          "8_quantity": string
          "9_notes": string | null
          "9_quantity": string
          item_name: string
          primary_key: string
          row_order: number
        }
        Insert: {
          "1_notes"?: string | null
          "1_quantity"?: string
          "10_notes"?: string | null
          "10_quantity"?: string
          "2_notes"?: string | null
          "2_quantity"?: string
          "3_notes"?: string | null
          "3_quantity"?: string
          "4_notes"?: string | null
          "4_quantity"?: string
          "5_notes"?: string | null
          "5_quantity"?: string
          "6_notes"?: string | null
          "6_quantity"?: string
          "7_notes"?: string | null
          "7_quantity"?: string
          "8_notes"?: string | null
          "8_quantity"?: string
          "9_notes"?: string | null
          "9_quantity"?: string
          item_name?: string
          primary_key?: string
          row_order?: number
        }
        Update: {
          "1_notes"?: string | null
          "1_quantity"?: string
          "10_notes"?: string | null
          "10_quantity"?: string
          "2_notes"?: string | null
          "2_quantity"?: string
          "3_notes"?: string | null
          "3_quantity"?: string
          "4_notes"?: string | null
          "4_quantity"?: string
          "5_notes"?: string | null
          "5_quantity"?: string
          "6_notes"?: string | null
          "6_quantity"?: string
          "7_notes"?: string | null
          "7_quantity"?: string
          "8_notes"?: string | null
          "8_quantity"?: string
          "9_notes"?: string | null
          "9_quantity"?: string
          item_name?: string
          primary_key?: string
          row_order?: number
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
            referencedRelation: "clients"
            referencedColumns: ["primary_key"]
          },
          {
            foreignKeyName: "parcels_collection_centre_fkey"
            columns: ["collection_centre"]
            referencedRelation: "collection_centres"
            referencedColumns: ["primary_key"]
          }
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
      [_ in never]: never
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
