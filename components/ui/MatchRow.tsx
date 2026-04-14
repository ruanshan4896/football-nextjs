import Link from 'next/link'
import Image from 'next/image'
import MatchStatusBadge from './MatchStatusBadge'
import type { Fixture } from '@/lib/api-football'

interface Props {
  fixture: Fixture
}

// Server Component - 1 hàng trận đấu
export default function MatchRow({ fixture }: Props) {
  const { fixture: f, teams, goals, league } = fixture
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.status.short)
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.status.short)

  return (
    <Link
      href={`/tran-dau/${f.id}`}
      className={`flex items-center gap-2 px-3 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 ${
        isLive ? 'bg-red-50/40' : ''
      }`}
    >
      {/* Trạng thái / Giờ */}
      <MatchStatusBadge
        status={f.status.short}
        elapsed={f.status.elapsed}
        date={f.date}
      />

      {/* Đội bóng + tỷ số */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* Đội nhà */}
        <div className="flex items-center gap-2">
          <div className="relative h-4 w-4 shrink-0">
            <Image
              src={teams.home.logo}
              alt={teams.home.name}
              fill
              className="object-contain"
              sizes="16px"
            />
          </div>
          <span className={`text-sm truncate ${
            isFinished && teams.home.winner ? 'font-semibold text-gray-900' : 'text-gray-700'
          }`}>
            {teams.home.name}
          </span>
          {/* Tỷ số đội nhà - mobile: hiện bên phải tên */}
          <span className={`ml-auto text-sm font-bold tabular-nums ${
            isLive ? 'text-red-600' : isFinished ? 'text-gray-900' : 'text-gray-300'
          }`}>
            {goals.home ?? '-'}
          </span>
        </div>

        {/* Đội khách */}
        <div className="flex items-center gap-2">
          <div className="relative h-4 w-4 shrink-0">
            <Image
              src={teams.away.logo}
              alt={teams.away.name}
              fill
              className="object-contain"
              sizes="16px"
            />
          </div>
          <span className={`text-sm truncate ${
            isFinished && teams.away.winner ? 'font-semibold text-gray-900' : 'text-gray-700'
          }`}>
            {teams.away.name}
          </span>
          <span className={`ml-auto text-sm font-bold tabular-nums ${
            isLive ? 'text-red-600' : isFinished ? 'text-gray-900' : 'text-gray-300'
          }`}>
            {goals.away ?? '-'}
          </span>
        </div>
      </div>
    </Link>
  )
}
