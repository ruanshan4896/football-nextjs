import Link from 'next/link'
import Image from 'next/image'

const HOT_LEAGUES = [
  { id: 39,  name: 'Premier League',   href: '/giai-dau/39' },
  { id: 140, name: 'La Liga',          href: '/giai-dau/140' },
  { id: 135, name: 'Serie A',          href: '/giai-dau/135' },
  { id: 78,  name: 'Bundesliga',       href: '/giai-dau/78' },
  { id: 61,  name: 'Ligue 1',          href: '/giai-dau/61' },
  { id: 2,   name: 'Champions League', href: '/giai-dau/2' },
  { id: 3,   name: 'Europa League',    href: '/giai-dau/3' },
  { id: 1,   name: 'World Cup 2026',   href: '/world-cup-2026' },
  { id: 340, name: 'V.League 1',       href: '/giai-dau/340' },
]

const NAV_LINKS = [
  { label: 'Trang chủ',     href: '/' },
  { label: 'Livescore',     href: '/livescore' },
  { label: 'Lịch thi đấu', href: '/lich-thi-dau' },
  { label: 'Bảng xếp hạng',href: '/bang-xep-hang' },
  { label: 'Nhận định',    href: '/nhan-dinh' },
  { label: 'Tin tức',      href: '/tin-tuc' },
  { label: 'Tỷ lệ kèo',   href: '/ty-le-keo' },
  { label: 'Tìm kiếm',    href: '/tim-kiem' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-8">
      {/* Main footer content */}
      <div className="mx-auto max-w-screen-xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 – Brand & description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/bongdawap-logo-techshift.png"
                alt="BongDaWap"
                width={200}
                height={52}
                className="h-13 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Trang xem bóng đá trực tiếp, livescore, kết quả, bảng xếp hạng,
              tỷ lệ kèo và nhận định chuyên sâu 24/7.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Facebook"
                className="rounded-full bg-gray-700 p-2 hover:bg-green-700 transition-colors"
              >
                {/* Facebook */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="YouTube"
                className="rounded-full bg-gray-700 p-2 hover:bg-green-700 transition-colors"
              >
                {/* YouTube */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                  <polygon fill="#111827" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Twitter / X"
                className="rounded-full bg-gray-700 p-2 hover:bg-green-700 transition-colors"
              >
                {/* X (Twitter) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 – Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Điều hướng
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Hot leagues */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Giải đấu nổi bật
            </h3>
            <ul className="space-y-2">
              {HOT_LEAGUES.map((league) => (
                <li key={league.id}>
                  <Link
                    href={league.href}
                    className="text-sm hover:text-green-400 transition-colors"
                  >
                    {league.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – About & legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Thông tin
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dieu-khoan" className="text-sm hover:text-green-400 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-rieng-tu" className="text-sm hover:text-green-400 transition-colors">
                  Chính sách riêng tư
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-lg bg-gray-800 p-4 text-xs leading-relaxed">
              <p className="font-medium text-white mb-1">Tuyên bố miễn trừ</p>
              <p>
                BongDaWap chỉ cung cấp thông tin thể thao. Chúng tôi không tổ
                chức cá cược hay các hoạt động vi phạm pháp luật.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-screen-xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} BongDaWap. All rights reserved.</p>
          <p>Dữ liệu bóng đá được cung cấp bởi <span className="text-gray-400">API-Football</span>.</p>
        </div>
      </div>
    </footer>
  )
}
