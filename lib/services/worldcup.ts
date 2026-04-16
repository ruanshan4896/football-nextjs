import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchStandings, fetchLeagueFixtures, type Standing, type Fixture } from '@/lib/api-football'

const WORLD_CUP_ID = 1
const WORLD_CUP_SEASON = 2026

// Cache keys cho World Cup
const WC_CACHE_KEYS = {
  GROUPS: `worldcup_groups_${WORLD_CUP_SEASON}`,
  GROUP_DETAIL: (group: string) => `worldcup_group_${group}_${WORLD_CUP_SEASON}`,
  FIXTURES_BY_ROUND: (round: string) => `worldcup_fixtures_${round}_${WORLD_CUP_SEASON}`,
  ALL_FIXTURES: `worldcup_all_fixtures_${WORLD_CUP_SEASON}`,
}

/**
 * Lấy tất cả 12 bảng đấu World Cup 2026 (A-L)
 * Mỗi bảng có 4 đội
 */
export async function getWorldCupGroups(): Promise<Record<string, Standing[]>> {
  const cacheKey = WC_CACHE_KEYS.GROUPS
  
  try {
    // Kiểm tra cache trước
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Fetch từ API
    const standings = await fetchStandings(WORLD_CUP_ID, WORLD_CUP_SEASON)
    
    // Nhóm theo bảng đấu (Group A, Group B, ...)
    const groups: Record<string, Standing[]> = {}
    
    standings.forEach((groupStandings) => {
      groupStandings.forEach((team) => {
        const groupName = team.group || 'Unknown'
        
        // Bỏ qua bảng "Ranking of third-placed teams"
        if (groupName.startsWith('Group ')) {
          const groupLetter = groupName.replace('Group ', '')
          
          if (!groups[groupLetter]) {
            groups[groupLetter] = []
          }
          
          groups[groupLetter].push(team)
        }
      })
    })

    // Sắp xếp các đội trong mỗi bảng theo thứ hạng
    Object.keys(groups).forEach(groupLetter => {
      groups[groupLetter].sort((a, b) => a.rank - b.rank)
    })

    // Cache 1 giờ
    await redis.setex(cacheKey, CACHE_TTL.STANDINGS, JSON.stringify(groups))
    
    return groups
  } catch (error) {
    console.error('Error fetching World Cup groups:', error)
    return {}
  }
}

/**
 * Lấy chi tiết 1 bảng đấu (A, B, C, ...)
 */
export async function getWorldCupGroup(groupLetter: string): Promise<Standing[]> {
  const cacheKey = WC_CACHE_KEYS.GROUP_DETAIL(groupLetter)
  
  try {
    // Kiểm tra cache trước
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Lấy tất cả bảng rồi filter
    const allGroups = await getWorldCupGroups()
    const group = allGroups[groupLetter.toUpperCase()] || []

    // Cache 1 giờ
    await redis.setex(cacheKey, CACHE_TTL.STANDINGS, JSON.stringify(group))
    
    return group
  } catch (error) {
    console.error(`Error fetching World Cup group ${groupLetter}:`, error)
    return []
  }
}

/**
 * Lấy lịch thi đấu theo vòng đấu
 * Rounds: "Group Stage - 1", "Group Stage - 2", "Group Stage - 3"
 */
export async function getWorldCupFixturesByRound(round: string): Promise<Fixture[]> {
  const cacheKey = WC_CACHE_KEYS.FIXTURES_BY_ROUND(round)
  
  try {
    // Kiểm tra cache trước
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Fetch từ API
    const fixtures = await fetchLeagueFixtures(WORLD_CUP_ID, WORLD_CUP_SEASON, round)

    // Cache 30 phút
    await redis.setex(cacheKey, CACHE_TTL.ODDS, JSON.stringify(fixtures))
    
    return fixtures
  } catch (error) {
    console.error(`Error fetching World Cup fixtures for round ${round}:`, error)
    return []
  }
}

/**
 * Lấy tất cả trận đấu World Cup 2026
 */
export async function getAllWorldCupFixtures(): Promise<Fixture[]> {
  const cacheKey = WC_CACHE_KEYS.ALL_FIXTURES
  
  try {
    // Kiểm tra cache trước
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      return JSON.parse(cached)
    }

    // Fetch từ API - lấy tất cả trận của World Cup 2026
    const fixtures = await fetchLeagueFixtures(WORLD_CUP_ID, WORLD_CUP_SEASON)

    // Cache 1 giờ
    await redis.setex(cacheKey, CACHE_TTL.STANDINGS, JSON.stringify(fixtures))
    
    return fixtures
  } catch (error) {
    console.error('Error fetching all World Cup fixtures:', error)
    return []
  }
}

/**
 * Lấy danh sách các vòng đấu World Cup 2026
 */
export async function getWorldCupRounds(): Promise<string[]> {
  // Từ API đã biết có 3 vòng bảng
  return [
    'Group Stage - 1',
    'Group Stage - 2', 
    'Group Stage - 3'
  ]
}

/**
 * Lấy trận đấu theo bảng đấu
 */
export async function getWorldCupFixturesByGroup(groupLetter: string): Promise<Fixture[]> {
  try {
    const allFixtures = await getAllWorldCupFixtures()
    
    // Filter trận đấu của bảng này
    // Cần check team trong bảng đó
    const group = await getWorldCupGroup(groupLetter)
    const teamIds = group.map(team => team.team.id)
    
    return allFixtures.filter(fixture => 
      teamIds.includes(fixture.teams.home.id) && 
      teamIds.includes(fixture.teams.away.id)
    )
  } catch (error) {
    console.error(`Error fetching World Cup fixtures for group ${groupLetter}:`, error)
    return []
  }
}

/**
 * Utility: Lấy tên bảng từ team ID
 */
export async function getTeamGroup(teamId: number): Promise<string | null> {
  try {
    const allGroups = await getWorldCupGroups()
    
    for (const [groupLetter, teams] of Object.entries(allGroups)) {
      if (teams.some(team => team.team.id === teamId)) {
        return groupLetter
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error finding group for team ${teamId}:`, error)
    return null
  }
}

/**
 * Utility: Kiểm tra xem có phải World Cup không
 */
export function isWorldCup(leagueId: number): boolean {
  return leagueId === WORLD_CUP_ID
}

/**
 * Constants export
 */
export { WORLD_CUP_ID, WORLD_CUP_SEASON }