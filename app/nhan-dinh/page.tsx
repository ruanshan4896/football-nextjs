import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Nhận định & Dự đoán bóng đá',
  description: 'Nhận định, phân tích chuyên sâu và dự đoán kết quả các trận đấu bóng đá.',
}

// Server Component - fetch bài viết từ Supabase
async function ArticleList() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (error || !articles || articles.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-400">
        Chưa có bài viết nào
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/nhan-dinh/${article.slug}`}
          className="flex gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Ảnh bìa */}
          {article.cover_image ? (
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          ) : (
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <FileText size={24} className="text-green-300" />
            </div>
          )}

          {/* Nội dung */}
          <div className="flex flex-col justify-between min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>{article.author}</span>
              <span>·</span>
              <Clock size={11} />
              <span>
                {new Date(article.published_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function NhanDinhPage() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
        <FileText size={15} className="text-white" />
        <h1 className="text-sm font-semibold text-white">Nhận định & Dự đoán</h1>
      </div>
      <ArticleList />
    </div>
  )
}
