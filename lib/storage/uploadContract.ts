import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadContract(bookingId: string, contractPdf: Uint8Array): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, `contracts/${bookingId}.pdf`);

  await uploadBytes(storageRef, contractPdf, {
    contentType: 'application/pdf',
  });

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
