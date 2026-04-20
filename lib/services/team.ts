import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchTeamById, fetchTeamStatistics, fetchTeamFixtures, fetchTeamLeagues, type Team, type TeamStatistics, type Fixture } from '@/lib/api-football'
import { CURRENT_SEASON } from './standings'

export async function getTeamById(teamId: number): Promise<Team | null> {
  return unstable_cache(
    () => fetchTeamById(teamId),
    [`team_${teamId}`],
    { revalidate: 86400 * 7 }
  )()
}

export async function getTeamStatistics(teamId: number, leagueId: number, season = CURRENT_SEASON): Promise<TeamStatistics | null> {
  return unstable_cache(
    () => fetchTeamStatistics(teamId, leagueId, season),
    [`team_stats_${teamId}_${leagueId}_${season}`],
    { revalidate: 3600 }
  )()
}

export async function getTeamFixtures(teamId: number, season = CURRENT_SEASON): Promise<{ last: Fixture[]; next: Fixture[] }> {
  return unstable_cache(
    () => fetchTeamFixtures(teamId, season, 5, 5),
    [`team_fixtures_${teamId}_${season}`],
    { revalidate: 3600 }
  )()
}

export async function getTeamLeagues(teamId: number, season: number): Promise<Array<{ id: number; name: string; logo: string; type: string }>> {
  return unstable_cache(
    async () => {
      const leagues = await fetchTeamLeagues(teamId, season)
      return leagues.filter(l => !l.name.toLowerCase().includes('friendl'))
    },
    [`team_leagues_${teamId}_${season}`],
    { revalidate: 86400 }
  )()
}
