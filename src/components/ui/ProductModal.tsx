'use client';
import { useEffect } from 'react';

export interface ProductDetail {
  id: number;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  stock: number;
  ingredients: string[];
  is_featured: boolean;
}

interface Props {
  product: ProductDetail | null;
  onClose: () => void;
  onAddToCart?: (product: ProductDetail) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: Props) {
  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const hasIngredients = product.ingredients && product.ingredients.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4, 1, 1, 0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-sm overflow-hidden flex"
        style={{
          background: '#0d0905',
          border: '1px solid rgba(196, 154, 108, 0.35)',
          boxShadow: '0 0 80px rgba(139,0,0,0.2), 0 25px 60px rgba(0,0,0,0.7)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* kanji top-right */}
        <div className="absolute top-4 right-4 z-10 border border-[#c49a6c]/50 px-1.5 py-1 text-center">
          <span className="text-[#c49a6c] text-xs leading-none block">人</span>
          <span className="text-[#c49a6c] text-xs leading-none block">気</span>
        </div>

        {/* close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 text-[#c49a6c]/60 hover:text-[#c49a6c] transition text-lg leading-none"
        >
          ✕
        </button>

        {/* LEFT — image */}
        <div className="w-[42%] shrink-0 p-6 flex flex-col items-center justify-center"
          style={{ borderRight: '1px solid rgba(196,154,108,0.15)' }}>
          <div className="w-full aspect-[3/4] rounded-sm overflow-hidden relative"
            style={{ border: '1px solid rgba(196,154,108,0.3)', background: '#160e08' }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,108,0.4)" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[#c49a6c]/40 text-[10px] tracking-[0.4em] uppercase">Imagen del platillo</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — info */}
        <div className="flex-1 flex flex-col overflow-y-auto p-7 pt-12">
          {/* name */}
          <h2 className="text-2xl font-bold text-[#f0e6e6] text-center tracking-wide uppercase mb-3">
            {product.name}
          </h2>

          {/* divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#c49a6c]/30" />
            <span className="text-[#c0392b] text-base">✿</span>
            <div className="h-px flex-1 bg-[#c49a6c]/30" />
          </div>

          {/* description */}
          {product.description && (
            <p className="text-[#b08080] text-xs leading-relaxed text-center mb-5 px-2">
              {product.description}
            </p>
          )}

          {/* ingredients */}
          {hasIngredients && (
            <div className="mb-5">
              <p className="text-[#c49a6c] text-[10px] tracking-[0.5em] uppercase text-center mb-3">
                Ingredientes
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {product.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 border-b border-[#c49a6c]/10 pb-2">
                    <span className="text-[#c49a6c] text-xs shrink-0">✦</span>
                    <span className="text-[#d4b896] text-xs">{ing}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* spacer */}
          <div className="flex-1" />

          {/* bottom: price + button */}
          <div className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid rgba(196,154,108,0.15)' }}>
            <span className="text-[#c0392b] text-2xl font-bold">
              S/{Number(product.unit_price).toFixed(2)}
            </span>
            <button
              disabled={product.stock === 0}
              onClick={() => onAddToCart?.(product)}
              className="flex items-center gap-2 px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: '1px solid rgba(196,154,108,0.5)',
                color: '#c49a6c',
              }}
              onMouseEnter={e => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,154,108,0.1)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <span>+</span>
              <span>{product.stock === 0 ? 'Agotado' : 'Agregar al pedido'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
