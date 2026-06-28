'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getRoutes, createRoute, deleteRoute, createRouteStop, deleteRouteStop,
  getWarehouses, Route, Warehouse, RouteStopPayload,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

export default function RutasPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  // form nueva ruta
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeForm, setRouteForm] = useState({ name: '', origin_warehouse: '' });
  const [savingRoute, setSavingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  // form nueva parada
  const [stopForms, setStopForms] = useState<Record<number, RouteStopPayload & { show: boolean }>>({});

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [r, w] = await Promise.all([getRoutes(), getWarehouses()]);
    setRoutes(r);
    setWarehouses(w);
    setLoading(false);
  }

  async function handleCreateRoute(e: React.FormEvent) {
    e.preventDefault();
    setSavingRoute(true);
    setRouteError('');
    try {
      await createRoute({ name: routeForm.name, origin_warehouse: Number(routeForm.origin_warehouse) });
      setShowRouteForm(false);
      setRouteForm({ name: '', origin_warehouse: '' });
      load();
    } catch (err: unknown) {
      setRouteError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSavingRoute(false);
    }
  }

  async function handleDeleteRoute(id: number) {
    if (!confirm('¿Eliminar esta ruta y todas sus paradas?')) return;
    try {
      await deleteRoute(id);
      load();
    } catch {
      alert('No se puede eliminar: tiene pedidos asociados.');
    }
  }

  function openStopForm(routeId: number, nextOrder: number) {
    setStopForms(p => ({
      ...p,
      [routeId]: { show: true, route: routeId, stop_order: nextOrder, address: '', city: '', estimated_arrival: '' },
    }));
  }

  async function handleCreateStop(routeId: number) {
    const sf = stopForms[routeId];
    if (!sf) return;
    const payload: RouteStopPayload = {
      route: sf.route,
      stop_order: sf.stop_order,
      address: sf.address,
      city: sf.city,
      ...(sf.estimated_arrival ? { estimated_arrival: sf.estimated_arrival } : {}),
    };
    await createRouteStop(payload);
    setStopForms(p => { const n = { ...p }; delete n[routeId]; return n; });
    load();
  }

  async function handleDeleteStop(stopId: number) {
    if (!confirm('¿Eliminar esta parada?')) return;
    await deleteRouteStop(stopId);
    load();
  }

  const warehouseName = (id: number) => warehouses.find(w => w.id === id)?.name ?? `#${id}`;

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
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Rutas</h1>
            <p className="text-[#b08080] text-xs mt-1">{routes.length} rutas registradas</p>
          </div>
          <button onClick={() => { setShowRouteForm(!showRouteForm); setRouteError(''); }}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nueva ruta
          </button>
        </div>

        {showRouteForm && (
          <form onSubmit={handleCreateRoute}
            className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            style={{ background: '#0f0505' }}>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Nombre *</label>
              <input value={routeForm.name} onChange={e => setRouteForm(p => ({ ...p, name: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
            </div>
            <div>
              <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Local origen *</label>
              <select value={routeForm.origin_warehouse} onChange={e => setRouteForm(p => ({ ...p, origin_warehouse: e.target.value }))} required
                className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]">
                <option value="">Seleccionar</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingRoute}
                className="flex-1 bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] py-2.5 text-xs uppercase tracking-wide transition disabled:opacity-40">
                {savingRoute ? '...' : 'Crear'}
              </button>
              <button type="button" onClick={() => setShowRouteForm(false)}
                className="px-3 border border-[#8b0000]/30 text-[#b08080] hover:text-[#f0e6e6] transition text-xs">✕</button>
            </div>
            {routeError && <p className="col-span-3 text-[#c0392b] text-xs">{routeError}</p>}
          </form>
        )}

        <div className="space-y-3">
          {routes.map(route => {
            const isOpen = expanded === route.id;
            const sf = stopForms[route.id];
            return (
              <div key={route.id} className="border border-[#8b0000]/20" style={{ background: '#0f0505' }}>
                {/* cabecera ruta */}
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => setExpanded(isOpen ? null : route.id)}
                    className="flex items-center gap-3 text-left flex-1">
                    <span className={`text-[#c0392b] text-xs transition ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    <span className="text-[#f0e6e6] font-semibold text-sm">{route.name}</span>
                    <span className="text-[#b08080] text-xs">— desde {warehouseName(route.origin_warehouse)}</span>
                    <span className="text-[#b08080]/50 text-xs ml-2">{route.stops.length} paradas</span>
                  </button>
                  <button onClick={() => handleDeleteRoute(route.id)}
                    className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition ml-4">Eliminar</button>
                </div>

                {isOpen && (
                  <div className="border-t border-[#8b0000]/10 px-4 pb-4 pt-3">
                    {route.stops.length > 0 && (
                      <table className="w-full text-sm mb-3">
                        <thead>
                          <tr className="border-b border-[#8b0000]/10">
                            <th className="text-left py-1.5 text-[#b08080] text-xs uppercase tracking-wide w-12">Orden</th>
                            <th className="text-left py-1.5 text-[#b08080] text-xs uppercase tracking-wide">Dirección</th>
                            <th className="text-left py-1.5 text-[#b08080] text-xs uppercase tracking-wide">Ciudad</th>
                            <th className="text-left py-1.5 text-[#b08080] text-xs uppercase tracking-wide">Llegada est.</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {route.stops.map(stop => (
                            <tr key={stop.id} className="border-b border-[#8b0000]/5">
                              <td className="py-2 text-[#c0392b] font-mono text-xs">{stop.stop_order}</td>
                              <td className="py-2 text-[#f0e6e6] text-xs pr-4">{stop.address}</td>
                              <td className="py-2 text-[#b08080] text-xs pr-4">{stop.city}</td>
                              <td className="py-2 text-[#b08080] text-xs">{stop.estimated_arrival ?? '—'}</td>
                              <td className="py-2 text-right">
                                <button onClick={() => handleDeleteStop(stop.id)}
                                  className="text-xs text-[#c0392b]/50 hover:text-[#c0392b] transition">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {sf?.show ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                        <div>
                          <label className="text-[#b08080] text-xs block mb-1">Orden</label>
                          <input type="number" min="1" value={sf.stop_order}
                            onChange={e => setStopForms(p => ({ ...p, [route.id]: { ...p[route.id], stop_order: Number(e.target.value) } }))}
                            className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-2 py-1.5 text-xs focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[#b08080] text-xs block mb-1">Dirección</label>
                          <input value={sf.address}
                            onChange={e => setStopForms(p => ({ ...p, [route.id]: { ...p[route.id], address: e.target.value } }))}
                            className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-2 py-1.5 text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[#b08080] text-xs block mb-1">Ciudad</label>
                          <input value={sf.city}
                            onChange={e => setStopForms(p => ({ ...p, [route.id]: { ...p[route.id], city: e.target.value } }))}
                            className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-2 py-1.5 text-xs focus:outline-none" />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleCreateStop(route.id)}
                            className="flex-1 bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] py-1.5 text-xs transition">
                            Agregar
                          </button>
                          <button onClick={() => setStopForms(p => { const n = { ...p }; delete n[route.id]; return n; })}
                            className="px-2 border border-[#8b0000]/30 text-[#b08080] text-xs">✕</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openStopForm(route.id, route.stops.length + 1)}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] border border-[#8b0000]/20 px-3 py-1.5 transition">
                        + Agregar parada
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {routes.length === 0 && (
            <div className="border border-[#8b0000]/15 py-12 text-center" style={{ background: '#0f0505' }}>
              <p className="text-[#b08080]/40 text-sm">No hay rutas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
