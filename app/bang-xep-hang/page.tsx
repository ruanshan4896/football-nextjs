import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { getStandings, TRACKED_LEAGUES, CURRENT_SEASON } from '@/lib/services/standings'
import type { Standing } from '@/lib/api-football'

export const metadata: Metadata = {
  title: 'Bảng xếp hạng bóng đá',
  description: 'Bảng xếp hạng các giải đấu bóng đá hàng đầu thế giới cập nhật mới nhất.',
}

// Skeleton
function Skeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-2">
          <div className="h-4 w-5 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
          <div className="h-3 flex-1 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

// Màu hàng theo thứ hạng (Champions League, Europa, Relegation...)
function getRowColor(description: string | null): string {
  if (!description) return ''
  const d = description.toLowerCase()
  if (d.includes('champions league') || d.includes('promotion')) return 'border-l-2 border-blue-500'
  if (d.includes('europa league')) return 'border-l-2 border-orange-400'
  if (d.includes('conference')) return 'border-l-2 border-green-400'
  if (d.includes('relegation') || d.includes('xuống hạng')) return 'border-l-2 border-red-400'
  return ''
}

// Bảng xếp hạng 1 giải
async function StandingsTable({ leagueId, leagueName }: { leagueId: number; leagueName: string }) {
  const standings = await getStandings(leagueId, CURRENT_SEASON)

  if (!standings || standings.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-gray-400">
        Chưa có dữ liệu bảng xếp hạng
      </div>
    )
  }

  // Lấy nhóm đầu tiên (hầu hết giải chỉ có 1 nhóm)
  const table: Standing[] = standings[0]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400">
            <th className="py-2 pl-3 text-left w-7">#</th>
            <th className="py-2 text-left">Đội</th>
            <th className="py-2 text-center w-7">Tr</th>
            <th className="py-2 text-center w-7">T</th>
            <th className="py-2 text-center w-7">H</th>
            <th className="py-2 text-center w-7">B</th>
            <th className="py-2 text-center w-10">HS</th>
            <th className="py-2 pr-3 text-center w-8 font-bold text-gray-600">Đ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {table.map((row) => (
            <tr
              key={row.team.id}
              className={`hover:bg-gray-50 transition-colors ${getRowColor(row.description)}`}
            >
              <td className="py-2 pl-3 text-gray-500 font-medium">{row.rank}</td>
              <td className="py-2">
                <Link
                  href={`/doi-bong/${row.team.id}`}
                  className="flex items-center gap-2 hover:text-green-700"
                >
                  <div className="relative h-5 w-5 shrink-0">
                    <Image
                      src={row.team.logo}
                      alt={row.team.name}
                      fill
                      className="object-contain"
                      sizes="20px"
                    />
                  </div>
                  <span className="truncate max-w-[120px] font-medium text-gray-800">
                    {row.team.name}
                  </span>
                </Link>
              </td>
              <td className="py-2 text-center text-gray-600">{row.all.played}</td>
              <td className="py-2 text-center text-gray-600">{row.all.win}</td>
              <td className="py-2 text-center text-gray-600">{row.all.draw}</td>
              <td className="py-2 text-center text-gray-600">{row.all.lose}</td>
              <td className="py-2 text-center text-gray-500">
                {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
              </td>
              <td className="py-2 pr-3 text-center font-bold text-gray-900">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chú thích màu */}
      <div className="flex flex-wrap gap-3 px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-blue-500" />Champions League
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-orange-400" />Europa League
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-red-400" />Xuống hạng
        </div>
      </div>
    </div>
  )
}

export default async function BangXepHangPage(props: PageProps<'/bang-xep-hang'>) {
  const { league: leagueParam } = await props.searchParams ?? {}
  const selectedLeagueId = typeof leagueParam === 'string'
    ? parseInt(leagueParam)
    : TRACKED_LEAGUES[0].id

  const selectedLeague = TRACKED_LEAGUES.find((l) => l.id === selectedLeagueId) ?? TRACKED_LEAGUES[0]

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
          <BarChart2 size={15} className="text-white" />
          <h1 className="text-sm font-semibold text-white">Bảng xếp hạng</h1>
        </div>

        {/* Tab chọn giải - scrollable trên mobile */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TRACKED_LEAGUES.map((league) => {
            const isActive = league.id === selectedLeague.id
            return (
              <Link
                key={league.id}
                href={`/bang-xep-hang?league=${league.id}`}
                className={`shrink-0 px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-b-2 border-green-700 text-green-700'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                {league.name}
              </Link>
            )
          })}
        </div>

        {/* Bảng xếp hạng */}
        <Suspense fallback={<Skeleton />}>
          <StandingsTable
            leagueId={selectedLeague.id}
            leagueName={selectedLeague.name}
          />
        </Suspense>
      </div>
    </div>
  )
}
