-- Supabase Setup for Active Capital Visual Editor
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Create the site_content table
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed with default content
INSERT INTO site_content (key, value) VALUES
  ('hero_title', '"Founder Led Capital for Founder Led Companies"'),
  ('hero_subtitle', '"Pre-Seed Investing in AI-Native Business Software"'),
  ('about_pat', '"Hi, I''m Pat. I''m an entrepreneur turned investor. I''ve spent my career starting, scaling, and investing in startups. I started Active Capital because I love backing technical founders and helping them reach their potential. I''ve spent more than 20 years building and investing in software, cloud infrastructure, and AI, and I believe the future is brighter than ever. If you''re a founder building an AI-native company, I''d love to hear from you. I welcome warm intros and cold emails."'),
  ('about_active_capital', '"Active Capital is a venture firm focused on pre-seed investing in technical founders building AI-native software, infrastructure, and products that solve real business problems. We love working with founders who stay small and scrappy until they find true product-market fit. We typically invest $100K to $1M, with the ability to invest significantly more as companies grow and our relationship develops. We like to invest early and be a meaningful part of the first capital raised."'),
  ('approach_items', '[{"label":"Pre-Seed Investing","icon":"/img/icons/how_we_invest/Pre-Seed Investing.svg"},{"label":"Business Software","icon":"/img/icons/how_we_invest/AI-Native Software.svg"},{"label":"$100k - $1M Checks","icon":"/img/icons/how_we_invest/100k-1M Checks.svg"},{"label":"Technical Founders","icon":"/img/icons/how_we_invest/Technical Founders.svg"},{"label":"Apps, Agents, Infra","icon":"/img/icons/how_we_invest/B2B, Infra, Dev Tools.png"},{"label":"Building in the US","icon":"/img/icons/how_we_invest/Buildin in the US.svg"}]'),
  ('contact_html', '"<p>If you''re a founder building AI-native business software, please email: team@active.vc</p>"')
ON CONFLICT (key) DO NOTHING;

-- 3. Enable Row Level Security (optional but recommended)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the website)
CREATE POLICY "Allow public read" ON site_content
  FOR SELECT USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role all" ON site_content
  FOR ALL USING (auth.role() = 'service_role');
