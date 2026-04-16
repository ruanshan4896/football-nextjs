# BÓNG ĐÁ LIVE - PROJECT STATUS & KNOWLEDGE BASE

## 1. Project Overview
- **Mục tiêu:** Xây dựng website dữ liệu bóng đá (Livescore, BXH, Lịch thi đấu, KQ, Tỷ lệ kèo) và tin tức nhận định. Tối ưu cực độ cho tốc độ tải trang và SEO.
- **Đối tượng:** Ưu tiên số 1 là người dùng Mobile (Giao diện App-like).
- **Nguồn dữ liệu:** `api-football.com`.

## 2. Tech Stack & Architecture
- **Frontend Framework:** Next.js (App Router) - Bắt buộc dùng Server Components (RSC) tối đa để tối ưu JS bundle.
- **Styling:** Tailwind CSS + Shadcn UI (nếu cần components nhanh).
- **Database & Auth (CMS/Admin):** Supabase (PostgreSQL). Quản lý bài viết tin tức, nhận định gắn với ID trận đấu.
- **Caching & Realtime:** Redis (Upstash). Dùng để cache dữ liệu API-Football tránh Rate Limit và phục vụ Livescore tốc độ cao.
- **State Management:** Zustand (chỉ dùng cho Client State nếu thật sự cần).

## 3. Core Rules (AI MUST READ AND FOLLOW)
1. **Mobile-First UI:** Luôn code giao diện Mobile trước. Cấu trúc Desktop là 3 cột (Left Sidebar 20% - Main 55% - Right Sidebar 25%). Trên Mobile: Left/Right Sidebar bị ẩn, dùng Bottom Navigation Bar và Drawer/Swipeable Carousel thay thế.
2. **API-Football Rule:** KHÔNG BAO GIỜ gọi trực tiếp từ Client. Flow chuẩn: Cronjob/Next API -> Gọi API-Football -> Lưu vào Redis/Supabase -> Next.js Frontend lấy data từ Redis/Supabase.
3. **SEO Rule:** Sử dụng Dynamic Meta Tags, JSON-LD cho tất cả các trang giải đấu, trận đấu. Tận dụng ISR (Incremental Static Regeneration) của Next.js cho lịch thi đấu/kết quả.
4. **Single Source of Truth:** Tiến độ, lỗi, cấu trúc Database PHẢI được cập nhật liên tục vào file `project_status.md` này. Cấm tạo file theo dõi khác.

## 4. Database Schema (Final)
- **Supabase Articles Table:** 
  - Core fields: `id, title, slug, content, excerpt, cover_image, author, status, created_at, updated_at, published_at`
  - Legacy fields: `match_id, league_id` (kept for backward compatibility)
  - **Simplified Content System (Current):**
    - `content_type`: 'article' | 'page_content'
    - `page_type`: Always 'general' for page_content (simplified)
    - `page_path`: Manual input path for content matching (e.g., '/giai-dau/39', '/ty-le-keo', '/bang-xep-hang?league=135')
  - **Removed Fields:** `entity_type, entity_id` (cleaned up April 2026)
- **Admin Users:** `admin_users` table for authentication
- **Redis Cache Keys:**
  - `live_matches`: Array of live matches
  - `standings_{league_id}_{season}`: Updated hourly
  - `fixtures_{date}`: Updated daily
  - `odds_{league_id}_{bookmaker_id}`: Odds cache by league (7 days)
  - `bookmakers`: Bookmaker list cache (7 days)

## 5. Task Progress
- [x] **Phase 1-5:** ✅ HOÀN THÀNH
- [x] **Post-launch improvements:**
  - [x] Timezone UTC+7, fix stale cache, season 2025/2026, V.League ID 340
  - [x] Trang `/giai-dau/[id]`: BXH + lịch vòng + tab Nhận định theo giải
  - [x] Trang `/doi-bong/[id]`: giải đấu thực tế, thống kê đầy đủ, lịch thi đấu
  - [x] Trang `/tran-dau/[id]`: Events, Statistics, Lineups
  - [x] Redesign BXH: StandingsTable, form dots cột riêng desktop
  - [x] `ArticleCard` component dùng chung, filter bài viết theo giải
  - [x] Fix team statistics API (response là object không phải array)
