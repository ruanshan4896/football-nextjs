import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchStandings, type Standing } from '@/lib/api-football'

export const CURRENT_SEASON = 2025

export const TRACKED_LEAGUES = [
  { id: 39,  name: 'Premier League',   season: 2025 },
  { id: 140, name: 'La Liga',          season: 2025 },
  { id: 135, name: 'Serie A',          season: 2025 },
  { id: 78,  name: 'Bundesliga',       season: 2025 },
  { id: 61,  name: 'Ligue 1',          season: 2025 },
  { id: 2,   name: 'Champions League', season: 2025 },
  { id: 340, name: 'V.League 1',       season: 2026 },
  { id: 1,   name: 'World Cup',        season: 2026, type: 'tournament' },
] as const

export async function getStandings(leagueId: number, season?: number): Promise<Standing[][]> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON

  return unstable_cache(
    () => fetchStandings(leagueId, resolvedSeason),
    [`standings_${leagueId}_${resolvedSeason}`],
    { revalidate: 3600 }
  )()
}

export async function refreshStandings(leagueId: number, season?: number): Promise<Standing[][]> {
  const { revalidateTag } = await import('next/cache')
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const standings = await fetchStandings(leagueId, resolvedSeason)
  revalidateTag(`standings_${leagueId}_${resolvedSeason}`)
  return standings
}

export async function refreshAllStandings(): Promise<void> {
  await Promise.all(TRACKED_LEAGUES.map(({ id, season }) => refreshStandings(id, season)))
}
