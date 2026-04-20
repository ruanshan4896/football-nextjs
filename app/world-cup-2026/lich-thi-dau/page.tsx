import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Trophy, ChevronLeft, ChevronRight, Users, Zap } from 'lucide-react'
import { getWorldCupRounds, getWorldCupFixturesByRound } from '@/lib/services/worldcup'
import { breadcrumbJsonLd } from '@/lib/json-ld'
import Breadcrumb from '@/components/ui/Breadcrumb'
import FixtureList from '@/components/ui/FixtureList'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongdalive.com')

export const metadata: Metadata = {
  title: 'Lịch thi đấu FIFA World Cup 2026 - Vòng bảng',
  description: 'Lịch thi đấu đầy đủ FIFA World Cup 2026. 3 vòng bảng, 12 bảng đấu từ A-L. Thời gian, kết quả và thông tin trận đấu cập nhật trực tiếp.',
  alternates: {
    canonical: `${BASE_URL}/world-cup-2026/lich-thi-dau`,
  },
  openGraph: {
    title: 'Lịch thi đấu FIFA World Cup 2026',
    description: 'Lịch thi đấu đầy đủ FIFA World Cup 2026. 3 vòng bảng, 12 bảng đấu từ A-L.',
    images: ['https://media.api-sports.io/football/leagues/1.png'],
  },
}

// Round tabs component
function RoundTabs({ 
  rounds, 
  currentRound 
}: { 
  rounds: string[]
  currentRound: string
}) {
  const getRoundShortName = (round: string) => {
    if (round.includes('Group Stage - 1')) return 'Lượt 1'
    if (round.includes('Group Stage - 2')) return 'Lượt 2'
    if (round.includes('Group Stage - 3')) return 'Lượt 3'
    return round
  }

  return (
    <div className="flex border-b border-gray-200 mb-4">
      {rounds.map((round) => (
        <Link
          key={round}
          href={`/world-cup-2026/lich-thi-dau?round=${encodeURIComponent(round)}`}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            currentRound === round
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-500 hover:text-green-600'
          }`}
        >
          {getRoundShortName(round)}
        </Link>
      ))}
    </div>
  )
}

// Round navigation component
function RoundNavigation({ 
  rounds, 
  currentRound 
}: { 
  rounds: string[]
  currentRound: string
}) {
  const currentIndex = rounds.indexOf(currentRound)
  const prevRound = currentIndex > 0 ? rounds[currentIndex - 1] : null
  const nextRound = currentIndex < rounds.length - 1 ? rounds[currentIndex + 1] : null

  const getRoundDisplayName = (round: string) => {
    if (round.includes('Group Stage - 1')) return 'Vòng bảng - Lượt 1'
    if (round.includes('Group Stage - 2')) return 'Vòng bảng - Lượt 2'
    if (round.includes('Group Stage - 3')) return 'Vòng bảng - Lượt 3'
    return round
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4 md:hidden">
      <Link
        href={prevRound ? `/world-cup-2026/lich-thi-dau?round=${encodeURIComponent(prevRound)}` : '#'}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          prevRound 
            ? 'text-gray-600 hover:bg-white hover:text-green-600' 
            : 'text-gray-300 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronLeft size={16} />
        Trước
      </Link>

      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">
          {getRoundDisplayName(currentRound)}
        </h2>
        <p className="text-xs text-gray-500">
          {currentIndex + 1} / {rounds.length}
        </p>
      </div>

      <Link
        href={nextRound ? `/world-cup-2026/lich-thi-dau?round=${encodeURIComponent(nextRound)}` : '#'}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          nextRound 
            ? 'text-gray-600 hover:bg-white hover:text-green-600' 
            : 'text-gray-300 cursor-not-allowed pointer-events-none'
        }`}
      >
        Sau
        <ChevronRight size={16} />
      </Link>
    </div>
  )
}

// Fixtures by round component
async function FixturesByRound({ round }: { round: string }) {
  const fixtures = await getWorldCupFixturesByRound(round)

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Chưa có lịch thi đấu</h3>
        <p className="text-sm">
          Lịch thi đấu cho vòng này sẽ được cập nhật sớm
        </p>
      </div>
    )
  }

  // Nhóm trận đấu theo ngày
  const fixturesByDate = fixtures.reduce((acc, fixture) => {
    const date = fixture.fixture.date.split('T')[0] // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(fixture)
    return acc
  }, {} as Record<string, typeof fixtures>)

  const sortedDates = Object.keys(fixturesByDate).sort()

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayFixtures = fixturesByDate[date]
        const dateObj = new Date(date + 'T00:00:00')
        const dayName = dateObj.toLocaleDateString('vi-VN', { 
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

        return (
          <div key={date} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 capitalize">
                  {dayName}
                </h3>
                <span className="text-xs text-gray-500">
                  {dayFixtures.length} trận
                </span>
              </div>
            </div>
            <FixtureList fixtures={dayFixtures} emptyMessage="" />
          </div>
        )
      })}
    </div>
  )
}

export default async function WorldCupFixturesPage(props: {
  searchParams: Promise<{ round?: string }>
}) {
  const searchParams = await props.searchParams
  const rounds = await getWorldCupRounds()
  const currentRound = searchParams.round || rounds[0] || 'Group Stage - 1'

  return (
    <div className="space-y-6">
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'FIFA World Cup 2026', url: `${BASE_URL}/world-cup-2026` },
            { name: 'Lịch thi đấu', url: `${BASE_URL}/world-cup-2026/lich-thi-dau` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'FIFA World Cup 2026', href: '/world-cup-2026' },
          { name: 'Lịch thi đấu' },
        ]}
      />

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-white to-red-600 p-6 text-center shadow-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lịch thi đấu FIFA World Cup 2026
          </h1>
          <p className="text-gray-600 text-sm">
            Theo dõi lịch thi đấu đầy đủ 3 vòng bảng với 12 bảng đấu từ A đến L
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
            className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-green-700 text-green-700"
          >
            <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
            Lịch thi đấu
          </Link>
          <Link
            href="/world-cup-2026/thong-ke"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
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

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Vòng bảng - 3 lượt trận
            </h2>
            <p className="text-sm text-gray-500">
              Mỗi đội đấu 3 trận trong vòng bảng. Top 2 mỗi bảng + 8 đội thứ 3 xuất sắc nhất vào vòng 32.
            </p>
          </div>

          {/* Round navigation */}
          <RoundNavigation rounds={rounds} currentRound={currentRound} />

          {/* Desktop tabs */}
          <div className="hidden md:block">
            <RoundTabs rounds={rounds} currentRound={currentRound} />
          </div>

          {/* Fixtures content */}
          <Suspense 
            key={currentRound}
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="h-6 bg-gray-100 rounded mb-4 animate-pulse" />
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-16 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <FixturesByRound round={currentRound} />
          </Suspense>
        </div>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-green-700">3</div>
          <div className="text-xs text-gray-500">Vòng bảng</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-blue-600">36</div>
          <div className="text-xs text-gray-500">Trận vòng bảng</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
          <div className="text-xl font-bold text-red-500">32</div>
          <div className="text-xs text-gray-500">Đội vào vòng sau</div>
        </div>
      </div>
    </div>
  )
}