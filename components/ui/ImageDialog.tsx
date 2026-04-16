'use client'

import { useState } from 'react'
import { X, Upload, Link as LinkIcon } from 'lucide-react'

interface ImageDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: { src: string; alt: string; title?: string }) => void
}

export default function ImageDialog({ isOpen, onClose, onInsert }: ImageDialogProps) {
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!src.trim()) {
      setError('Vui lòng nhập URL ảnh')
      return
    }
    
    if (!alt.trim()) {
      setError('Vui lòng nhập mô tả ảnh (Alt text)')
      return
    }

    onInsert({
      src: src.trim(),
      alt: alt.trim(),
      title: title.trim() || undefined,
    })

    // Reset form
    setSrc('')
    setAlt('')
    setTitle('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setSrc('')
    setAlt('')
    setTitle('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chèn ảnh</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL ảnh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Alt text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ảnh (Alt text) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Mô tả nội dung ảnh cho SEO và accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mô tả này giúp SEO và người khiếm thị hiểu nội dung ảnh
            </p>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề ảnh (tùy chọn)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hiển thị khi hover chuột"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          {/* Preview */}
          {src && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Xem trước:</p>
              <img
                src={src}
                alt={alt || 'Preview'}
                title={title}
                className="max-w-full h-auto max-h-32 rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  setError('URL ảnh không hợp lệ')
                }}
                onLoad={() => setError('')}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Chèn ảnh
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}