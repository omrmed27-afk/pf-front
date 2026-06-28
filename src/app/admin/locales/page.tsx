'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse,
  Warehouse, WarehousePayload,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const EMPTY: WarehousePayload = { name: '', address: '', city: '', country: '', capacity: 0, floors: 1 };

export default function LocalesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<WarehousePayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getWarehouses();
    setWarehouses(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(w: Warehouse) {
    setEditing(w);
    setForm({ name: w.name, address: w.address, city: w.city, country: w.country, capacity: w.capacity, floors: w.floors ?? 1 });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await updateWarehouse(editing.id, form);
      else await createWarehouse(form);
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este local?')) return;
    try {
      await deleteWarehouse(id);
      load();
    } catch {
      alert('No se puede eliminar: tiene mesas o pedidos asociados.');
    }
  }

  const F = (k: keyof WarehousePayload, v: string | number) => setForm(p => ({ ...p, [k]: v }));

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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Locales</h1>
            <p className="text-[#b08080] text-xs mt-1">{warehouses.length} locales registrados</p>
          </div>
          <button onClick={openCreate}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nuevo local
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ background: '#0f0505' }}>
            <h2 className="col-span-2 text-[#f0e6e6] text-sm font-semibold mb-1">
              {editing ? 'Editar local' : 'Nuevo local'}
            </h2>
            {([
              ['name', 'Nombre *', 'text'],
              ['address', 'Dirección *', 'text'],
              ['city', 'Ciudad *', 'text'],
              ['country', 'País *', 'text'],
            ] as const).map(([k, label]) => (
              <div key={k}>
                <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">{label}</label>
                <input value={form[k] as string} onChange={e => F(k, e.target.value)} required
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>
            ))}
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Capacidad *</label>
              <input type="number" min="1" value={form.capacity} onChange={e => F('capacity', Number(e.target.value))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Pisos *</label>
              <input type="number" min="1" value={form.floors ?? 1} onChange={e => F('floors', Number(e.target.value))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            {error && <p className="col-span-2 text-[#c0392b] text-xs">{error}</p>}
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] text-xs transition">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2 text-xs uppercase tracking-wide transition disabled:opacity-40">
                {saving ? '...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        <div className="border border-[#8b0000]/15 overflow-hidden" style={{ background: '#0f0505' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#8b0000]/20">
                {['Nombre', 'Ciudad', 'País', 'Capacidad', 'Pisos', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w, i) => (
                <tr key={w.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6] font-semibold">{w.name}</td>
                  <td className="px-4 py-3 text-[#b08080]">{w.city}</td>
                  <td className="px-4 py-3 text-[#b08080]">{w.country}</td>
                  <td className="px-4 py-3 text-[#b08080]">{w.capacity}</td>
                  <td className="px-4 py-3 text-[#b08080]">{w.floors ?? 1}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => openEdit(w)}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] transition">Editar</button>
                      <button onClick={() => handleDelete(w.id)}
                        className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay locales registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
