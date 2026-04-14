import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import ArticleForm from '../ArticleForm'

export const metadata: Metadata = { title: 'Chỉnh sửa bài viết' }

export default async function EditArticlePage(props: PageProps<'/admin/bai-viet/[id]'>) {
  const { id } = await props.params

  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!article) notFound()

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/bai-viet"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
          article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {article.status === 'published' ? 'Đã đăng' : 'Nháp'}
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <ArticleForm
          initialData={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt ?? '',
            content: article.content,
            cover_image: article.cover_image ?? '',
            match_id: article.match_id ? String(article.match_id) : '',
            league_id: article.league_id ? String(article.league_id) : '',
            author: article.author,
            status: article.status,
          }}
        />
      </div>
    </div>
  )
}
