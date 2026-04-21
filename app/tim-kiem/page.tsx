import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Users, Trophy, Calendar, FileText } from 'lucide-react'
import { searchAll, getSearchSuggestions, type SearchResult } from '@/lib/services/search'
import { breadcrumbJsonLd } from '@/lib/json-ld'
import Breadcrumb from '@/components/ui/Breadcrumb'


export const dynamic = 'force-dynamic'
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

export const metadata: Metadata = {
  title: 'Tìm kiếm - Giải đấu, Đội bóng, Bài viết',
  description: 'Tìm kiếm giải đấu, đội bóng, bài viết nhận định và thông tin bóng đá.',
  alternates: {
    canonical: `${BASE_URL}/tim-kiem`,
  },
}

// Skeleton loading
function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component hiển thị kết quả tìm kiếm
function SearchResultCard({ result }: { result: SearchResult }) {
  const getIcon = () => {
    switch (result.type) {
      case 'league': return <Trophy size={16} className="text-yellow-600" />
      case 'team': return <Users size={16} className="text-blue-600" />
      case 'article': return <FileText size={16} className="text-green-600" />
      default: return null
    }
  }

  const getTypeLabel = () => {
    switch (result.type) {
      case 'league': return 'Giải đấu'
      case 'team': return 'Đội bóng'
      case 'article': return 'Bài viết'
      default: return ''
    }
  }

  return (
    <Link
      href={result.url}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="relative h-10 w-10 shrink-0">
        {result.image ? (
          <Image
            src={result.image}
            alt={result.title}
            fill
            className="object-contain rounded"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {result.title}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {result.subtitle}
        </p>
        {result.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {result.description}
          </p>
        )}
      </div>
      <div className="text-xs text-gray-400 flex items-center gap-1">
        {getIcon()}
        {getTypeLabel()}
      </div>
    </Link>
  )
}

// Component hiển thị nhóm kết quả
function SearchResultGroup({ 
  title, 
  icon, 
  results, 
  viewAllUrl 
}: { 
  title: string
  icon: React.ReactNode
  results: SearchResult[]
  viewAllUrl?: string 
}) {
  if (results.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title} ({results.length})
          </h3>
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="text-xs font-medium text-green-700 hover:underline"
            >
              Xem tất cả →
            </Link>
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {results.slice(0, 5).map((result) => (
          <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>
    </div>
  )
}

// Gợi ý tìm kiếm phổ biến
function SearchSuggestions() {
  const suggestions = getSearchSuggestions()

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Tìm kiếm phổ biến
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              href={`/tim-kiem?q=${encodeURIComponent(suggestion.text)}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
            >
              {suggestion.type === 'league' && <Trophy size={12} className="mr-1" />}
              {suggestion.type === 'team' && <Users size={12} className="mr-1" />}
              {suggestion.type === 'tournament' && <Calendar size={12} className="mr-1" />}
              {suggestion.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component tìm kiếm chính
async function SearchResults({ query }: { query: string }) {
  if (!query || query.length < 2) {
    return <SearchSuggestions />
  }

  const { leagues, teams, articles, total } = await searchAll(query)

  if (total === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8 text-center">
        <Search size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy kết quả
        </h3>
        <p className="text-gray-500 mb-4">
          Không có kết quả nào cho "{query}". Hãy thử với từ khóa khác.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Gợi ý:</p>
          <ul className="text-left max-w-xs mx-auto space-y-1">
            <li>• Kiểm tra chính tả</li>
            <li>• Thử từ khóa ngắn hơn</li>
            <li>• Tìm theo tên tiếng Anh</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SearchResultGroup
        title="Giải đấu"
        icon={<Trophy size={16} />}
        results={leagues}
      />
      
      <SearchResultGroup
        title="Đội bóng"
        icon={<Users size={16} />}
        results={teams}
      />
      
      <SearchResultGroup
        title="Bài viết"
        icon={<FileText size={16} />}
        results={articles}
        viewAllUrl={`/nhan-dinh?q=${encodeURIComponent(query)}`}
      />
    </div>
  )
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams.q || ''

  return (
    <div className="space-y-6">
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'Tìm kiếm', url: `${BASE_URL}/tim-kiem` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'Tìm kiếm' },
        ]}
      />

      {/* Header tìm kiếm */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="bg-green-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-white" />
            <h1 className="text-lg font-bold text-white">Tìm kiếm</h1>
          </div>
        </div>

        {/* Form tìm kiếm */}
        <div className="p-4">
          <form method="GET" action="/tim-kiem" className="relative">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Tìm kiếm giải đấu, đội bóng, bài viết..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition-colors"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* Kết quả tìm kiếm */}
      {query && (
        <div className="rounded-xl bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Kết quả cho "{query}"
          </h2>
        </div>
      )}

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>

      {/* Hướng dẫn tìm kiếm */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Mẹo tìm kiếm hiệu quả
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sử dụng từ khóa ngắn gọn: "Premier League", "Real Madrid"</li>
          <li>• Tìm theo tên giải đấu: "Champions League", "World Cup"</li>
          <li>• Tìm theo tên đội bóng: "Manchester United", "Barcelona"</li>
          <li>• Tìm bài viết theo chủ đề: "nhận định", "dự đoán"</li>
        </ul>
      </div>
    </div>
  )
}