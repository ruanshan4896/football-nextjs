import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchOddsByLeague, fetchOddsByFixture, fetchBookmakers, fetchFixturesByDate, type FixtureOdds, type OddsValue, type Bookmaker } from '@/lib/api-football'
import { TRACKED_LEAGUES, CURRENT_SEASON } from './standings'

export type FixtureOddsWithTeams = FixtureOdds & {
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
}

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
): Promise<{ odds: FixtureOddsWithTeams[]; totalPages: number }> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON

  return unstable_cache(
    async () => {
      // Fetch page đầu tiên để biết tổng số pages
      const firstResult = await fetchOddsByLeague(leagueId, resolvedSeason, 1, bookmakerId)
      const totalPages = firstResult.totalPages

      // Fetch thêm các page tiếp theo nếu có (tối đa 5 page)
      const pagesToFetch = Math.min(totalPages, 5)
      const additionalPages = pagesToFetch > 1
        ? await Promise.all(
            Array.from({ length: pagesToFetch - 1 }, (_, i) =>
              fetchOddsByLeague(leagueId, resolvedSeason, i + 2, bookmakerId)
            )
          )
        : []

      const allOdds = [
        ...firstResult.odds,
        ...additionalPages.flatMap(r => r.odds),
      ]

      // Lọc trận sắp diễn ra dựa vào timestamp
      const nowTs = Math.floor(Date.now() / 1000)
      const upcomingOdds = allOdds.filter(o => o.fixture.timestamp > nowTs)

      if (upcomingOdds.length === 0) {
        return { odds: [], totalPages }
      }

      // Lấy các ngày duy nhất từ odds để fetch fixtures theo date (1 call/ngày thay vì N calls)
      const uniqueDates = [...new Set(
        upcomingOdds.map(o => o.fixture.date.split('T')[0])
      )]

      const fixturesByDateArr = await Promise.all(
        uniqueDates.map(date => fetchFixturesByDate(date))
      )

      // Build map fixtureId -> team info
      const teamMap = new Map<number, { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } }>()
      fixturesByDateArr.flat().forEach(f => {
        teamMap.set(f.fixture.id, {
          home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
          away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
        })
      })

      // Merge team info vào odds — bỏ qua trận không tìm được team info
      const oddsWithTeams: FixtureOddsWithTeams[] = upcomingOdds
        .map(o => {
          const teams = teamMap.get(o.fixture.id)
          if (!teams) return null
          return { ...o, teams }
        })
        .filter((o): o is FixtureOddsWithTeams => o !== null)

      return { odds: oddsWithTeams, totalPages }
    },
    [`odds_league_${leagueId}_${resolvedSeason}_bm${bookmakerId}`],
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
