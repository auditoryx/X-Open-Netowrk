export default function Navbar() {
  return (
    <nav className='bg-gray-900 p-4 sticky top-0 shadow-lg z-50'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <h1 className='text-xl font-bold'>AuditoryX</h1>
        <ul className='flex space-x-4'>
          <li><a href='/' className='hover:text-gray-400'>Home</a></li>
          <li><a href='/services' className='hover:text-gray-400'>Services</a></li>
          <li><a href='/about' className='hover:text-gray-400'>About</a></li>
          <li><a href='/contact' className='hover:text-gray-400'>Contact</a></li>
        </ul>
      </div>
    </nav>
  );
}
