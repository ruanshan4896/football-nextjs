import Link from 'next/link'
import { Search, Bell } from 'lucide-react'

// Server Component - không cần 'use client'
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-green-700 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-yellow-400">⚽</span>
          <span className="hidden sm:inline">BóngĐá Live</span>
          <span className="sm:hidden">BĐ Live</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300 transition-colors">
            Livescore
          </Link>
          <Link href="/lich-thi-dau" className="hover:text-yellow-300 transition-colors">
            Lịch thi đấu
          </Link>
          <Link href="/bang-xep-hang" className="hover:text-yellow-300 transition-colors">
            Bảng xếp hạng
          </Link>
          <Link href="/nhan-dinh" className="hover:text-yellow-300 transition-colors">
            Nhận định
          </Link>
          <Link href="/ty-le-keo" className="hover:text-yellow-300 transition-colors">
            Tỷ lệ kèo
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Tìm kiếm"
            className="rounded-full p-2 hover:bg-green-600 transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            aria-label="Thông báo"
            className="rounded-full p-2 hover:bg-green-600 transition-colors"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
