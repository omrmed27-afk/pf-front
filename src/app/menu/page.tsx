import { fetchProducts } from '@/lib/api';
import MenuGrid from '@/components/menu/MenuGrid';

export default async function MenuPage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen" style={{ background: '#080404' }}>
      {/* header */}
      <div className="border-b border-[#8b0000]/20 py-16" style={{ background: '#0c0404' }}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-10 bg-[#8b0000]" />
            <span className="text-[#c0392b] text-xs tracking-[0.5em] uppercase">Dragón Rojo</span>
          </div>
          <h1 className="text-4xl font-bold text-[#f0e6e6]">Nuestra Carta</h1>
          <p className="text-[#b08080] text-sm mt-2">{products.length} platos disponibles</p>
        </div>
      </div>

      {/* grid */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <MenuGrid products={products} />
      </div>
    </div>
  );
}
