import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchStandings, fetchLeagueFixtures, type Standing, type Fixture } from '@/lib/api-football'

const WORLD_CUP_ID = 1
const WORLD_CUP_SEASON = 2026

export async function getWorldCupGroups(): Promise<Record<string, Standing[]>> {
  return unstable_cache(
    async () => {
      const standings = await fetchStandings(WORLD_CUP_ID, WORLD_CUP_SEASON)
      const groups: Record<string, Standing[]> = {}

      standings.forEach(groupStandings => {
        groupStandings.forEach(team => {
          const groupName = team.group || 'Unknown'
          if (groupName.startsWith('Group ')) {
            const groupLetter = groupName.replace('Group ', '')
            if (!groups[groupLetter]) groups[groupLetter] = []
            groups[groupLetter].push(team)
          }
        })
      })

      Object.keys(groups).forEach(g => {
        groups[g].sort((a, b) => a.rank - b.rank)
      })

      return groups
    },
    [`worldcup_groups_${WORLD_CUP_SEASON}`],
    { revalidate: 3600 }
  )()
}

export async function getWorldCupGroup(groupLetter: string): Promise<Standing[]> {
  const allGroups = await getWorldCupGroups()
  return allGroups[groupLetter.toUpperCase()] || []
}

export async function getWorldCupFixturesByRound(round: string): Promise<Fixture[]> {
  return unstable_cache(
    () => fetchLeagueFixtures(WORLD_CUP_ID, WORLD_CUP_SEASON, round),
    [`worldcup_fixtures_${round}_${WORLD_CUP_SEASON}`],
    { revalidate: 1800 }
  )()
}

export async function getAllWorldCupFixtures(): Promise<Fixture[]> {
  return unstable_cache(
    () => fetchLeagueFixtures(WORLD_CUP_ID, WORLD_CUP_SEASON),
    [`worldcup_all_fixtures_${WORLD_CUP_SEASON}`],
    { revalidate: 3600 }
  )()
}

export async function getWorldCupRounds(): Promise<string[]> {
  return ['Group Stage - 1', 'Group Stage - 2', 'Group Stage - 3']
}

export async function getWorldCupFixturesByGroup(groupLetter: string): Promise<Fixture[]> {
  const [allFixtures, group] = await Promise.all([
    getAllWorldCupFixtures(),
    getWorldCupGroup(groupLetter),
  ])
  const teamIds = group.map(t => t.team.id)
  return allFixtures.filter(f =>
    teamIds.includes(f.teams.home.id) && teamIds.includes(f.teams.away.id)
  )
}

export async function getTeamGroup(teamId: number): Promise<string | null> {
  const allGroups = await getWorldCupGroups()
  for (const [groupLetter, teams] of Object.entries(allGroups)) {
    if (teams.some(t => t.team.id === teamId)) return groupLetter
  }
  return null
}

export function isWorldCup(leagueId: number): boolean {
  return leagueId === WORLD_CUP_ID
}

export { WORLD_CUP_ID, WORLD_CUP_SEASON }
