import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redis, CACHE_KEYS } from '@/lib/redis'
import { getVNDateString } from '@/lib/date'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * DELETE /api/admin/cache?key=live|fixtures_today|fixtures_YYYY-MM-DD|all
 * Xóa cache Redis thủ công — dùng khi data bị stale
 */
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const key = request.nextUrl.searchParams.get('key') ?? 'all'
  const deleted: string[] = []

  if (key === 'live' || key === 'all') {
    await redis.del(CACHE_KEYS.LIVE_MATCHES)
    deleted.push(CACHE_KEYS.LIVE_MATCHES)
  }

  if (key === 'fixtures_today' || key === 'all') {
    const today = getVNDateString(0)
    const cacheKey = CACHE_KEYS.FIXTURES(today)
    await redis.del(cacheKey)
    deleted.push(cacheKey)
  }

  // Xóa cache ngày cụ thể: key=fixtures_2025-04-15
  if (key.startsWith('fixtures_') && key !== 'fixtures_today') {
    await redis.del(key)
    deleted.push(key)
  }

  return Response.json({ success: true, deleted })
}
