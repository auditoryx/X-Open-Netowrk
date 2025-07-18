import { storage, db } from '@/firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface UploadMediaResult {
  url: string;
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  size: number;
  createdAt: FieldValue | Timestamp; // Firestore timestamp
  storagePath: string;
}

/**
 * Upload a file or blob to Firebase Storage and save metadata to Firestore
 * @param file - File or Blob to upload
 * @param userId - User ID for storage path and Firestore document
 * @returns Promise with URL and metadata
 */
export async function uploadMedia(file: File | Blob, userId: string): Promise<UploadMediaResult> {
  if (!userId) {
    throw new Error('User ID is required for media upload');
  }

  if (!file) {
    throw new Error('File is required for upload');
  }

  try {
    // Generate unique filename
    const mediaId = uuidv4();
    const fileExtension = file instanceof File ? getFileExtension(file.name) : 'bin';
    const filename = file instanceof File ? file.name : `upload.${fileExtension}`;
    const uniqueFilename = `${mediaId}.${fileExtension}`;
    const storagePath = `media/${userId}/${uniqueFilename}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    
    const uploadSnapshot = await uploadBytes(storageRef, file, {
      contentType: file.type
    });

    // Get download URL
    const downloadURL = await getDownloadURL(uploadSnapshot.ref);

    // Determine media type
    const mediaType = getMediaType(file.type);

    // Prepare metadata
    const metadata: MediaMetadata = {
      id: mediaId,
      url: downloadURL,
      type: mediaType,
      filename: filename,
      size: file.size,
      createdAt: serverTimestamp(),
      storagePath: storagePath
    };

    // Save metadata to Firestore under users/{userId}/media/{mediaId}
    const userMediaRef = collection(db, 'users', userId, 'media');
    await addDoc(userMediaRef, metadata);

    return {
      url: downloadURL,
      metadata: metadata
    };

  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || 'bin';
  }
  return 'bin';
}

/**
 * Determine media type from MIME type
 */
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  
  // Default to image for unsupported types
  return 'image';
}

/**
 * Validate file before upload
 */
export function validateMediaFile(file: File | Blob): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_MIME_TYPES = [
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

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported`
    };
  }

  return { valid: true };
}

/**
 * Upload multiple media files
 */
export async function uploadMultipleMedia(
  files: (File | Blob)[],
  userId: string,
  onProgress?: (index: number, progress: number) => void
): Promise<UploadMediaResult[]> {
  const results: UploadMediaResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      onProgress?.(i, 0);
      const result = await uploadMedia(file, userId);
      results.push(result);
      onProgress?.(i, 100);
    } catch (error) {
      console.error(`Failed to upload file ${i}:`, error);
      onProgress?.(i, -1); // Indicate error
      throw error; // Re-throw to let caller handle
    }
  }

  return results;
}