import Link from "next/link";

export default function Navbar(): JSX.Element {
  return (
    <header className="nav-brutalist w-full flex items-center justify-between">
      <h1 className="heading-brutalist-lg">
        AUDITORYX
      </h1>
      <nav className="flex gap-6">
        <Link href="/about" className="nav-brutalist-link">
          ABOUT
        </Link>
        <Link href="/services" className="nav-brutalist-link">
          SERVICES
        </Link>
        <Link href="/apply" className="nav-brutalist-link">
          APPLY
        </Link>
        <Link href="/contact" className="nav-brutalist-link">
          CONTACT
        </Link>
      </nav>
    </header>
  );
}
