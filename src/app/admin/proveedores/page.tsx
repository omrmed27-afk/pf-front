'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  Supplier, SupplierPayload,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const EMPTY: SupplierPayload = { name: '', email: '', phone: '', address: '', contact_name: '' };

export default function ProveedoresPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getSuppliers();
    setSuppliers(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone, address: s.address, contact_name: s.contact_name });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await updateSupplier(editing.id, form);
      else await createSupplier(form);
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      await deleteSupplier(id);
      load();
    } catch {
      alert('No se puede eliminar: tiene productos asociados.');
    }
  }

  const F = (k: keyof SupplierPayload, v: string) => setForm(p => ({ ...p, [k]: v }));

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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Proveedores</h1>
            <p className="text-[#b08080] text-xs mt-1">{suppliers.length} proveedores registrados</p>
          </div>
          <button onClick={openCreate}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nuevo proveedor
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ background: '#0f0505' }}>
            <h2 className="col-span-2 text-[#f0e6e6] text-sm font-semibold mb-1">
              {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h2>
            {([
              ['name', 'Nombre *'],
              ['contact_name', 'Contacto'],
              ['email', 'Email'],
              ['phone', 'Teléfono'],
              ['address', 'Dirección'],
            ] as const).map(([k, label]) => (
              <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
                <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">{label}</label>
                <input value={form[k] ?? ''} onChange={e => F(k, e.target.value)}
                  required={k === 'name'}
                  className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>
            ))}
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
                {['Nombre', 'Contacto', 'Email', 'Teléfono', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr key={s.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#f0e6e6] font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-[#b08080]">{s.contact_name || '—'}</td>
                  <td className="px-4 py-3 text-[#b08080]">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-[#b08080]">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => openEdit(s)}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] transition">Editar</button>
                      <button onClick={() => handleDelete(s.id)}
                        className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay proveedores registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
