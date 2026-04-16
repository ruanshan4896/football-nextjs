'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { useState } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-react'
import ImageDialog from './ImageDialog'
import LinkDialog from './LinkDialog'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'prose-image',
        },
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
        'data-placeholder': placeholder || 'Nhập nội dung bài viết...',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = (linkData: { href: string; text?: string }) => {
    if (linkData.text) {
      // Nếu có text, chèn text mới với link
      editor.chain().focus().insertContent(`<a href="${linkData.href}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`).run()
    } else {
      // Nếu không có text, áp dụng link cho text đã chọn
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkData.href }).run()
    }
  }

  const getSelectedText = () => {
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, '')
  }

  const addImage = (imageData: { src: string; alt: string; title?: string }) => {
    editor.chain().focus().setImage({
      src: imageData.src,
      alt: imageData.alt,
      title: imageData.title,
    }).run()
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors disabled:opacity-50"
          title="Hoàn tác"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors disabled:opacity-50"
          title="Làm lại"
        >
          <Redo size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Tiêu đề 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Tiêu đề 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="In đậm"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="In nghiêng"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('code') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Code"
        >
          <Code size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Danh sách"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Danh sách số"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Trích dẫn"
        >
          <Quote size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Căn trái"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Căn giữa"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Căn phải"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1 h-6"></div>

        {/* Link & Image */}
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className={`p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''
          }`}
          title="Chèn link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
          className="p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
          title="Chèn ảnh"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="bg-white"
        placeholder={placeholder}
      />

      {/* Image Dialog */}
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={addImage}
      />

      {/* Link Dialog */}
      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsert={addLink}
        selectedText={getSelectedText()}
      />
    </div>
  )
}