export default function DeliverySection() {
  const steps = [
    { icon: '🍱', title: 'Elegí tu pedido', desc: 'Explorá nuestra carta y seleccioná tus platos favoritos.' },
    { icon: '📍', title: 'Ingresá tu dirección', desc: 'Llegamos donde estés dentro de nuestra zona de cobertura.' },
    { icon: '🛵', title: 'Recibí en tu puerta', desc: 'Entrega rápida y en perfectas condiciones.' },
  ];

  return (
    <section id="delivery" className="py-24" style={{ background: '#080404' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8b0000]" />
            <span className="text-[#c0392b] text-xs tracking-[0.4em] uppercase">Pedí desde casa</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#8b0000]" />
          </div>
          <h2 className="text-4xl font-bold text-[#f0e6e6]">Delivery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {steps.map((s, i) => (
            <div key={i}
              className="text-center p-8 border border-[#8b0000]/20 hover:border-[#8b0000]/50 transition-all duration-300"
              style={{ background: '#0f0505' }}>
              <div className="text-4xl mb-5">{s.icon}</div>
              <div className="w-8 h-px bg-[#8b0000] mx-auto mb-4" />
              <h3 className="text-[#f0e6e6] font-semibold mb-2 tracking-wide">{s.title}</h3>
              <p className="text-[#b08080] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="tel:+5491100000000"
            className="inline-block bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-12 py-4 text-sm tracking-[0.3em] uppercase font-semibold transition-all duration-300">
            Llamar para pedir
          </a>
          <p className="text-[#b08080]/40 text-xs mt-4 tracking-wide">Lunes a domingo · 12:00 – 23:30</p>
        </div>
      </div>
    </section>
  );
}
