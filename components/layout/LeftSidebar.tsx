import Link from 'next/link'
import { Trophy, Star } from 'lucide-react'

// Danh sách giải đấu phổ biến - sau này sẽ lấy từ Redis/Supabase
const POPULAR_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  { id: 2, name: 'Champions League', country: 'Europe', flag: '🇪🇺' },
  { id: 3, name: 'Europa League', country: 'Europe', flag: '🇪🇺' },
  { id: 197, name: 'V.League 1', country: 'Vietnam', flag: '🇻🇳' },
]

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[20%] min-w-[180px] max-w-[240px] shrink-0">
      <div className="sticky top-[72px] space-y-4">
        {/* Giải đấu yêu thích */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
            <Star size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-white">Giải đấu</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {POPULAR_LEAGUES.map((league) => (
              <li key={league.id}>
                <Link
                  href={`/giai-dau/${league.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <span className="text-base leading-none">{league.flag}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{league.name}</p>
                    <p className="text-xs text-gray-400">{league.country}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Giải đấu quốc tế */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-3">
            <Trophy size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-white">Quốc tế</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            <li>
              <Link
                href="/giai-dau/1"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <span className="text-base">🌍</span>
                <span className="font-medium">World Cup</span>
              </Link>
            </li>
            <li>
              <Link
                href="/giai-dau/4"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                <span className="text-base">🌍</span>
                <span className="font-medium">Euro</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
