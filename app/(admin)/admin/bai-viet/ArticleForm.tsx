'use client'

import { useState, useRef } from 'react'
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
  content_type: 'article' | 'page_content'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    content_type: (initialData as any)?.content_type ?? 'article',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      // Chỉ auto-gen slug khi tạo mới (không ghi đè slug đã có khi edit)
      slug: isEdit ? f.slug : toSlug(title),
    }))
  }

  // Helper functions cho editor
  function insertTag(tag: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = form.content.substring(start, end)
    const beforeText = form.content.substring(0, start)
    const afterText = form.content.substring(end)

    const newText = selectedText 
      ? `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`
      : `${beforeText}<${tag}></${tag}>${afterText}`

    setForm((f) => ({ ...f, content: newText }))

    // Set cursor position
    setTimeout(() => {
      const newPos = selectedText ? end + tag.length * 2 + 5 : start + tag.length + 2
      textarea.focus()
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  function insertList(type: 'ul' | 'ol') {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const beforeText = form.content.substring(0, start)
    const afterText = form.content.substring(start)

    const listHtml = `<${type}>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</${type}>`

    const newText = `${beforeText}${listHtml}${afterText}`
    setForm((f) => ({ ...f, content: newText }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + listHtml.length, start + listHtml.length)
    }, 0)
  }

  function insertLink() {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = form.content.substring(start, end)
    const beforeText = form.content.substring(0, start)
    const afterText = form.content.substring(end)

    const url = prompt('Nhập URL:', 'https://')
    if (!url) return

    const linkText = selectedText || 'link text'
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener">${linkText}</a>`

    const newText = `${beforeText}${linkHtml}${afterText}`
    setForm((f) => ({ ...f, content: newText }))

    setTimeout(() => {
      textarea.focus()
    }, 0)
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
      content_type: form.content_type,
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
        <p className="text-xs text-blue-800 font-medium mb-2">💡 Loại nội dung:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Bài viết (Article):</strong> Nhận định trận đấu, tin tức - hiển thị ở trang /nhan-dinh</li>
          <li><strong>Nội dung trang (Page Content):</strong> Giới thiệu giải đấu/đội bóng, hướng dẫn - chỉ hiển thị ở trang tương ứng</li>
        </ul>
      </div>

      {/* Loại nội dung */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Loại nội dung <span className="text-red-500">*</span>
        </label>
        <select
          value={form.content_type}
          onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value as 'article' | 'page_content' }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        >
          <option value="article">Bài viết (Article)</option>
          <option value="page_content">Nội dung trang (Page Content)</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          {form.content_type === 'article' 
            ? 'Hiển thị ở trang /nhan-dinh và sidebar' 
            : 'Chỉ hiển thị ở trang được chỉ định (giải đấu, đội bóng, tỷ lệ kèo)'}
        </p>
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
            {form.content_type === 'page_content' && 'Team ID hoặc '}Match ID
          </label>
          <input
            type="number"
            value={form.match_id}
            onChange={(e) => setForm((f) => ({ ...f, match_id: e.target.value }))}
            placeholder={form.content_type === 'page_content' ? '33 (team) hoặc 1035066 (match)' : '1035066'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            {form.content_type === 'article' 
              ? 'Gắn bài với trận đấu cụ thể' 
              : 'Team ID cho giới thiệu đội, Match ID cho nhận định'}
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            League ID
          </label>
          <input
            type="number"
            value={form.league_id}
            onChange={(e) => setForm((f) => ({ ...f, league_id: e.target.value }))}
            placeholder={form.content_type === 'page_content' ? '39 (giải) hoặc 0 (hướng dẫn)' : '39'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            {form.content_type === 'article'
              ? 'ID giải đấu'
              : 'ID giải cho giới thiệu, 0 cho hướng dẫn, -1 cho đội bóng'}
          </p>
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Nội dung (HTML) <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showPreview ? '✏️ Chỉnh sửa' : '👁️ Xem trước'}
          </button>
        </div>

        {!showPreview ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
              <button
                type="button"
                onClick={() => insertTag('p')}
                className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Đoạn văn"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => insertTag('h2')}
                className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Tiêu đề 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertTag('h3')}
                className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Tiêu đề 3"
              >
                H3
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertTag('strong')}
                className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="In đậm"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertTag('em')}
                className="px-2 py-1 text-xs italic text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="In nghiêng"
              >
                I
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertList('ul')}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Danh sách"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertList('ol')}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Danh sách số"
              >
                1. List
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertLink()}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                title="Chèn link"
              >
                🔗 Link
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={16}
              placeholder="<p>Nội dung bài viết...</p>"
              className="w-full rounded-b-lg border border-gray-200 border-t-0 px-3 py-2.5 text-sm font-mono outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-y"
            />
            <p className="mt-1 text-xs text-gray-400">Hỗ trợ HTML. Dùng &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;...</p>
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 p-4 bg-white min-h-[400px]">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: form.content }}
            />
          </div>
        )}
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
