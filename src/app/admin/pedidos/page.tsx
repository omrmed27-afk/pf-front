'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getShipments, createShipment, dispatchShipment, deliverShipment, cancelShipment,
  getWarehouses, getCustomers, getDrivers, getTransports, getRoutes,
  Shipment, ShipmentPayload, Warehouse, Customer, Driver, Transport, Route,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-800/40 bg-yellow-900/10',
  in_transit: 'text-blue-400 border-blue-800/40 bg-blue-900/10',
  delivered: 'text-green-400 border-green-800/40 bg-green-900/10',
  cancelled: 'text-[#c0392b] border-[#8b0000]/40 bg-[#8b0000]/10',
  returned: 'text-[#b08080] border-[#8b0000]/20 bg-[#8b0000]/5',
};

const EMPTY_FORM: ShipmentPayload = {
  customer: 0,
  origin_warehouse: 0,
  destination_address: '',
  destination_city: '',
  estimated_delivery_date: '',
};

export default function PedidosPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ShipmentPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // dispatch modal
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ driver: '', transport: '', route: '' });
  const [dispatchError, setDispatchError] = useState('');

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [s, w, c, d, t, r] = await Promise.all([
      getShipments(), getWarehouses(), getCustomers(), getDrivers(), getTransports(), getRoutes(),
    ]);
    setShipments(s);
    setWarehouses(w);
    setCustomers(c);
    setDrivers(d);
    setTransports(t);
    setRoutes(r);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createShipment(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!dispatching) return;
    setDispatchError('');
    try {
      await dispatchShipment(dispatching, Number(dispatchForm.driver), Number(dispatchForm.transport), Number(dispatchForm.route));
      setDispatching(null);
      load();
    } catch (err: unknown) {
      setDispatchError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function handleAction(id: number, action: 'deliver' | 'cancel') {
    try {
      if (action === 'deliver') await deliverShipment(id);
      else await cancelShipment(id);
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  const filtered = filter === 'all' ? shipments : shipments.filter(s => s.status === filter);
  const customerName = (id: number) => customers.find(c => c.id === id)?.name ?? `#${id}`;
  const warehouseName = (id: number) => warehouses.find(w => w.id === id)?.name ?? `#${id}`;

  const FILTER_TABS = ['all', 'pending', 'in_transit', 'delivered', 'cancelled'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080404' }}>
      <span className="text-[#b08080] text-sm">Cargando...</span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080404' }}>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Pedidos</h1>
            <p className="text-[#b08080] text-xs mt-1">{shipments.length} pedidos registrados</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nuevo pedido
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ background: '#0f0505' }}>
            <h2 className="col-span-2 text-[#f0e6e6] text-sm font-semibold mb-1">Nuevo pedido</h2>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Cliente *</label>
              <select value={form.customer} onChange={e => setForm(p => ({ ...p, customer: Number(e.target.value) }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value={0}>Seleccionar</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Local origen *</label>
              <select value={form.origin_warehouse} onChange={e => setForm(p => ({ ...p, origin_warehouse: Number(e.target.value) }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value={0}>Seleccionar</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Dirección destino *</label>
              <input value={form.destination_address} onChange={e => setForm(p => ({ ...p, destination_address: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Ciudad destino *</label>
              <input value={form.destination_city} onChange={e => setForm(p => ({ ...p, destination_city: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Fecha entrega estimada *</label>
              <input type="datetime-local" value={form.estimated_delivery_date}
                onChange={e => setForm(p => ({ ...p, estimated_delivery_date: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            {formError && <p className="col-span-2 text-[#c0392b] text-xs">{formError}</p>}
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] text-xs transition">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2 text-xs uppercase tracking-wide transition disabled:opacity-40">
                {saving ? '...' : 'Crear pedido'}
              </button>
            </div>
          </form>
        )}

        {/* filtros */}
        <div className="flex gap-6 mb-6 border-b border-[#8b0000]/15">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`pb-2 text-xs tracking-[0.2em] uppercase transition border-b-2 ${
                filter === f
                  ? 'text-[#f0e6e6] border-[#c0392b]'
                  : 'text-[#b08080]/60 border-transparent hover:text-[#b08080]'
              }`}>
              {f === 'all' ? 'Todos' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="border border-[#8b0000]/15 overflow-x-auto" style={{ background: '#0f0505' }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#8b0000]/20">
                {['Tracking', 'Cliente', 'Destino', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                  <td className="px-4 py-3 text-[#c0392b] font-mono text-xs font-semibold">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-[#f0e6e6] text-xs">{customerName(s.customer)}</td>
                  <td className="px-4 py-3 text-[#b08080] text-xs">{s.destination_city}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border ${STATUS_COLOR[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.status === 'pending' && (
                        <>
                          <button onClick={() => { setDispatching(s.id); setDispatchForm({ driver: '', transport: '', route: '' }); setDispatchError(''); }}
                            className="text-xs px-2 py-0.5 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] transition">
                            Despachar
                          </button>
                          <button onClick={() => handleAction(s.id, 'cancel')}
                            className="text-xs px-2 py-0.5 border border-[#8b0000]/30 text-[#c0392b]/60 hover:text-[#c0392b] transition">
                            Cancelar
                          </button>
                        </>
                      )}
                      {s.status === 'in_transit' && (
                        <button onClick={() => handleAction(s.id, 'deliver')}
                          className="text-xs px-2 py-0.5 border border-green-800/40 text-green-400 hover:bg-green-900/20 transition">
                          Marcar entregado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay pedidos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal dispatch */}
      {dispatching !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <form onSubmit={handleDispatch}
            className="w-full max-w-md border border-[#8b0000]/40 p-6 space-y-4"
            style={{ background: '#0f0505' }}>
            <h2 className="text-[#f0e6e6] font-semibold text-sm">Despachar pedido</h2>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Conductor *</label>
              <select value={dispatchForm.driver} onChange={e => setDispatchForm(p => ({ ...p, driver: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Seleccionar</option>
                {drivers.filter(d => d.status === 'available').map(d => (
                  <option key={d.id} value={d.id}>
                    {[d.user.first_name, d.user.last_name].filter(Boolean).join(' ') || d.user.username} — {d.license_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Vehículo *</label>
              <select value={dispatchForm.transport} onChange={e => setDispatchForm(p => ({ ...p, transport: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Seleccionar</option>
                {transports.filter(t => t.status === 'available').map(t => (
                  <option key={t.id} value={t.id}>{t.license_plate} — {t.brand} {t.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Ruta *</label>
              <select value={dispatchForm.route} onChange={e => setDispatchForm(p => ({ ...p, route: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Seleccionar</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {dispatchError && <p className="text-[#c0392b] text-xs">{dispatchError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setDispatching(null)}
                className="px-4 py-2 border border-[#8b0000]/30 text-[#b08080] text-xs transition">
                Cancelar
              </button>
              <button type="submit"
                className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2 text-xs uppercase tracking-wide transition">
                Confirmar despacho
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
