import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import {
  fetchTeamById,
  fetchTeamStatistics,
  fetchTeamFixtures,
  fetchTeamLeagues,
  type Team,
  type TeamStatistics,
  type Fixture,
} from '@/lib/api-football'
import { CURRENT_SEASON } from './standings'

export async function getTeamById(teamId: number): Promise<Team | null> {
  const cacheKey = CACHE_KEYS.TEAM(teamId)
  const cached = await redis.get<Team>(cacheKey)
  if (cached) return cached

  const team = await fetchTeamById(teamId)
  if (team) await redis.set(cacheKey, team, { ex: CACHE_TTL.TEAM })
  return team
}

export async function getTeamStatistics(
  teamId: number,
  leagueId: number,
  season = CURRENT_SEASON
): Promise<TeamStatistics | null> {
  const cacheKey = CACHE_KEYS.TEAM_STATS(teamId, leagueId, season)
  const cached = await redis.get<TeamStatistics>(cacheKey)
  if (cached) return cached

  const stats = await fetchTeamStatistics(teamId, leagueId, season)
  if (stats) await redis.set(cacheKey, stats, { ex: CACHE_TTL.TEAM_STATS })
  return stats
}

export async function getTeamFixtures(
  teamId: number,
  season = CURRENT_SEASON
): Promise<{ last: Fixture[]; next: Fixture[] }> {
  const cacheKey = CACHE_KEYS.TEAM_FIXTURES(teamId, season)
  const cached = await redis.get<{ last: Fixture[]; next: Fixture[] }>(cacheKey)
  if (cached) return cached

  const fixtures = await fetchTeamFixtures(teamId, season, 5, 5)
  await redis.set(cacheKey, fixtures, { ex: CACHE_TTL.TEAM_FIXTURES })
  return fixtures
}

/**
 * Lấy danh sách giải đấu thực tế của đội trong mùa
 * Lọc bỏ Friendlies, chỉ giữ League và Cup
 */
export async function getTeamLeagues(
  teamId: number,
  season: number
): Promise<Array<{ id: number; name: string; logo: string; type: string }>> {
  const cacheKey = CACHE_KEYS.TEAM_LEAGUES(teamId, season)
  const cached = await redis.get<Array<{ id: number; name: string; logo: string; type: string }>>(cacheKey)
  if (cached) return cached

  const leagues = await fetchTeamLeagues(teamId, season)
  // Lọc bỏ Friendlies
  const filtered = leagues.filter(l => !l.name.toLowerCase().includes('friendl'))
  await redis.set(cacheKey, filtered, { ex: CACHE_TTL.TEAM_LEAGUES })
  return filtered
}
