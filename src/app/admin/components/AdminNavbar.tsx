"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/auth");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/verifications", label: "Verifications", icon: "✅" },
    { href: "/admin/disputes", label: "Disputes", icon: "⚖️" },
    { href: "/admin/reports", label: "Reports", icon: "📈" },
    { href: "/admin/listings", label: "Listings", icon: "📝" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-64 min-h-screen bg-gray-950 border-r border-gray-800 text-white">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-400">AuditoryX Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Management Portal</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
