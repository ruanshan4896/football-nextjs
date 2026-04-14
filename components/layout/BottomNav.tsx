'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BarChart2, FileText, TrendingUp } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Live', icon: Home },
  { href: '/lich-thi-dau', label: 'Lịch', icon: Calendar },
  { href: '/bang-xep-hang', label: 'BXH', icon: BarChart2 },
  { href: '/nhan-dinh', label: 'Nhận định', icon: FileText },
  { href: '/ty-le-keo', label: 'Kèo', icon: TrendingUp },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    // Chỉ hiển thị trên mobile (md trở xuống ẩn)
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-green-700'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-green-700' : ''}
                />
                <span>{label}</span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-green-700" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
