'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductModal, { ProductDetail } from '@/components/ui/ProductModal';
import { useCart } from '@/context/CartContext';

interface Props {
  products: ProductDetail[];
}

export default function FeaturedGrid({ products }: Props) {
  const [selected, setSelected] = useState<ProductDetail | null>(null);
  const { addItem } = useCart();

  function handleAddToCart(product: ProductDetail) {
    addItem(product, {});
    setSelected(null);
  }

  return (
    <>
      <div className="flex flex-col md:grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start md:items-center h-full">
        {/* LEFT */}
        <div className="pt-2 md:pt-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-6 bg-[#8b0000]" />
            <span className="text-[#c0392b] text-[10px] tracking-[0.4em] uppercase">Nuestro menú</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#f0e6e6] leading-tight mb-2 md:mb-3">Platos Destacados</h2>
          <p className="text-[#b08080] text-xs leading-relaxed mb-4 md:mb-5 hidden md:block">
            Explora nuestra selección de platos preparados con pasión y dedicación.
          </p>
          <Link href="/menu"
            className="text-[#c0392b] text-xs tracking-[0.2em] uppercase hover:text-[#e74c3c] transition flex items-center gap-2">
            Ver menú completo →
          </Link>
        </div>

        {/* RIGHT — tarjetas */}
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-[#8b0000]/10 w-full" style={{ background: '#0f0505' }}>
            <p className="text-[#b08080]/40 text-sm italic">Próximamente...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="group text-left border border-[#8b0000]/20 hover:border-[#8b0000]/50 transition-all duration-300 overflow-hidden"
                style={{ background: '#110606' }}
              >
                <div className="h-36 md:h-40 overflow-hidden relative" style={{ background: '#1a0606' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-10">🍜</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110606] via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-[#f0e6e6] font-semibold text-xs leading-tight">{p.name}</h3>
                    <span className="text-[#c0392b] font-bold text-xs whitespace-nowrap">
                      S/{Number(p.unit_price).toFixed(2)}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-[#b08080] text-[10px] leading-relaxed line-clamp-2">{p.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
