import AdminNavbar from './components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <AdminNavbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
