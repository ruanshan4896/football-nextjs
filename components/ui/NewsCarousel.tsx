'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { formatArticleDate } from '@/lib/date'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
}

interface Props {
  news: NewsItem[]
}

export default function NewsCarousel({ news }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  if (!news.length) return null

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-3 h-8 w-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Cuộn trái"
      >
        <ChevronLeft size={16} className="text-gray-600" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-3 h-8 w-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Cuộn phải"
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-1"
      >
        {news.map((item) => (
          <Link
            key={item.id}
            href={`/tin-tuc/${item.slug}`}
            className="shrink-0 w-52 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Ảnh */}
            <div className="h-28 w-full bg-gray-100 overflow-hidden">
              {item.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-2xl">📰</span>
                </div>
              )}
            </div>

            {/* Nội dung */}
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={9} />
                <span>{formatArticleDate(item.published_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
