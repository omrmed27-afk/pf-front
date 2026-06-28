'use client';
import { useState, useEffect } from 'react';
import { Product, ProductPayload } from '@/lib/adminApi';

interface Props {
  product?: Product | null;
  onSave: (payload: ProductPayload) => Promise<void>;
  onClose: () => void;
}

const inputClass = "w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition text-sm placeholder:text-[#b08080]/40";
const labelClass = "text-[#b08080] text-xs uppercase tracking-[0.2em] block mb-1.5";


export default function ProductForm({ product, onSave, onClose }: Props) {
  const [form, setForm] = useState<ProductPayload>({
    name: '', sku: '', unit_price: '', stock: 0, description: '', image_url: '',
    ingredients: [],
  });
  const [preview, setPreview] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        stock: product.stock,
        description: product.description ?? '',
        image_url: product.image_url ?? '',
        ingredients: product.ingredients ?? [],
      });
      setPreview(product.image_url ?? '');
      setIngredientsText((product.ingredients ?? []).join('\n'));
    }
  }, [product]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'stock' ? Number(value) : value }));
    if (name === 'image_url') setPreview(value);
  }

  function handleIngredientsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setIngredientsText(e.target.value);
    const list = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, ingredients: list }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-2xl border border-[#8b0000]/30 overflow-y-auto max-h-[90vh]" style={{ background: '#0f0505' }}>
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#8b0000]/20">
          <h2 className="text-[#f0e6e6] font-semibold tracking-wide">
            {product ? 'Editar plato' : 'Nuevo plato'}
          </h2>
          <button onClick={onClose} className="text-[#b08080] hover:text-[#f0e6e6] transition text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* image preview */}
          <div>
            <label className={labelClass}>URL de imagen</label>
            <input name="image_url" value={form.image_url} onChange={handleChange}
              placeholder="https://ejemplo.com/foto-plato.jpg"
              className={inputClass} />
            <div className="mt-3 w-full aspect-video border border-[#8b0000]/20 overflow-hidden"
              style={{ background: '#1a0606' }}>
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#b08080]/30 text-sm">
                  Vista previa de imagen
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required className={inputClass}
                placeholder="ej: ARR-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Precio *</label>
              <input name="unit_price" type="number" step="0.01" min="0" value={form.unit_price}
                onChange={handleChange} required className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input name="stock" type="number" min="0" value={form.stock}
                onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Descripción del plato..."
              className={`${inputClass} resize-none`} />
          </div>

          {/* ingredients */}
          <div>
            <label className={labelClass}>
              Ingredientes <span className="normal-case text-[#b08080]/50">(uno por línea)</span>
            </label>
            <textarea
              value={ingredientsText}
              onChange={handleIngredientsChange}
              rows={4}
              placeholder={"Arroz japonés\nSalmón fresco\nAguacate\nSalsa especial"}
              className={`${inputClass} resize-none font-mono text-xs`}
            />
            {form.ingredients && form.ingredients.length > 0 && (
              <p className="text-[#b08080]/50 text-[10px] mt-1">{form.ingredients.length} ingrediente(s)</p>
            )}
          </div>

          {error && <p className="text-[#c0392b] text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#8b0000]/30 text-[#b08080] py-3 text-sm tracking-wide hover:border-[#8b0000] transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#8b0000] text-[#f0e6e6] py-3 text-sm tracking-[0.2em] uppercase font-semibold hover:bg-[#c0392b] transition disabled:opacity-40">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
