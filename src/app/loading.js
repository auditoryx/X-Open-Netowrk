export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-ebony">
      {/* Brand Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-brand-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
          AX
        </div>
      </div>
      
      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
      
      {/* Loading Text */}
      <p className="mt-4 text-gray-400 text-sm animate-pulse">
        Loading the creative network...
      </p>
    </div>
  );
}
