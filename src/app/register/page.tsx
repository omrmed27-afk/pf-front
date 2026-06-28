'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerCustomer } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm_password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passOk = form.password.length >= 8;
  const passMatch = form.password === form.confirm_password && form.confirm_password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) { setError('Debes aceptar los términos y condiciones.'); return; }
    if (!passOk) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (!passMatch) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    setError('');
    try {
      await registerCustomer(form);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  }

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{
        backgroundImage: 'url(/bg-oriental.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        {/* logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-[#c0392b] text-3xl">✦</span>
            <span className="text-[#f0e6e6] text-2xl font-bold tracking-[0.2em] uppercase">Dragón Rojo</span>
            <span className="text-[#b08080] text-[10px] tracking-[0.4em] uppercase">Cocina Oriental</span>
          </Link>
        </div>

        <div className="border border-[#8b0000]/20 p-8" style={{ background: 'rgba(15,5,5,0.95)' }}>
          <p className="text-[#c0392b] text-xs tracking-[0.4em] uppercase text-center mb-1">Únete a nosotros</p>
          <h1 className="text-[#f0e6e6] text-2xl font-bold text-center mb-2">Crear cuenta</h1>
          <p className="text-[#b08080] text-xs text-center mb-8">Regístrate y descubre una experiencia única</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* nombre + apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Nombre *</label>
                <input value={form.first_name} onChange={F('first_name')} placeholder="Tu nombre" required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
              </div>
              <div>
                <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Apellido *</label>
                <input value={form.last_name} onChange={F('last_name')} placeholder="Tu apellido" required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
              </div>
            </div>

            {/* nombre de usuario */}
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Nombre de usuario *</label>
              <input value={form.username} onChange={F('username')} placeholder="ej: juan.garcia" required
                autoComplete="username"
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
              <p className="text-[#b08080]/50 text-[10px] mt-1">Solo letras, números y puntos. Sin espacios.</p>
            </div>

            {/* email */}
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Correo electrónico *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 text-sm">✉</span>
                <input type="email" value={form.email} onChange={F('email')} placeholder="ejemplo@correo.com" required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
              </div>
            </div>

            {/* contraseña */}
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Contraseña *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 text-sm">🔒</span>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={F('password')}
                  placeholder="••••••••" required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#c0392b] transition placeholder-[#b08080]/30" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 hover:text-[#b08080] text-xs transition">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {form.password.length > 0 && (
                <p className={`text-[10px] mt-1 ${passOk ? 'text-green-400' : 'text-[#c0392b]'}`}>
                  {passOk ? '✓ Mínimo 8 caracteres' : '✗ Mínimo 8 caracteres'}
                </p>
              )}
            </div>

            {/* confirmar contraseña */}
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1.5">Confirmar contraseña *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 text-sm">🔒</span>
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={F('confirm_password')}
                  placeholder="••••••••" required
                  className={`w-full bg-[#0a0303] border text-[#f0e6e6] pl-9 pr-10 py-3 text-sm focus:outline-none transition placeholder-[#b08080]/30 ${
                    form.confirm_password.length > 0
                      ? passMatch ? 'border-green-700/50 focus:border-green-600' : 'border-[#c0392b]/50 focus:border-[#c0392b]'
                      : 'border-[#8b0000]/30 focus:border-[#c0392b]'
                  }`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b08080]/60 hover:text-[#b08080] text-xs transition">
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* términos */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)}
                className="mt-0.5 accent-[#c0392b]" />
              <label htmlFor="terms" className="text-[#b08080] text-xs leading-relaxed">
                Acepto los{' '}
                <span className="text-[#c0392b]">Términos y condiciones</span>
                {' '}y la{' '}
                <span className="text-[#c0392b]">Política de privacidad</span>
              </label>
            </div>

            {error && <p className="text-[#c0392b] text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] py-3 text-xs tracking-[0.3em] uppercase font-bold transition disabled:opacity-40 mt-1">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#b08080] text-xs">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#c0392b] hover:text-[#f0e6e6] transition">
                Inicia sesión aquí
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
