'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import { getReservations, cancelReservation, Reservation } from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-800/40 bg-yellow-900/10',
  confirmed: 'text-green-400 border-green-800/40 bg-green-900/10',
  cancelled: 'text-[#b08080] border-[#8b0000]/20 bg-transparent',
};

export default function ReservasPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  }

  async function handleCancel(id: number) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await cancelReservation(id);
    load();
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Reservas</h1>
            <p className="text-[#b08080] text-xs mt-1">{reservations.length} reservas en total</p>
          </div>
          <div className="flex gap-1">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wide transition ${
                  filter === f ? 'bg-[#8b0000] text-[#f0e6e6]' : 'text-[#b08080] border border-[#8b0000]/20 hover:text-[#f0e6e6]'
                }`}>
                {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[#8b0000]/15 overflow-hidden" style={{ background: '#0f0505' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b0000]/20">
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Hora</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Mesa</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Personas</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Notas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6]">{r.date}</td>
                  <td className="px-4 py-3 text-[#f0e6e6]">{r.time.slice(0, 5)}</td>
                  <td className="px-4 py-3 text-[#b08080]">#{r.table}</td>
                  <td className="px-4 py-3 text-[#b08080]">{r.party_size} pers.</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLOR[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#b08080]/60 text-xs max-w-[150px] truncate">
                    {r.notes ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(r.id)}
                        className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay reservas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
