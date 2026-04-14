-- ============================================================
-- BÓNG ĐÁ LIVE - Supabase Database Schema
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: articles
-- Lưu bài viết tin tức và nhận định trận đấu
-- ============================================================
create table if not exists public.articles (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  slug        text not null unique,
  content     text not null,                    -- Nội dung HTML/Markdown
  excerpt     text,                             -- Tóm tắt ngắn (dùng cho card preview)
  cover_image text,                             -- URL ảnh bìa
  match_id    integer,                          -- ID trận đấu từ API-Football (nullable - không phải bài nào cũng gắn trận)
  league_id   integer,                          -- ID giải đấu từ API-Football
  author      text not null default 'Admin',
  status      text not null default 'draft'     -- 'draft' | 'published'
                check (status in ('draft', 'published')),
  published_at timestamptz,                     -- Null nếu còn là draft
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index để query nhanh theo slug, match_id, status
create index if not exists articles_slug_idx      on public.articles (slug);
create index if not exists articles_match_id_idx  on public.articles (match_id);
create index if not exists articles_status_idx    on public.articles (status, published_at desc);
create index if not exists articles_league_id_idx on public.articles (league_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Bật RLS
alter table public.articles enable row level security;

-- Policy: Ai cũng đọc được bài đã published
create policy "Public can read published articles"
  on public.articles for select
  using (status = 'published');

-- Policy: Chỉ service_role (admin) mới được insert/update/delete
-- (Dùng supabaseAdmin client với secret key để bypass RLS)
create policy "Service role has full access"
  on public.articles for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLE: admin_sessions (optional - nếu dùng custom auth)
-- Supabase Auth tự quản lý sessions, bảng này chỉ để track
-- ============================================================
-- Hiện tại dùng Supabase Auth built-in, không cần bảng riêng.
-- Admin login qua: supabase.auth.signInWithPassword()

-- ============================================================
-- SAMPLE DATA (xóa trước khi deploy production)
-- ============================================================
insert into public.articles (title, slug, content, excerpt, match_id, league_id, status, published_at)
values (
  'Nhận định Man City vs Arsenal: Trận cầu đinh vòng 30',
  'nhan-dinh-man-city-vs-arsenal-vong-30',
  '<p>Đây là trận đấu được mong chờ nhất vòng 30 Premier League...</p>',
  'Man City tiếp đón Arsenal trong trận cầu có thể quyết định ngôi vô địch.',
  1035066,
  39,
  'published',
  now()
);
