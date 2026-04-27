-- Production content table (staging = site_content, production = production_site_content)
CREATE TABLE IF NOT EXISTS production_site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE production_site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON production_site_content
  FOR SELECT USING (true);

CREATE POLICY "Allow service role all" ON production_site_content
  FOR ALL USING (auth.role() = 'service_role');

-- Seed production with current staging data on first migration
INSERT INTO production_site_content (key, value, updated_at)
SELECT key, value, updated_at FROM site_content
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

-- Version history table: stores snapshots of production at each publish
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  major INTEGER NOT NULL,
  minor INTEGER NOT NULL,
  patch INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role all" ON content_versions
  FOR ALL USING (auth.role() = 'service_role');
