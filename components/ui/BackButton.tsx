'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Quay lại' }: { label?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  )
}
