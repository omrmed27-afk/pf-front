'use client';
import { useState } from 'react';
import { Table, findOrCreateCustomer, createReservation } from '@/lib/adminApi';

const inputClass = "w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition text-sm placeholder:text-[#b08080]/30";
const labelClass = "text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5";

export default function ReservationModal({ table, onClose, onSuccess }: {
  table: Table;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', date: '', time: '', party_size: '2', notes: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      const customerId = await findOrCreateCustomer(form.name, form.email);
      await createReservation({
        customer: customerId,
        table: table.id,
        date: form.date,
        time: form.time,
        party_size: Number(form.party_size),
        notes: form.notes || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar la reserva.');
      setState('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,4,4,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md border border-[#8b0000]/50 p-8 relative" style={{ background: '#0f0505' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#b08080] hover:text-[#f0e6e6] transition text-lg leading-none">✕</button>

        <div className="mb-6">
          <span className="text-[#c0392b] text-xs tracking-[0.4em] uppercase">Reserva</span>
          <h2 className="text-[#f0e6e6] text-2xl font-bold mt-1">Mesa {table.number}</h2>
          <p className="text-[#b08080] text-xs mt-1">Capacidad: hasta {table.capacity} personas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Tu nombre" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="tu@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Fecha *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora *</label>
              <input name="time" type="time" value={form.time} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Personas *</label>
              <select name="party_size" value={form.party_size} onChange={handleChange} className={inputClass}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea
              name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Alergias, ocasión especial..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {state === 'error' && (
            <p className="text-[#c0392b] text-sm">{errorMsg}</p>
          )}

          <button
            type="submit" disabled={state === 'loading'}
            className="bg-[#8b0000] disabled:opacity-40 text-[#f0e6e6] py-3.5 text-sm tracking-[0.3em] uppercase font-semibold hover:bg-[#c0392b] transition-all duration-300 mt-1"
          >
            {state === 'loading' ? 'Procesando...' : 'Confirmar Reserva →'}
          </button>
        </form>
      </div>
    </div>
  );
}
