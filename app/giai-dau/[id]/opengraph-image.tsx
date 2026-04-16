import { ImageResponse } from 'next/og'
import { getLeagueById } from '@/lib/services/league'
import { CURRENT_SEASON } from '@/lib/services/standings'

export const runtime = 'edge'
export const alt = 'Giải đấu bóng đá'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const league = await getLeagueById(parseInt(id))

  if (!league) {
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
          Giải đấu không tồn tại
        </div>
      ),
      { ...size }
    )
  }

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
        {/* League logo */}
        <img
          src={league.league.logo}
          alt={league.league.name}
          width="200"
          height="200"
          style={{ marginBottom: '40px' }}
        />

        {/* League name */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.2,
          }}
        >
          {league.league.name}
        </div>

        {/* Country and season */}
        <div
          style={{
            fontSize: '32px',
            opacity: 0.9,
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          {league.country.name} • Mùa {CURRENT_SEASON}
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '24px',
            opacity: 0.8,
          }}
        >
          <div>📊 Bảng xếp hạng</div>
          <div>📅 Lịch thi đấu</div>
          <div>📝 Nhận định</div>
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