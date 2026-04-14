import type { Metadata } from 'next'
import { TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tỷ lệ kèo bóng đá',
  description: 'Tỷ lệ kèo bóng đá cập nhật liên tục từ các nhà cái uy tín.',
}

export default function TyLeKeoPage() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
        <TrendingUp size={16} className="text-white" />
        <h1 className="text-sm font-semibold text-white">Tỷ lệ kèo</h1>
      </div>
      <div className="px-4 py-12 text-center text-gray-400">
        Tính năng đang được phát triển (Phase 3)
      </div>
    </div>
  )
}
