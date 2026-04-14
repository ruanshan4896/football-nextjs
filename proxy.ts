import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Match /admin và tất cả sub-routes, nhưng KHÔNG match /admin/login
  // để tránh redirect loop
  matcher: ['/admin', '/admin/bai-viet', '/admin/bai-viet/:path*'],
}
