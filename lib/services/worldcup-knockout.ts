import 'server-only'
import { redis, CACHE_TTL } from '@/lib/redis'
import { getWorldCupGroups } from './worldcup'
import type { Standing } from '@/lib/api-football'

// Knockout bracket structure
export interface KnockoutMatch {
  id: string
  round: 'Round of 32' | 'Round of 16' | 'Quarter-finals' | 'Semi-finals' | 'Final' | 'Third Place'
  homeTeam: KnockoutTeam | null
  awayTeam: KnockoutTeam | null
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'finished'
  date?: string
  winner?: KnockoutTeam
  nextMatchId?: string
}

export interface KnockoutTeam {
  id: number
  name: string
  logo: string
  code: string
  group?: string
  position?: string // "1A", "2B", "3C", etc.
}

// Cache key
const KNOCKOUT_CACHE_KEY = 'worldcup_knockout_bracket_2026'

/**
 * Generate knockout bracket based on group stage results
 */
export async function generateKnockoutBracket(): Promise<KnockoutMatch[]> {
  try {
    // Check cache first
    const cached = await redis.get(KNOCKOUT_CACHE_KEY)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    const groups = await getWorldCupGroups()
    
    // Get qualified teams (top 2 from each group + best 8 third-place teams)
    const qualifiedTeams = getQualifiedTeams(groups)
    
    if (qualifiedTeams.length < 32) {
      // Not enough data yet, return empty bracket
      return []
    }

    // Generate bracket matches
    const bracket = generateBracketMatches(qualifiedTeams)
    
    // Cache for 1 hour
    await redis.setex(KNOCKOUT_CACHE_KEY, CACHE_TTL.STANDINGS, JSON.stringify(bracket))
    
    return bracket
  } catch (error) {
    console.error('Error generating knockout bracket:', error)
    return []
  }
}

/**
 * Get 32 qualified teams from group stage
 */
function getQualifiedTeams(groups: Record<string, Standing[]>): KnockoutTeam[] {
  const qualifiedTeams: KnockoutTeam[] = []
  
  // Get top 2 from each group (24 teams)
  const groupLetters = Object.keys(groups).sort()
  
  groupLetters.forEach(groupLetter => {
    const groupTeams = groups[groupLetter]
    if (groupTeams.length >= 2) {
      // Winner
      const winner = groupTeams[0]
      qualifiedTeams.push({
        id: winner.team.id,
        name: winner.team.name,
        logo: winner.team.logo,
        code: winner.team.name.substring(0, 3).toUpperCase(),
        group: groupLetter,
        position: `1${groupLetter}`
      })
      
      // Runner-up
      const runnerUp = groupTeams[1]
      qualifiedTeams.push({
        id: runnerUp.team.id,
        name: runnerUp.team.name,
        logo: runnerUp.team.logo,
        code: runnerUp.team.name.substring(0, 3).toUpperCase(),
        group: groupLetter,
        position: `2${groupLetter}`
      })
    }
  })
  
  // Get best 8 third-place teams
  const thirdPlaceTeams = groupLetters
    .map(groupLetter => {
      const groupTeams = groups[groupLetter]
      const thirdPlace = groupTeams.find(team => team.rank === 3)
      return thirdPlace ? { ...thirdPlace, groupLetter } : null
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by points, goal difference, goals scored
      if (a!.points !== b!.points) return b!.points - a!.points
      if (a!.goalsDiff !== b!.goalsDiff) return b!.goalsDiff - a!.goalsDiff
      return b!.all.goals.for - a!.all.goals.for
    })
    .slice(0, 8) // Top 8
  
  thirdPlaceTeams.forEach((team, index) => {
    qualifiedTeams.push({
      id: team!.team.id,
      name: team!.team.name,
      logo: team!.team.logo,
      code: team!.team.name.substring(0, 3).toUpperCase(),
      group: team!.groupLetter,
      position: `3${team!.groupLetter}`
    })
  })
  
  return qualifiedTeams
}

/**
 * Generate bracket matches based on FIFA World Cup 2026 format
 */
