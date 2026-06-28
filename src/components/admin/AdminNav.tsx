'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logout, getUsername } from '@/lib/auth';

const groups = [
  {
    label: 'Restaurante',
    links: [
      { href: '/admin/dashboard', label: 'Platos' },
      { href: '/admin/mesas', label: 'Mesas' },
      { href: '/admin/reservas', label: 'Reservas' },
    ],
  },
  {
    label: 'Logística',
    links: [
      { href: '/admin/pedidos', label: 'Pedidos' },
      { href: '/admin/rutas', label: 'Rutas' },
      { href: '/admin/vehiculos', label: 'Vehículos' },
      { href: '/admin/conductores', label: 'Conductores' },
    ],
  },
  {
    label: 'Empresa',
    links: [
      { href: '/admin/locales', label: 'Locales' },
      { href: '/admin/proveedores', label: 'Proveedores' },
      { href: '/admin/usuarios', label: 'Usuarios' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function isGroupActive(g: typeof groups[0]) {
    return g.links.some(l => pathname === l.href);
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080404]/90 backdrop-blur-md border-b border-[#8b0000]/30">
      <div ref={navRef} className="w-full px-8 flex items-center justify-between h-16">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#8b0000]/60 border border-[#c0392b]/40 flex items-center justify-center text-lg select-none">
            🐉
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[#f0e6e6] text-sm font-bold tracking-[0.15em] uppercase">Dragón Rojo</span>
            <span className="text-[#b08080]/60 text-[10px] tracking-[0.2em] uppercase">Admin</span>
          </div>
        </Link>

        <ul className="flex gap-8 items-center h-16">
          {groups.map(g => (
            <li key={g.label} className="relative">
              <button
                onClick={() => setOpen(open === g.label ? null : g.label)}
                className={`flex items-center gap-1.5 text-xs tracking-[0.3em] uppercase transition px-2 py-5 ${
                  isGroupActive(g) ? 'text-[#f0e6e6]' : 'text-[#b08080]/80 hover:text-[#f0e6e6]'
                }`}
              >
                {g.label}
                <span className={`text-[8px] transition-transform duration-200 ${open === g.label ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {open === g.label && (
                <div className="absolute top-full left-0 min-w-[140px] border border-[#8b0000]/30 shadow-xl"
                  style={{ background: '#0c0404' }}>
                  {g.links.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(null)}
                      className={`block px-5 py-3 text-xs tracking-[0.2em] uppercase border-b border-[#8b0000]/15 last:border-0 transition ${
                        pathname === l.href
                          ? 'text-[#f0e6e6] bg-[#8b0000]/20'
                          : 'text-[#b08080]/80 hover:text-[#f0e6e6] hover:bg-[#8b0000]/10'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}

          {username && (
            <li className="text-[#b08080]/60 text-xs border-l border-[#8b0000]/30 pl-6">
              <span className="text-[#f0e6e6]/80">{username}</span>
            </li>
          )}
          <li>
            <button onClick={handleLogout}
              className="text-[#b08080]/80 text-xs tracking-[0.3em] uppercase hover:text-[#f0e6e6] transition px-2 py-5">
              Salir
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
