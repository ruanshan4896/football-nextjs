import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Trophy, Target, Users, Award, Zap } from 'lucide-react'
import { getWorldCupGroups } from '@/lib/services/worldcup'
import { breadcrumbJsonLd } from '@/lib/json-ld'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

export const metadata: Metadata = {
  title: 'Thống kê FIFA World Cup 2026 - Bảng xếp hạng tổng hợp',
  description: 'Thống kê tổng hợp FIFA World Cup 2026. Bảng xếp hạng các đội thứ 3, phong độ, thành tích và dự đoán đội đi tiếp vòng 32.',
  alternates: {
    canonical: `${BASE_URL}/world-cup-2026/thong-ke`,
  },
  openGraph: {
    title: 'Thống kê FIFA World Cup 2026',
    description: 'Thống kê tổng hợp FIFA World Cup 2026. Bảng xếp hạng các đội thứ 3, phong độ và dự đoán.',
    images: ['https://media.api-sports.io/football/leagues/1.png'],
  },
}

// Third place teams ranking
async function ThirdPlaceRanking() {
  const groups = await getWorldCupGroups()
  
  // Lấy tất cả đội thứ 3 từ các bảng
  const thirdPlaceTeams = Object.entries(groups)
    .map(([groupLetter, teams]) => {
      const thirdPlace = teams.find(team => team.rank === 3)
      return thirdPlace ? { ...thirdPlace, groupLetter } : null
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sắp xếp theo: điểm > hiệu số > bàn thắng
      if (a!.points !== b!.points) return b!.points - a!.points
      if (a!.goalsDiff !== b!.goalsDiff) return b!.goalsDiff - a!.goalsDiff
      return b!.all.goals.for - a!.all.goals.for
    })

  if (thirdPlaceTeams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award size={32} className="mx-auto mb-2 text-gray-300" />
        <p>Chưa có dữ liệu đội thứ 3</p>
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
            <th className="text-center py-2 px-1 w-12">Bảng</th>
            <th className="text-center py-2 px-1 w-8">Trận</th>
            <th className="text-center py-2 px-1 w-8">T</th>
            <th className="text-center py-2 px-1 w-8">H</th>
            <th className="text-center py-2 px-1 w-8">B</th>
            <th className="text-center py-2 px-1 w-12">H.số</th>
            <th className="text-center py-2 px-2 w-10 font-bold">Điểm</th>
            <th className="text-center py-2 px-2 w-16">Tình trạng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {thirdPlaceTeams.map((team, index) => {
            const isQualified = index < 8 // Top 8 đội thứ 3 đi tiếp
            
            return (
              <tr key={team!.team.id} className="hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isQualified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Link 
                    href={`/doi-bong/${team!.team.id}`}
                    className="flex items-center gap-3 hover:text-green-600 transition-colors"
                  >
                    <div className="relative w-6 h-4 shrink-0">
                      <Image
                        src={team!.team.logo}
                        alt={team!.team.name}
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
                    <span className="font-medium text-gray-900 truncate">
                      {team!.team.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-1 text-center">
                  <Link 
                    href={`/world-cup-2026/bang-dau/${team!.groupLetter.toLowerCase()}`}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-200 transition-colors"
                  >
                    {team!.groupLetter}
                  </Link>
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums">
                  {team!.all.played}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-green-600">
                  {team!.all.win}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-gray-500">
                  {team!.all.draw}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums text-red-500">
                  {team!.all.lose}
                </td>
                <td className="py-3 px-1 text-center text-sm tabular-nums">
                  <span className={team!.goalsDiff >= 0 ? 'text-green-600' : 'text-red-500'}>
                    {team!.goalsDiff > 0 ? '+' : ''}{team!.goalsDiff}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="font-bold text-gray-900 tabular-nums">
                    {team!.points}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isQualified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isQualified ? 'Đi tiếp' : 'Bị loại'}
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

// Group winners summary
async function GroupWinnersSummary() {
  const groups = await getWorldCupGroups()
  
  const groupWinners = Object.entries(groups)
    .map(([groupLetter, teams]) => ({
      groupLetter,
      winner: teams.find(team => team.rank === 1),
      runnerUp: teams.find(team => team.rank === 2),
    }))
    .filter(group => group.winner && group.runnerUp)
    .sort((a, b) => a.groupLetter.localeCompare(b.groupLetter))

  if (groupWinners.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy size={32} className="mx-auto mb-2 text-gray-300" />
        <p>Chưa có dữ liệu bảng đấu</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groupWinners.map(({ groupLetter, winner, runnerUp }) => (
        <Link
          key={groupLetter}
          href={`/world-cup-2026/bang-dau/${groupLetter.toLowerCase()}`}
          className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Bảng {groupLetter}</h3>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-700">{groupLetter}</span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Winner */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <div className="relative w-5 h-3 shrink-0">
                <Image
                  src={winner!.team.logo}
                  alt={winner!.team.name}
                  fill
                  className="object-contain"
                  sizes="20px"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {winner!.team.name}
              </span>
              <span className="ml-auto text-sm font-bold text-gray-700 tabular-nums">
                {winner!.points}
              </span>
            </div>

            {/* Runner-up */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">2</span>
              </div>
              <div className="relative w-5 h-3 shrink-0">
                <Image
                  src={runnerUp!.team.logo}
                  alt={runnerUp!.team.name}
                  fill
                  className="object-contain"
                  sizes="20px"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {runnerUp!.team.name}
              </span>
              <span className="ml-auto text-sm font-bold text-gray-700 tabular-nums">
                {runnerUp!.points}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default async function WorldCupStatsPage() {
  return (
    <div className="space-y-6">
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'FIFA World Cup 2026', url: `${BASE_URL}/world-cup-2026` },
            { name: 'Thống kê', url: `${BASE_URL}/world-cup-2026/thong-ke` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'FIFA World Cup 2026', href: '/world-cup-2026' },
          { name: 'Thống kê' },
        ]}
      />

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-white to-red-600 p-6 text-center shadow-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thống kê FIFA World Cup 2026
          </h1>
          <p className="text-gray-600 text-sm">
            Bảng xếp hạng tổng hợp, đội đi tiếp và thống kê toàn giải
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <Link
            href="/world-cup-2026"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
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
            className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-green-700 text-green-700"
          >
            <Clock size={14} className="inline mr-1.5 -mt-0.5" />
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
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {/* Group winners */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy size={18} />
              Nhất & Nhì các bảng
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              32 đội đi tiếp vòng knockout (24 đội từ top 2 + 8 đội thứ 3 xuất sắc nhất)
            </p>
          </div>
          <div className="p-4">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            }>
              <GroupWinnersSummary />
            </Suspense>
          </div>
        </div>

        {/* Third place ranking */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award size={18} />
              Bảng xếp hạng các đội thứ 3
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              8 đội thứ 3 xuất sắc nhất sẽ đi tiếp vòng 32. Xếp hạng theo điểm, hiệu số, bàn thắng.
            </p>
          </div>
          <div className="p-4">
            <Suspense fallback={
              <div className="space-y-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            }>
              <ThirdPlaceRanking />
            </Suspense>
          </div>
        </div>

        {/* Tournament format info */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Users size={18} />
            Thể thức World Cup 2026
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Vòng bảng</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 48 đội chia thành 12 bảng (A-L)</li>
                <li>• Mỗi bảng 4 đội, đấu vòng tròn 1 lượt</li>
                <li>• Top 2 mỗi bảng đi tiếp (24 đội)</li>
                <li>• 8 đội thứ 3 xuất sắc nhất đi tiếp</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Vòng loại trực tiếp</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Vòng 32: 32 đội → 16 đội</li>
                <li>• Vòng 16: 16 đội → 8 đội</li>
                <li>• Tứ kết: 8 đội → 4 đội</li>
                <li>• Bán kết + Chung kết + Tranh hạng 3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}