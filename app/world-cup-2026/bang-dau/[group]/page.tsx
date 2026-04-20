import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Trophy, Calendar, ArrowLeft } from 'lucide-react'
import { getWorldCupGroup, getWorldCupFixturesByGroup } from '@/lib/services/worldcup'
import { breadcrumbJsonLd } from '@/lib/json-ld'

export const dynamic = 'force-dynamic'
import Breadcrumb from '@/components/ui/Breadcrumb'
import FixtureList from '@/components/ui/FixtureList'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongdalive.com')

export async function generateMetadata(props: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await props.params
  const groupLetter = group.toUpperCase()
  const teams = await getWorldCupGroup(groupLetter)
  
  if (teams.length === 0) {
    return { title: 'Bảng đấu không tồn tại' }
  }

  const teamNames = teams.map(t => t.team.name).join(', ')
  
  return {
    title: `Bảng ${groupLetter} - FIFA World Cup 2026`,
    description: `Bảng xếp hạng và lịch thi đấu bảng ${groupLetter} World Cup 2026: ${teamNames}`,
    alternates: {
      canonical: `${BASE_URL}/world-cup-2026/bang-dau/${group}`,
    },
    openGraph: {
      title: `Bảng ${groupLetter} - FIFA World Cup 2026`,
      description: `Bảng xếp hạng và lịch thi đấu bảng ${groupLetter}: ${teamNames}`,
      images: teams.length > 0 ? [teams[0].team.logo] : [],
    },
  }
}

// Group standings table
async function GroupStandingsTable({ groupLetter }: { groupLetter: string }) {
  const teams = await getWorldCupGroup(groupLetter)

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy size={32} className="mx-auto mb-2 text-gray-300" />
        <p>Không tìm thấy dữ liệu bảng {groupLetter}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left py-2 px-3">#</th>
            <th className="text-left py-2 px-3">Đội</th>
            <th className="text-center py-2 px-1 w-8">Trận</th>
            <th className="text-center py-2 px-1 w-8">T</th>
            <th className="text-center py-2 px-1 w-8">H</th>
            <th className="text-center py-2 px-1 w-8">B</th>
            <th className="text-center py-2 px-1 w-12">H.số</th>
            <th className="text-center py-2 px-2 w-10 font-bold">Điểm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {teams.map((team, index) => {
            const isQualified = index < 2 // Top 2 đi tiếp
            const isThirdPlace = index === 2 // Thứ 3 có thể đi tiếp
            
            return (
              <tr key={team.team.id} className="hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isQualified ? 'bg-green-100 text-green-700' :
                      isThirdPlace ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {team.rank}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Link 
                    href={`/doi-bong/${team.team.id}`}
                    className="flex items-center gap-3 hover:text-green-600 transition-colors"
                  >
                    <div className="relative w-6 h-4 shrink-0">
                      <Image
                        src={team.team.logo}
                        alt={team.team.name}
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
                    <span className="font-medium text-gray-900 truncate">
                      {team.team.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums">
                  {team.all.played}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-green-600">
                  {team.all.win}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-gray-500">
                  {team.all.draw}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-red-500">
                  {team.all.lose}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums">
                  <span className={team.goalsDiff >= 0 ? 'text-green-600' : 'text-red-500'}>
                    {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="font-bold text-gray-900 tabular-nums">
                    {team.points}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Group fixtures
async function GroupFixtures({ groupLetter }: { groupLetter: string }) {
  const fixtures = await getWorldCupFixturesByGroup(groupLetter)

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
        <p>Chưa có lịch thi đấu cho bảng {groupLetter}</p>
      </div>
    )
  }

  return <FixtureList fixtures={fixtures} showDate emptyMessage="" />
}

export default async function WorldCupGroupPage(props: { params: Promise<{ group: string }> }) {
  const { group } = await props.params
  const groupLetter = group.toUpperCase()

  // Validate group letter (A-L)
  if (!/^[A-L]$/.test(groupLetter)) {
    notFound()
  }

  const teams = await getWorldCupGroup(groupLetter)

  if (teams.length === 0) {
    notFound()
  }

  return (
    <div className="space-y-4">
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'FIFA World Cup 2026', url: `${BASE_URL}/world-cup-2026` },
            { name: `Bảng ${groupLetter}`, url: `${BASE_URL}/world-cup-2026/bang-dau/${group}` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'FIFA World Cup 2026', href: '/world-cup-2026' },
          { name: `Bảng ${groupLetter}` },
        ]}
      />

      {/* Back button */}
      <Link 
        href="/world-cup-2026"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại tất cả bảng đấu
      </Link>

      {/* Group header */}
      <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <Image
              src="https://media.api-sports.io/football/leagues/1.png"
              alt="FIFA World Cup 2026"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Bảng {groupLetter} - FIFA World Cup 2026
            </h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>4 đội tham dự</span>
              <span>•</span>
              <span>Top 2 đi tiếp</span>
              <span>•</span>
              <span>Thứ 3 có thể đi tiếp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Standings */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Trophy size={16} />
              Bảng xếp hạng
            </h2>
          </div>
          <div className="p-4">
            <Suspense fallback={
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            }>
              <GroupStandingsTable groupLetter={groupLetter} />
            </Suspense>
          </div>
        </div>

        {/* Fixtures */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} />
              Lịch thi đấu
            </h2>
          </div>
          <Suspense fallback={
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          }>
            <GroupFixtures groupLetter={groupLetter} />
          </Suspense>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Chú thích</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500" />
            <span>Top 2: Vào vòng 32</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-500" />
            <span>Thứ 3: Có thể vào vòng 32</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-400" />
            <span>Thứ 4: Bị loại</span>
          </div>
        </div>
      </div>
    </div>
  )
}