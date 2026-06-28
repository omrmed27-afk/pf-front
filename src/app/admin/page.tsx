'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin, logout } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSuperuser } = await loginAdmin(form.username, form.password);
      if (!isSuperuser) {
        logout();
        setError('Acceso denegado. Solo superusuarios pueden ingresar al panel.');
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080404' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-[#c0392b] text-2xl">✦</span>
          <h1 className="text-[#f0e6e6] text-xl font-bold tracking-[0.3em] uppercase mt-2">Panel Admin</h1>
          <p className="text-[#b08080] text-xs mt-1 tracking-wide">Dragón Rojo</p>
        </div>

        <form onSubmit={handleSubmit}
          className="border border-[#8b0000]/20 p-8 flex flex-col gap-5"
          style={{ background: '#0f0505' }}>
          <div>
            <label className="text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5">Usuario</label>
            <input name="username" value={form.username} onChange={handleChange} required autoFocus
              className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition text-sm" />
          </div>
          <div>
            <label className="text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5">Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition text-sm" />
          </div>

          {error && <p className="text-[#c0392b] text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-[#8b0000] text-[#f0e6e6] py-3 text-sm tracking-[0.3em] uppercase font-semibold hover:bg-[#c0392b] transition disabled:opacity-40 mt-2">
            {loading ? 'Entrando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
