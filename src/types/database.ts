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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number;
          compare_at_price: number | null;
          currency: string;
          sku: string | null;
          inventory_quantity: number;
          is_active: boolean;
          is_featured: boolean;
          is_bestseller: boolean;
          is_new: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          sku?: string | null;
          inventory_quantity?: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_bestseller?: boolean;
          is_new?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          currency?: string;
          sku?: string | null;
          inventory_quantity?: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_bestseller?: boolean;
          is_new?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price: number | null;
          compare_at_price: number | null;
          inventory_quantity: number;
          options: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price?: number | null;
          compare_at_price?: number | null;
          inventory_quantity?: number;
          options?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sku?: string | null;
          price?: number | null;
          compare_at_price?: number | null;
          inventory_quantity?: number;
          options?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          currency: string;
          subtotal: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          shipping_address: Json;
          billing_address: Json | null;
          customer_email: string;
          customer_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          currency?: string;
          subtotal: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount: number;
          shipping_address: Json;
          billing_address?: Json | null;
          customer_email: string;
          customer_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
          currency?: string;
          subtotal?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          shipping_address?: Json;
          billing_address?: Json | null;
          customer_email?: string;
          customer_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          sku: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          variant_name?: string | null;
          sku?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          variant_name?: string | null;
          sku?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone?: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string | null;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          rating: number;
          title: string | null;
          content: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          rating: number;
          title?: string | null;
          content: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          rating?: number;
          title?: string | null;
          content?: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'customer' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
      };
    };
  };
}
