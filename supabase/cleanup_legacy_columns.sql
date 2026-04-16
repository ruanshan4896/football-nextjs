-- ============================================================
-- CLEANUP MIGRATION: Remove legacy columns and constraints
-- Date: 2026-04-16
-- Purpose: Clean up unused entity_type and entity_id columns
-- ============================================================           

-- Step 1: Drop unused columns if they exist
ALTER TABLE public.articles 
  DROP COLUMN IF EXISTS entity_type,
  DROP COLUMN IF EXISTS entity_id;

-- Step 2: Drop related indexes if they exist
DROP INDEX IF EXISTS articles_entity_idx;
DROP INDEX IF EXISTS articles_content_type_idx;

-- Step 3: Ensure content_type only has valid values (article, page_content)
-- Update any legacy content_type values to the new simplified system
UPDATE public.articles 
SET content_type = CASE 
  WHEN content_type IN ('match_preview', 'general') THEN 'article'
  WHEN content_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_intro') THEN 'page_content'
  ELSE content_type
END
WHERE content_type NOT IN ('article', 'page_content');

-- Step 4: Add proper constraint for content_type
ALTER TABLE public.articles 
  DROP CONSTRAINT IF EXISTS articles_content_type_check;

ALTER TABLE public.articles 
  ADD CONSTRAINT articles_content_type_check 
  CHECK (content_type IN ('article', 'page_content'));

-- Step 4: Ensure page_path is populated for all page_content records
UPDATE public.articles 
SET 
  page_type = 'general',
  page_path = CASE 
    WHEN page_type = 'league_intro' AND league_id IS NOT NULL 
      THEN '/giai-dau/' || league_id
    WHEN page_type = 'team_intro' AND match_id IS NOT NULL 
      THEN '/doi-bong/' || match_id
    WHEN page_type = 'odds_guide' THEN '/ty-le-keo'
    WHEN page_type = 'standings_guide' THEN '/bang-xep-hang'
    WHEN page_type = 'fixtures_guide' THEN '/lich-thi-dau'
    ELSE page_path
  END
WHERE content_type = 'page_content';

-- Step 5: Update constraint to only allow 'general' for page_type
ALTER TABLE public.articles 
  DROP CONSTRAINT IF EXISTS articles_page_type_check;

ALTER TABLE public.articles 
  ADD CONSTRAINT articles_page_type_check 
  CHECK (
    (content_type = 'article' AND page_type IS NULL) OR
    (content_type = 'page_content' AND page_type = 'general')
  );

-- Step 6: Verify cleanup
SELECT 
  content_type,
  page_type,
  COUNT(*) as count,
  COUNT(CASE WHEN page_path IS NOT NULL THEN 1 END) as with_path
FROM public.articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;

-- Step 7: Show final schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✅ Legacy columns cleanup completed!' as status;