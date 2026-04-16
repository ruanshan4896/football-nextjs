import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

// Cấu hình chuyển hướng domain
const DOMAIN_REDIRECTS = {
  // Chuyển hướng từ Netlify domain cũ sang domain mới
  'football-nextjs.netlify.app': 'https://www.techshift.vn',
  // Chuyển hướng non-www sang www
  'techshift.vn': 'https://www.techshift.vn',
  // Backup cho các domain cũ khác nếu có
  'bongdalive.com': 'https://www.techshift.vn',
  'www.bongdalive.com': 'https://www.techshift.vn',
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')
  
  // Kiểm tra chuyển hướng domain trước
  if (hostname) {
    const redirectTo = DOMAIN_REDIRECTS[hostname]
    
    if (redirectTo) {
      // Giữ nguyên path và query parameters
      const url = new URL(request.url)
      const newUrl = `${redirectTo}${url.pathname}${url.search}`
      
      // Chuyển hướng 301 (permanent redirect) - tốt cho SEO
      return NextResponse.redirect(newUrl, 301)
    }
  }

  // Xử lý authentication cho admin routes
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/admin')) {
    return await updateSession(request)
  }

  // Cho phép các routes khác đi qua
  return NextResponse.next()
}

export const config = {
  // Áp dụng cho tất cả routes trừ static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
