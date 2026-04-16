import 'server-only'
import { redis, CACHE_TTL } from '@/lib/redis'
import { supabase } from '@/lib/supabase'
import { TRACKED_LEAGUES } from './standings'

// Cache key cho tìm kiếm
const SEARCH_CACHE_KEY = (query: string, type: string) => `search_${type}_${query.toLowerCase()}`

// Interface cho kết quả tìm kiếm
export interface SearchResult {
  id: string
  type: 'league' | 'team' | 'article'
  title: string
  subtitle?: string
  description?: string
  image?: string
  url: string
  relevance: number
}

/**
 * Tìm kiếm giải đấu
 */
export async function searchLeagues(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const cacheKey = SEARCH_CACHE_KEY(query, 'leagues')
  
  try {
    // Kiểm tra cache
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // Tìm trong TRACKED_LEAGUES
    TRACKED_LEAGUES.forEach(league => {
      const nameMatch = league.name.toLowerCase().includes(lowerQuery)
      
      if (nameMatch) {
        const relevance = league.name.toLowerCase().startsWith(lowerQuery) ? 100 : 80
        
        results.push({
          id: league.id.toString(),
          type: 'league',
          title: league.name,
          subtitle: `Mùa ${league.season}`,
          description: league.id === 1 ? 'Giải đấu quốc tế' : 'Giải câu lạc bộ',
          image: `https://media.api-sports.io/football/leagues/${league.id}.png`,
          url: league.id === 1 ? '/world-cup-2026' : `/giai-dau/${league.id}`,
          relevance
        })
      }
    })

    // Sắp xếp theo độ liên quan
    results.sort((a, b) => b.relevance - a.relevance)

    // Cache 1 giờ
    await redis.setex(cacheKey, CACHE_TTL.STANDINGS, JSON.stringify(results))
    
    return results
  } catch (error) {
    console.error('Error searching leagues:', error)
    return []
  }
}

/**
 * Tìm kiếm đội bóng từ API-Football
 */
export async function searchTeams(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) return [] // Tối thiểu 3 ký tự cho đội bóng

  const cacheKey = SEARCH_CACHE_KEY(query, 'teams')
  
  try {
    // Kiểm tra cache
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Gọi API-Football để tìm đội bóng
    const { searchTeams: apiSearchTeams } = await import('@/lib/api-football')
    const teams = await apiSearchTeams(query)

    const results: SearchResult[] = teams.slice(0, 10).map(team => {
      const lowerQuery = query.toLowerCase()
      const lowerName = team.team.name.toLowerCase()
      
      // Tính độ liên quan
      let relevance = 50
      if (lowerName.startsWith(lowerQuery)) relevance = 100
      else if (lowerName.includes(lowerQuery)) relevance = 80
      
      // Ưu tiên đội bóng nổi tiếng (có founded date)
      if (team.team.founded) relevance += 10

      return {
        id: team.team.id.toString(),
        type: 'team' as const,
        title: team.team.name,
        subtitle: team.team.country || 'Đội bóng',
        description: team.team.founded ? `Thành lập ${team.team.founded}` : undefined,
        image: team.team.logo,
        url: `/doi-bong/${team.team.id}`,
        relevance
      }
    })

    // Sắp xếp theo độ liên quan
    results.sort((a, b) => b.relevance - a.relevance)

    // Cache 2 giờ
    await redis.setex(cacheKey, CACHE_TTL.STANDINGS * 2, JSON.stringify(results))
    
    return results
  } catch (error) {
    console.error('Error searching teams:', error)
    return []
  }
}

/**
 * Tìm kiếm bài viết
 */
export async function searchArticles(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const cacheKey = SEARCH_CACHE_KEY(query, 'articles')
  
  try {
    // Kiểm tra cache
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Tìm kiếm trong Supabase với full-text search
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image, published_at')
      .eq('status', 'published')
      .eq('content_type', 'article')
      .or(`title.ilike.%${query}%, excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(15)

    if (!articles) return []

    const results: SearchResult[] = articles.map(article => {
      const lowerQuery = query.toLowerCase()
      const lowerTitle = article.title.toLowerCase()
      
      // Tính độ liên quan
      let relevance = 50
      if (lowerTitle.includes(lowerQuery)) {
        if (lowerTitle.startsWith(lowerQuery)) relevance = 100
        else relevance = 80
      }
      
      // Ưu tiên bài viết mới
      const daysSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSincePublished < 7) relevance += 10
      else if (daysSincePublished < 30) relevance += 5

      return {
        id: article.id.toString(),
        type: 'article' as const,
        title: article.title,
        subtitle: 'Bài viết nhận định',
        description: article.excerpt || undefined,
        image: article.cover_image || undefined,
        url: `/nhan-dinh/${article.slug}`,
        relevance
      }
    })

    // Sắp xếp theo độ liên quan
    results.sort((a, b) => b.relevance - a.relevance)

    // Cache 30 phút
    await redis.setex(cacheKey, CACHE_TTL.ODDS, JSON.stringify(results))
    
    return results
  } catch (error) {
    console.error('Error searching articles:', error)
    return []
  }
}

/**
 * Tìm kiếm tổng hợp
 */
export async function searchAll(query: string): Promise<{
  leagues: SearchResult[]
  teams: SearchResult[]
  articles: SearchResult[]
  total: number
}> {
  if (!query || query.length < 2) {
    return { leagues: [], teams: [], articles: [], total: 0 }
  }

  try {
    // Tìm kiếm song song
    const [leagues, teams, articles] = await Promise.all([
      searchLeagues(query),
      searchTeams(query),
      searchArticles(query)
    ])

    return {
      leagues,
      teams,
      articles,
      total: leagues.length + teams.length + articles.length
    }
  } catch (error) {
    console.error('Error in searchAll:', error)
    return { leagues: [], teams: [], articles: [], total: 0 }
  }
}

/**
 * Gợi ý tìm kiếm phổ biến
 */
export function getSearchSuggestions(): Array<{ text: string; type: string }> {
  return [
    { text: 'Premier League', type: 'league' },
    { text: 'Champions League', type: 'league' },
    { text: 'World Cup 2026', type: 'tournament' },
    { text: 'Manchester United', type: 'team' },
    { text: 'Real Madrid', type: 'team' },
    { text: 'Barcelona', type: 'team' },
    { text: 'Liverpool', type: 'team' },
    { text: 'Arsenal', type: 'team' },
    { text: 'Chelsea', type: 'team' },
    { text: 'Manchester City', type: 'team' },
    { text: 'Bayern Munich', type: 'team' },
    { text: 'PSG', type: 'team' },
    { text: 'V.League', type: 'league' },
    { text: 'La Liga', type: 'league' },
    { text: 'Serie A', type: 'league' },
  ]
}

/**
 * Làm sạch cache tìm kiếm
 */
export async function clearSearchCache(): Promise<void> {
  try {
    // Xóa tất cả cache tìm kiếm (pattern matching)
    const keys = await redis.keys('search_*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Error clearing search cache:', error)
  }
}