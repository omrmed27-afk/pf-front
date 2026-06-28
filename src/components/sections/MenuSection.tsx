interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  unit_price: string;
  stock: number;
  image_url: string | null;
}

interface Props { products: Product[]; }

export default function MenuSection({ products }: Props) {
  return (
    <section id="menu" className="py-24 relative">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8b0000]" />
            <span className="text-[#c0392b] text-xs tracking-[0.4em] uppercase">Nuestra Carta</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#8b0000]" />
          </div>
          <h2 className="text-4xl font-bold text-[#f0e6e6]">Menú</h2>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[#b08080]/50 italic">No hay platos disponibles por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id}
                className="group border border-[#8b0000]/20 hover:border-[#8b0000]/60 transition-all duration-300 overflow-hidden"
                style={{ background: '#110606' }}>
                <div className="h-52 overflow-hidden relative" style={{ background: '#1a0606' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-10">🍜</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110606] via-transparent to-transparent" />
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
                  <span className={`text-xs px-2 py-0.5 border ${
                    p.stock > 0
                      ? 'border-[#8b0000]/30 text-[#c0392b] bg-[#8b0000]/10'
                      : 'border-gray-700 text-gray-600'
                  }`}>
                    {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
