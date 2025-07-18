'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { uploadMedia, UploadMediaResult } from '@/lib/uploadMedia';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface PortfolioUploaderProps {
  onUploadComplete?: (results: UploadMediaResult[]) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
}

export default function PortfolioUploader({
  onUploadComplete,
  onUploadProgress,
  maxFiles = 10,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  className = ''
}: PortfolioUploaderProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['image/*', 'video/*', 'audio/*'];

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // fallback
  };

  const createPreview = (file: File): string => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return ''; // No preview for audio files
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Max size: ${Math.round(maxFileSize / (1024 * 1024))}MB`
      };
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File "${file.name}" type is not supported`
      };
    }

    return { valid: true };
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: MediaFile[] = [];
    
    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        preview: createPreview(file),
        type: getFileType(file),
        uploadStatus: 'pending'
      });
    });

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  }, [maxFiles, maxFileSize]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleUpload = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to upload media');
      return;
    }

    const pendingFiles = files.filter(f => f.uploadStatus === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setUploading(true);
    const results: UploadMediaResult[] = [];

    try {
      for (const mediaFile of pendingFiles) {
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 }
            : f
        ));

        try {
          const result = await uploadMedia(mediaFile.file, session.user.id);
          
          setFiles(prev => prev.map(f => 
            f.id === mediaFile.id 
              ? { ...f, uploadStatus: 'success', url: result.url, uploadProgress: 100 }
              : f
          ));

          results.push(result);
          onUploadProgress?.(mediaFile.id, 100);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setFiles(prev => prev.map(f => 
            f.id === mediaFile.id 
              ? { ...f, uploadStatus: 'error', error: errorMessage }
              : f
          ));
          console.error(`Upload failed for ${mediaFile.file.name}:`, error);
        }
      }

      if (results.length > 0) {
        toast.success(`Successfully uploaded ${results.length} file${results.length !== 1 ? 's' : ''}`);
        onUploadComplete?.(results);
      }

      if (results.length < pendingFiles.length) {
        toast.error(`${pendingFiles.length - results.length} file(s) failed to upload`);
      }

    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, uploadStatus: 'pending', error: undefined, uploadProgress: 0 }
        : f
    ));
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">Drag & drop files here, or click to select</p>
              <p className="text-sm text-gray-400">
                Supports images, videos, and audio files up to {Math.round(maxFileSize / (1024 * 1024))}MB each
              </p>
              <p className="text-sm text-gray-400">
                Maximum {maxFiles} files allowed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Files ({files.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="btn btn-secondary"
                disabled={uploading}
              >
                Clear all
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.uploadStatus !== 'pending')}
                className="btn btn-primary"
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {file.type === 'image' && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : file.type === 'video' && file.preview ? (
                      <video
                        src={file.preview}
                        className="w-16 h-16 object-cover rounded"
                        muted
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.file.size)}
                    </p>
                    
                    {/* Status */}
                    <div className="mt-2">
                      {file.uploadStatus === 'pending' && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Pending
                        </span>
                      )}
                      
                      {file.uploadStatus === 'uploading' && (
                        <div className="space-y-1">
                          <span className="text-xs text-blue-600">
                            Uploading... {Math.round(file.uploadProgress || 0)}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${file.uploadProgress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {file.uploadStatus === 'success' && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          ✓ Uploaded
                        </span>
                      )}
                      
                      {file.uploadStatus === 'error' && (
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Error
                          </span>
                          {file.error && (
                            <p className="text-xs text-red-600">{file.error}</p>
                          )}
                          <button
                            onClick={() => handleRetry(file.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={uploading}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}