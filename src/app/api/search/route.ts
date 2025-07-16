import { NextResponse } from 'next/server'
import { queryCreators } from '@/lib/firestore/queryCreators'

const windowMs = 60_000
const maxRequests = 30
const buckets: Map<string, { count: number; ts: number }> =
  (globalThis as any).__searchLimiter ||
  ((globalThis as any).__searchLimiter = new Map())

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = buckets.get(ip) || { count: 0, ts: now }
  if (now - entry.ts > windowMs) {
    entry.count = 0
    entry.ts = now
  }
  entry.count++
  buckets.set(ip, entry)
  return entry.count > maxRequests
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const cursor = searchParams.get('cursor') || undefined

  const filters: any = {
    role: searchParams.get(SCHEMA_FIELDS.USER.ROLE) || undefined,
    location: searchParams.get('location') || undefined,
    service: searchParams.get('service') || undefined,
    genres: searchParams.get('genres')
      ? searchParams.get('genres')!.split(',').filter(Boolean)
      : undefined,
    minBpm: searchParams.get('minBpm')
      ? parseInt(searchParams.get('minBpm')!, 10)
      : undefined,
    maxBpm: searchParams.get('maxBpm')
      ? parseInt(searchParams.get('maxBpm')!, 10)
      : undefined,
    proTier: searchParams.get('proTier') || undefined,
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    availableNow: searchParams.get('availableNow') === '1',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radiusKm: searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : undefined,
    sort: searchParams.get('sort') as 'rating' | 'distance' | 'popularity' | null,
  }

  const { results, nextCursor } = await queryCreators({
    ...filters,
    limit,
    cursor,
  })

  return NextResponse.json({ results, nextCursor })
}
