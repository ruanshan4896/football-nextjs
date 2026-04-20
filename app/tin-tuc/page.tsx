import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ui/ArticleCard'
import { TRACKED_LEAGUES } from '@/lib/services/standings'

export const metadata: Metadata = {
  title: 'Tin tức bóng đá',
  description: 'Tin tức bóng đá mới nhất, cập nhật nhanh nhất từ các giải đấu hàng đầu thế giới.',
}

const LEAGUE_LOGOS: Record<number, string> = Object.fromEntries(
  TRACKED_LEAGUES.map(l => [l.id, `https://media.api-sports.io/football/leagues/${l.id}.png`])
)

async function NewsList({ leagueId }: { leagueId?: number }) {
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    .eq('content_type', 'news')
    .order('published_at', { ascending: false })
    .limit(20)

  if (leagueId) {
    query = query.eq('league_id', leagueId)
  }

  const { data: articles } = await query

  if (!articles || articles.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-400">
        {leagueId ? 'Chưa có tin tức nào cho giải đấu này' : 'Chưa có tin tức nào'}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} basePath="/tin-tuc" />
      ))}
    </div>
  )
}

export default async function TinTucPage(props: PageProps<'/tin-tuc'>) {
  const { league: leagueParam } = await props.searchParams ?? {}
  const selectedLeagueId = typeof leagueParam === 'string' ? parseInt(leagueParam) : undefined
  const selectedLeague = selectedLeagueId ? TRACKED_LEAGUES.find(l => l.id === selectedLeagueId) : undefined

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
        <Newspaper size={15} className="text-white" />
        <h1 className="text-sm font-semibold text-white">Tin tức bóng đá</h1>
        {selectedLeague && (
          <span className="ml-1 text-xs text-blue-200">· {selectedLeague.name}</span>
        )}
      </div>

      {/* Filter giải đấu */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-gray-50">
        <Link
          href="/tin-tuc"
          className={`shrink-0 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
            !selectedLeagueId
              ? 'border-b-2 border-blue-700 text-blue-700 bg-white'
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          Tất cả
        </Link>
        {TRACKED_LEAGUES.map((league) => {
          const isActive = selectedLeagueId === league.id
          return (
            <Link
              key={league.id}
              href={`/tin-tuc?league=${league.id}`}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-700 text-blue-700 bg-white'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <div className="relative h-4 w-4 shrink-0">
                <Image src={LEAGUE_LOGOS[league.id]} alt={league.name} fill className="object-contain" sizes="16px" />
              </div>
              {league.name}
            </Link>
          )
        })}
      </div>

      {/* Danh sách tin tức */}
      <NewsList leagueId={selectedLeagueId} />
    </div>
  )
}
