import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ArticleForm from '../ArticleForm'

export const metadata: Metadata = { title: 'Tạo bài viết mới' }

export default function TaoMoiPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/bai-viet"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Tạo bài viết mới</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <ArticleForm />
      </div>
    </div>
  )
}
