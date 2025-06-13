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
    <div className='border p-4 rounded'>
      <label htmlFor='drag-upload' className='block mb-2 font-semibold'>
        Upload Media
      </label>
      <input
        id='drag-upload'
        type='file'
        multiple
        accept='image/*,video/*'
        onChange={handleFileChange}
        className='mb-2'
      />
      {uploading && <p>Uploading...</p>}
      <div className='grid grid-cols-3 gap-2'>
        {urls.map((url, idx) => (
          <div key={idx}>
            {url.includes('video') ? (
              <video src={url} controls className='w-full h-32 object-cover' />
            ) : (
              <img src={url} alt='Uploaded' className='w-full h-32 object-cover' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
