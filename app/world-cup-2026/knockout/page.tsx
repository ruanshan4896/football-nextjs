import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Trophy, Users, Target, Zap } from 'lucide-react'
import { getBracketStructure, getKnockoutRounds } from '@/lib/services/worldcup-knockout'
import { breadcrumbJsonLd } from '@/lib/json-ld'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Image from 'next/image'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongdalive.com')

export const metadata: Metadata = {
  title: 'Vòng loại trực tiếp FIFA World Cup 2026 - Bracket & Kết quả',
  description: 'Theo dõi vòng loại trực tiếp FIFA World Cup 2026. Bracket từ vòng 32 đến chung kết. 32 đội đi tiếp từ vòng bảng tranh tài knockout.',
  alternates: {
    canonical: `${BASE_URL}/world-cup-2026/knockout`,
  },
  openGraph: {
    title: 'Vòng loại trực tiếp FIFA World Cup 2026',
    description: 'Bracket vòng loại trực tiếp FIFA World Cup 2026. Từ vòng 32 đến chung kết.',
    images: ['https://media.api-sports.io/football/leagues/1.png'],
  },
}

// Bracket visualization component
async function KnockoutBracket() {
  const bracketData = await getBracketStructure()
  const { rounds, totalMatches } = bracketData

  if (totalMatches === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Target size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Vòng loại trực tiếp chưa bắt đầu</h3>
        <p className="text-sm">
          Bracket sẽ được tạo sau khi vòng bảng kết thúc
        </p>
      </div>
    )
  }

  const roundOrder: Array<keyof typeof rounds> = [
    'Round of 32',
    'Round of 16', 
    'Quarter-finals',
    'Semi-finals',
    'Final',
    'Third Place'
  ]

  const getRoundDisplayName = (round: string) => {
    switch (round) {
      case 'Round of 32': return 'Vòng 32'
      case 'Round of 16': return 'Vòng 16'
      case 'Quarter-finals': return 'Tứ kết'
      case 'Semi-finals': return 'Bán kết'
      case 'Final': return 'Chung kết'
      case 'Third Place': return 'Tranh hạng 3'
      default: return round
    }
  }

  const getRoundColor = (round: string) => {
    switch (round) {
      case 'Round of 32': return 'bg-blue-50 border-blue-200'
      case 'Round of 16': return 'bg-green-50 border-green-200'
      case 'Quarter-finals': return 'bg-yellow-50 border-yellow-200'
      case 'Semi-finals': return 'bg-orange-50 border-orange-200'
      case 'Final': return 'bg-red-50 border-red-200'
      case 'Third Place': return 'bg-purple-50 border-purple-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Desktop bracket view */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 gap-4 min-h-[600px]">
          {roundOrder.slice(0, 5).map((roundName, colIndex) => {
            const roundMatches = rounds[roundName] || []
            const isLastRound = colIndex === 4 // Final
            
            return (
              <div key={roundName} className={`space-y-4 ${isLastRound ? 'col-span-2' : ''}`}>
                <h3 className="text-sm font-semibold text-gray-700 text-center mb-4">
                  {getRoundDisplayName(roundName)}
                </h3>
                
                <div className={`space-y-${isLastRound ? '8' : '6'}`}>
                  {roundMatches.map((match) => (
                    <div 
                      key={match.id}
                      className={`rounded-lg border p-3 ${getRoundColor(roundName)} ${
                        isLastRound ? 'mx-auto max-w-xs' : ''
                      }`}
                    >
                      {/* Home team */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {match.homeTeam ? (
                            <>
                              <div className="relative w-4 h-3 shrink-0">
                                <Image
                                  src={match.homeTeam.logo}
                                  alt={match.homeTeam.name}
                                  fill
                                  className="object-contain"
                                  sizes="16px"
                                />
                              </div>
                              <span className="text-xs font-medium truncate">
                                {match.homeTeam.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">TBD</span>
                          )}
                        </div>
                        <span className="text-xs font-bold tabular-nums ml-2">
                          {match.homeScore ?? '-'}
                        </span>
                      </div>

                      {/* Away team */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {match.awayTeam ? (
                            <>
                              <div className="relative w-4 h-3 shrink-0">
                                <Image
                                  src={match.awayTeam.logo}
                                  alt={match.awayTeam.name}
                                  fill
                                  className="object-contain"
                                  sizes="16px"
                                />
                              </div>
                              <span className="text-xs font-medium truncate">
                                {match.awayTeam.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">TBD</span>
                          )}
                        </div>
                        <span className="text-xs font-bold tabular-nums ml-2">
                          {match.awayScore ?? '-'}
                        </span>
                      </div>

                      {/* Match status */}
                      <div className="mt-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          match.status === 'finished' ? 'bg-green-100 text-green-700' :
                          match.status === 'live' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {match.status === 'finished' ? 'KT' :
                           match.status === 'live' ? 'LIVE' : 'Chưa đấu'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Third place match */}
        {rounds['Third Place'] && rounds['Third Place'].length > 0 && (
          <div className="mt-8 max-w-xs mx-auto">
            <h3 className="text-sm font-semibold text-gray-700 text-center mb-4">
              Tranh hạng 3
            </h3>
            {rounds['Third Place'].map((match) => (
              <div 
                key={match.id}
                className={`rounded-lg border p-3 ${getRoundColor('Third Place')}`}
              >
                {/* Same match structure as above */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.homeTeam ? (
                      <>
                        <div className="relative w-4 h-3 shrink-0">
                          <Image
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        </div>
                        <span className="text-xs font-medium truncate">
                          {match.homeTeam.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">TBD</span>
                    )}
                  </div>
                  <span className="text-xs font-bold tabular-nums ml-2">
                    {match.homeScore ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.awayTeam ? (
                      <>
                        <div className="relative w-4 h-3 shrink-0">
                          <Image
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        </div>
                        <span className="text-xs font-medium truncate">
                          {match.awayTeam.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">TBD</span>
                    )}
                  </div>
                  <span className="text-xs font-bold tabular-nums ml-2">
                    {match.awayScore ?? '-'}
                  </span>
                </div>
                <div className="mt-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    match.status === 'finished' ? 'bg-green-100 text-green-700' :
                    match.status === 'live' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {match.status === 'finished' ? 'KT' :
                     match.status === 'live' ? 'LIVE' : 'Chưa đấu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile list view */}
      <div className="lg:hidden space-y-6">
        {roundOrder.map((roundName) => {
          const roundMatches = rounds[roundName] || []
          
          if (roundMatches.length === 0) return null

          return (
            <div key={roundName} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className={`px-4 py-3 border-b border-gray-200 ${getRoundColor(roundName)}`}>
                <h3 className="text-sm font-semibold text-gray-900">
                  {getRoundDisplayName(roundName)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {roundMatches.length} trận đấu
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {roundMatches.map((match) => (
                  <div key={match.id} className="p-4">
                    {/* Home team */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {match.homeTeam ? (
                          <>
                            <div className="relative w-6 h-4 shrink-0">
                              <Image
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                fill
                                className="object-contain"
                                sizes="24px"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.homeTeam.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic ml-9">Chưa xác định</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-900 tabular-nums ml-3">
                        {match.homeScore ?? '-'}
                      </span>
                    </div>

                    {/* Away team */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {match.awayTeam ? (
                          <>
                            <div className="relative w-6 h-4 shrink-0">
                              <Image
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                fill
                                className="object-contain"
                                sizes="24px"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.awayTeam.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic ml-9">Chưa xác định</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-900 tabular-nums ml-3">
                        {match.awayScore ?? '-'}
                      </span>
                    </div>

                    {/* Match info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Trận {match.id}</span>
                      <span className={`px-2 py-1 rounded font-medium ${
                        match.status === 'finished' ? 'bg-green-100 text-green-700' :
                        match.status === 'live' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {match.status === 'finished' ? 'Kết thúc' :
                         match.status === 'live' ? 'TRỰC TIẾP' : 'Chưa diễn ra'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function WorldCupKnockoutPage() {
  return (
    <div className="space-y-6">
      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Trang chủ', url: BASE_URL },
            { name: 'FIFA World Cup 2026', url: `${BASE_URL}/world-cup-2026` },
            { name: 'Vòng loại trực tiếp', url: `${BASE_URL}/world-cup-2026/knockout` },
          ]))
        }}
      />

      <Breadcrumb 
        items={[
          { name: 'FIFA World Cup 2026', href: '/world-cup-2026' },
          { name: 'Vòng loại trực tiếp' },
        ]}
      />

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-white to-red-600 p-6 text-center shadow-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vòng loại trực tiếp FIFA World Cup 2026
          </h1>
          <p className="text-gray-600 text-sm">
            32 đội xuất sắc nhất từ vòng bảng tranh tài knockout đến chung kết
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
            className="flex-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <Users size={14} className="inline mr-1.5 -mt-0.5" />
            Thống kê
          </Link>
          <Link
            href="/world-cup-2026/knockout"
            className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-green-700 text-green-700"
          >
            <Zap size={14} className="inline mr-1.5 -mt-0.5" />
            Knockout
          </Link>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Bracket vòng loại trực tiếp
            </h2>
            <p className="text-sm text-gray-500">
              32 đội đi tiếp từ vòng bảng (24 đội top 2 + 8 đội thứ 3 xuất sắc nhất) tranh tài knockout
            </p>
          </div>

          <Suspense 
            fallback={
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
                </div>
              </div>
            }
          >
            <KnockoutBracket />
          </Suspense>
        </div>
      </div>

      {/* Tournament progression info */}
      <div className="rounded-xl bg-red-50 border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <Target size={18} />
          Lộ trình vô địch World Cup 2026
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-lg font-bold text-blue-700">32</span>
            </div>
            <div className="text-xs font-medium text-red-800">Vòng 32</div>
            <div className="text-xs text-red-600">16 trận</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-lg font-bold text-green-700">16</span>
            </div>
            <div className="text-xs font-medium text-red-800">Vòng 16</div>
            <div className="text-xs text-red-600">8 trận</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-lg font-bold text-yellow-700">8</span>
            </div>
            <div className="text-xs font-medium text-red-800">Tứ kết</div>
            <div className="text-xs text-red-600">4 trận</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-lg font-bold text-orange-700">4</span>
            </div>
            <div className="text-xs font-medium text-red-800">Bán kết</div>
            <div className="text-xs text-red-600">2 trận</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-lg font-bold text-purple-700">3</span>
            </div>
            <div className="text-xs font-medium text-red-800">Tranh hạng 3</div>
            <div className="text-xs text-red-600">1 trận</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy size={20} className="text-red-700" />
            </div>
            <div className="text-xs font-medium text-red-800">Chung kết</div>
            <div className="text-xs text-red-600">1 trận</div>
          </div>
        </div>
      </div>
    </div>
  )
}