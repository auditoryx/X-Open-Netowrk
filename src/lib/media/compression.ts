export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class MediaCompressor {
  static async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async compressVideo(
    file: File,
    options: { maxSize?: number } = {}
  ): Promise<File> {
    const { maxSize = 50 * 1024 * 1024 } = options; // 50MB default

    // For now, we'll just return the original file if it's under the max size
    // In a real implementation, you'd use a library like ffmpeg.js or similar
    if (file.size <= maxSize) {
      return file;
    }

    // For demonstration, we'll just return the original file
    // In production, you'd implement actual video compression
    console.warn('Video compression not implemented. Original file returned.');
    return file;
  }

  static async generateThumbnail(
    file: File,
    options: { width?: number; height?: number } = {}
  ): Promise<File> {
    const { width = 200, height = 200 } = options;

    if (file.type.startsWith('image/')) {
      return this.compressImage(file, {
        maxWidth: width,
        maxHeight: height,
        quality: 0.7,
        format: 'jpeg'
      });
    }

    if (file.type.startsWith('video/')) {
      return this.generateVideoThumbnail(file, { width, height });
    }

    throw new Error('Unsupported file type for thumbnail generation');
  }

  private static async generateVideoThumbnail(
    file: File,
    options: { width: number; height: number }
  ): Promise<File> {
    const { width, height } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        canvas.width = width;
        canvas.height = height;
        
        // Seek to 10% of video duration for thumbnail
        video.currentTime = video.duration * 0.1;
      };

      video.onseeked = () => {
        // Draw video frame on canvas
        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `${file.name}_thumbnail.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate video thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
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

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true };
  }

  static getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      mediaType: this.getMediaType(file.type)
    };
  }

  private static getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image'; // fallback
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async optimizeForUpload(file: File): Promise<File> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (file.type.startsWith('image/')) {
      // Compress images larger than 2MB
      if (file.size > 2 * 1024 * 1024) {
        return this.compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: 'jpeg'
        });
      }
    }

    if (file.type.startsWith('video/')) {
      // For videos, we might want to compress if they're too large
      // This is a placeholder - actual video compression would require more sophisticated tools
      return this.compressVideo(file);
    }

    // Return original file if no compression needed
    return file;
  }
}