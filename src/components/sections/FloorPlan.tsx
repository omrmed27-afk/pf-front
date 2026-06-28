'use client';
import { useState } from 'react';
import { Table, Warehouse, findOrCreateCustomer, createReservation } from '@/lib/adminApi';

// Posiciones calculadas sobre imagen 1537 × 1023 px con badges numerados
const TABLE_POSITIONS: Record<number, { left: string; top: string }> = {
  1:  { left: '24%', top: '29%' },
  2:  { left: '36%', top: '29%' },
  3:  { left: '48%', top: '29%' },
  4:  { left: '60%', top: '29%' },
  5:  { left: '23%', top: '46%' },
  6:  { left: '60%', top: '46%' },
  7:  { left: '23%', top: '60%' },
  8:  { left: '60%', top: '60%' },
  9:  { left: '24%', top: '75%' },
  10: { left: '36%', top: '75%' },
  11: { left: '48%', top: '75%' },
  12: { left: '60%', top: '75%' },
};

const STATUS_STYLE = {
  available: { bg: '#15803d', border: '#22c55e', label: 'Disponible', glow: '#22c55e66' },
  reserved:  { bg: '#92400e', border: '#f59e0b', label: 'Reservada',  glow: 'none' },
  occupied:  { bg: '#7f1d1d', border: '#8b0000', label: 'Ocupada',    glow: 'none' },
};

const inputClass = "w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 focus:outline-none focus:border-[#c0392b] transition text-sm placeholder:text-[#b08080]/30";
const labelClass = "text-[#b08080] text-xs uppercase tracking-[0.15em] block mb-1";

