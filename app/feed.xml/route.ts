import { supabase } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  updated_at: string
  content_type: string
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

function generateAtomFeed(articles: Article[]): string {
  const latestUpdate = articles.length > 0 
    ? new Date(articles[0].updated_at).toISOString()
    : new Date().toISOString()

  const entries = articles.map((article) => {
    const url = article.content_type === 'news'
      ? `${BASE_URL}/tin-tuc/${article.slug}`
      : `${BASE_URL}/nhan-dinh/${article.slug}`
    
    const summary = article.excerpt 
      ? escapeXml(article.excerpt)
      : escapeXml(stripHtml(article.content).substring(0, 200) + '...')

    return `
    <entry>
      <title>${escapeXml(article.title)}</title>
      <link href="${url}" rel="alternate" />
      <id>${url}</id>
      <published>${new Date(article.published_at).toISOString()}</published>
      <updated>${new Date(article.updated_at).toISOString()}</updated>
      <author>
        <name>${escapeXml(article.author)}</name>
      </author>
      <summary type="text">${summary}</summary>
      <content type="html">${escapeXml(article.content)}</content>
      ${article.cover_image ? `<link rel="enclosure" href="${escapeXml(article.cover_image)}" type="image/jpeg" />` : ''}
    </entry>`
  }).join('')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>BongDaWap - Tin tức &amp; Nhận định bóng đá</title>
  <link href="${BASE_URL}/feed.xml" rel="self" />
  <link href="${BASE_URL}" />
  <updated>${latestUpdate}</updated>
  <id>${BASE_URL}/</id>
  <subtitle>Cập nhật tin tức, nhận định bóng đá từ BongDaWap</subtitle>
  ${entries}
</feed>`
}

export async function GET() {
  try {
    // Lấy 50 bài mới nhất (cả tin tức và nhận định)
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, content, excerpt, cover_image, author, published_at, updated_at, content_type')
      .eq('status', 'published')
      .in('content_type', ['news', 'prediction'])
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching articles for feed:', error)
      return new Response('Error generating feed', { status: 500 })
    }

    const feed = generateAtomFeed(articles || [])

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
