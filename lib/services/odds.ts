import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import {
  fetchOddsByLeague,
  fetchOddsByFixture,
  fetchBookmakers,
  type FixtureOdds,
  type OddsValue,
  type Bookmaker,
} from '@/lib/api-football'
import { TRACKED_LEAGUES, CURRENT_SEASON } from './standings'

/**
 * Lấy danh sách bookmakers
 */
export async function getBookmakers(): Promise<Bookmaker[]> {
  const cacheKey = 'bookmakers:all'
  
  const cached = await redis.get<Bookmaker[]>(cacheKey)
  if (cached) return cached

  const bookmakers = await fetchBookmakers()
  // Cache 7 ngày vì danh sách bookmaker ít thay đổi
  await redis.set(cacheKey, bookmakers, { ex: 60 * 60 * 24 * 7 })
  return bookmakers
}

/**
 * Lấy tỷ lệ kèo theo giải đấu
 */
export async function getOddsByLeague(
  leagueId: number,
  season?: number,
  page = 1,
  bookmakerId = 8
): Promise<{ odds: FixtureOdds[]; totalPages: number }> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const cacheKey = `${CACHE_KEYS.ODDS_LEAGUE(leagueId, resolvedSeason, page)}_bm${bookmakerId}`

  const cached = await redis.get<{ odds: FixtureOdds[]; totalPages: number }>(cacheKey)
  if (cached) return cached

  const result = await fetchOddsByLeague(leagueId, resolvedSeason, page, bookmakerId)
  await redis.set(cacheKey, result, { ex: CACHE_TTL.ODDS })
  return result
}

/**
 * Lấy tỷ lệ kèo theo fixture ID
 */
export async function getOddsByFixture(
  fixtureId: number,
  bookmakerId = 8
): Promise<FixtureOdds | null> {
  const cacheKey = `${CACHE_KEYS.ODDS_FIXTURE(fixtureId)}_bm${bookmakerId}`

  const cached = await redis.get<FixtureOdds>(cacheKey)
  if (cached) return cached

  const odds = await fetchOddsByFixture(fixtureId, bookmakerId)
  if (odds) await redis.set(cacheKey, odds, { ex: CACHE_TTL.ODDS })
  return odds
}

// --- Helper functions để parse odds ---

/** Lấy kèo 1x2 (Match Winner) */
export function getMatchWinner(odds: FixtureOdds): { home: string; draw: string; away: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Match Winner')
  if (!bet) return null
  const get = (v: string) => bet.values.find(x => x.value === v)?.odd ?? '-'
  return { home: get('Home'), draw: get('Draw'), away: get('Away') }
}

/** Lấy kèo tài xỉu (Goals Over/Under 2.5) */
export function getOverUnder(odds: FixtureOdds, line = '2.5'): { over: string; under: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Goals Over/Under')
  if (!bet) return null
  const over = bet.values.find(x => x.value === `Over ${line}`)?.odd ?? '-'
  const under = bet.values.find(x => x.value === `Under ${line}`)?.odd ?? '-'
  return { over, under }
}

/** Lấy kèo 1x2 hiệp 1 (First Half Winner) */
export function getFirstHalfWinner(odds: FixtureOdds): { home: string; draw: string; away: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'First Half Winner')
  if (!bet) return null
  const get = (v: string) => bet.values.find(x => x.value === v)?.odd ?? '-'
  return { home: get('Home'), draw: get('Draw'), away: get('Away') }
}

/** Lấy kèo tài xỉu hiệp 1 */
export function getFirstHalfOverUnder(odds: FixtureOdds, line = '0.5'): { over: string; under: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Goals Over/Under First Half')
  if (!bet) return null
  const over = bet.values.find(x => x.value === `Over ${line}`)?.odd ?? '-'
  const under = bet.values.find(x => x.value === `Under ${line}`)?.odd ?? '-'
  if (over === '-' && under === '-') return null
  return { over, under }
}

/** Lấy kèo châu Á hiệp 1 */
export function getFirstHalfAsianHandicap(odds: FixtureOdds): Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Asian Handicap First Half')
  if (!bet) return []
  const pairs: Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> = []
  const values = bet.values
  const homeValues = values.filter(v => v.value.startsWith('Home'))
  for (const hv of homeValues.slice(0, 1)) {
    const handicap = hv.value.replace('Home ', '')
    const awayMatch = values.find(v => v.value === `Away ${handicap}`)
    if (awayMatch) {
      pairs.push({ home: hv.value, homeOdd: hv.odd, away: awayMatch.value, awayOdd: awayMatch.odd })
    }
  }
  return pairs
}

/** Lấy kèo tỷ số chính xác (Correct Score) - top 3 */
export function getCorrectScore(odds: FixtureOdds): Array<{ score: string; odd: string }> {
  // Thử các tên bet có thể có
  const possibleNames = ['Correct Score', 'Exact Score', 'Score']
  let bet = null
  
  for (const name of possibleNames) {
    bet = odds.bookmakers[0]?.bets.find(b => b.name === name)
    if (bet) break
  }
  
  if (!bet) {
    console.log('Available bets:', odds.bookmakers[0]?.bets.map(b => b.name))
    return []
  }
  
  // Lấy top 3 tỷ số có odd thấp nhất (xác suất cao nhất)
  const scores = bet.values
    .map(v => ({ score: v.value, odd: v.odd }))
    .sort((a, b) => parseFloat(a.odd) - parseFloat(b.odd))
    .slice(0, 3)
  
  return scores
}

/** Lấy kèo châu Á cả trận */
export function getAsianHandicap(odds: FixtureOdds): Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Asian Handicap')
  if (!bet) return []

  // Group theo cặp home/away cùng handicap
  const pairs: Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> = []
  const values = bet.values

  // Tìm các cặp handicap
  const homeValues = values.filter(v => v.value.startsWith('Home'))
  for (const hv of homeValues.slice(0, 2)) {
    const handicap = hv.value.replace('Home ', '')
    const awayMatch = values.find(v => v.value === `Away ${handicap}`)
    if (awayMatch) {
      pairs.push({
        home: hv.value,
        homeOdd: hv.odd,
        away: awayMatch.value,
        awayOdd: awayMatch.odd,
      })
    }
  }
  return pairs
}
