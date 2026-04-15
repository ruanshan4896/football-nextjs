-- Fix migration: Remove old constraint and add column properly

-- Step 1: Drop existing constraint if exists
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_page_type_check;

-- Step 2: Add page_type column if not exists
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS page_type VARCHAR(30) NULL;

-- Step 3: Fix data - ensure articles have NULL page_type
UPDATE articles 
SET page_type = NULL
WHERE content_type = 'article';

-- Step 4: Fix data - ensure page_content have valid page_type
UPDATE articles 
SET page_type = CASE 
  WHEN slug LIKE 'gioi-thieu-%' AND league_id > 0 THEN 'league_intro'
  WHEN slug LIKE 'gioi-thieu-%' AND match_id IS NOT NULL THEN 'team_intro'
  WHEN slug LIKE 'lich-su-%' THEN 'team_intro'
  WHEN slug LIKE 'huong-dan-ty-le-keo%' THEN 'odds_guide'
  WHEN slug LIKE 'huong-dan-bang-xep-hang%' THEN 'standings_guide'
  WHEN slug LIKE 'huong-dan-lich-thi-dau%' THEN 'fixtures_guide'
  ELSE 'general'
END
WHERE content_type = 'page_content';

-- Step 5: Ensure no NULL page_type for page_content
UPDATE articles 
SET page_type = 'general'
WHERE content_type = 'page_content' AND page_type IS NULL;

-- Step 6: Create index
CREATE INDEX IF NOT EXISTS idx_articles_page_type ON articles(page_type) WHERE page_type IS NOT NULL;

-- Step 7: Verify data is correct
SELECT content_type, page_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;

-- Step 8: Now add constraint (commented out - uncomment if data looks good)
-- ALTER TABLE articles 
-- ADD CONSTRAINT articles_page_type_check 
-- CHECK (
--   (content_type = 'article' AND page_type IS NULL) OR
--   (content_type = 'page_content' AND page_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_guide', 'general'))
-- );
