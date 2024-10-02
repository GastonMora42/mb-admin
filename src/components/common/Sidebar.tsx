import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white">
      <nav className="mt-10">
        <Link href="/dashboard">
          <a className="block px-4 py-2 hover:bg-gray-700">Dashboard</a>
        </Link>
        <Link href="/students">
          <a className="block px-4 py-2 hover:bg-gray-700">Alumnos</a>
        </Link>
        <Link href="/payments">
          <a className="block px-4 py-2 hover:bg-gray-700">Recibos</a>
        </Link>
        {/* Otras secciones */}
      </nav>
    </aside>
  );
}