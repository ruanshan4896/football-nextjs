import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import ArticleCard from '@/components/ui/ArticleCard'


export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Tin tức bóng đá',
  description: 'Tin tức bóng đá mới nhất, cập nhật nhanh nhất từ các giải đấu hàng đầu thế giới.',
}

export default async function TinTucPage() {
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    .eq('content_type', 'news')
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) console.error('Tin tức error:', error)

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
        <Newspaper size={15} className="text-white" />
        <h1 className="text-sm font-semibold text-white">Tin tức bóng đá</h1>
      </div>

      {/* Danh sách tin tức */}
      {!articles || articles.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-400">
          Chưa có tin tức nào
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} basePath="/tin-tuc" />
          ))}
        </div>
      )}
    </div>
  )
}
