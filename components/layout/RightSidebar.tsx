import Link from 'next/link'
import { Newspaper, TrendingUp } from 'lucide-react'

// Placeholder - sau này lấy từ Supabase
const HOT_NEWS = [
  {
    id: 1,
    title: 'Haaland lập hat-trick, Man City thắng đậm',
    slug: 'haaland-hat-trick-man-city',
    time: '2 giờ trước',
  },
  {
    id: 2,
    title: 'Real Madrid chia điểm trên sân nhà',
    slug: 'real-madrid-chia-diem',
    time: '4 giờ trước',
  },
  {
    id: 3,
    title: 'Mbappe chấn thương, PSG lo lắng',
    slug: 'mbappe-chan-thuong-psg',
    time: '5 giờ trước',
  },
  {
    id: 4,
    title: 'V.League: HAGL thắng kịch tính phút bù giờ',
    slug: 'vleague-hagl-thang-kich-tinh',
    time: '6 giờ trước',
  },
]

export default function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-[25%] min-w-[200px] max-w-[280px] shrink-0">
      <div className="sticky top-[72px] space-y-4">
        {/* Tin tức HOT */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-red-600 px-4 py-3">
            <Newspaper size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Tin HOT</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {HOT_NEWS.map((news) => (
              <li key={news.id}>
                <Link
                  href={`/nhan-dinh/${news.slug}`}
                  className="block px-4 py-3 hover:bg-red-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                    {news.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{news.time}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100">
            <Link
              href="/nhan-dinh"
              className="text-xs font-medium text-green-700 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>

        {/* Tỷ lệ kèo nổi bật */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
            <TrendingUp size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Kèo nổi bật</h2>
          </div>
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Đang cập nhật...
          </div>
        </div>
      </div>
    </aside>
  )
}
