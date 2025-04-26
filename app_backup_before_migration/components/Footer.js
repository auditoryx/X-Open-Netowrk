export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center p-6 mt-10">
      <p>© 2025 AuditoryX. All Rights Reserved.</p>
      <div className="flex justify-center space-x-6 mt-2">
        <a href="https://instagram.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          Instagram
        </a>
        <a href="https://twitter.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          Twitter
        </a>
        <a href="/contact" className="hover:text-white">Contact</a>
      </div>
    </footer>
  );
}
