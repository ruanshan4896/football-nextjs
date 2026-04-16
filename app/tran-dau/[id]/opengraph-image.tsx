import { ImageResponse } from 'next/og'
import { getFixtureDetails } from '@/lib/services/fixtures'

export const runtime = 'edge'
export const alt = 'Trận đấu bóng đá'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const fixture = await getFixtureDetails(parseInt(id))

  if (!fixture) {
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
          Trận đấu không tồn tại
        </div>
      ),
      { ...size }
    )
  }

  const { teams, goals, fixture: f, league } = fixture
  const score = `${goals.home ?? '?'} - ${goals.away ?? '?'}`
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.status.short)

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
          padding: '40px',
          color: 'white',
        }}
      >
        {/* League info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
            fontSize: '24px',
            opacity: 0.9,
          }}
        >
          <img
            src={league.logo}
            alt={league.name}
            width="32"
            height="32"
            style={{ marginRight: '12px' }}
          />
          {league.name}
        </div>

        {/* Teams and score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '800px',
          }}
        >
          {/* Home team */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <img
              src={teams.home.logo}
              alt={teams.home.name}
              width="120"
              height="120"
              style={{ marginBottom: '20px' }}
            />
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {teams.home.name}
            </div>
          </div>

          {/* Score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '0 60px',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: '20px',
                opacity: 0.8,
                backgroundColor: isFinished ? '#dc2626' : '#f59e0b',
                padding: '8px 16px',
                borderRadius: '20px',
              }}
            >
              {isFinished ? 'KẾT THÚC' : f.status.short === 'NS' ? 'CHƯA ĐẤU' : 'ĐANG ĐẤU'}
            </div>
          </div>

          {/* Away team */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <img
              src={teams.away.logo}
              alt={teams.away.name}
              width="120"
              height="120"
              style={{ marginBottom: '20px' }}
            />
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {teams.away.name}
            </div>
          </div>
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