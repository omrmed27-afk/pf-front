'use client';
import { useState } from 'react';
import ProductModal, { ProductDetail } from '@/components/ui/ProductModal';
import { useCart } from '@/context/CartContext';

interface Props {
  products: ProductDetail[];
}

export default function MenuGrid({ products }: Props) {
  const [selected, setSelected] = useState<ProductDetail | null>(null);
  const { addItem } = useCart();

  function handleAddToCart(product: ProductDetail) {
    addItem(product, {});
    setSelected(null);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <span className="text-6xl opacity-10">🍜</span>
        <p className="text-[#b08080]/50 text-sm mt-4 italic">No hay platos disponibles por el momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="group text-left border border-[#8b0000]/20 hover:border-[#8b0000]/50 transition-all duration-300 overflow-hidden w-full"
            style={{ background: '#110606' }}
          >
            <div className="h-52 overflow-hidden relative" style={{ background: '#1a0606' }}>
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-10">🍜</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#110606] via-transparent to-transparent" />
              {p.is_featured && (
                <div className="absolute top-3 right-3 bg-[#8b0000]/80 px-2 py-0.5">
                  <span className="text-[#f0e6e6] text-[10px] tracking-[0.3em] uppercase">Destacado</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-[#f0e6e6] font-semibold text-base group-hover:text-[#e8d0d0] transition">
                  {p.name}
                </h3>
                <span className="text-[#c0392b] font-bold text-sm whitespace-nowrap">
                  S/{Number(p.unit_price).toFixed(2)}
                </span>
              </div>
              {p.description && (
                <p className="text-[#b08080] text-xs leading-relaxed line-clamp-2 mb-3">{p.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 border ${
                  p.stock > 0
                    ? 'border-[#8b0000]/30 text-[#c0392b] bg-[#8b0000]/10'
                    : 'border-gray-700 text-gray-600'
                }`}>
                  {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
                </span>
                <span className="text-[#c49a6c]/50 text-[10px] tracking-[0.2em] uppercase group-hover:text-[#c49a6c] transition">
                  Ver detalles →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
