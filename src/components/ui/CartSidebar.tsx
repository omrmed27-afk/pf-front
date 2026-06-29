'use client';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { findOrCreateCustomer } from '@/lib/adminApi';

const inputClass = "w-full bg-[#0a0303] border border-[#c49a6c]/20 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c49a6c]/50 transition placeholder:text-[#b08080]/30";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleClose() {
    setCheckout(false);
    setState('idle');
    setForm({ name: '', email: '', address: '' });
    closeCart();
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      await findOrCreateCustomer(form.name.trim(), form.email.trim(), form.address.trim());
      setState('success');
      clearCart();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el pedido.');
      setState('error');
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(4,1,1,0.7)', backdropFilter: 'blur(3px)' }}
        onClick={handleClose}
      />

      {/* sidebar */}
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(380px, 100vw)',
          background: '#0d0905',
          borderLeft: '1px solid rgba(196,154,108,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(196,154,108,0.15)' }}>
          <div className="flex items-center gap-3">
            <span className="text-[#c49a6c] text-lg">🛍</span>
            <h2 className="text-[#f0e6e6] font-semibold tracking-[0.15em] uppercase text-sm">
              {checkout ? 'Confirmar pedido' : 'Mi Pedido'}
            </h2>
            {!checkout && items.length > 0 && (
              <span className="bg-[#8b0000] text-[#f0e6e6] text-[10px] px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {checkout && state !== 'success' && (
              <button onClick={() => setCheckout(false)}
                className="text-[#c49a6c]/60 hover:text-[#c49a6c] transition text-xs tracking-wide">
                ← Volver
              </button>
            )}
            <button onClick={handleClose} className="text-[#c49a6c]/60 hover:text-[#c49a6c] transition text-lg">✕</button>
          </div>
        </div>

        {/* ── CHECKOUT VIEW ── */}
        {checkout ? (
          <div className="flex-1 flex flex-col px-6 py-6">
            {state === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="text-[#c49a6c] text-4xl mb-2">✦</div>
                <h3 className="text-[#f0e6e6] text-lg font-bold">¡Pedido recibido!</h3>
                <p className="text-[#b08080] text-sm leading-relaxed max-w-xs">
                  Gracias por tu pedido. Nuestro equipo lo estará preparando en breve.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-6 py-2.5 text-xs tracking-[0.3em] uppercase text-[#c49a6c] transition hover:text-[#f0e6e6]"
                  style={{ border: '1px solid rgba(196,154,108,0.4)' }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* resumen */}
                <div className="mb-5 p-4 space-y-2" style={{ background: '#160e08', border: '1px solid rgba(196,154,108,0.1)' }}>
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-xs">
                      <span className="text-[#d4b896]">{item.product.name} × {item.quantity}</span>
                      <span className="text-[#c0392b] font-semibold">
                        S/{(Number(item.product.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 mt-2 text-sm font-bold"
                    style={{ borderTop: '1px solid rgba(196,154,108,0.15)' }}>
                    <span className="text-[#b08080]">Total</span>
                    <span className="text-[#f0e6e6]">S/{total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleConfirm} className="flex flex-col gap-4 flex-1">
                  <div>
                    <label className="text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5">Nombre *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required className={inputClass} placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5">Email *</label>
                    <input
                      type="email" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required className={inputClass} placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5">Dirección *</label>
                    <input
                      value={form.address}
                      onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      required className={inputClass} placeholder="Av. Principal 123, Ciudad"
                    />
                  </div>

                  {state === 'error' && (
                    <p className="text-[#c0392b] text-xs">{errorMsg}</p>
                  )}

                  <button
                    type="submit" disabled={state === 'loading'}
                    className="mt-auto w-full py-3.5 text-xs tracking-[0.35em] uppercase font-semibold transition-all duration-300 disabled:opacity-40"
                    style={{ background: '#8b0000', color: '#f0e6e6' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#c0392b'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8b0000'; }}
                  >
                    {state === 'loading' ? 'Procesando...' : 'Enviar pedido →'}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ── CART ITEMS VIEW ── */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <span className="text-5xl opacity-10">🍜</span>
                  <p className="text-[#b08080]/50 text-sm italic">Tu pedido está vacío</p>
                  <button onClick={() => { handleClose(); router.push('/menu'); }}
                    className="text-[#c49a6c] text-xs tracking-[0.3em] uppercase hover:text-[#f0e6e6] transition">
                    Ver menú →
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3"
                    style={{ background: '#160e08', border: '1px solid rgba(196,154,108,0.12)' }}>
                    <div className="w-16 h-16 shrink-0 overflow-hidden" style={{ background: '#1e1008' }}>
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name}
                          className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl opacity-20">🍜</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[#f0e6e6] text-xs font-semibold truncate mb-1">{item.product.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#c49a6c] hover:bg-[#c49a6c]/10 transition text-sm"
                            style={{ border: '1px solid rgba(196,154,108,0.3)' }}
                          >−</button>
                          <span className="text-[#f0e6e6] text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#c49a6c] hover:bg-[#c49a6c]/10 transition text-sm"
                            style={{ border: '1px solid rgba(196,154,108,0.3)' }}
                          >+</button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#c0392b] text-xs font-bold">
                            S/{(Number(item.product.unit_price) * item.quantity).toFixed(2)}
                          </span>
                          <button onClick={() => removeItem(item.product.id)}
                            className="text-[#b08080]/40 hover:text-[#c0392b] transition text-xs">✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <div className="px-5 py-5 space-y-4"
                style={{ borderTop: '1px solid rgba(196,154,108,0.15)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[#b08080] text-xs tracking-[0.2em] uppercase">Total</span>
                  <span className="text-[#f0e6e6] text-xl font-bold">S/{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setCheckout(true)}
                  className="w-full py-3 text-xs tracking-[0.35em] uppercase font-semibold transition-all duration-300"
                  style={{ background: '#8b0000', color: '#f0e6e6' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#c0392b'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8b0000'; }}
                >
                  Confirmar pedido →
                </button>
                <button onClick={clearCart}
                  className="w-full text-[#b08080]/50 text-[10px] tracking-[0.3em] uppercase hover:text-[#b08080] transition">
                  Vaciar carrito
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
