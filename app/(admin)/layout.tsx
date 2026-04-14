import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'Admin CMS', template: '%s | Admin' },
  robots: { index: false, follow: false }, // Không index trang admin
}

// Layout riêng cho Admin - KHÔNG dùng Header/BottomNav public
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
