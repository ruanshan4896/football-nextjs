'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BarChart2, FileText, Search, Activity } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/livescore', label: 'Live', icon: Activity },
  { href: '/lich-thi-dau', label: 'Lịch', icon: Calendar },
  { href: '/bang-xep-hang', label: 'BXH', icon: BarChart2 },
  { href: '/tim-kiem', label: 'Tìm kiếm', icon: Search },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    // Chỉ hiển thị trên mobile (md trở xuống ẩn)
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-green-700 dark:text-green-400' : ''}
                />
                <span>{label}</span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-green-700 dark:bg-green-400" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
