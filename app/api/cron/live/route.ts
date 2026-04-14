import { NextRequest } from 'next/server'
import { refreshLiveMatches } from '@/lib/services/live'

// Cronjob chạy mỗi 1 phút để cập nhật livescore
// Bảo vệ bằng CRON_SECRET để tránh gọi trái phép
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const fixtures = await refreshLiveMatches()
    return Response.json({
      success: true,
      count: fixtures.length,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON/live] Error:', error)
    return Response.json({ error: 'Failed to refresh live matches' }, { status: 500 })
  }
}
