import 'server-only'
import { unstable_cache } from 'next/cache'
import { fetchFixturesByDate, fetchFixtureById, fetchFixtureDetails, type Fixture, type FixtureDetail } from '@/lib/api-football'
import { getVNDateString } from '@/lib/date'

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const today = getVNDateString(0)
  const isToday = date === today
  const ttl = isToday ? 300 : 86400

  return unstable_cache(
    () => fetchFixturesByDate(date),
    [`fixtures_${date}`],
    { revalidate: ttl }
  )()
}

export async function getTodayFixtures(): Promise<Fixture[]> {
  const today = getVNDateString(0)
  return getFixturesByDate(today)
}

export async function getFixtureDetail(fixtureId: number): Promise<Fixture | null> {
  return unstable_cache(
    () => fetchFixtureById(fixtureId),
    [`fixture_${fixtureId}`],
    { revalidate: 300 }
  )()
}

export async function getFixtureDetails(fixtureId: number): Promise<FixtureDetail | null> {
  return unstable_cache(
    () => fetchFixtureDetails(fixtureId),
    [`fixture_full_${fixtureId}`],
    { revalidate: 300 }
  )()
}

export async function refreshFixturesByDate(date: string): Promise<Fixture[]> {
  const { revalidateTag } = await import('next/cache')
  const fixtures = await fetchFixturesByDate(date)
  revalidateTag(`fixtures_${date}`, 'max')
  return fixtures
}
