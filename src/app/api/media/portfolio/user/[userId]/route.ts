import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'portfolio';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get(SCHEMA_FIELDS.NOTIFICATION.TYPE); // 'image', 'video', 'audio'

    // Build query
    let query = adminDb.collection('media')
      .where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId)
      .where('folder', '==', folder)
      .orderBy('uploadedAt', 'desc');

    if (type) {
      query = query.where(SCHEMA_FIELDS.NOTIFICATION.TYPE, '==', type);
    }

    // Apply pagination
    const snapshot = await query.limit(limit).offset(offset).get();
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get total count
    const totalSnapshot = await adminDb.collection('media')
      .where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId)
      .where('folder', '==', folder)
      .get();
    
    const totalCount = totalSnapshot.size;

    return NextResponse.json({
      items,
      totalCount,
      hasMore: offset + limit < totalCount
    });

  } catch (error) {
    console.error('Failed to get portfolio items:', error);
    return NextResponse.json({ 
      error: 'Failed to get portfolio items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mediaIds, action } = body;

    if (action === 'reorder') {
      // Update display order for multiple items
      const batch = adminDb.batch();
      
      mediaIds.forEach((mediaId: string, index: number) => {
        const mediaRef = adminDb.collection('media').doc(mediaId);
        batch.update(mediaRef, { displayOrder: index });
      });

      await batch.commit();
      
      return NextResponse.json({ success: true });
    }

    if (action === 'bulk_update') {
      const { updates } = body;
      const batch = adminDb.batch();

      Object.entries(updates).forEach(([mediaId, update]) => {
        const mediaRef = adminDb.collection('media').doc(mediaId);
        batch.update(mediaRef, update);
      });

      await batch.commit();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Portfolio batch operation failed:', error);
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}