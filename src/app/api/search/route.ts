import { NextResponse } from 'next/server'
import { queryCreators } from '@/lib/firestore/queryCreators'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const cursor = searchParams.get('cursor') || undefined

  const filters: any = {
    role: searchParams.get('role') || undefined,
    location: searchParams.get('location') || undefined,
    service: searchParams.get('service') || undefined,
    proTier: searchParams.get('proTier') || undefined,
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
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
