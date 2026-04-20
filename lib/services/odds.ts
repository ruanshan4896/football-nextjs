import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchOddsByLeague, fetchOddsByFixture, fetchBookmakers, type FixtureOdds, type OddsValue, type Bookmaker } from '@/lib/api-football'
import { TRACKED_LEAGUES, CURRENT_SEASON } from './standings'

export async function getBookmakers(): Promise<Bookmaker[]> {
  return unstable_cache(
    () => fetchBookmakers(),
    ['bookmakers_all'],
    { revalidate: 86400 * 7 }
  )()
}

export async function getOddsByLeague(
  leagueId: number,
  season?: number,
  page = 1,
  bookmakerId = 8
): Promise<{ odds: FixtureOdds[]; totalPages: number }> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON

  return unstable_cache(
    async () => {
      const result = await fetchOddsByLeague(leagueId, resolvedSeason, page, bookmakerId)
      const { fetchFixtureById } = await import('@/lib/api-football')
      const fixtures = await Promise.all(result.odds.map(o => fetchFixtureById(o.fixture.id)))
      const upcomingOdds = result.odds.filter((_, i) => fixtures[i]?.fixture.status.short === 'NS')
      return { odds: upcomingOdds, totalPages: result.totalPages }
    },
    [`odds_league_${leagueId}_${resolvedSeason}_p${page}_bm${bookmakerId}`],
    { revalidate: 900 } // 15 phút
  )()
}

export async function getOddsByFixture(fixtureId: number, bookmakerId = 8): Promise<FixtureOdds | null> {
  return unstable_cache(
    () => fetchOddsByFixture(fixtureId, bookmakerId),
    [`odds_fixture_${fixtureId}_bm${bookmakerId}`],
    { revalidate: 1800 }
  )()
}

// --- Helper functions (không thay đổi) ---

export function getMatchWinner(odds: FixtureOdds): { home: string; draw: string; away: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Match Winner')
  if (!bet) return null
  const get = (v: string) => bet.values.find(x => x.value === v)?.odd ?? '-'
  return { home: get('Home'), draw: get('Draw'), away: get('Away') }
}

export function getOverUnder(odds: FixtureOdds, line = '2.5'): { over: string; under: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Goals Over/Under')
  if (!bet) return null
  const over = bet.values.find(x => x.value === `Over ${line}`)?.odd ?? '-'
  const under = bet.values.find(x => x.value === `Under ${line}`)?.odd ?? '-'
  return { over, under }
}

export function getFirstHalfWinner(odds: FixtureOdds): { home: string; draw: string; away: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'First Half Winner')
  if (!bet) return null
  const get = (v: string) => bet.values.find(x => x.value === v)?.odd ?? '-'
  return { home: get('Home'), draw: get('Draw'), away: get('Away') }
}

export function getFirstHalfOverUnder(odds: FixtureOdds, line = '0.5'): { over: string; under: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Goals Over/Under First Half')
  if (!bet) return null
  const over = bet.values.find(x => x.value === `Over ${line}`)?.odd ?? '-'
  const under = bet.values.find(x => x.value === `Under ${line}`)?.odd ?? '-'
  if (over === '-' && under === '-') return null
  return { over, under }
}

export function getFirstHalfAsianHandicap(odds: FixtureOdds): Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Asian Handicap First Half')
  if (!bet) return []
  const pairs: Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> = []
  const homeValues = bet.values.filter(v => v.value.startsWith('Home'))
  for (const hv of homeValues.slice(0, 1)) {
    const handicap = hv.value.replace('Home ', '')
    const awayMatch = bet.values.find(v => v.value === `Away ${handicap}`)
    if (awayMatch) pairs.push({ home: hv.value, homeOdd: hv.odd, away: awayMatch.value, awayOdd: awayMatch.odd })
  }
  return pairs
}

export function getCorrectScore(odds: FixtureOdds): Array<{ score: string; odd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => ['Correct Score', 'Exact Score', 'Score'].includes(b.name))
  if (!bet) return []
  return bet.values
    .map(v => ({ score: v.value, odd: v.odd }))
    .sort((a, b) => parseFloat(a.odd) - parseFloat(b.odd))
    .slice(0, 3)
}

export function getAsianHandicap(odds: FixtureOdds): Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Asian Handicap')
  if (!bet) return []
  const pairs: Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> = []
  const homeValues = bet.values.filter(v => v.value.startsWith('Home'))
  for (const hv of homeValues.slice(0, 2)) {
    const handicap = hv.value.replace('Home ', '')
    const awayMatch = bet.values.find(v => v.value === `Away ${handicap}`)
    if (awayMatch) pairs.push({ home: hv.value, homeOdd: hv.odd, away: awayMatch.value, awayOdd: awayMatch.odd })
  }
  return pairs
}