- [x] **Trang Tỷ lệ kèo (Hoàn thành):**
  - [x] Redesign layout mobile-first: 1 hàng/trận, 3 cột kèo (Chấp 64px, T/X 56px, 1×2 48px)
  - [x] Format kèo: Chấp (hệ số + odd 2 hàng), T/X (line + odd 2 hàng), 1×2 (3 hàng dọc)
  - [x] Tính năng chọn bookmaker (mặc định Bet365 ID=8)
  - [x] Logo đội bóng 16×16px
  - [x] Toggle hiển thị kèo hiệp 1 + kèo tỷ số (top 3)
  - [x] Chuẩn hóa font size: text-[11px] cho tất cả số và ký hiệu
  - [x] Sửa lỗi hydration với formatMatchDate
  - [x] Components: `BookmakerSelect.tsx`, `OddsMatchRow.tsx`, `OddsCompactRow.tsx`
- [x] **Navigation & UX:**
  - [x] Sửa navigation: thay window.location bằng Next.js router
  - [x] Tạo `BackButton` component với router.back()
  - [x] Fix button toggle trong Link component
- [x] **Cập nhật format kèo toàn bộ trang:**
  - [x] `RightSidebar`: Kèo nổi bật với format bảng (header + 3 cột)
  - [x] Trang `/tran-dau/[id]`: OddsSection với format bảng đơn giản
  - [x] `OddsCompactRow`: Format dọc giống bảng tỷ lệ kèo chính
- [x] **Hệ thống quản lý nội dung (CMS) - UPDATED 2026-04-16:**
  - [x] **Simplified Path-Based System (Active):**
    - `content_type`: 'article' (hiển thị /nhan-dinh) | 'page_content' (hiển thị theo path)
    - `page_type`: Luôn là 'general' cho page_content (đơn giản hóa)
    - `page_path`: Nhập trực tiếp path (VD: '/giai-dau/39', '/ty-le-keo', '/bang-xep-hang?league=135')
  - [x] Service layer: `lib/services/content.ts` với `getPageContentByPath()`
  - [x] Component: `PageContent.tsx` để render nội dung
  - [x] Tích hợp vào các trang: `/giai-dau/[id]`, `/doi-bong/[id]`, `/ty-le-keo`
  - [x] **Admin Form Simplified:**
    - [x] Chỉ 2 dropdown: "Bài viết" hoặc "Nội dung trang"
    - [x] Khi chọn "Nội dung trang": hiện field nhập path trực tiếp
    - [x] Validation: bắt buộc nhập page_path cho page_content
    - [x] Xóa hết dropdown phức tạp và auto-generation logic
- [x] **Admin Editor Improvements (MAJOR UPDATE 2026-04-16):**
  - [x] **WYSIWYG Rich Text Editor:** Tích hợp Tiptap editor thay thế textarea HTML thô
  - [x] **Professional Toolbar:** Undo/Redo, Headings (H2/H3), Bold/Italic/Code, Lists, Blockquote, Text Align, Link/Image
  - [x] **Real-time Preview:** WYSIWYG editing với preview mode toggle
  - [x] **Custom Prose Styling:** CSS tùy chỉnh cho typography, tương thích Tailwind v4
  - [x] **User-Friendly Interface:** Không còn cần viết HTML thô, editor trực quan như Word/Google Docs
  - [x] **Removed Legacy:** Xóa hết toolbar cũ và helper functions không cần thiết
- [x] **SEO Optimization (COMPLETED 2026-04-16):**
  - [x] **Canonical URLs:** Added to all dynamic pages (matches, leagues, teams, articles)
  - [x] **Environment-aware URLs:** Development uses localhost:3000, production uses bongdalive.com
  - [x] **JSON-LD Schemas:** Organization, SportsEvent, NewsArticle, SportsTeam, SportsLeague, BreadcrumbList
  - [x] **OG Image Generators:** Professional dynamic images for all page types using Next.js ImageResponse
  - [x] **Enhanced Sitemap:** 500+ URLs including leagues, teams, matches, and articles
  - [x] **Breadcrumb Navigation:** Component with structured data support
  - [x] **OpenGraph Metadata:** Proper descriptions and images for social media sharing
  - [x] **Local Development Fix:** Canonical URLs now work correctly in both dev and production

