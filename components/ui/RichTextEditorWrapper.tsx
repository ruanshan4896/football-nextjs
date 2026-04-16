'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

// Loading component
const EditorLoading = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="flex items-center justify-center p-4 bg-gray-50 border-b border-gray-200">
      <Loader2 size={16} className="animate-spin text-gray-400" />
      <span className="ml-2 text-sm text-gray-500">Đang tải editor...</span>
    </div>
    <div className="bg-white p-4 min-h-[300px] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Vui lòng đợi...</div>
    </div>
  </div>
)

// Dynamic import with no SSR
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: EditorLoading,
})

export default function RichTextEditorWrapper(props: RichTextEditorProps) {
  return <RichTextEditor {...props} />
}