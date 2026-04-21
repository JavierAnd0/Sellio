/**
 * Types generados por Supabase CLI.
 * Regenerar con: `pnpm db:types`
 *
 * Este archivo es un placeholder inicial. Después del primer deploy
 * a Supabase, correr `pnpm db:types` para sobrescribir con los types reales.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrgRole = 'owner' | 'admin' | 'cashier';
export type OrgPlan = 'free' | 'basic' | 'elite';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';
export type PaymentProvider = 'wompi' | 'stripe';
export type PointTxType = 'earn' | 'redeem' | 'adjust' | 'expire';
export type PointTxSource = 'checkin' | 'manual' | 'referral' | 'admin' | 'import';

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
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          primary_color: string;
          country: string;
          timezone: string;
          plan: OrgPlan;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          logo_url?: string | null;
          primary_color?: string;
          country?: string;
          timezone?: string;
          plan?: OrgPlan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          logo_url?: string | null;
          primary_color?: string;
          country?: string;
          timezone?: string;
          plan?: OrgPlan;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: OrgRole;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_members_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cards: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          points_per_checkin: number;
          points_for_reward: number;
          reward_description: string;
          max_members: number | null;
          design: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          points_per_checkin?: number;
          points_for_reward: number;
          reward_description: string;
          max_members?: number | null;
          design?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          points_per_checkin?: number;
          points_for_reward?: number;
          reward_description?: string;
          max_members?: number | null;
          design?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cards_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          org_id: string;
          phone: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          phone?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          id: string;
          card_id: string;
          customer_id: string;
          slug: string;
          points: number;
          joined_at: string;
          last_activity_at: string | null;
        };
        Insert: {
          id?: string;
          card_id: string;
          customer_id: string;
          slug?: string;
          points?: number;
          joined_at?: string;
          last_activity_at?: string | null;
        };
        Update: {
          id?: string;
          card_id?: string;
          customer_id?: string;
          slug?: string;
          points?: number;
          joined_at?: string;
          last_activity_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memberships_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      point_transactions: {
        Row: {
          id: string;
          membership_id: string;
          type: PointTxType;
          points: number;
          source: PointTxSource;
          idempotency_key: string | null;
          metadata: Json;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          membership_id: string;
          type: PointTxType;
          points: number;
          source: PointTxSource;
          idempotency_key?: string | null;
          metadata?: Json;
          created_at?: string;
          created_by?: string | null;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'point_transactions_membership_id_fkey';
            columns: ['membership_id'];
            isOneToOne: false;
            referencedRelation: 'memberships';
            referencedColumns: ['id'];
          },
        ];
      };
      redemptions: {
        Row: {
          id: string;
          membership_id: string;
          point_tx_id: string;
          points_used: number;
          reward_snapshot: Json;
          redeemed_at: string;
          redeemed_by: string;
        };
        Insert: {
          id?: string;
          membership_id: string;
          point_tx_id: string;
          points_used: number;
          reward_snapshot: Json;
          redeemed_at?: string;
          redeemed_by: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'redemptions_membership_id_fkey';
            columns: ['membership_id'];
            isOneToOne: false;
            referencedRelation: 'memberships';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          plan: OrgPlan;
          status: SubscriptionStatus;
          provider: PaymentProvider;
          provider_subscription_id: string | null;
          provider_customer_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          plan: OrgPlan;
          status: SubscriptionStatus;
          provider: PaymentProvider;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          plan?: OrgPlan;
          status?: SubscriptionStatus;
          provider?: PaymentProvider;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: true;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          key: string;
          description: string | null;
          enabled_globally: boolean;
          enabled_for_orgs: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          description?: string | null;
          enabled_globally?: boolean;
          enabled_for_orgs?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          description?: string | null;
          enabled_globally?: boolean;
          enabled_for_orgs?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      org_role: OrgRole;
      org_plan: OrgPlan;
      subscription_status: SubscriptionStatus;
      payment_provider: PaymentProvider;
      point_tx_type: PointTxType;
      point_tx_source: PointTxSource;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helpers de tipos
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