## 6. Installed Dependencies (Updated)
```json
{
  "dependencies": {
    "@supabase/ssr": "^0.10.2",
    "@supabase/supabase-js": "^2.103.0",
    "@upstash/redis": "^1.37.0",
    "lucide-react": "^1.8.0",
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@tiptap/react": "^2.x",
    "@tiptap/pm": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-link": "^2.x",
    "@tiptap/extension-image": "^2.x",
    "@tiptap/extension-text-align": "^2.x",
    "@tiptap/extension-list-item": "^2.x",
    "@tiptap/extension-bullet-list": "^2.x",
    "@tiptap/extension-ordered-list": "^2.x"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## 7. Project Structure (Cleaned)
```
/
├── app/
│   ├── layout.tsx                    # Root layout: Header + 3-col + BottomNav
│   ├── page.tsx                      # Trang chủ: LiveSection + TodaySection
│   ├── globals.css
│   ├── lich-thi-dau/page.tsx         # Date picker 7 ngày + danh sách trận
│   ├── bang-xep-hang/page.tsx        # Tab giải đấu + bảng xếp hạng
│   ├── nhan-dinh/
│   │   ├── page.tsx                  # Danh sách bài viết từ Supabase
│   │   └── [slug]/page.tsx           # Chi tiết bài viết + mini scoreboard
│   ├── tran-dau/[id]/page.tsx        # Chi tiết trận + bài nhận định + kèo
│   ├── ty-le-keo/
│   │   ├── page.tsx                  # Bảng tỷ lệ kèo chính
│   │   ├── BookmakerSelect.tsx       # Dropdown chọn nhà cái
│   │   └── OddsMatchRow.tsx          # Row hiển thị kèo với toggle
│   ├── giai-dau/[id]/page.tsx        # BXH + lịch vòng + nhận định
│   ├── doi-bong/[id]/page.tsx        # Thống kê + lịch thi đấu
│   ├── (admin)/                      # Admin panel routes
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── login/
│   │       └── bai-viet/             # Article management
│   └── api/
│       ├── admin/                    # Admin API routes
│       └── cron/                     # Scheduled jobs
│           ├── live/route.ts
│           ├── fixtures/route.ts
│           └── standings/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── LeftSidebar.tsx
│   │   └── RightSidebar.tsx          # Tin HOT + Kèo nổi bật
│   └── ui/
│       ├── MatchStatusBadge.tsx      # Badge LIVE/giờ/KT/Hoãn
│       ├── LeagueGroupHeader.tsx     # Header nhóm theo giải
│       ├── MatchRow.tsx              # 1 hàng trận đấu
│       ├── FixtureList.tsx           # Danh sách trận (dùng chung)
│       ├── ArticleCard.tsx           # Card bài viết (2 variants)
│       ├── StandingsTable.tsx        # Bảng xếp hạng
│       ├── BackButton.tsx            # Nút quay lại với router.back()
│       ├── PageContent.tsx           # Render page content
│       ├── RichTextEditor.tsx        # Tiptap WYSIWYG editor component
│       ├── RichTextEditorWrapper.tsx # SSR-safe wrapper for editor
│       ├── ImageDialog.tsx           # Professional image insert dialog
│       ├── LinkDialog.tsx            # Professional link insert dialog
│       └── OddsCompactRow.tsx        # Row kèo compact (sidebar, chi tiết)
├── lib/
│   ├── supabase.ts, supabase-server.ts, supabase-browser.ts
│   ├── redis.ts
│   ├── api-football.ts               # Fetch API-Football
│   ├── date.ts                       # Xử lý timezone VN
│   ├── json-ld.ts                    # Schema.org structured data
│   └── services/
│       ├── live.ts, fixtures.ts, standings.ts
│       ├── league.ts, team.ts
│       ├── odds.ts                   # getOddsByLeague, getOddsByFixture, helpers
│       └── content.ts                # getPageContentByPath
├── supabase/
│   ├── schema.sql                    # Current database schema
│   └── cleanup_legacy_columns.sql    # Final cleanup migration
├── public/                           # (Cleaned - removed unused assets)
├── .env.local
├── package.json                      # (Cleaned dependencies)
├── README.md                         # (Updated with project info)
├── netlify.toml, vercel.json, railway.toml  # Multi-platform deployment
└── project_status.md                 # This file
```

## 8. Current Context & Next Step
- **Current Status:** ✅ Project fully optimized with comprehensive SEO implementation. Production-ready system.
- **Latest Updates (April 16, 2026):** 
  - **MAJOR SEO UPGRADE:** Complete SEO audit and optimization
  - **SEO Features Added:**
    - ✅ Canonical URLs for all dynamic pages (matches, leagues, teams, articles)
    - ✅ Environment-aware URLs (localhost for dev, production domain for prod)
    - ✅ Comprehensive JSON-LD schemas: Organization, SportsEvent, NewsArticle, SportsTeam, SportsLeague, BreadcrumbList
    - ✅ Professional OG image generators for all dynamic pages using Next.js ImageResponse
    - ✅ Enhanced sitemap with 500+ URLs including leagues, teams, matches, and articles
    - ✅ Breadcrumb navigation with structured data support
    - ✅ Improved OpenGraph metadata with proper descriptions and images
  - **WYSIWYG Editor:** Professional Tiptap editor with rich toolbar and real-time preview
  - **Project Cleanup:** 11 redundant files deleted, dependencies optimized
  - **CMS System:** Simplified path-based content management
- **SEO Compliance:** All pages now have proper canonical URLs, structured data, and social media optimization
- **Next Step:** World Cup 2026 Phase 3 completed successfully. All 3 phases of World Cup 2026 implementation are now complete with comprehensive tournament coverage.

## TASK 7: World Cup 2026 Implementation - Phase 1
- **STATUS**: ✅ COMPLETED
- **USER QUERIES**: 7 ("Hãy bắt đầu Phase 1")
- **DETAILS**: Successfully implemented World Cup 2026 Phase 1 with accurate data from API-Football. Created tournament structure, services, and basic UI.
- **COMPLETED TASKS**:
  * ✅ Added World Cup to TRACKED_LEAGUES with correct ID (1) and season (2026)
  * ✅ Created comprehensive World Cup service (`lib/services/worldcup.ts`)
  * ✅ Verified API data: 12 groups (A-L), 4 teams per group, 48 total teams
  * ✅ Built main World Cup page (`/world-cup-2026`) with groups grid
  * ✅ Created group detail pages (`/world-cup-2026/bang-dau/[group]`)
  * ✅ Added World Cup routes to sitemap (13 new URLs)
  * ✅ Updated navigation to include "World Cup 2026"
  * ✅ Implemented proper caching strategy (1 hour for standings, 30 min for fixtures)
- **FILEPATHS**: `lib/services/worldcup.ts`, `app/world-cup-2026/`, `lib/services/standings.ts`, `app/sitemap.ts`, `components/layout/LeftSidebar.tsx`

## TASK 8: World Cup 2026 Implementation - Phase 2
- **STATUS**: ✅ COMPLETED
- **USER QUERIES**: 8 ("hãy tiếp tục sang Phase 2")
- **DETAILS**: Successfully implemented Phase 2 with fixtures schedule and statistics pages. Created comprehensive tournament navigation and data visualization.
- **COMPLETED TASKS**:
  * ✅ Created fixtures page (`/world-cup-2026/lich-thi-dau`) with round navigation
  * ✅ Built statistics page (`/world-cup-2026/thong-ke`) with third-place ranking
  * ✅ Implemented round-based fixture filtering (Group Stage - 1, 2, 3)
  * ✅ Added fixtures grouped by date with proper Vietnamese formatting
  * ✅ Created third-place teams ranking with qualification status
  * ✅ Built group winners summary with visual cards
  * ✅ Added tournament format explanation and rules
  * ✅ Implemented responsive navigation (desktop tabs, mobile navigation)
  * ✅ Added 2 new URLs to sitemap (total 15 World Cup URLs)
  * ✅ Consistent navigation tabs across all World Cup pages
- **FILEPATHS**: `app/world-cup-2026/lich-thi-dau/`, `app/world-cup-2026/thong-ke/`, `app/sitemap.ts`

## TASK 9: World Cup 2026 Implementation - Phase 3
- **STATUS**: ✅ COMPLETED
- **USER QUERIES**: 9 ("tiếp tục sang phase 3")
- **DETAILS**: Successfully completed Phase 3 with knockout bracket visualization. Created comprehensive bracket system with desktop tree view and mobile list view.
- **COMPLETED TASKS**:
  * ✅ Completed knockout service (`lib/services/worldcup-knockout.ts`) with bracket generation logic
  * ✅ Created knockout bracket page (`/world-cup-2026/knockout`) with professional visualization
  * ✅ Built desktop bracket tree view with 6-column layout (Round 32 → Final)
  * ✅ Implemented mobile-friendly list view with collapsible rounds
  * ✅ Added bracket progression visualization with team logos and scores
  * ✅ Created tournament progression info with visual roadmap
  * ✅ Updated navigation tabs across all World Cup pages to include "Knockout"
  * ✅ Added knockout page to sitemap (total 16 World Cup URLs)
  * ✅ Implemented proper match status indicators (scheduled/live/finished)
  * ✅ Added FIFA World Cup 2026 format explanation (32 teams → 16 → 8 → 4 → 2 → 1)
- **FILEPATHS**: `app/world-cup-2026/knockout/page.tsx`, `lib/services/worldcup-knockout.ts`, `app/sitemap.ts`, all World Cup navigation tabs