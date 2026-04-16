import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchStandings, type Standing } from '@/lib/api-football'

// Mùa giải hiện tại cho các giải châu Âu (2025-26)
export const CURRENT_SEASON = 2025

// Các giải đấu theo dõi — season có thể khác nhau tùy giải
export const TRACKED_LEAGUES = [
  { id: 39,  name: 'Premier League',   season: 2025 },
  { id: 140, name: 'La Liga',          season: 2025 },
  { id: 135, name: 'Serie A',          season: 2025 },
  { id: 78,  name: 'Bundesliga',       season: 2025 },
  { id: 61,  name: 'Ligue 1',          season: 2025 },
  { id: 2,   name: 'Champions League', season: 2025 },
  { id: 340, name: 'V.League 1',       season: 2026 }, // V.League dùng năm kết thúc mùa
  { id: 1,   name: 'World Cup',        season: 2026, type: 'tournament' }, // World Cup 2026
] as const

/**
 * Lấy bảng xếp hạng theo giải đấu.
 * Tự động dùng đúng season của từng giải.
 */
export async function getStandings(
  leagueId: number,
  season?: number
): Promise<Standing[][]> {
  // Nếu không truyền season, tự tìm season đúng từ TRACKED_LEAGUES
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const cacheKey = CACHE_KEYS.STANDINGS(leagueId, resolvedSeason)

  const cached = await redis.get<Standing[][]>(cacheKey)
  if (cached) return cached

  const standings = await fetchStandings(leagueId, resolvedSeason)
  await redis.set(cacheKey, standings, { ex: CACHE_TTL.STANDINGS })

  return standings
}

/**
 * Force refresh BXH (dùng cho cronjob)
 */
export async function refreshStandings(
  leagueId: number,
  season?: number
): Promise<Standing[][]> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const standings = await fetchStandings(leagueId, resolvedSeason)
  await redis.set(CACHE_KEYS.STANDINGS(leagueId, resolvedSeason), standings, { ex: CACHE_TTL.STANDINGS })
  return standings
}

/**
 * Refresh tất cả các giải đấu đang theo dõi (dùng cho cronjob hàng giờ)
 */
export async function refreshAllStandings(): Promise<void> {
  await Promise.all(
    TRACKED_LEAGUES.map(({ id, season }) => refreshStandings(id, season))
  )
}
