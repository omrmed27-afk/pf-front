'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUserToken, getUserFirstName, logoutCustomer } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/menu', label: 'Menú' },
  { href: '/reservas', label: 'Reservas' },
];

function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  const initials = name.charAt(0).toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center shrink-0 font-bold text-xs`}
      style={{ background: '#8b0000', color: '#f0e6e6', border: '1.5px solid rgba(196,154,108,0.4)' }}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const router = useRouter();
  const { count, openCart } = useCart();

  useEffect(() => {
    if (getUserToken()) setCustomerName(getUserFirstName());
  }, []);

  function handleCustomerLogout() {
    logoutCustomer();
    setCustomerName('');
    router.push('/');
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080404]/90 backdrop-blur-md border-b border-[#8b0000]/30">
      <div className="w-full px-6 md:px-16 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-[#f0e6e6] text-lg font-bold tracking-[0.2em] uppercase">
          <span className="text-[#c0392b]">✦</span> Dragón Rojo
        </Link>

        {/* ── DESKTOP ── */}
        <ul className="hidden md:flex gap-10 items-center">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href}
                className="text-[#b08080] hover:text-[#f0e6e6] transition text-xs tracking-[0.3em] uppercase">
                {l.label}
              </Link>
            </li>
          ))}

          {/* carrito */}
          <li>
            <button onClick={openCart}
              className="relative flex items-center gap-1.5 text-[#b08080] hover:text-[#f0e6e6] transition"
              aria-label="Ver carrito">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8b0000] text-[#f0e6e6] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          </li>

          {/* usuario desktop */}
          {customerName ? (
            <li>
              <div className="flex items-center gap-2 border border-[#8b0000]/30 px-3 py-1.5 rounded-sm"
                style={{ background: '#0f0505' }}>
                <Avatar name={customerName} size={6} />
                <span className="text-[#f0e6e6] text-xs">{customerName}</span>
                <span className="text-[#8b0000]/50">|</span>
                <button onClick={handleCustomerLogout}
                  className="text-[#b08080]/70 hover:text-[#c0392b] transition text-xs">
                  Salir
                </button>
              </div>
            </li>
          ) : (
            <li>
              <Link href="/login"
                className="text-[#b08080]/70 hover:text-[#f0e6e6] transition text-xs tracking-[0.3em] uppercase">
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>

        <div className="md:hidden flex items-center gap-3">
          {customerName ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs"
                style={{ background: '#8b0000', color: '#f0e6e6', border: '1px solid rgba(196,154,108,0.4)' }}>
                {customerName.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleCustomerLogout}
                className="text-[#b08080] hover:text-[#c0392b] transition text-[9px] tracking-wide uppercase">
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login"
              className="text-[#b08080] hover:text-[#f0e6e6] transition text-[10px] tracking-[0.2em] uppercase">
              Iniciar sesión
            </Link>
          )}
          <button className="text-[#c0392b] text-xl" onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {open && (
        <ul className="md:hidden bg-[#080404] border-t border-[#8b0000]/20 px-6 py-5 flex flex-col gap-5">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}
                className="text-[#b08080] hover:text-[#f0e6e6] transition text-xs tracking-[0.3em] uppercase">
                {l.label}
              </Link>
            </li>
          ))}

          {/* carrito mobile */}
          <li>
            <button onClick={() => { setOpen(false); openCart(); }}
              className="flex items-center gap-2 text-[#b08080] hover:text-[#f0e6e6] transition text-xs tracking-[0.3em] uppercase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Carrito
              {count > 0 && (
                <span className="bg-[#8b0000] text-[#f0e6e6] text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {count}
                </span>
              )}
            </button>
          </li>

          {/* usuario mobile */}
          {customerName ? (
            <li className="pt-3 border-t border-[#8b0000]/20">
              <div className="flex items-center gap-3 border border-[#8b0000]/30 px-3 py-2.5 rounded-sm"
                style={{ background: '#0f0505' }}>
                <Avatar name={customerName} size={8} />
                <div className="flex-1">
                  <p className="text-[#f0e6e6] text-xs font-semibold">{customerName}</p>
                  <p className="text-[#b08080]/50 text-[10px]">Cliente</p>
                </div>
                <button onClick={() => { setOpen(false); handleCustomerLogout(); }}
                  className="text-[#b08080]/60 hover:text-[#c0392b] transition text-xs tracking-wide">
                  Salir
                </button>
              </div>
            </li>
          ) : (
            <li className="pt-3 border-t border-[#8b0000]/20">
              <Link href="/login" onClick={() => setOpen(false)}
                className="text-[#b08080]/70 text-xs tracking-[0.3em] uppercase">
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
