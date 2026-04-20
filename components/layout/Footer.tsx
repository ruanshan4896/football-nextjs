import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-8">
      <div className="mx-auto max-w-screen-xl px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-white">BongDaWap</p>
            <p className="text-xs text-gray-400 mt-0.5">Xem bóng đá trực tiếp, livescore 24/7</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <Link href="/livescore" className="hover:text-white transition-colors">Livescore</Link>
            <Link href="/nhan-dinh" className="hover:text-white transition-colors">Nhận định</Link>
            <Link href="/tin-tuc" className="hover:text-white transition-colors">Tin tức</Link>
            <Link href="/ty-le-keo" className="hover:text-white transition-colors">Tỷ lệ kèo</Link>
          </nav>

          {/* Legal */}
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">
              Điều khoản dịch vụ
            </Link>
            <span className="text-gray-600">·</span>
            <Link href="/chinh-sach-rieng-tu" className="hover:text-white transition-colors">
              Chính sách riêng tư
            </Link>
          </nav>
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BongDaWap. Dữ liệu bóng đá được cung cấp bởi API-Football.
        </div>
      </div>
    </footer>
  )
}
