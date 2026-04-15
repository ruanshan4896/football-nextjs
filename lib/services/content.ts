import { supabase } from '@/lib/supabase'

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
 * Quy ước: content_type = 'page_content', league_id có giá trị, match_id = NULL
 */
export async function getLeagueContent(leagueId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
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
 * Quy ước: content_type = 'page_content', match_id = team_id, league_id = -1
 */
export async function getTeamContent(teamId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
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
 * Quy ước: content_type = 'page_content', league_id = 0, match_id = NULL
 */
export async function getPageContent(pageType: 'odds' | 'standings' | 'fixtures'): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
    .eq('league_id', 0)
    .is('match_id', null)
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
