import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-8">
      <div className="mx-auto max-w-screen-xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">

          {/* Col 1 – Brand, mô tả & mạng xã hội (chiếm 2/5) */}
          <div className="space-y-4 lg:col-span-2">
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
              <a href="https://www.techshift.vn/">Bongdawap</a> là trang thông tin bóng đá trực tiếp dành cho người hâm mộ Việt Nam.
              Cập nhật livescore, kết quả, bảng xếp hạng, tỷ lệ kèo và nhận định chuyên sâu 24/7
              từ các giải đấu hàng đầu thế giới.
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 – Chuyên mục */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Chuyên mục
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/livescore" className="hover:text-green-400 transition-colors">Livescore</Link></li>
              <li><Link href="/lich-thi-dau" className="hover:text-green-400 transition-colors">Lịch thi đấu</Link></li>
              <li><Link href="/bang-xep-hang" className="hover:text-green-400 transition-colors">Bảng xếp hạng</Link></li>
              <li><Link href="/nhan-dinh" className="hover:text-green-400 transition-colors">Nhận định</Link></li>
              <li><Link href="/tin-tuc" className="hover:text-green-400 transition-colors">Tin tức</Link></li>
              <li><Link href="/ty-le-keo" className="hover:text-green-400 transition-colors">Tỷ lệ kèo</Link></li>
              <li><Link href="/world-cup-2026" className="hover:text-green-400 transition-colors">World Cup 2026</Link></li>
            </ul>
          </div>

          {/* Col 3 – Giải đấu hot */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Giải đấu
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/giai-dau/39" className="hover:text-green-400 transition-colors">Premier League</Link></li>
              <li><Link href="/giai-dau/140" className="hover:text-green-400 transition-colors">La Liga</Link></li>
              <li><Link href="/giai-dau/135" className="hover:text-green-400 transition-colors">Serie A</Link></li>
              <li><Link href="/giai-dau/78" className="hover:text-green-400 transition-colors">Bundesliga</Link></li>
              <li><Link href="/giai-dau/61" className="hover:text-green-400 transition-colors">Ligue 1</Link></li>
              <li><Link href="/giai-dau/2" className="hover:text-green-400 transition-colors">Champions League</Link></li>
              <li><Link href="/giai-dau/340" className="hover:text-green-400 transition-colors">V.League 1</Link></li>
            </ul>
          </div>

          {/* Col 4 – Liên hệ & Pháp lý */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Liên hệ
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✉</span>
                  <a href="mailto:contact@techshift.vn" className="hover:text-green-400 transition-colors">
                    contact@techshift.vn
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">💬</span>
                  <span>Hợp tác quảng cáo, bài viết tài trợ liên hệ qua email.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Pháp lý
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dieu-khoan" className="hover:text-green-400 transition-colors" rel="nofollow">
                    Điều khoản dịch vụ
                  </Link>
                </li>
                <li>
                  <Link href="/chinh-sach-rieng-tu" className="hover:text-green-400 transition-colors" rel="nofollow">
                    Chính sách riêng tư
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Tuyên bố miễn trừ trách nhiệm – full width */}
        <div className="mt-8 rounded-lg bg-gray-800 p-4 text-xs leading-relaxed space-y-2">
          <p className="font-semibold text-white text-sm">⚠ Tuyên bố miễn trừ trách nhiệm</p>
          <p>
            Bongdawap chỉ cung cấp thông tin thể thao mang tính tham khảo.
            Chúng tôi không tổ chức, khuyến khích hay tham gia vào bất kỳ
            hoạt động cá cược nào.
          </p>
          <p>
            Nội dung trên trang không dành cho người dưới 18 tuổi.
            Hãy chơi thể thao có trách nhiệm.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-screen-xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} https://www.techshift.vn/. All rights reserved.</p>
          <p>Dữ liệu bóng đá được cung cấp bởi <span className="text-gray-400">API-Football</span>.</p>
        </div>
      </div>

      {/* Hệ thống site */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <li>
              <a
                href="https://gk88.vegas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#101828] hover:text-[#101828] transition-colors"
              >
                gk88
              </a>
            </li>
            <li>
              <a
                href="https://18win.wtf/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#101828] hover:text-[#101828] transition-colors"
              >
                18win
              </a>
            </li>
            <li>
              <a
                href="https://uk88online.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#101828] hover:text-[#101828] transition-colors"
              >
                uk88
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
