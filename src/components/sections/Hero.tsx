import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* overlay oscuro */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(8,4,4,0.55) 0%, rgba(8,4,4,0.75) 100%)' }} />

      {/* glow spot rojo central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #8b0000, transparent 70%)' }} />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* ornament */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#8b0000]" />
          <span className="text-[#c0392b] text-xs tracking-[0.5em] uppercase">Restaurante Oriental</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#8b0000]" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-[#f0e6e6] leading-none mb-2 tracking-tight">
          Dragón
        </h1>
        <h1 className="text-6xl md:text-8xl font-bold leading-none mb-8 tracking-tight"
          style={{ color: '#8b0000', textShadow: '0 0 40px rgba(139,0,0,0.5)' }}>
          Rojo
        </h1>

        <p className="text-[#b08080] text-base md:text-lg mb-12 leading-relaxed max-w-xl mx-auto">
          Sabores auténticos de oriente. Preparados con ingredientes frescos y tradición.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/#menu"
            className="px-10 py-4 text-sm tracking-[0.3em] uppercase font-semibold text-[#f0e6e6] border border-[#8b0000] hover:bg-[#8b0000] transition-all duration-300">
            Ver Menú
          </Link>
          <Link href="/#reservations"
            className="px-10 py-4 text-sm tracking-[0.3em] uppercase font-semibold bg-[#8b0000] text-[#f0e6e6] hover:bg-[#c0392b] transition-all duration-300">
            Reservar Mesa
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#8b0000]/50 text-xs tracking-widest animate-bounce">
        ↓
      </div>
    </section>
  );
}
