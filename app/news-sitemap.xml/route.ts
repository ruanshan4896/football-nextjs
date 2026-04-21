import { supabaseAdmin } from '@/lib/supabase-server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn'

export async function GET() {
  // Lấy bài viết trong 48 giờ gần nhất (yêu cầu của Google News)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('title, slug, published_at, content_type')
    .eq('status', 'published')
    .in('content_type', ['article', 'news'])
    .gte('published_at', cutoff)
    .order('published_at', { ascending: false })
    .limit(1000)

  const items = (articles ?? []).map((a) => {
    const url = a.content_type === 'news'
      ? `${BASE_URL}/tin-tuc/${a.slug}`
      : `${BASE_URL}/nhan-dinh/${a.slug}`

    return `
    <url>
      <loc>${url}</loc>
      <news:news>
        <news:publication>
          <news:name>BongDaWap</news:name>
          <news:language>vi</news:language>
        </news:publication>
        <news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date>
        <news:title>${escapeXml(a.title)}</news:title>
      </news:news>
    </url>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${items}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // cache 1 giờ
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
