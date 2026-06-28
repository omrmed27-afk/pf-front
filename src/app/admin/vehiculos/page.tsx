'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getTransports, createTransport, updateTransport, deleteTransport,
  Transport, TransportPayload,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const VEHICLE_LABEL: Record<string, string> = {
  motorcycle: 'Moto',
  van: 'Furgoneta',
  bicycle: 'Bicicleta',
};

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponible',
  in_use: 'En uso',
  maintenance: 'Mantenimiento',
};

const STATUS_COLOR: Record<string, string> = {
  available: 'text-green-400 border-green-800/40 bg-green-900/10',
  in_use: 'text-yellow-400 border-yellow-800/40 bg-yellow-900/10',
  maintenance: 'text-[#c0392b] border-[#8b0000]/40 bg-[#8b0000]/10',
};

const EMPTY: TransportPayload = { license_plate: '', vehicle_type: 'motorcycle', brand: '', model: '', status: 'available' };

export default function VehiculosPage() {
  const router = useRouter();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transport | null>(null);
  const [form, setForm] = useState<TransportPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getTransports();
    setTransports(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(t: Transport) {
    setEditing(t);
    setForm({ license_plate: t.license_plate, vehicle_type: t.vehicle_type, brand: t.brand, model: t.model, status: t.status });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await updateTransport(editing.id, form);
      else await createTransport(form);
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await deleteTransport(id);
      load();
    } catch {
      alert('No se puede eliminar: tiene pedidos asociados.');
    }
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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Vehículos</h1>
            <p className="text-[#b08080] text-xs mt-1">{transports.length} vehículos registrados</p>
          </div>
          <button onClick={openCreate}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nuevo vehículo
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ background: '#0f0505' }}>
            <h2 className="col-span-2 text-[#f0e6e6] text-sm font-semibold mb-1">
              {editing ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h2>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Patente *</label>
              <input value={form.license_plate} onChange={e => setForm(p => ({ ...p, license_plate: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Tipo *</label>
              <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value="motorcycle">Moto</option>
                <option value="van">Furgoneta</option>
                <option value="bicycle">Bicicleta</option>
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Marca</label>
              <input value={form.brand ?? ''} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Modelo</label>
              <input value={form.model ?? ''} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Estado</label>
              <select value={form.status ?? 'available'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value="available">Disponible</option>
                <option value="in_use">En uso</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
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
                {['Patente', 'Tipo', 'Marca / Modelo', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transports.map((t, i) => (
                <tr key={t.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6] font-semibold font-mono">{t.license_plate}</td>
                  <td className="px-4 py-3 text-[#b08080]">{VEHICLE_LABEL[t.vehicle_type]}</td>
                  <td className="px-4 py-3 text-[#b08080]">{[t.brand, t.model].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => openEdit(t)}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] transition">Editar</button>
                      <button onClick={() => handleDelete(t.id)}
                        className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {transports.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay vehículos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
