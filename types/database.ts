export interface PijlerScores {
  savor?: number;
  connect?: number;
  body?: number;
  flow?: number;
  gratitude?: number;
  meaning?: number;
}

export interface GedragsChecks {
  savor?: boolean;
  connect?: boolean;
  body?: boolean;
  flow?: boolean;
  gratitude?: boolean;
  meaning?: boolean;
}

export interface Profile {
  id: string;
  clerk_user_id: string;
  naam: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  pijler: 'savor' | 'connect' | 'body' | 'flow' | 'gratitude' | 'meaning';
  type: 'gewoonte' | 'project' | 'intentie';
  wish: string;
  outcome: string | null;
  obstacle: string | null;
  plan: string | null;
  tijdshorizon: number | null;
  actief: boolean;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  datum: string;
  stemming: number;
  pijler_scores: PijlerScores;
  gedragschecks: GedragsChecks;
  slaapuren: number | null;
  werkdag: boolean | null;
  notitie: string | null;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  type: 'correlatie' | 'drempel' | 'cluster' | 'aanbeveling';
  laag: 1 | 2 | 3;
  data: Record<string, unknown>;
  gelezen: boolean;
  gegenereerd_op: string;
}

type Json = Record<string, unknown>;

type DailyLogInsert = {
  user_id: string;
  datum: string;
  stemming: number;
  pijler_scores: Json;
  gedragschecks: Json;
  slaapuren?: number | null;
  werkdag?: boolean | null;
  notitie?: string | null;
  id?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'> & Partial<Pick<Profile, 'id' | 'created_at'>>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at'> & Partial<Pick<Goal, 'id' | 'created_at'>>;
        Update: Partial<Omit<Goal, 'id'>>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: DailyLogInsert;
        Update: Partial<DailyLogInsert>;
      };
      insights: {
        Row: Insight;
        Insert: Omit<Insight, 'id' | 'gegenereerd_op'> & Partial<Pick<Insight, 'id' | 'gegenereerd_op'>>;
        Update: Partial<Omit<Insight, 'id'>>;
      };
    };
  };
};
