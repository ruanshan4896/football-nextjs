import Link from 'next/link'
import Image from 'next/image'

// Component hiển thị kèo dạng compact cho sidebar và chi tiết trận đấu
interface OddsCompactRowProps {
  fixtureId: number
  homeTeam: string
  awayTeam: string
  homeLogo: string
  awayLogo: string
  handicap?: { label: string; homeOdd: string; awayOdd: string }
  overUnder?: { label: string; over: string; under: string }
  winner?: { home: string; draw: string; away: string }
}

function OddsCell({ odd, className = '' }: { odd: string; className?: string }) {
  const v = parseFloat(odd)
  let color = 'text-gray-700'
  if (!isNaN(v) && odd !== '-') {
    if (v < 1.5) color = 'text-green-600 font-semibold'
    else if (v < 2.0) color = 'text-green-500'
    else if (v > 3.5) color = 'text-red-500'
  }
  return <span className={`tabular-nums text-xs ${color} ${className}`}>{odd}</span>
}

export default function OddsCompactRow({
  fixtureId,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  handicap,
  overUnder,
  winner,
}: OddsCompactRowProps) {
  return (
    <Link
      href={`/tran-dau/${fixtureId}`}
      className="block px-4 py-3 hover:bg-blue-50 transition-colors"
    >
      {/* Tên đội */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="relative w-3.5 h-3.5 shrink-0">
              <Image src={homeLogo} alt={homeTeam} fill className="object-contain" sizes="14px" />
            </div>
            <p className="text-xs font-semibold text-gray-800 truncate">{homeTeam}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-3.5 h-3.5 shrink-0">
              <Image src={awayLogo} alt={awayTeam} fill className="object-contain" sizes="14px" />
            </div>
            <p className="text-xs text-gray-600 truncate">{awayTeam}</p>
          </div>
        </div>
      </div>

      {/* Kèo */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Kèo châu Á */}
        {handicap && (
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-[9px] text-gray-400 mb-0.5">Chấp</p>
            <p className="text-[10px] text-gray-500 font-medium mb-0.5">{handicap.label}</p>
            <div className="flex flex-col gap-0.5">
              <OddsCell odd={handicap.homeOdd} />
              <OddsCell odd={handicap.awayOdd} />
            </div>
          </div>
        )}

        {/* Kèo tài xỉu */}
        {overUnder && (
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-[9px] text-gray-400 mb-0.5">T/X</p>
            <p className="text-[10px] text-gray-500 font-medium mb-0.5">{overUnder.label}</p>
            <div className="flex flex-col gap-0.5">
              <OddsCell odd={overUnder.over} />
              <OddsCell odd={overUnder.under} />
            </div>
          </div>
        )}

        {/* Kèo 1x2 */}
        {winner && (
          <div className="bg-gray-50 rounded px-2 py-1.5">
            <p className="text-[9px] text-gray-400 mb-0.5">1×2</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <OddsCell odd={winner.home} />
              <OddsCell odd={winner.draw} />
              <OddsCell odd={winner.away} />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
