import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Calendar, Users, MapPin, Zap } from 'lucide-react'
import { getWorldCupGroups, WORLD_CUP_SEASON } from '@/lib/services/worldcup'
import { organizationJsonLd, breadcrumbJsonLd } from '@/lib/json-ld'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 - Bảng đấu, Lịch thi đấu & Kết quả',
  description: 'Theo dõi FIFA World Cup 2026 tại USA, Canada, Mexico. 12 bảng đấu, 48 đội tham dự. Lịch thi đấu, kết quả và bảng xếp hạng cập nhật trực tiếp.',
  alternates: {
    canonical: `${BASE_URL}/world-cup-2026`,
  },
  openGraph: {
    title: 'FIFA World Cup 2026 - Bảng đấu & Lịch thi đấu',
    description: 'Theo dõi FIFA World Cup 2026 tại USA, Canada, Mexico. 12 bảng đấu, 48 đội tham dự.',
    images: ['https://media.api-sports.io/football/leagues/1.png'],
  },
}

// Skeleton loading
function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-100 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-6 h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// World Cup Groups Grid
async function WorldCupGroupsGrid() {
  const groups = await getWorldCupGroups()
  const groupLetters = Object.keys(groups).sort()

  if (groupLetters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
        <p>Dữ liệu bảng đấu World Cup 2026 chưa có sẵn</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {groupLetters.map((groupLetter) => {
        const teams = groups[groupLetter]
        return (
          <Link
            key={groupLetter}
            href={`/world-cup-2026/bang-dau/${groupLetter.toLowerCase()}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
          >
            {/* Group header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Bảng {groupLetter}</h3>
              <div className="text-xs text-gray-400">{teams.length} đội</div>
            </div>

            {/* Teams list */}
            <div className="space-y-2">
              {teams.slice(0, 4).map((team, index) => (
                <div key={team.team.id} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-center text-xs font-bold text-gray-400">
                    {index + 1}
                  </span>
                  <div className="relative w-5 h-3 shrink-0">
                    <Image
                      src={team.team.logo}
                      alt={team.team.name}
                      fill
                      className="object-contain"
                      sizes="20px"
                    />
                  </div>
                  <span className="truncate text-gray-700 font-medium">
                    {team.team.name}
                  </span>
                  <span className="ml-auto text-xs font-bold text-gray-600 tabular-nums">
                    {team.points}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function WorldCup2026Page() {
  return (
    <div className="space-y-6">
      {/* JSON-LD Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'FIFA World Cup 2026', url: `${BASE_URL}/world-cup-2026` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'Giải đấu quốc tế' },
          { name: 'FIFA World Cup 2026' },
        ]}
      />

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-white to-red-600 p-6 text-center shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <Image
              src="https://media.api-sports.io/football/leagues/1.png"
              alt="FIFA World Cup 2026"
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FIFA World Cup 2026
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-700 mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>🇺🇸 USA • 🇨🇦 Canada • 🇲🇽 Mexico</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>11/6 - 28/6/2026</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>48 đội • 12 bảng</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Giải đấu bóng đá lớn nhất thế giới với 48 đội tham dự lần đầu tiên trong lịch sử
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <Link
            href="/world-cup-2026"
            className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-green-700 text-green-700"
          >
            <Trophy size={14} className="inline mr-1.5 -mt-0.5" />
            Bảng đấu
          </Link>
          <Link
            href="/world-cup-2026/lich-thi-dau"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
            Lịch thi đấu
          </Link>
          <Link
            href="/world-cup-2026/thong-ke"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <Users size={14} className="inline mr-1.5 -mt-0.5" />
            Thống kê
          </Link>
          <Link
            href="/world-cup-2026/knockout"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <Zap size={14} className="inline mr-1.5 -mt-0.5" />
            Knockout
          </Link>
        </div>

        {/* Groups grid */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              12 Bảng đấu vòng bảng
            </h2>
            <p className="text-sm text-gray-500">
              Mỗi bảng 4 đội, top 2 và 8 đội thứ 3 xuất sắc nhất vào vòng 32
            </p>
          </div>

          <Suspense fallback={<GroupsSkeleton />}>
            <WorldCupGroupsGrid />
          </Suspense>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">48</div>
          <div className="text-xs text-gray-500">Đội tham dự</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-xs text-gray-500">Bảng đấu</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">104</div>
          <div className="text-xs text-gray-500">Trận đấu</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">3</div>
          <div className="text-xs text-gray-500">Nước đăng cai</div>
        </div>
      </div>
    </div>
  )
}