# ⚽ Bóng Đá Live - Football Data Platform

A comprehensive football data platform built with Next.js, providing live scores, fixtures, standings, odds, and match predictions for Vietnamese football fans.

## 🎯 Features

- **Live Scores & Fixtures** - Real-time match data with minute-by-minute updates
- **League Standings** - Complete league tables with form indicators
- **Odds Comparison** - Multi-bookmaker odds display with mobile-optimized layout
- **Match Predictions** - Editorial content and match analysis
- **Team & League Pages** - Detailed statistics and information
- **Admin CMS** - Content management system for articles and page content
- **Mobile-First Design** - Optimized for mobile users with app-like experience

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) with Server Components
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Caching:** Upstash Redis
- **Data Source:** API-Football.com
- **Deployment:** Netlify / Vercel / Railway
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd temp-football
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Redis connection URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token
- `API_FOOTBALL_KEY` - API-Football.com API key

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin panel routes
│   ├── api/               # API routes & cron jobs
│   ├── bang-xep-hang/     # League standings
│   ├── doi-bong/          # Team pages
│   ├── giai-dau/          # League pages
│   ├── lich-thi-dau/      # Fixtures
│   ├── nhan-dinh/         # Match predictions
│   ├── tran-dau/          # Match details
│   └── ty-le-keo/         # Odds comparison
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utilities & services
│   └── services/         # Data service layer
└── supabase/             # Database schema & migrations
```

## 🔧 Key Features

### Content Management System
- **Article Type:** News and match predictions displayed at `/nhan-dinh`
- **Page Content:** Static content for specific pages (guides, introductions)
- **Path-Based Routing:** Flexible content matching using `page_path`

### Data Caching Strategy
- **Redis Cache:** API-Football data cached to avoid rate limits
- **Scheduled Updates:** Cron jobs for live scores, fixtures, and standings
- **ISR:** Incremental Static Regeneration for optimal performance

### Mobile-First Design
- **Responsive Layout:** 3-column desktop, mobile-optimized navigation
- **Touch-Friendly:** Optimized for mobile interactions
- **Fast Loading:** Minimal JavaScript bundle with Server Components

## 🚀 Deployment

The application supports multiple deployment platforms:

### Netlify
```bash
npm run build
# Deploy to Netlify with netlify.toml configuration
```

### Vercel
```bash
npm run build
# Deploy to Vercel with vercel.json configuration
```

### Railway
```bash
npm run build
# Deploy to Railway with railway.toml configuration
```

## 📊 Database Schema

### Articles Table
- `id, title, slug, content, excerpt, cover_image`
- `author, status, created_at, updated_at, published_at`
- `match_id, league_id` (legacy compatibility)
- `content_type` ('article' | 'page_content')
- `page_type` ('general' for all page_content)
- `page_path` (full path for content matching)

## 🔄 Cron Jobs

- **Live Scores:** Every minute (`/api/cron/live`)
- **Fixtures:** Daily at 00:01 (`/api/cron/fixtures`)
- **Standings:** Hourly (`/api/cron/standings`)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For development guidelines, see `project_status.md`.
