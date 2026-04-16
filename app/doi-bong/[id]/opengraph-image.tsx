import { ImageResponse } from 'next/og'
import { getTeamById } from '@/lib/services/team'

export const runtime = 'edge'
export const alt = 'Đội bóng'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const team = await getTeamById(parseInt(id))

  if (!team) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Đội bóng không tồn tại
        </div>
      ),
      { ...size }
    )
  }

  const { team: t, venue } = team

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
          padding: '60px',
          color: 'white',
        }}
      >
        {/* Team logo */}
        <img
          src={t.logo}
          alt={t.name}
          width="200"
          height="200"
          style={{ marginBottom: '40px' }}
        />

        {/* Team name */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.2,
          }}
        >
          {t.name}
        </div>

        {/* Team info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            fontSize: '24px',
            opacity: 0.9,
            marginBottom: '40px',
          }}
        >
          {t.country && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              🌍 {t.country}
            </div>
          )}
          {t.founded && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              📅 Thành lập {t.founded}
            </div>
          )}
          {venue.name && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              🏟️ {venue.name}
            </div>
          )}
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '20px',
            opacity: 0.8,
          }}
        >
          <div>📊 Thống kê</div>
          <div>📅 Lịch thi đấu</div>
          <div>🏆 Thành tích</div>
        </div>

        {/* Site branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '40px',
            fontSize: '24px',
            fontWeight: 'bold',
            opacity: 0.7,
          }}
        >
          BóngĐá Live
        </div>
      </div>
    ),
    { ...size }
  )
}