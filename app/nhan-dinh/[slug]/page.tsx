import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, User, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getFixtureDetail } from '@/lib/services/fixtures'
import MatchStatusBadge from '@/components/ui/MatchStatusBadge'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import { formatArticleDateTime } from '@/lib/date'
import BackButton from '@/components/ui/BackButton'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ArticleCard from '@/components/ui/ArticleCard'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn'

// Dynamic metadata
export async function generateMetadata(props: PageProps<'/nhan-dinh/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) return { title: 'Bài viết không tồn tại' }

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: {
      canonical: `${baseUrl}/nhan-dinh/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

export default async function NhanDinhDetailPage(props: PageProps<'/nhan-dinh/[slug]'>) {
  const { slug } = await props.params

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  // Nếu bài viết gắn với trận đấu, lấy thêm thông tin trận
  const fixture = article.match_id
    ? await getFixtureDetail(article.match_id)
    : null

  // Lấy bài viết liên quan: cùng league_id (nếu có), loại trừ bài hiện tại
  let relatedQuery = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    .eq('content_type', 'article')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(4)

  if (article.league_id) {
    relatedQuery = relatedQuery.eq('league_id', article.league_id)
  }

  const { data: relatedArticles } = await relatedQuery

  return (
    <div className="space-y-4">
      {/* JSON-LD NewsArticle schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Trang chủ', url: BASE_URL },
          { name: 'Nhận định', url: `${BASE_URL}/nhan-dinh` },
          { name: article.title, url: `${BASE_URL}/nhan-dinh/${article.slug}` },
        ])) }}
      />

      <Breadcrumb 
        items={[
          { name: 'Nhận định', href: '/nhan-dinh' },
          { name: article.title },
        ]}
        className="mb-2"
      />

      {/* Back */}
      <BackButton label="Nhận định" />

      <article className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Ảnh bìa */}
        {article.cover_image && (
          <div className="relative h-48 w-full sm:h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Tiêu đề */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{article.title}</h1>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <User size={11} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span>{formatArticleDateTime(article.published_at)}</span>
            </div>
          </div>

          {/* Mini scoreboard nếu gắn trận */}
          {fixture && (
            <Link
              href={`/tran-dau/${fixture.fixture.id}`}
              className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7">
                  <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} fill className="object-contain" sizes="28px" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{fixture.teams.home.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-gray-900">
                  {fixture.goals.home ?? '-'} - {fixture.goals.away ?? '-'}
                </span>
                <MatchStatusBadge
                  status={fixture.fixture.status.short}
                  elapsed={fixture.fixture.status.elapsed}
                  date={fixture.fixture.date}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{fixture.teams.away.name}</span>
                <div className="relative h-7 w-7">
                  <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} fill className="object-contain" sizes="28px" />
                </div>
              </div>
            </Link>
          )}

          {/* Nội dung bài viết */}
          <div
            className="prose prose-sm max-w-none mt-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* Bài viết liên quan */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
            <TrendingUp size={15} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Nhận định liên quan</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.id} article={related} basePath="/nhan-dinh" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
