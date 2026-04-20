import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// OG image động cho từng bài viết nhận định
export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  try {
    const { data: article } = await supabase
      .from('articles')
      .select('title, author')
      .eq('slug', slug)
      .single()

    const title = article?.title ?? 'Nhận định bóng đá'
    const author = article?.author ?? 'BóngĐá Live'

    return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #1e3a5f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40 }}>⚽</div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            BóngĐá Live
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 44 : 56,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 24,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Nhận định · {author}
          </div>
        </div>
      </div>
    ),
    size
  )
  } catch {
    return new ImageResponse(
      (
        <div style={{ background: '#15803d', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: 'white' }}>⚽ BóngĐá Live</div>
        </div>
      ),
      size
    )
  }
}
