import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { adminDb } from '@/lib/firebase-admin';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'portfolio';
    const userId = formData.get(SCHEMA_FIELDS.NOTIFICATION.USER_ID) as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} not allowed` 
      }, { status: 400 });
    }

    // Validate user authorization
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${userId}/${uniqueFileName}`;

    // Upload to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, filePath);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult = await uploadBytes(storageRef, buffer, {
      contentType: file.type
    });

    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Save metadata to Firestore
    const mediaDoc = {
      id: uuidv4(),
      userId,
      filename: file.name,
      originalFilename: file.name,
      storagePath: filePath,
      url: downloadURL,
      type: getMediaType(file.type),
      mimeType: file.type,
      size: file.size,
      folder,
      uploadedAt: new Date().toISOString(),
      featured: false,
      description: '',
      tags: []
    };

    await adminDb.collection('media').add(mediaDoc);

    // Update user's media count
    await adminDb.doc(`users/${userId}`).update({
      [`mediaCount.${folder}`]: adminDb.FieldValue.increment(1),
      [`mediaCount.total`]: adminDb.FieldValue.increment(1)
    });

    return NextResponse.json({
      success: true,
      url: downloadURL,
      media: mediaDoc
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image'; // fallback
}

// Compression utility for images
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920x1080)
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
}