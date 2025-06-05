import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from '@/lib/firebase'

export async function uploadChatMedia(bookingId: string, file: File): Promise<string> {
  const storage = getStorage(app)
  const fileRef = ref(storage, `bookings/${bookingId}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}
