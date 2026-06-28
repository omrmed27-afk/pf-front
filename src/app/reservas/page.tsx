import FloorPlan from '@/components/sections/FloorPlan';
import { Table, Warehouse } from '@/lib/adminApi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchTables(): Promise<Table[]> {
  try {
    const res = await fetch(`${API}/tables/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const res = await fetch(`${API}/warehouses/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return [];
  }
}

export default async function ReservasPage() {
  const [tables, warehouses] = await Promise.all([fetchTables(), fetchWarehouses()]);

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080404' }}>
      <div className="border-b border-[#8b0000]/20 py-10" style={{ background: '#0c0404' }}>
        <div className="max-w-xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-[#8b0000]" />
            <span className="text-[#c0392b] text-xs tracking-[0.5em] uppercase">Dragón Rojo</span>
            <div className="h-px w-10 bg-[#8b0000]" />
          </div>
          <h1 className="text-4xl font-bold text-[#f0e6e6]">Reservar Mesa</h1>
          <p className="text-[#b08080] text-sm mt-2">Elegí tu lugar en el salón</p>
        </div>
      </div>
      <FloorPlan tables={tables} warehouses={warehouses} />
    </div>
  );
}
