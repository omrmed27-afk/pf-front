'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import { getProducts, createProduct, updateProduct, deleteProduct, Product, ProductPayload } from '@/lib/adminApi';
import ProductForm from '@/components/admin/ProductForm';
import AdminNav from '@/components/admin/AdminNav';

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload: ProductPayload) {
    if (editing) await updateProduct(editing.id, payload);
    else await createProduct(payload);
    setEditing(null);
    setShowForm(false);
    load();
  }

  async function handleToggleFeatured(p: Product) {
    setToggling(p.id);
    await updateProduct(p.id, { is_featured: !p.is_featured } as never);
    setToggling(null);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este plato?')) return;
    setDeleting(id);
    await deleteProduct(id);
    setDeleting(null);
    load();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080404' }}>
      <span className="text-[#b08080] text-sm">Cargando...</span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080404' }}>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Platos del menú</h1>
            <p className="text-[#b08080] text-xs mt-1">{products.length} platos registrados</p>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
            + Nuevo plato
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 border border-[#8b0000]/10" style={{ background: '#0f0505' }}>
            <p className="text-[#b08080]/50 text-sm mb-4">No hay platos todavía.</p>
            <button onClick={() => setShowForm(true)}
              className="text-[#c0392b] border border-[#8b0000]/30 px-6 py-2 text-xs uppercase hover:bg-[#8b0000]/10 transition">
              Agregar primer plato
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => (
              <div key={p.id} className="border border-[#8b0000]/20 hover:border-[#8b0000]/40 transition overflow-hidden relative" style={{ background: '#110606' }}>
                <button
                  onClick={() => handleToggleFeatured(p)}
                  disabled={toggling === p.id}
                  title={p.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full border transition disabled:opacity-40 ${
                    p.is_featured
                      ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#d4af37]'
                      : 'bg-black/40 border-[#8b0000]/20 text-[#b08080]/40 hover:text-[#d4af37] hover:border-[#d4af37]/40'
                  }`}
                >
                  ★
                </button>
                <div className="w-full aspect-video overflow-hidden" style={{ background: '#1a0606' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🍜</div>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[#f0e6e6] font-semibold text-sm">{p.name}</h3>
                    <span className="text-[#c0392b] font-bold text-sm">S/{Number(p.unit_price).toFixed(2)}</span>
                  </div>
                  {p.description && <p className="text-[#b08080] text-xs line-clamp-2 mb-3">{p.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-[#b08080]/50 text-xs">Stock: {p.stock}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setShowForm(true); }}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] border border-[#8b0000]/20 hover:border-[#8b0000]/50 px-3 py-1 transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="text-xs text-[#c0392b] border border-[#8b0000]/20 hover:border-[#c0392b]/50 px-3 py-1 transition disabled:opacity-40">
                        {deleting === p.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && (
        <ProductForm product={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}
