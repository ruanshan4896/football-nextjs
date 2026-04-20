import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { TRACKED_LEAGUES } from './standings'

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

export async function searchLeagues(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  return unstable_cache(
    async () => {
      const lowerQuery = query.toLowerCase()
      const results: SearchResult[] = []

      TRACKED_LEAGUES.forEach(league => {
        if (league.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: league.id.toString(),
            type: 'league',
            title: league.name,
            subtitle: `Mùa ${league.season}`,
            description: league.id === 1 ? 'Giải đấu quốc tế' : 'Giải câu lạc bộ',
            image: `https://media.api-sports.io/football/leagues/${league.id}.png`,
            url: league.id === 1 ? '/world-cup-2026' : `/giai-dau/${league.id}`,
            relevance: league.name.toLowerCase().startsWith(lowerQuery) ? 100 : 80,
          })
        }
      })

      return results.sort((a, b) => b.relevance - a.relevance)
    },
    [`search_leagues_${query.toLowerCase()}`],
    { revalidate: 3600 }
  )()
}

export async function searchTeams(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) return []

  return unstable_cache(
    async () => {
      const { searchTeams: apiSearchTeams } = await import('@/lib/api-football')
      const teams = await apiSearchTeams(query)
      const lowerQuery = query.toLowerCase()

      return teams.slice(0, 10).map(team => {
        const lowerName = team.team.name.toLowerCase()
        let relevance = 50
        if (lowerName.startsWith(lowerQuery)) relevance = 100
        else if (lowerName.includes(lowerQuery)) relevance = 80
        if (team.team.founded) relevance += 10

        return {
          id: team.team.id.toString(),
          type: 'team' as const,
          title: team.team.name,
          subtitle: team.team.country || 'Đội bóng',
          description: team.team.founded ? `Thành lập ${team.team.founded}` : undefined,
          image: team.team.logo,
          url: `/doi-bong/${team.team.id}`,
          relevance,
        }
      }).sort((a, b) => b.relevance - a.relevance)
    },
    [`search_teams_${query.toLowerCase()}`],
    { revalidate: 7200 }
  )()
}

export async function searchArticles(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  return unstable_cache(
    async () => {
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image, published_at')
        .eq('status', 'published')
        .eq('content_type', 'article')
        .or(`title.ilike.%${query}%, excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(15)

      if (!articles) return []

      const lowerQuery = query.toLowerCase()
      return articles.map(article => {
        const lowerTitle = article.title.toLowerCase()
        let relevance = 50
        if (lowerTitle.startsWith(lowerQuery)) relevance = 100
        else if (lowerTitle.includes(lowerQuery)) relevance = 80
        const daysSince = (Date.now() - new Date(article.published_at).getTime()) / 86400000
        if (daysSince < 7) relevance += 10
        else if (daysSince < 30) relevance += 5

        return {
          id: article.id.toString(),
          type: 'article' as const,
          title: article.title,
          subtitle: 'Bài viết nhận định',
          description: article.excerpt || undefined,
          image: article.cover_image || undefined,
          url: `/nhan-dinh/${article.slug}`,
          relevance,
        }
      }).sort((a, b) => b.relevance - a.relevance)
    },
    [`search_articles_${query.toLowerCase()}`],
    { revalidate: 1800 }
  )()
}

export async function searchAll(query: string): Promise<{
  leagues: SearchResult[]
  teams: SearchResult[]
  articles: SearchResult[]
  total: number
}> {
  if (!query || query.length < 2) return { leagues: [], teams: [], articles: [], total: 0 }

  const [leagues, teams, articles] = await Promise.all([
    searchLeagues(query),
    searchTeams(query),
    searchArticles(query),
  ])

  return { leagues, teams, articles, total: leagues.length + teams.length + articles.length }
}

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
    { text: 'Manchester City', type: 'team' },
    { text: 'Bayern Munich', type: 'team' },
    { text: 'V.League', type: 'league' },
    { text: 'La Liga', type: 'league' },
    { text: 'Serie A', type: 'league' },
  ]
}
