'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Xóa bài viết "${title}"?\nHành động này không thể hoàn tác.`)) return

    setLoading(true)
    const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Xóa thất bại, thử lại sau.')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
