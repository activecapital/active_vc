-- Version history table: stores snapshots of published content for revert
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

CREATE POLICY "Allow public read" ON content_versions
  FOR SELECT USING (true);

CREATE POLICY "Allow service role all" ON content_versions
  FOR ALL USING (auth.role() = 'service_role');
