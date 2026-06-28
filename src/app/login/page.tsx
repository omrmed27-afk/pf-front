'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginCustomer } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSuperuser } = await loginCustomer(form.identifier, form.password);
      router.push(isSuperuser ? '/admin/dashboard' : '/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{
        backgroundImage: 'url(/bg-oriental.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      {/* overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        {/* logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-[#c0392b] text-3xl">✦</span>
            <span className="text-[#f0e6e6] text-2xl font-bold tracking-[0.2em] uppercase">Dragón Rojo</span>
            <span className="text-[#b08080] text-[10px] tracking-[0.4em] uppercase">Cocina Oriental</span>
          </Link>
        </div>

        <div className="border border-[#8b0000]/20 p-8" style={{ background: 'rgba(15,5,5,0.95)' }}>
          <p className="text-[#c0392b] text-xs tracking-[0.4em] uppercase text-center mb-1">Bienvenido</p>
          <h1 className="text-[#f0e6e6] text-2xl font-bold text-center mb-2">Iniciar sesión</h1>
          <p className="text-[#b08080] text-xs text-center mb-8">Accede para reservar y seguir tus pedidos</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Email o usuario</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 text-sm">✉</span>
                <input
                  type="text" value={form.identifier} onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                  placeholder="ejemplo@correo.com o juan.garcia" required autoComplete="username"
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
              </div>
            </div>

            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 text-sm">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 hover:text-[#b08080] text-xs transition">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && <p className="text-[#c0392b] text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] py-3 text-xs tracking-[0.3em] uppercase font-bold transition disabled:opacity-40 mt-1">
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#b08080] text-xs">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-[#c0392b] hover:text-[#f0e6e6] transition">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '🍜', title: 'Auténtico sabor', desc: 'Recetas tradicionales orientales' },
            { icon: '👨‍🍳', title: 'Chefs expertos', desc: 'Maestros en cocina oriental' },
            { icon: '🚀', title: 'Delivery rápido', desc: 'Entrega en tu puerta' },
          ].map(f => (
            <div key={f.title} className="text-center">
              <span className="text-2xl block mb-1">{f.icon}</span>
              <p className="text-[#f0e6e6] text-[10px] font-semibold uppercase tracking-wide">{f.title}</p>
              <p className="text-[#b08080]/60 text-[10px] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[#b08080]/30 text-[10px] mt-8">
          © 2025 Dragón Rojo · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
