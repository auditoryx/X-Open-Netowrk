export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center'>
      <h1 className='text-4xl font-bold mb-4'>Welcome to AuditoryX</h1>
      <p className='text-lg'>Your ultimate platform for music production and artist collaboration.</p>
      <a href='/services' className='mt-4 px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-700'>Explore Services</a>
    </div>
  );
}
