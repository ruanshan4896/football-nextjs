import { NextRequest } from 'next/server'
import { refreshAllStandings } from '@/lib/services/standings'

// Cronjob chạy mỗi giờ để cập nhật bảng xếp hạng tất cả giải đấu
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await refreshAllStandings()
    return Response.json({
      success: true,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON/standings] Error:', error)
    return Response.json({ error: 'Failed to refresh standings' }, { status: 500 })
  }
}
