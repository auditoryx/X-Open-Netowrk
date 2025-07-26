/**
 * Document Upload Component
 * 
 * Secure file upload component for KYC documents
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentUploadProps {
  documentType: 'passport' | 'drivers_license' | 'id_card' | 'proof_of_address' | 'selfie';
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploadProgress: number;
  error?: string;
  documentId?: string;
}

export default function DocumentUpload({
  documentType,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
}: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'passport':
        return 'Passport';
      case 'drivers_license':
        return 'Driver\'s License';
      case 'id_card':
        return 'ID Card';
      case 'proof_of_address':
        return 'Proof of Address';
      case 'selfie':
        return 'Selfie Photo';
      default:
        return 'Document';
    }
  };

  const getDocumentInstructions = (type: string) => {
    switch (type) {
      case 'passport':
        return 'Upload a clear photo of your passport photo page. Make sure all text is readable.';
      case 'drivers_license':
        return 'Upload both front and back of your driver\'s license. Ensure all information is visible.';
      case 'id_card':
        return 'Upload a clear photo of your government-issued ID card. All corners should be visible.';
      case 'proof_of_address':
        return 'Upload a recent utility bill, bank statement, or official document showing your address.';
      case 'selfie':
        return 'Take a clear selfie photo. Make sure your face is well-lit and matches your ID photo.';
      default:
        return 'Upload a clear, high-quality document.';
    }
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    if (file.size > maxFileSize) {
      errors.push(`File size must be less than ${maxFileSize / 1024 / 1024}MB`);
    }

    if (!acceptedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use JPEG, PNG, WebP, or PDF');
    }

    // Additional validation for specific document types
    if (documentType === 'selfie' && !file.type.startsWith('image/')) {
      errors.push('Selfie must be an image file');
    }

    return errors;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const errors = validateFile(file);

    if (errors.length > 0) {
      toast.error(errors[0]);
      onUploadError?.(errors.join(', '));
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);

    setUploadedFile({
      file,
      preview,
      uploading: false,
      uploadProgress: 0,
    });
  };

  const uploadFile = async () => {
    if (!uploadedFile) return;

    const fileToUpload = uploadedFile;
    setUploadedFile(prev => prev ? { ...prev, uploading: true, uploadProgress: 0 } : null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', fileToUpload.file);
      formData.append('documentType', documentType);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev || prev.uploadProgress >= 90) return prev;
          return { ...prev, uploadProgress: prev.uploadProgress + 10 };
        });
      }, 200);

      // In production, this would upload to your API
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);

      // Simulate successful upload
      const mockDocumentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setUploadedFile(prev => prev ? {
        ...prev,
        uploading: false,
        uploadProgress: 100,
        documentId: mockDocumentId,
      } : null);

      toast.success('Document uploaded successfully');
      onUploadComplete?.(mockDocumentId);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = 'Failed to upload document. Please try again.';
      
      setUploadedFile(prev => prev ? {
        ...prev,
        uploading: false,
        uploadProgress: 0,
        error: errorMessage,
      } : null);

      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getDocumentTitle(documentType)}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {getDocumentInstructions(documentType)}
        </p>
      </div>

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your file here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Support for JPEG, PNG, WebP, and PDF files up to {maxFileSize / 1024 / 1024}MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {uploadedFile.file.type.startsWith('image/') ? (
                <img
                  src={uploadedFile.preview}
                  alt="Document preview"
                  className="h-16 w-16 object-cover rounded border"
                />
              ) : (
                <FileText className="h-16 w-16 text-gray-400" />
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {uploadedFile.file.name}
              </h4>
              <p className="text-sm text-gray-500">
                {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              {uploadedFile.uploading && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{uploadedFile.uploadProgress}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadedFile.uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFile.error && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {uploadedFile.error}
                </div>
              )}

              {uploadedFile.documentId && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Upload complete
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={uploadedFile.uploading}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Button */}
          {!uploadedFile.uploading && !uploadedFile.documentId && !uploadedFile.error && (
            <button
              type="button"
              onClick={uploadFile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Document
            </button>
          )}

          {/* Retry Button */}
          {uploadedFile.error && (
            <button
              type="button"
              onClick={uploadFile}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Retry Upload
            </button>
          )}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          🔒 Your documents are encrypted and securely stored. They will only be used for verification purposes and will not be shared with third parties.
        </p>
      </div>
    </div>
  );
}