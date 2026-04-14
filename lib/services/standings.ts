import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchStandings, type Standing } from '@/lib/api-football'

// Mùa giải hiện tại
export const CURRENT_SEASON = 2024

// Các giải đấu theo dõi mặc định
export const TRACKED_LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' },
  { id: 2, name: 'Champions League' },
  { id: 197, name: 'V.League 1' },
] as const

/**
 * Lấy bảng xếp hạng theo giải đấu.
 * Flow: Redis cache (1 giờ) -> API-Football -> lưu Redis -> trả về
 */
export async function getStandings(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<Standing[][]> {
  const cacheKey = CACHE_KEYS.STANDINGS(leagueId, season)

  const cached = await redis.get<Standing[][]>(cacheKey)
  if (cached) return cached

  const standings = await fetchStandings(leagueId, season)
  await redis.set(cacheKey, standings, { ex: CACHE_TTL.STANDINGS })

  return standings
}

/**
 * Force refresh BXH (dùng cho cronjob)
 */
export async function refreshStandings(
  leagueId: number,
  season: number = CURRENT_SEASON
): Promise<Standing[][]> {
  const standings = await fetchStandings(leagueId, season)
  await redis.set(CACHE_KEYS.STANDINGS(leagueId, season), standings, { ex: CACHE_TTL.STANDINGS })
  return standings
}

/**
 * Refresh tất cả các giải đấu đang theo dõi (dùng cho cronjob hàng giờ)
 */
export async function refreshAllStandings(): Promise<void> {
  await Promise.all(
    TRACKED_LEAGUES.map(({ id }) => refreshStandings(id, CURRENT_SEASON))
  )
}
