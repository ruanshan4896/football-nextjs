import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
 * DELETE /api/admin/cache?key=live|fixtures_today|all
 */
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const key = request.nextUrl.searchParams.get('key') ?? 'all'
  const invalidated: string[] = []

  if (key === 'live' || key === 'all') {
    revalidateTag('live_matches')
    invalidated.push('live_matches')
  }

  if (key === 'fixtures_today' || key === 'all') {
    const today = getVNDateString(0)
    revalidateTag(`fixtures_${today}`)
    invalidated.push(`fixtures_${today}`)
  }

  if (key.startsWith('fixtures_') && key !== 'fixtures_today') {
    revalidateTag(key)
    invalidated.push(key)
  }

  return Response.json({ success: true, invalidated })
}
