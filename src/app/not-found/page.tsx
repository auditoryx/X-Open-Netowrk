import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center'>
      <h1 className='text-6xl font-bold text-red-500'>404</h1>
      <p className='text-lg mt-4'>Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href='/' className='mt-4 px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-700'>
        Go Home
      </Link>
    </div>
  );
}
