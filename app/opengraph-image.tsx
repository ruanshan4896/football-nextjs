import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// OG image mặc định cho trang chủ
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>⚽</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: 'white', letterSpacing: -2 }}>
          BóngĐá Live
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.75)', marginTop: 16 }}>
          Livescore · Kết quả · BXH · Nhận định
        </div>
      </div>
    ),
    size
  )
}
