import { NextRequest, NextResponse } from 'next/server';
import { algoliaIndex } from '@/lib/search/algolia';
import { queryCreators } from '@/lib/firestore/queryCreators';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const filters: any = {
    role: searchParams.get('role') || '',
    location: searchParams.get('location') || '',
    service: searchParams.get('service') || '',
    proTier: searchParams.get('proTier') || '',
  };
  if (searchParams.get('searchNearMe') === 'true') {
    filters.searchNearMe = true;
    if (searchParams.get('lat')) filters.lat = parseFloat(searchParams.get('lat')!);
    if (searchParams.get('lng')) filters.lng = parseFloat(searchParams.get('lng')!);
  }

  try {
    if (q) {
      const algoliaRes = await algoliaIndex.search(q);
      if (algoliaRes.hits.length > 0) {
        return NextResponse.json(algoliaRes.hits);
      }
    }
  } catch (err) {
    console.error('Algolia search failed:', (err as Error).message);
  }

  if (q && !filters.service && !filters.role) {
    const lower = q.toLowerCase();
    if (lower.includes('engineer')) filters.role = 'engineer';
    if (lower.includes('artist')) filters.role = 'artist';
    if (lower.includes('producer')) filters.role = 'producer';
    if (lower.includes('studio')) filters.role = 'studio';
    if (lower.includes('videographer')) filters.role = 'videographer';
    if (lower.includes('mix')) filters.service = 'mixing';
    if (lower.includes('master')) filters.service = 'mastering';
  }

  const results = await queryCreators(filters);
  return NextResponse.json(results);
}
