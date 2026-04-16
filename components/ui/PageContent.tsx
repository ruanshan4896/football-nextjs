import type { PageContent } from '@/lib/services/content'

interface Props {
  content: PageContent
  className?: string
}

export default function PageContentSection({ content, className = '' }: Props) {
  return (
    <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{content.title}</h1>
        {content.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{content.excerpt}</p>
        )}
        <div 
          className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
        {content.author && (
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Tác giả: {content.author}
          </p>
        )}
      </div>
    </div>
  )
}
