import { useState } from 'react';
import { uploadMedia } from '@lib/firebase/uploadMedia';
import { useAuth } from '@/lib/hooks/useAuth';

interface Props {
  onUploadComplete: (urls: string[]) => void;
}

export default function DragDropUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const fileList = e.target.files;
    if (!fileList) {
      setUploading(false);
      return;
    }
    const files = Array.from(fileList);
    const uploadedUrls = await Promise.all(
      files.map((file) => uploadMedia(file, user.uid))
    );
    setUrls(uploadedUrls);
    onUploadComplete(uploadedUrls);
    setUploading(false);
  };

  return (
    <div className='card-brutalist spacing-brutalist-md'>
      <label htmlFor='drag-upload' className='text-brutalist block mb-4'>
        UPLOAD MEDIA
      </label>
      <div className='border-2 border-white border-dashed p-8 mb-6 text-center hover:bg-brutalist-dark transition-colors'>
        <input
          id='drag-upload'
          type='file'
          multiple
          accept='image/*,video/*'
          onChange={handleFileChange}
          className='hidden'
        />
        <label 
          htmlFor='drag-upload' 
          className='cursor-pointer text-brutalist-mono block'
        >
          {uploading ? 'UPLOADING...' : 'CLICK TO SELECT FILES OR DRAG & DROP'}
        </label>
      </div>
      
      {urls.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {urls.map((url, idx) => (
            <div key={idx} className='border-2 border-white overflow-hidden'>
              {url.includes('video') ? (
                <video src={url} controls className='w-full h-32 object-cover' />
              ) : (
                <img src={url} alt='Uploaded' className='w-full h-32 object-cover' />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
