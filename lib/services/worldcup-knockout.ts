import 'server-only'
import { unstable_cache } from 'next/cache'
import { getWorldCupGroups } from './worldcup'
import type { Standing } from '@/lib/api-football'

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
  position?: string
}

function getQualifiedTeams(groups: Record<string, Standing[]>): KnockoutTeam[] {
  const qualifiedTeams: KnockoutTeam[] = []
  const groupLetters = Object.keys(groups).sort()

  groupLetters.forEach(g => {
    const groupTeams = groups[g]
    if (groupTeams.length >= 2) {
      [0, 1].forEach(i => {
        const team = groupTeams[i]
        qualifiedTeams.push({
          id: team.team.id,
          name: team.team.name,
          logo: team.team.logo,
          code: team.team.name.substring(0, 3).toUpperCase(),
          group: g,
          position: `${i + 1}${g}`,
        })
      })
    }
  })

  const thirdPlace = groupLetters
    .map(g => ({ ...groups[g].find(t => t.rank === 3), groupLetter: g }))
    .filter(t => t.team)
    .sort((a, b) => {
      if (a.points !== b.points) return (b.points ?? 0) - (a.points ?? 0)
      if (a.goalsDiff !== b.goalsDiff) return (b.goalsDiff ?? 0) - (a.goalsDiff ?? 0)
      return (b.all?.goals.for ?? 0) - (a.all?.goals.for ?? 0)
    })
    .slice(0, 8)

  thirdPlace.forEach(t => {
    if (!t.team) return
    qualifiedTeams.push({
      id: t.team.id,
      name: t.team.name,
      logo: t.team.logo,
      code: t.team.name.substring(0, 3).toUpperCase(),
      group: t.groupLetter,
      position: `3${t.groupLetter}`,
    })
  })

  return qualifiedTeams
}

function generateBracketMatches(teams: KnockoutTeam[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = []
  const winners = teams.filter(t => t.position?.startsWith('1')).slice(0, 12)
  const runners = teams.filter(t => t.position?.startsWith('2')).slice(0, 12)
  const thirds = teams.filter(t => t.position?.startsWith('3')).slice(0, 8)

  for (let i = 0; i < 8 && i < winners.length && i < thirds.length; i++) {
    matches.push({ id: `r32_${i + 1}`, round: 'Round of 32', homeTeam: winners[i], awayTeam: thirds[i], status: 'scheduled', nextMatchId: `r16_${Math.floor(i / 2) + 1}` })
  }
  for (let i = 8; i < 12 && i < winners.length; i++) {
    const r = i - 8
    if (r < runners.length) matches.push({ id: `r32_${i + 1}`, round: 'Round of 32', homeTeam: winners[i], awayTeam: runners[r], status: 'scheduled', nextMatchId: `r16_${Math.floor((i - 8) / 2) + 5}` })
  }

  for (let i = 0; i < 8; i++) matches.push({ id: `r16_${i + 1}`, round: 'Round of 16', homeTeam: null, awayTeam: null, status: 'scheduled', nextMatchId: `qf_${Math.floor(i / 2) + 1}` })
  for (let i = 0; i < 4; i++) matches.push({ id: `qf_${i + 1}`, round: 'Quarter-finals', homeTeam: null, awayTeam: null, status: 'scheduled', nextMatchId: i < 2 ? 'sf_1' : 'sf_2' })
  matches.push({ id: 'sf_1', round: 'Semi-finals', homeTeam: null, awayTeam: null, status: 'scheduled', nextMatchId: 'final' })
  matches.push({ id: 'sf_2', round: 'Semi-finals', homeTeam: null, awayTeam: null, status: 'scheduled', nextMatchId: 'final' })
  matches.push({ id: 'third_place', round: 'Third Place', homeTeam: null, awayTeam: null, status: 'scheduled' })
  matches.push({ id: 'final', round: 'Final', homeTeam: null, awayTeam: null, status: 'scheduled' })

  return matches
}

export const generateKnockoutBracket = unstable_cache(
  async (): Promise<KnockoutMatch[]> => {
    const groups = await getWorldCupGroups()
    const qualifiedTeams = getQualifiedTeams(groups)
    if (qualifiedTeams.length < 32) return []
    return generateBracketMatches(qualifiedTeams)
  },
  ['worldcup_knockout_bracket_2026'],
  { revalidate: 3600 }
)

export async function getKnockoutMatchesByRound(round: KnockoutMatch['round']): Promise<KnockoutMatch[]> {
  const allMatches = await generateKnockoutBracket()
  return allMatches.filter(m => m.round === round)
}

export function getKnockoutRounds(): KnockoutMatch['round'][] {
  return ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Third Place']
}

export async function getBracketStructure(): Promise<{ rounds: Record<string, KnockoutMatch[]>; totalMatches: number }> {
  const allMatches = await generateKnockoutBracket()
  const rounds: Record<string, KnockoutMatch[]> = {}
  getKnockoutRounds().forEach(round => { rounds[round] = allMatches.filter(m => m.round === round) })
  return { rounds, totalMatches: allMatches.length }
}
