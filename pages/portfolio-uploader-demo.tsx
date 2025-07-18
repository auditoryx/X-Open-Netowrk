import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import PortfolioUploader from '@/components/PortfolioUploader';
import Link from 'next/link';

const PortfolioUploaderDemo: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio Media Uploader Demo
          </h1>
          <p className="text-gray-600">
            This demo showcases the new PortfolioUploader component for uploading media files to Firebase Storage.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </Link>
        </div>

        {!session && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please sign in to test the upload functionality.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Media Files
          </h2>
          
          <PortfolioUploader
            onUploadComplete={(results) => {
              console.log('Upload completed:', results);
              alert(`Successfully uploaded ${results.length} file(s)!`);
            }}
            onUploadProgress={(fileId, progress) => {
              console.log(`File ${fileId}: ${progress}% complete`);
            }}
            maxFiles={5}
            className="mb-6"
          />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Drag and drop file upload interface</li>
              <li>• Support for images, videos, and audio files</li>
              <li>• File validation and preview thumbnails</li>
              <li>• Upload progress tracking</li>
              <li>• Firebase Storage integration with /media/userId/ path structure</li>
              <li>• Firestore metadata storage in users/userId/media/ subcollection</li>
              <li>• Responsive Tailwind CSS design</li>
              <li>• Error handling and retry functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioUploaderDemo;