import { NextRequest, NextResponse } from 'next/server'

// Cấu hình chuyển hướng domain
const DOMAIN_REDIRECTS = {
  // Thay đổi các domain này theo nhu cầu
  'old-domain.com': 'https://bongdalive.com',
  'www.old-domain.com': 'https://bongdalive.com',
  // Thêm các domain cũ khác nếu cần
  // 'another-old-domain.com': 'https://bongdalive.com',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  
  if (!hostname) {
    return NextResponse.next()
  }

  // Kiểm tra nếu hostname hiện tại cần chuyển hướng
  const redirectTo = DOMAIN_REDIRECTS[hostname]
  
  if (redirectTo) {
    // Giữ nguyên path và query parameters
    const url = new URL(request.url)
    const newUrl = `${redirectTo}${url.pathname}${url.search}`
    
    // Chuyển hướng 301 (permanent redirect) - tốt cho SEO
    return NextResponse.redirect(newUrl, 301)
  }

  // Chuyển hướng www sang non-www (tùy chọn)
  if (hostname.startsWith('www.') && !DOMAIN_REDIRECTS[hostname]) {
    const nonWwwDomain = hostname.slice(4) // Bỏ "www."
    const url = new URL(request.url)
    const newUrl = `${url.protocol}//${nonWwwDomain}${url.pathname}${url.search}`
    
    return NextResponse.redirect(newUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  // Áp dụng middleware cho tất cả các routes
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