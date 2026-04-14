import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchLiveFixtures, type Fixture } from '@/lib/api-football'

/**
 * Lấy danh sách trận đang diễn ra.
 * Flow: Redis cache (60s) -> API-Football -> lưu Redis -> trả về
 */
export async function getLiveMatches(): Promise<Fixture[]> {
  const cacheKey = CACHE_KEYS.LIVE_MATCHES

  // 1. Thử lấy từ Redis trước
  const cached = await redis.get<Fixture[]>(cacheKey)
  if (cached) return cached

  // 2. Cache miss -> gọi API-Football
  const fixtures = await fetchLiveFixtures()

  // 3. Lưu vào Redis với TTL 60 giây
  await redis.set(cacheKey, fixtures, { ex: CACHE_TTL.LIVE })

  return fixtures
}

/**
 * Force refresh live matches (dùng cho cronjob)
 */
export async function refreshLiveMatches(): Promise<Fixture[]> {
  const fixtures = await fetchLiveFixtures()
  await redis.set(CACHE_KEYS.LIVE_MATCHES, fixtures, { ex: CACHE_TTL.LIVE })
  return fixtures
}
