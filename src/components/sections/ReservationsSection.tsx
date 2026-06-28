'use client';
import { useState } from 'react';
import { findOrCreateCustomer, getAvailableTables, createReservation } from '@/lib/adminApi';

const inputClass = "w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition text-sm placeholder:text-[#b08080]/30";
const labelClass = "text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5";

export default function ReservationsSection() {
  const [form, setForm] = useState({
    name: '', email: '', date: '', time: '', party_size: '2', notes: ''
  });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
      const tables = await getAvailableTables(Number(form.party_size));
      if (tables.length === 0) {
        setErrorMsg('No hay mesas disponibles para esa cantidad de personas. Intentá otra fecha u horario.');
        setState('error');
        return;
      }
      await createReservation({
        customer: customerId,
        table: tables[0].id,
        date: form.date,
        time: form.time,
        party_size: Number(form.party_size),
        notes: form.notes || undefined,
      });
      setState('success');
      setForm({ name: '', email: '', date: '', time: '', party_size: '2', notes: '' });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar la reserva.');
      setState('error');
    }
  }

  return (
    <section id="reservations" className="py-24" style={{ background: '#0c0505' }}>
      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8b0000]" />
            <span className="text-[#c0392b] text-xs tracking-[0.4em] uppercase">Reservá tu lugar</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#8b0000]" />
          </div>
          <h2 className="text-4xl font-bold text-[#f0e6e6]">Reservas</h2>
        </div>

        {state === 'success' ? (
          <div className="text-center py-16 border border-[#8b0000]/30" style={{ background: '#0f0505' }}>
            <div className="text-[#c0392b] text-3xl mb-4">✦</div>
            <h3 className="text-[#f0e6e6] text-xl font-semibold mb-2">¡Reserva confirmada!</h3>
            <p className="text-[#b08080] text-sm mb-8">Tu mesa está reservada. Te esperamos.</p>
            <button onClick={() => setState('idle')}
              className="text-[#c0392b] border border-[#8b0000]/40 px-6 py-2 text-xs tracking-[0.2em] uppercase hover:bg-[#8b0000]/10 transition">
              Nueva reserva
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}
            className="flex flex-col gap-5 border border-[#8b0000]/20 p-8"
            style={{ background: '#0f0505' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Notas especiales</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                placeholder="Alergias, ocasión especial..."
                className={`${inputClass} resize-none`} />
            </div>

            {state === 'error' && (
              <p className="text-[#c0392b] text-sm text-center">{errorMsg}</p>
            )}

            <button type="submit" disabled={state === 'loading'}
              className="bg-[#8b0000] disabled:opacity-40 text-[#f0e6e6] py-4 text-sm tracking-[0.3em] uppercase font-semibold hover:bg-[#c0392b] transition-all duration-300 mt-2">
              {state === 'loading' ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
