import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebaseClient';

/**
 * Upload a file to Firebase storage
 * 
 * @param file - The file to upload
 * @param path - The path to upload to (e.g., 'mentorships/feedback')
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const fullPath = `${path}/${filename}`;
  
  const storageRef = ref(storage, fullPath);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress tracking could be implemented here if needed
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload progress:', progress);
      },
      (error) => {
        // Handle errors
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Upload multiple files to Firebase storage
 * 
 * @param files - Array of files to upload
 * @param path - The path to upload to
 * @returns Promise with array of download URLs
 */
export const uploadMultipleFiles = async (files: File[], path: string): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
};
