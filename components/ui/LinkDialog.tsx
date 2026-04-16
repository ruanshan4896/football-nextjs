'use client'

import { useState } from 'react'
import { X, Link as LinkIcon, ExternalLink } from 'lucide-react'

interface LinkDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: { href: string; text?: string }) => void
  selectedText?: string
}

export default function LinkDialog({ isOpen, onClose, onInsert, selectedText }: LinkDialogProps) {
  const [href, setHref] = useState('')
  const [text, setText] = useState(selectedText || '')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!href.trim()) {
      setError('Vui lòng nhập URL')
      return
    }
    
    if (!text.trim()) {
      setError('Vui lòng nhập text hiển thị')
      return
    }

    onInsert({
      href: href.trim(),
      text: text.trim(),
    })

    // Reset form
    setHref('')
    setText('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setHref('')
    setText(selectedText || '')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chèn liên kết</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Text hiển thị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhấn vào đây"
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
          {href && text && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Xem trước:</p>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
                onClick={(e) => e.preventDefault()}
              >
                {text}
                <ExternalLink size={12} />
              </a>
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
              Chèn link
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}