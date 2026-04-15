import { supabase } from '@/lib/supabase'

export type ContentType = 
  | 'match_preview' 
  | 'league_intro' 
  | 'team_intro' 
  | 'odds_guide' 
  | 'standings_guide' 
  | 'fixtures_intro' 
  | 'general'

export type EntityType = 'match' | 'league' | 'team' | 'page' | null

export interface PageContent {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  created_at: string
  updated_at: string
}

/**
 * Lấy nội dung cho trang giải đấu
 * Quy ước: league_id có giá trị, match_id = NULL
 */
export async function getLeagueContent(leagueId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('league_id', leagueId)
    .is('match_id', null)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching league content:', error)
    return null
  }

  return data
}

/**
 * Lấy nội dung cho trang đội bóng
 * Quy ước: Dùng match_id để lưu team_id, league_id = -1 (để phân biệt)
 */
export async function getTeamContent(teamId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('match_id', teamId)
    .eq('league_id', -1)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching team content:', error)
    return null
  }

  return data
}

/**
 * Lấy nội dung cho các trang tĩnh (odds guide, standings guide, etc.)
 * Quy ước: league_id = 0, match_id = NULL
 * Phân biệt bằng slug hoặc title
 */
export async function getPageContent(contentType: ContentType): Promise<PageContent | null> {
  // Map content type to slug pattern
  const slugPatterns: Record<string, string> = {
    odds_guide: 'huong-dan-ty-le-keo',
    standings_guide: 'huong-dan-bang-xep-hang',
    fixtures_intro: 'gioi-thieu-lich-thi-dau',
  }

  const slugPattern = slugPatterns[contentType]
  if (!slugPattern) return null

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('league_id', 0)
    .is('match_id', null)
    .like('slug', `%${slugPattern}%`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching page content:', error)
    return null
  }

  return data
}

/**
 * Lấy tất cả nội dung theo entity
 */
export async function getContentByEntity(
  entityType: EntityType,
  entityId: number
): Promise<PageContent[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (entityType === 'league') {
    query = query.eq('league_id', entityId).is('match_id', null)
  } else if (entityType === 'team') {
    query = query.eq('match_id', entityId).eq('league_id', -1)
  } else if (entityType === 'match') {
    query = query.eq('match_id', entityId).neq('league_id', -1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching content by entity:', error)
    return []
  }

  return data || []
}
