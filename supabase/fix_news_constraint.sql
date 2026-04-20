-- Fix constraint để cho phép content_type = 'news'
-- Chạy trong Supabase Dashboard > SQL Editor

-- 1. Xóa constraint cũ
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_page_type_check;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_content_type_check;

-- 2. Thêm constraint mới cho content_type (bao gồm 'news')
ALTER TABLE public.articles ADD CONSTRAINT articles_content_type_check
  CHECK (content_type IN ('article', 'page_content', 'news'));

-- 3. Thêm constraint mới cho page_type (cho phép 'news' có page_type = NULL)
ALTER TABLE public.articles ADD CONSTRAINT articles_page_type_check
  CHECK (
    (content_type = 'article' AND page_type IS NULL) OR
    (content_type = 'news' AND page_type IS NULL) OR
    (content_type = 'page_content' AND page_type = 'general')
  );
