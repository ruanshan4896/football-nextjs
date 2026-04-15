-- Migration: Add content_type column to articles table
-- Date: 2026-04-16

-- Step 1: Add content_type column with default value 'article'
ALTER TABLE articles 
ADD COLUMN content_type VARCHAR(20) DEFAULT 'article' NOT NULL;

-- Step 2: Update existing records based on slug patterns
-- Content pages: gioi-thieu-*, huong-dan-*, lich-su-*
UPDATE articles 
SET content_type = 'page_content'
WHERE slug LIKE 'gioi-thieu-%' 
   OR slug LIKE 'huong-dan-%' 
   OR slug LIKE 'lich-su-%';

-- Step 3: Add check constraint to ensure valid values
ALTER TABLE articles 
ADD CONSTRAINT articles_content_type_check 
CHECK (content_type IN ('article', 'page_content'));

-- Step 4: Create index for better query performance
CREATE INDEX idx_articles_content_type ON articles(content_type);

-- Verify the migration
SELECT content_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type;
