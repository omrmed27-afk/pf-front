'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import { getTables, createTable, changeTableStatus, deleteTable, getWarehouses, Table, Warehouse } from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  occupied: 'Ocupada',
};

const STATUS_COLOR: Record<string, string> = {
  available: 'text-green-400 border-green-800/40 bg-green-900/10',
  reserved: 'text-yellow-400 border-yellow-800/40 bg-yellow-900/10',
  occupied: 'text-[#c0392b] border-[#8b0000]/40 bg-[#8b0000]/10',
};

const NEXT_STATUS: Record<string, string[]> = {
  available: ['reserved'],
  reserved: ['occupied', 'available'],
  occupied: ['available'],
};

export default function MesasPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ warehouse: '', number: '', capacity: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    const [t, w] = await Promise.all([getTables(), getWarehouses()]);
    setTables(t);
    setWarehouses(w);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTable({ warehouse: Number(form.warehouse), number: Number(form.number), capacity: Number(form.capacity) });
      setShowForm(false);
      setForm({ warehouse: '', number: '', capacity: '' });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id: number, newStatus: string) {
    await changeTableStatus(id, newStatus);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    await deleteTable(id);
    load();
  }

  const warehouseName = (id: number) => warehouses.find(w => w.id === id)?.name ?? `Local #${id}`;

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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Mesas</h1>
            <p className="text-[#b08080] text-xs mt-1">{tables.length} mesas registradas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nueva mesa
          </button>
        </div>

        {/* form crear mesa */}
        {showForm && (
          <form onSubmit={handleCreate}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
            style={{ background: '#0f0505' }}>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Local *</label>
              <select value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value="">Seleccionar</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Número *</label>
              <input type="number" min="1" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Capacidad *</label>
              <input type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] py-2.5 text-xs uppercase tracking-wide transition disabled:opacity-40">
                {saving ? '...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] transition text-xs">
                ✕
              </button>
            </div>
            {error && <p className="col-span-4 text-[#c0392b] text-xs">{error}</p>}
          </form>
        )}

        {/* tabla de mesas */}
        <div className="border border-[#8b0000]/15 overflow-hidden" style={{ background: '#0f0505' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b0000]/20">
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Mesa</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Local</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Cap.</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">Cambiar a</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tables.map((t, i) => (
                <tr key={t.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6] font-semibold">#{t.number}</td>
                  <td className="px-4 py-3 text-[#b08080]">{warehouseName(t.warehouse)}</td>
                  <td className="px-4 py-3 text-[#b08080]">{t.capacity} pers.</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {NEXT_STATUS[t.status]?.map(s => (
                        <button key={s} onClick={() => handleStatus(t.id, s)}
                          className="text-xs px-2 py-0.5 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] hover:border-[#8b0000] transition">
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(t.id)}
                      className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay mesas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
