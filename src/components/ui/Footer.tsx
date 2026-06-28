export default function Footer() {
  return (
    <footer className="border-t border-[#8b0000]/20 py-10" style={{ background: '#080404' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[#f0e6e6] font-bold tracking-[0.3em] uppercase text-sm">
          <span className="text-[#c0392b]">✦</span> Dragón Rojo
        </span>
        <p className="text-[#b08080]/50 text-xs text-center tracking-wide">
          Av. Oriental 1234, Buenos Aires · Lun–Dom 12:00–23:30
        </p>
        <p className="text-[#b08080]/30 text-xs">© 2026 Dragón Rojo</p>
      </div>
    </footer>
  );
}
