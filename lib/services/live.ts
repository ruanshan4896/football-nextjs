import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchLiveFixtures, type Fixture } from '@/lib/api-football'

export const getLiveMatches = unstable_cache(
  async (): Promise<Fixture[]> => {
    return fetchLiveFixtures()
  },
  ['live_matches'],
  { revalidate: 60 } // 1 phút
)

// Force refresh dùng cho cronjob - gọi API trực tiếp rồi revalidate tag
export async function refreshLiveMatches(): Promise<Fixture[]> {
  const { revalidateTag } = await import('next/cache')
  const fixtures = await fetchLiveFixtures()
  revalidateTag('live_matches', 'max')
  return fixtures
}
