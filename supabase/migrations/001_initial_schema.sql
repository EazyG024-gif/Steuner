-- Gebruikers profiel (gesynchroniseerd met Clerk)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  naam TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Doelen (WOOP-structuur)
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pijler TEXT NOT NULL CHECK (pijler IN ('savor','connect','body','flow','gratitude','meaning')),
  type TEXT NOT NULL CHECK (type IN ('gewoonte','project','intentie')),
  wish TEXT NOT NULL,
  outcome TEXT,
  obstacle TEXT,
  plan TEXT,
  tijdshorizon INTEGER,
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dagelijkse logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  datum DATE NOT NULL,
  stemming INTEGER NOT NULL CHECK (stemming BETWEEN 1 AND 10),
  pijler_scores JSONB NOT NULL DEFAULT '{}',
  gedragschecks JSONB NOT NULL DEFAULT '{}',
  slaapuren NUMERIC(3,1),
  werkdag BOOLEAN,
  notitie TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, datum)
);

-- Inzichten (gegenereerd door patroonlogica)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('correlatie','drempel','cluster','aanbeveling')),
  laag INTEGER CHECK (laag IN (1,2,3)),
  data JSONB NOT NULL DEFAULT '{}',
  gelezen BOOLEAN DEFAULT false,
  gegenereerd_op TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS policies: gebruikers zien alleen eigen data
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (clerk_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "goals_own" ON goals
  FOR ALL USING (
    user_id = (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "daily_logs_own" ON daily_logs
  FOR ALL USING (
    user_id = (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY "insights_own" ON insights
  FOR ALL USING (
    user_id = (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('app.current_user_id', true)
    )
  );

-- Indexes voor performance
CREATE INDEX idx_daily_logs_user_datum ON daily_logs(user_id, datum DESC);
CREATE INDEX idx_goals_user_actief ON goals(user_id, actief);
CREATE INDEX idx_insights_user_gelezen ON insights(user_id, gelezen);
