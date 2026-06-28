import Link from 'next/link';
import { fetchFeaturedProducts, fetchProducts } from '@/lib/api';
import FeaturedGrid from '@/components/menu/FeaturedGrid';

const features = [
  { icon: '/icon-fresh.png', title: 'Ingredientes frescos', desc: 'Seleccionamos los mejores ingredientes para ti.' },
  { icon: '/icon-chef.png', title: 'Chefs expertos', desc: 'Maestros en cocina oriental con años de experiencia.' },
  { icon: '/icon-ambient.png', title: 'Ambiente único', desc: 'Disfruta de un ambiente que te transporta a Asia.' },
  { icon: '/icon-flavor.png', title: 'Auténtico sabor', desc: 'Recetas tradicionales con el toque perfecto de modernidad.' },
];

export default async function Home() {
  const [featured, allProducts] = await Promise.all([
    fetchFeaturedProducts(),
    fetchProducts(),
  ]);
  const showcased = (featured.length > 0 ? featured : allProducts).slice(0, 4);

  return (
    <div className="md:h-screen md:overflow-hidden flex flex-col pt-16" style={{ background: '#080404' }}>

      {/* ── HERO ── */}
      <section className="flex-[6] flex flex-col md:flex-row items-center overflow-hidden relative h-[55vh] md:h-auto md:min-h-0">

        {/* Glow rojo — solo desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }} />

        {/* Imagen mobile — fondo absoluto con gradiente, título encima */}
        <div className="md:hidden absolute inset-0 overflow-hidden">
          <img src="/hero-dish.png" alt="Plato destacado"
            className="w-full h-full object-cover"
            style={{ objectPosition: '100% center' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #080404 25%, transparent 65%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, #080404 0%, transparent 20%, transparent 60%, #080404 100%)' }} />
        </div>

        {/* Imagen desktop — full bleed derecha */}
        <div className="hidden md:block absolute right-0 top-0 h-full w-[65%] overflow-hidden">
          <img src="/hero-dish.png" alt="Plato destacado"
            className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #080404 0%, #080404 5%, transparent 45%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, #080404 0%, transparent 15%, transparent 85%, #080404 100%)' }} />
        </div>

        {/* Contenido */}
        <div className="relative z-10 w-full md:w-[55%] flex justify-center px-6 md:px-0 py-8 md:py-0">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-[#8b0000]" />
              <span className="text-[#c0392b] text-[10px] tracking-[0.5em] uppercase">Auténticos sabores</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#f0e6e6] leading-none tracking-tight mb-0.5">Dragón</h1>
            <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-4 md:mb-5"
              style={{ color: '#8b0000', textShadow: '0 0 50px rgba(139,0,0,0.6)' }}>Rojo</h1>
            <p className="text-[#b08080] text-sm leading-relaxed max-w-xs mb-6 md:mb-7">
              Descubre una experiencia única donde la tradición oriental se fusiona con ingredientes frescos y de la más alta calidad.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu"
                className="px-6 md:px-7 py-3 bg-[#8b0000] text-[#f0e6e6] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#c0392b] transition-all duration-300">
                Ver Menú →
              </Link>
              <Link href="/reservas"
                className="px-6 md:px-7 py-3 border border-[#8b0000] text-[#f0e6e6] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#8b0000]/20 transition-all duration-300">
                Reservar Mesa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES — 2×2 en mobile, 4 cols en desktop ── */}
      <div className="border-t border-b border-[#8b0000]/15 shrink-0" style={{ background: '#0c0404' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-2 md:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className={`
              flex items-center gap-3 px-4 md:px-8 py-4
              border-[#8b0000]/15
              ${i % 2 === 1 ? 'border-l' : ''}
              ${i >= 2 ? 'border-t' : ''}
              md:border-l md:border-t-0 md:first:border-l-0
            `}>
              <img src={f.icon} alt={f.title} className="w-10 h-10 md:w-12 md:h-12 shrink-0 object-contain" />
              <div>
                <p className="text-[#c0392b] text-[10px] tracking-[0.2em] uppercase font-semibold mb-0.5">{f.title}</p>
                <p className="text-[#b08080] text-[10px] leading-relaxed hidden sm:block">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLATOS DESTACADOS ── */}
      <section className="flex-[4] overflow-hidden px-4 md:px-10 py-4" style={{ background: '#080404' }}>
        <div className="max-w-7xl mx-auto h-full">
          <FeaturedGrid products={showcased} />
        </div>
      </section>

    </div>
  );
}
