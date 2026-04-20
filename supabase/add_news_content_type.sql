-- Thêm giá trị 'news' vào content_type nếu cột đã tồn tại
-- Chạy trong Supabase Dashboard > SQL Editor

-- Nếu cột content_type chưa có, thêm vào
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'article'
CHECK (content_type IN ('article', 'page_content', 'news'));

-- Nếu cột đã có nhưng constraint chưa có 'news', cập nhật constraint
-- (Chạy nếu gặp lỗi constraint violation)
-- ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_content_type_check;
-- ALTER TABLE public.articles ADD CONSTRAINT articles_content_type_check 
--   CHECK (content_type IN ('article', 'page_content', 'news'));

-- Index cho content_type
CREATE INDEX IF NOT EXISTS articles_content_type_idx ON public.articles (content_type, published_at DESC);
