-- Create the site_content table
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the website)
CREATE POLICY "Allow public read" ON site_content
  FOR SELECT USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role all" ON site_content
  FOR ALL USING (auth.role() = 'service_role');
