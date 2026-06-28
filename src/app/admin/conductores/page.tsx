'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import { getDrivers, updateDriverStatus, Driver } from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponible',
  on_route: 'En ruta',
  off_duty: 'Fuera de servicio',
};

const STATUS_COLOR: Record<string, string> = {
  available: 'text-green-400 border-green-800/40 bg-green-900/10',
  on_route: 'text-yellow-400 border-yellow-800/40 bg-yellow-900/10',
  off_duty: 'text-[#b08080] border-[#8b0000]/20 bg-[#8b0000]/5',
};

const ALL_STATUSES = ['available', 'on_route', 'off_duty'];

export default function ConductoresPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getDrivers();
    setDrivers(data);
    setLoading(false);
  }

  async function handleStatus(id: number, status: string) {
    await updateDriverStatus(id, status);
    load();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080404' }}>
      <span className="text-[#b08080] text-sm">Cargando...</span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080404' }}>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Conductores</h1>
            <p className="text-[#b08080] text-xs mt-1">
              {drivers.length} conductores · registrar vía <span className="font-mono text-[#c0392b]/80">/api/v1/auth/register/</span>
            </p>
          </div>
        </div>

        <div className="border border-[#8b0000]/15 overflow-hidden" style={{ background: '#0f0505' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b0000]/20">
                {['Nombre', 'Usuario', 'Licencia', 'Teléfono', 'Estado', 'Cambiar a'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, i) => (
                <tr key={d.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6] font-semibold">
                    {[d.user.first_name, d.user.last_name].filter(Boolean).join(' ') || d.user.username}
                  </td>
                  <td className="px-4 py-3 text-[#b08080] font-mono text-xs">{d.user.username}</td>
                  <td className="px-4 py-3 text-[#b08080] font-mono text-xs">{d.license_number}</td>
                  <td className="px-4 py-3 text-[#b08080]">{d.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLOR[d.status]}`}>
                      {STATUS_LABEL[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {ALL_STATUSES.filter(s => s !== d.status).map(s => (
                        <button key={s} onClick={() => handleStatus(d.id, s)}
                          className="text-xs px-2 py-0.5 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] hover:border-[#8b0000] transition">
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay conductores registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
