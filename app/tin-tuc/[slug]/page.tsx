import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Clock, User, Newspaper } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import { formatArticleDateTime } from '@/lib/date'
import BackButton from '@/components/ui/BackButton'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ArticleCard from '@/components/ui/ArticleCard'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn'

export async function generateMetadata(props: PageProps<'/tin-tuc/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('content_type', 'news')
    .single()

  if (!article) return { title: 'Tin tức không tồn tại' }

  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `${baseUrl}/tin-tuc/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

export default async function TinTucDetailPage(props: PageProps<'/tin-tuc/[slug]'>) {
  const { slug } = await props.params

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('content_type', 'news')
    .single()

  if (!article) notFound()

  // Lấy bài viết liên quan: cùng league_id (nếu có), loại trừ bài hiện tại
  let relatedQuery = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    .eq('content_type', 'news')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(4)

  if (article.league_id) {
    relatedQuery = relatedQuery.eq('league_id', article.league_id)
  }

  const { data: relatedArticles } = await relatedQuery

  return (
    <div className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Trang chủ', url: BASE_URL },
          { name: 'Tin tức', url: `${BASE_URL}/tin-tuc` },
          { name: article.title, url: `${BASE_URL}/tin-tuc/${article.slug}` },
        ])) }}
      />

      <Breadcrumb
        items={[
          { name: 'Tin tức', href: '/tin-tuc' },
          { name: article.title },
        ]}
        className="mb-2"
      />

      <BackButton label="Tin tức" />

      <article className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {article.cover_image && (
          <div className="relative h-48 w-full sm:h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{article.title}</h1>

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

          <div
            className="prose prose-sm max-w-none mt-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* Bài viết liên quan */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
            <Newspaper size={15} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Tin tức liên quan</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.id} article={related} basePath="/tin-tuc" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
