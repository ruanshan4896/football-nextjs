import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchLeagueById, fetchLeagueFixtures, fetchLeagueRounds, type League, type Fixture } from '@/lib/api-football'
import { CURRENT_SEASON } from './standings'

export async function getLeagueById(leagueId: number): Promise<League | null> {
  return unstable_cache(
    () => fetchLeagueById(leagueId),
    [`league_${leagueId}`],
    { revalidate: 86400 * 7 }
  )()
}

export async function getLeagueRounds(leagueId: number, season = CURRENT_SEASON): Promise<string[]> {
  return unstable_cache(
    () => fetchLeagueRounds(leagueId, season),
    [`league_rounds_${leagueId}_${season}`],
    { revalidate: 86400 }
  )()
}

export async function getLeagueFixturesByRound(leagueId: number, season = CURRENT_SEASON, round: string): Promise<Fixture[]> {
  return unstable_cache(
    () => fetchLeagueFixtures(leagueId, season, round),
    [`league_fixtures_${leagueId}_${season}_${round}`],
    { revalidate: 300 }
  )()
}

export async function getCurrentRound(leagueId: number, season: number, rounds: string[]): Promise<string> {
  if (rounds.length === 0) return ''

  const now = Date.now()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000
  const recentRounds = rounds.slice(-5)

  for (let i = recentRounds.length - 1; i >= 0; i--) {
    const round = recentRounds[i]
    try {
      const fixtures = await getLeagueFixturesByRound(leagueId, season, round)
      if (fixtures.length === 0) continue

      const hasLive = fixtures.some(f => ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.fixture.status.short))
      if (hasLive) return round

      const hasUpcoming = fixtures.some(f => {
        if (f.fixture.status.short !== 'NS') return false
        const diff = new Date(f.fixture.date).getTime() - now
        return diff >= 0 && diff <= threeDaysMs
      })
      if (hasUpcoming) return round

      const hasFinished = fixtures.some(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short))
      if (hasFinished) return round
    } catch {
      continue
    }
  }

  return rounds[rounds.length - 1]
}
