import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Bảo vệ admin routes (trừ trang login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
