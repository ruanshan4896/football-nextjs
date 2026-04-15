'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Eye } from 'lucide-react'

interface ArticleFormData {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  match_id: string
  league_id: string
  author: string
  status: 'draft' | 'published'
}

interface Props {
  initialData?: Partial<ArticleFormData>
}

// Tự động tạo slug từ tiêu đề tiếng Việt
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function ArticleForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<ArticleFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    content: initialData?.content ?? '',
    cover_image: initialData?.cover_image ?? '',
    match_id: initialData?.match_id ? String(initialData.match_id) : '',
    league_id: initialData?.league_id ? String(initialData.league_id) : '',
    author: initialData?.author ?? 'Admin',
    status: initialData?.status ?? 'draft',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      // Chỉ auto-gen slug khi tạo mới (không ghi đè slug đã có khi edit)
      slug: isEdit ? f.slug : toSlug(title),
    }))
  }

  async function handleSubmit(status: 'draft' | 'published') {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError('Vui lòng điền đầy đủ Tiêu đề, Slug và Nội dung.')
      return
    }

    setLoading(true)
    setError('')

    const payload = {
      ...form,
      status,
      match_id: form.match_id ? parseInt(form.match_id) : null,
      league_id: form.league_id ? parseInt(form.league_id) : null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }

    const url = isEdit ? `/api/admin/articles/${initialData!.id}` : '/api/admin/articles'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Có lỗi xảy ra, thử lại sau.')
      setLoading(false)
      return
    }

    router.push('/admin/bai-viet')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Hướng dẫn sử dụng */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800 font-medium mb-2">💡 Quy ước tạo nội dung:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Giới thiệu giải đấu:</strong> League ID = 39 (Premier League), Match ID = để trống</li>
          <li><strong>Giới thiệu đội bóng:</strong> Match ID = 33 (Man Utd), League ID = -1</li>
          <li><strong>Hướng dẫn tỷ lệ kèo:</strong> League ID = 0, Match ID = để trống, Slug chứa "huong-dan-ty-le-keo"</li>
          <li><strong>Nhận định trận:</strong> Match ID = ID trận, League ID = ID giải</li>
        </ul>
      </div>

      {/* Tiêu đề */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Nhận định Man City vs Arsenal..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Slug (URL) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="nhan-dinh-man-city-vs-arsenal"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
        <p className="mt-1 text-xs text-gray-400">
          URL: /nhan-dinh/<strong>{form.slug || '...'}</strong>
        </p>
      </div>

      {/* 2 cột: Match ID + League ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Match ID (API-Football)
          </label>
          <input
            type="number"
            value={form.match_id}
            onChange={(e) => setForm((f) => ({ ...f, match_id: e.target.value }))}
            placeholder="1035066"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
          <p className="mt-1 text-xs text-gray-400">Gắn bài với trận đấu cụ thể</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            League ID
          </label>
          <input
            type="number"
            value={form.league_id}
            onChange={(e) => setForm((f) => ({ ...f, league_id: e.target.value }))}
            placeholder="39"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Tóm tắt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          rows={2}
          placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">URL ảnh bìa</label>
        <input
          type="url"
          value={form.cover_image}
          onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Author */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Tác giả</label>
        <input
          type="text"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Nội dung */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Nội dung (HTML) <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          rows={16}
          placeholder="<p>Nội dung bài viết...</p>"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-y"
        />
        <p className="mt-1 text-xs text-gray-400">Hỗ trợ HTML. Dùng &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;...</p>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
          Đăng bài
        </button>
      </div>
    </div>
  )
}
