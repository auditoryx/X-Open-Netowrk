export default function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-900 text-gray-400 p-8 mt-10">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">AuditoryX</h3>
            <p className="text-sm mb-4">
              The global creative network built for music. Connect, collaborate, and get paid.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Instagram
              </a>
              <a href="https://twitter.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Twitter
              </a>
            </div>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Creators</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/apply" className="hover:text-white">Apply as Creator</a></li>
              <li><a href="/creator-guidelines" className="hover:text-white">Creator Guidelines</a></li>
              <li><a href="/dashboard" className="hover:text-white">Creator Dashboard</a></li>
              <li><a href="/success-stories" className="hover:text-white">Success Stories</a></li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/explore" className="hover:text-white">Browse Creators</a></li>
              <li><a href="/search" className="hover:text-white">Advanced Search</a></li>
              <li><a href="/about" className="hover:text-white">How It Works</a></li>
              <li><a href="/contact" className="hover:text-white">Get Support</a></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms-of-service" className="hover:text-white">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/legal/escrow" className="hover:text-white">Escrow Process</a></li>
              <li><a href="/contact" className="hover:text-white">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2025 AuditoryX. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <a href="/terms-of-service" className="hover:text-white">Terms</a>
            <a href="/privacy-policy" className="hover:text-white">Privacy</a>
            <a href="/contact" className="hover:text-white">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
