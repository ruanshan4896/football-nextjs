import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchFixturesByDate, fetchFixtureById, fetchFixtureDetails, type Fixture, type FixtureDetail } from '@/lib/api-football'
import { getVNDateString } from '@/lib/date'

/**
 * Lấy lịch thi đấu theo ngày.
 * - Ngày hôm nay: cache 5 phút (trận có thể đang diễn ra, status thay đổi liên tục)
 * - Ngày khác: cache 1 ngày (data ổn định)
 */
export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const cacheKey = CACHE_KEYS.FIXTURES(date)
  const today = getVNDateString(0)
  const isToday = date === today

  const cached = await redis.get<Fixture[]>(cacheKey)
  if (cached) return cached

  const fixtures = await fetchFixturesByDate(date)

  // Ngày hôm nay cache ngắn hơn vì status trận thay đổi liên tục
  const ttl = isToday ? CACHE_TTL.FIXTURES_TODAY : CACHE_TTL.FIXTURES
  await redis.set(cacheKey, fixtures, { ex: ttl })

  return fixtures
}

/**
 * Lấy lịch thi đấu hôm nay (timezone Asia/Ho_Chi_Minh)
 */
export async function getTodayFixtures(): Promise<Fixture[]> {
  const today = getVNDateString(0)
  return getFixturesByDate(today)
}

/**
 * Lấy chi tiết 1 trận đấu.
 * Cache 5 phút - trận đang diễn ra sẽ được refresh thường xuyên hơn qua cronjob live
 */
export async function getFixtureDetail(fixtureId: number): Promise<Fixture | null> {
  const cacheKey = CACHE_KEYS.FIXTURE_DETAIL(fixtureId)

  const cached = await redis.get<Fixture>(cacheKey)
  if (cached) return cached

  const fixture = await fetchFixtureById(fixtureId)
  if (fixture) {
    await redis.set(cacheKey, fixture, { ex: CACHE_TTL.FIXTURE_DETAIL })
  }

  return fixture
}

/**
 * Force refresh lịch thi đấu theo ngày (dùng cho cronjob)
 */
export async function refreshFixturesByDate(date: string): Promise<Fixture[]> {
  const today = getVNDateString(0)
  const isToday = date === today
  const fixtures = await fetchFixturesByDate(date)
  const ttl = isToday ? CACHE_TTL.FIXTURES_TODAY : CACHE_TTL.FIXTURES
  await redis.set(CACHE_KEYS.FIXTURES(date), fixtures, { ex: ttl })
  return fixtures
}

/**
 * Lấy chi tiết đầy đủ trận đấu (có events, lineups, statistics)
 * Cache 5 phút
 */
export async function getFixtureDetails(fixtureId: number): Promise<FixtureDetail | null> {
  const cacheKey = CACHE_KEYS.FIXTURE_DETAIL_FULL(fixtureId)
  const cached = await redis.get<FixtureDetail>(cacheKey)
  if (cached) return cached

  const fixture = await fetchFixtureDetails(fixtureId)
  if (fixture) await redis.set(cacheKey, fixture, { ex: CACHE_TTL.FIXTURE_DETAIL_FULL })
  return fixture
}