export default function FloorPlan({ tables, warehouses }: { tables: Table[]; warehouses: Warehouse[] }) {
  const [selected, setSelected] = useState<Table | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', date: '', time: '', party_size: '2', floor: '1', notes: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function getWarehouse(warehouseId: number) {
    return warehouses.find(w => w.id === warehouseId) ?? null;
  }

  function handleTableClick(table: Table) {
    if (table.status !== 'available') return;
    setSelected(table);
    setState('idle');
    setErrorMsg('');
    setForm(f => ({ ...f, floor: '1' }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setState('loading');
    setErrorMsg('');
    try {
      const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
      const customerId = await findOrCreateCustomer(fullName, form.email);
      const warehouse = getWarehouse(selected.warehouse);
      const floorNote = warehouse && warehouse.floors > 1 ? `Piso ${form.floor}. ` : '';
      await createReservation({
        customer: customerId,
        table: selected.id,
        date: form.date,
        time: form.time,
        party_size: Number(form.party_size),
        notes: floorNote + (form.notes || ''),
      });
      setState('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar la reserva.');
      setState('error');
    }
  }

  function handleNewReservation() {
    setSelected(null);
    setState('idle');
    setErrorMsg('');
    setForm({ first_name: '', last_name: '', email: '', date: '', time: '', party_size: '2', floor: '1', notes: '' });
  }

  const warehouse = selected ? getWarehouse(selected.warehouse) : null;

  return (
    <section className="py-10" style={{ background: '#080404' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Leyenda */}
        <div className="flex items-center gap-8 justify-center mb-6">
          {Object.entries(STATUS_STYLE).map(([status, { bg, border, label }]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: bg, border: `1.5px solid ${border}` }} />
              <span className="text-[#b08080] text-xs tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Plano ── */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            <div
              className="relative w-full border border-[#8b0000]/20 overflow-hidden"
              style={{ paddingBottom: '67%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/restaurante-plano.png"
                alt="Plano del restaurante"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {tables.map(table => {
                const pos = TABLE_POSITIONS[table.number];
                if (!pos) return null;
                const style = STATUS_STYLE[table.status] ?? STATUS_STYLE.occupied;
                const isAvailable = table.status === 'available';
                const isSelected = selected?.id === table.id;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    disabled={!isAvailable}
                    title={`Mesa ${table.number} — ${style.label}`}
                    style={{
                      position: 'absolute',
                      left: pos.left,
                      top: pos.top,
                      transform: `translate(-50%, -50%) scale(${isSelected ? 1.2 : 1})`,
                      background: `${style.bg}dd`,
                      border: `2px solid ${isSelected ? '#f0e6e6' : style.border}`,
                      boxShadow: isSelected
                        ? '0 0 20px #f0e6e666'
                        : isAvailable ? `0 0 14px ${style.glow}` : 'none',
                      width: '2.8rem',
                      height: '2.8rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f0e6e6',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                    }}
                  >
                    {table.number}
                  </button>
                );
              })}

              {tables.length === 0 && (
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <span className="bg-black/60 text-[#b08080] text-xs px-4 py-2">
                    No hay mesas cargadas — ejecutá seed_tables
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-[#b08080]/40 text-xs mt-3 tracking-wide">
              Hacé click en una mesa verde para reservar
            </p>
          </div>

          {/* ── Panel de detalles / formulario ── */}
          <div className="w-full lg:w-80 lg:shrink-0 border border-[#8b0000]/30 p-6" style={{ background: '#0f0505' }}>
            {state === 'success' ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="text-[#c0392b] text-3xl mb-4">✦</div>
                <h3 className="text-[#f0e6e6] text-lg font-bold mb-1">¡Reserva confirmada!</h3>
                <p className="text-[#b08080] text-xs mb-6">Mesa {selected?.number} reservada. Te esperamos.</p>
                <button
                  onClick={handleNewReservation}
                  className="text-[#c0392b] border border-[#8b0000]/40 px-5 py-2 text-xs tracking-[0.2em] uppercase hover:bg-[#8b0000]/10 transition"
                >
                  Nueva reserva
                </button>
              </div>
            ) : !selected ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="text-[#8b0000]/60 text-4xl mb-4">🪑</div>
                <p className="text-[#b08080] text-sm">Seleccioná una mesa disponible del plano</p>
              </div>
            ) : (
              <>
                <div className="mb-5 pb-4 border-b border-[#8b0000]/20">
                  <span className="text-[#c0392b] text-xs tracking-[0.3em] uppercase">Reserva</span>
                  <h2 className="text-[#f0e6e6] text-xl font-bold mt-0.5">Mesa {selected.number}</h2>
                  <p className="text-[#b08080] text-xs mt-1">Capacidad: {selected.capacity} personas</p>
                  {warehouse && (
                    <p className="text-[#b08080] text-xs mt-0.5">
                      Local: {warehouse.name}
                      {warehouse.floors > 1 && ` · ${warehouse.floors} pisos`}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Nombre *</label>
                      <input name="first_name" value={form.first_name} onChange={handleChange} required className={inputClass} placeholder="Ana" />
                    </div>
                    <div>
                      <label className={labelClass}>Apellido *</label>
                      <input name="last_name" value={form.last_name} onChange={handleChange} required className={inputClass} placeholder="García" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="tu@email.com" />
                  </div>

                  {/* Local (read-only info) */}
                  {warehouse && (
                    <div>
                      <label className={labelClass}>Local</label>
                      <div className={`${inputClass} text-[#b08080] cursor-default`}>{warehouse.name}</div>
                    </div>
                  )}

                  {/* Piso — solo si el local tiene más de 1 piso */}
                  {warehouse && warehouse.floors > 1 && (
                    <div>
                      <label className={labelClass}>Piso *</label>
                      <select name="floor" value={form.floor} onChange={handleChange} className={inputClass}>
                        {Array.from({ length: warehouse.floors }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>Piso {n}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Fecha *</label>
                      <input name="date" type="date" value={form.date} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Hora *</label>
                      <input name="time" type="time" value={form.time} onChange={handleChange} required className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Personas *</label>
                    <select name="party_size" value={form.party_size} onChange={handleChange} className={inputClass}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>

                  {state === 'error' && (
                    <p className="text-[#c0392b] text-xs">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="bg-[#8b0000] disabled:opacity-40 text-[#f0e6e6] py-3 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-[#c0392b] transition-all duration-300 mt-1"
                  >
                    {state === 'loading' ? 'Procesando...' : 'Confirmar Reserva →'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
