export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-gray-400">Page Not Found</p>
      <a href="/" className="mt-6 px-5 py-3 bg-white text-black rounded-lg hover:bg-gray-300 transition">Go Back Home</a>
    </div>
  );
}
