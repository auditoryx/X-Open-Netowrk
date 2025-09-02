import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/firebase-admin';
import { getStorage, ref, deleteObject } from 'firebase/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;

    const mediaDoc = await adminDb.collection('media').doc(mediaId).get();
    
    if (!mediaDoc.exists) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const mediaData = mediaDoc.data();
    
    return NextResponse.json({
      id: mediaDoc.id,
      ...mediaData
    });

  } catch (error) {
    console.error('Failed to get media item:', error);
    return NextResponse.json({ 
      error: 'Failed to get media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { mediaId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mediaDoc = await adminDb.collection('media').doc(mediaId).get();
    
    if (!mediaDoc.exists) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const mediaData = mediaDoc.data();
    
    // Check if user owns this media
    if (mediaData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    
    // Validate updates
    const allowedUpdates = [SCHEMA_FIELDS.SERVICE.DESCRIPTION, 'tags', 'featured', 'displayOrder'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // If setting as featured, remove featured status from other items
    if (updates.featured === true) {
      const batch = adminDb.batch();
      
      // Remove featured status from other items
      const featuredSnapshot = await adminDb.collection('media')
        .where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', session.user.id)
        .where('featured', '==', true)
        .get();

      featuredSnapshot.docs.forEach(doc => {
        if (doc.id !== mediaId) {
          batch.update(doc.ref, { featured: false });
        }
      });

      await batch.commit();
    }

    // Update the media item
    await adminDb.collection('media').doc(mediaId).update({
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to update media item:', error);
    return NextResponse.json({ 
      error: 'Failed to update media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { mediaId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mediaDoc = await adminDb.collection('media').doc(mediaId).get();
    
    if (!mediaDoc.exists) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const mediaData = mediaDoc.data();
    
    // Check if user owns this media
    if (mediaData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Delete from Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, mediaData.storagePath);
      await deleteObject(storageRef);
    } catch (storageError) {
      console.error('Failed to delete from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from Firestore
    await adminDb.collection('media').doc(mediaId).delete();

    // Update user's media count
    await adminDb.doc(`users/${session.user.id}`).update({
      [`mediaCount.${mediaData.folder}`]: adminDb.FieldValue.increment(-1),
      [`mediaCount.total`]: adminDb.FieldValue.increment(-1)
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete media item:', error);
    return NextResponse.json({ 
      error: 'Failed to delete media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}