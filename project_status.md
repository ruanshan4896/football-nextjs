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

## 4. Database Schema (Draft)
- **Supabase:** 
  - `articles`: id, title, slug, content, match_id (nếu là nhận định trận), league_id, author, created_at, status, cover_image, excerpt.
  - `admin_users`: Quản lý tài khoản đăng nhập Admin.
- **Redis Cache Keys:**
  - `live_matches`: Chứa array các trận đang đá.
  - `standings_{league_id}_{season}`: Cập nhật mỗi giờ.
  - `fixtures_{date}`: Cập nhật mỗi ngày.
  - `odds_{league_id}_{bookmaker_id}`: Cache tỷ lệ kèo theo giải (7 ngày).
  - `bookmakers`: Cache danh sách nhà cái (7 ngày).

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

## 6. Installed Dependencies
```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@supabase/supabase-js": "latest",
    "@upstash/redis": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "typescript": "^5"
  }
}
```

## 7. Project Structure
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
│   └── api/cron/
│       ├── live/route.ts
│       ├── fixtures/route.ts
│       └── standings/route.ts
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
│       └── OddsCompactRow.tsx        # Row kèo compact (sidebar, chi tiết)
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── supabase-browser.ts
│   ├── redis.ts
│   ├── api-football.ts               # Fetch API-Football
│   ├── date.ts                       # Xử lý timezone VN
│   ├── json-ld.ts                    # Schema.org structured data
│   └── services/
│       ├── live.ts
│       ├── fixtures.ts
│       ├── standings.ts
│       ├── league.ts
│       ├── team.ts
│       └── odds.ts                   # getOddsByLeague, getOddsByFixture, helpers
├── supabase/schema.sql
└── .env.local
```

## 8. Current Context & Next Step
- **Current Status:** ✅ Deploy Netlify. Trang tỷ lệ kèo đã hoàn thiện với format mobile-first.
- **Latest Updates:** 
  - Redesign trang tỷ lệ kèo với layout 1 hàng/trận
  - Thêm tính năng chọn bookmaker
  - Cập nhật format hiển thị kèo toàn bộ trang (sidebar, chi tiết trận)
  - Sửa navigation issues (router.back(), window.location)
- **Next Step:** Thêm nội dung bài viết cho các trang (giải đấu, đội bóng, tỷ lệ kèo).