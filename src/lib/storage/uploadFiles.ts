export async function uploadFile(_file: File | Blob): Promise<string> {
  // Return a dummy URL; wire real storage later
  return Promise.resolve('https://example.com/dummy-upload-url');
}

