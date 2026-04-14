import { Redis } from '@upstash/redis'

// Upstash Redis client - dùng REST API, không cần persistent connection
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache keys constants
export const CACHE_KEYS = {
  LIVE_MATCHES: 'live_matches',
  STANDINGS: (leagueId: number, season: number) =>
    `standings_${leagueId}_${season}`,
  FIXTURES: (date: string) => `fixtures_${date}`,
  FIXTURE_DETAIL: (fixtureId: number) => `fixture_${fixtureId}`,
} as const

// TTL constants (giây)
export const CACHE_TTL = {
  LIVE: 60,          // 1 phút - livescore
  STANDINGS: 3600,   // 1 giờ - bảng xếp hạng
  FIXTURES: 86400,   // 1 ngày - lịch thi đấu
  FIXTURE_DETAIL: 300, // 5 phút - chi tiết trận
} as const
