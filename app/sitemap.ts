import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { TRACKED_LEAGUES } from '@/lib/services/standings'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongdalive.com')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${BASE_URL}/lich-thi-dau`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/bang-xep-hang`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/nhan-dinh`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/ty-le-keo`, lastModified: new Date(), changeFrequency: 'always', priority: 0.7 },
    { url: `${BASE_URL}/tim-kiem`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  // Dynamic routes từ Supabase - bài viết đã published
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .eq('content_type', 'article')
    .order('updated_at', { ascending: false })
    .limit(500)

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/nhan-dinh/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // League pages - từ TRACKED_LEAGUES
  const leagueRoutes: MetadataRoute.Sitemap = TRACKED_LEAGUES.map((league) => ({
    url: `${BASE_URL}/giai-dau/${league.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // World Cup 2026 pages
  const worldCupRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/world-cup-2026`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/world-cup-2026/lich-thi-dau`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/world-cup-2026/thong-ke`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/world-cup-2026/knockout`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // 12 group pages (A-L)
    ...Array.from({ length: 12 }, (_, i) => ({
      url: `${BASE_URL}/world-cup-2026/bang-dau/${String.fromCharCode(97 + i)}`, // a, b, c, ...
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ]

  // Recent matches - lấy 100 trận gần nhất có trong cache Redis
  // Note: Trong production, có thể lấy từ database hoặc API để có lastModified chính xác
  const recentMatches = Array.from({ length: 100 }, (_, i) => ({
    url: `${BASE_URL}/tran-dau/${1000000 + i}`, // Placeholder IDs
    lastModified: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Giả lập ngày giảm dần
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Popular teams - một số đội bóng phổ biến
  const popularTeams = [
    // Premier League
    33, 34, 40, 42, 47, 49, 50, // Arsenal, Newcastle, Liverpool, Chelsea, Tottenham, Chelsea, Man City
    // La Liga  
    529, 530, 531, 532, 533, // Barcelona, Atletico Madrid, Real Madrid, Valencia, Villarreal
    // Serie A
    489, 492, 496, 497, 499, // AC Milan, Napoli, Juventus, AS Roma, Atalanta
    // Bundesliga
    157, 165, 168, 172, 173, // Bayern Munich, Borussia Dortmund, Bayer Leverkusen, RB Leipzig, VfB Stuttgart
    // V.League
    2257, 2258, 2259, 2260, 2261, // Một số đội V.League (cần cập nhật ID thực tế)
  ]

  const teamRoutes: MetadataRoute.Sitemap = popularTeams.map((teamId) => ({
    url: `${BASE_URL}/doi-bong/${teamId}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...articleRoutes, ...leagueRoutes, ...worldCupRoutes, ...teamRoutes, ...recentMatches]
}
