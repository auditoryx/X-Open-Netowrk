import Link from "next/link";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-brutalist-black border-t-4 border-white text-white spacing-brutalist-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link href="/" className="heading-brutalist-md block mb-6">
            AUDITORYX
          </Link>
          <p className="text-brutalist-mono opacity-80">
            THE GLOBAL CREATIVE NETWORK BUILT FOR MUSIC
          </p>
        </div>
        
        <div>
          <h4 className="text-brutalist mb-4">NAVIGATION</h4>
          <nav className="space-y-3">
            <Link href="/about" className="nav-brutalist-link block">ABOUT</Link>
            <Link href="/services" className="nav-brutalist-link block">SERVICES</Link>
            <Link href="/apply" className="nav-brutalist-link block">APPLY</Link>
            <Link href="/contact" className="nav-brutalist-link block">CONTACT</Link>
          </nav>
        </div>
        
        <div>
          <h4 className="text-brutalist mb-4">CONNECT</h4>
          <div className="space-y-3">
            <a 
              href="https://twitter.com/auditoryx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-brutalist-link block"
            >
              🐦 TWITTER
            </a>
            <a 
              href="https://instagram.com/auditoryx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-brutalist-link block"
            >
              📸 INSTAGRAM
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t-2 border-white text-center">
        <p className="text-brutalist-mono opacity-60">
          &copy; {new Date().getFullYear()} AUDITORYX. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
