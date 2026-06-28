const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/products/`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

export async function fetchProduct(id: number) {
  const res = await fetch(`${API_URL}/products/${id}/`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchFeaturedProducts() {
  const res = await fetch(`${API_URL}/products/?featured=true`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

export async function createReservation(payload: {
  customer: number;
  table: number;
  date: string;
  time: string;
  party_size: number;
  notes?: string;
}) {
  const res = await fetch(`${API_URL}/reservations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function fetchTables() {
  const res = await fetch(`${API_URL}/tables/`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}