function generateBracketMatches(teams: KnockoutTeam[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = []
  
  // Round of 32 (32 teams → 16 teams)
  // FIFA uses specific pairing rules for World Cup
  const round32Pairings = generateRound32Pairings(teams)
  
  round32Pairings.forEach((pairing, index) => {
    matches.push({
      id: `r32_${index + 1}`,
      round: 'Round of 32',
      homeTeam: pairing.home,
      awayTeam: pairing.away,
      status: 'scheduled',
      nextMatchId: `r16_${Math.floor(index / 2) + 1}`
    })
  })
  
  // Round of 16 (16 teams → 8 teams)
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `r16_${i + 1}`,
      round: 'Round of 16',
      homeTeam: null, // Will be filled by Round of 32 winners
      awayTeam: null,
      status: 'scheduled',
      nextMatchId: `qf_${Math.floor(i / 2) + 1}`
    })
  }
  
  // Quarter-finals (8 teams → 4 teams)
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `qf_${i + 1}`,
      round: 'Quarter-finals',
      homeTeam: null,
      awayTeam: null,
      status: 'scheduled',
      nextMatchId: i < 2 ? `sf_1` : `sf_2`
    })
  }
  
  // Semi-finals (4 teams → 2 teams)
  matches.push({
    id: 'sf_1',
    round: 'Semi-finals',
    homeTeam: null,
    awayTeam: null,
    status: 'scheduled',
    nextMatchId: 'final'
  })
  
  matches.push({
    id: 'sf_2',
    round: 'Semi-finals',
    homeTeam: null,
    awayTeam: null,
    status: 'scheduled',
    nextMatchId: 'final'
  })
  
  // Third Place Playoff
  matches.push({
    id: 'third_place',
    round: 'Third Place',
    homeTeam: null,
    awayTeam: null,
    status: 'scheduled'
  })
  
  // Final
  matches.push({
    id: 'final',
    round: 'Final',
    homeTeam: null,
    awayTeam: null,
    status: 'scheduled'
  })
  
  return matches
}

/**
 * Generate Round of 32 pairings based on FIFA rules
 */
function generateRound32Pairings(teams: KnockoutTeam[]): Array<{ home: KnockoutTeam; away: KnockoutTeam }> {
  const pairings: Array<{ home: KnockoutTeam; away: KnockoutTeam }> = []
  
  // Separate teams by type
  const groupWinners = teams.filter(t => t.position?.startsWith('1')).slice(0, 12)
  const runnersUp = teams.filter(t => t.position?.startsWith('2')).slice(0, 12)
  const thirdPlace = teams.filter(t => t.position?.startsWith('3')).slice(0, 8)
  
  // FIFA World Cup 2026 pairing rules (simplified)
  // Group winners vs third-place teams (8 matches)
  for (let i = 0; i < 8 && i < groupWinners.length && i < thirdPlace.length; i++) {
    pairings.push({
      home: groupWinners[i],
      away: thirdPlace[i]
    })
  }
  
  // Group winners vs runners-up (8 matches)
  for (let i = 8; i < 12 && i < groupWinners.length; i++) {
    const runnerUpIndex = i - 8
    if (runnerUpIndex < runnersUp.length) {
      pairings.push({
        home: groupWinners[i],
        away: runnersUp[runnerUpIndex]
      })
    }
  }
  
  // Remaining runners-up matches (8 matches)
  for (let i = 4; i < 12 && (i * 2) < runnersUp.length; i++) {
    const home = runnersUp[i * 2]
    const away = runnersUp[i * 2 + 1]
    if (home && away) {
      pairings.push({ home, away })
    }
  }
  
  return pairings
}

/**
 * Get matches by round
 */
export async function getKnockoutMatchesByRound(round: KnockoutMatch['round']): Promise<KnockoutMatch[]> {
  const allMatches = await generateKnockoutBracket()
  return allMatches.filter(match => match.round === round)
}

/**
 * Get all knockout rounds
 */
export function getKnockoutRounds(): KnockoutMatch['round'][] {
  return ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Third Place']
}

/**
 * Get bracket structure for visualization
 */
export async function getBracketStructure(): Promise<{
  rounds: Record<string, KnockoutMatch[]>
  totalMatches: number
}> {
  const allMatches = await generateKnockoutBracket()
  
  const rounds: Record<string, KnockoutMatch[]> = {}
  
  getKnockoutRounds().forEach(round => {
    rounds[round] = allMatches.filter(match => match.round === round)
  })
  
  return {
    rounds,
    totalMatches: allMatches.length
  }
}