import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Đăng nhập Admin' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-4xl">⚽</span>
          <h1 className="mt-2 text-xl font-bold text-gray-900">BóngĐá Live</h1>
          <p className="text-sm text-gray-500">Admin CMS</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Đăng nhập</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
