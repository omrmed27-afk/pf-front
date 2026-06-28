import { authHeaders } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── Products ───────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  unit_price: string;
  stock: number;
  image_url: string | null;
  is_featured: boolean;
  ingredients: string[];
  supplier: number | null;
}

export interface ProductPayload {
  name: string;
  sku: string;
  unit_price: string;
  stock: number;
  description?: string;
  image_url?: string;
  ingredients?: string[];
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API}/products/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('No autorizado');
  const data = await res.json();
  return data.results ?? data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const res = await fetch(`${API}/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear plato');
  return res.json();
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>): Promise<Product> {
  const res = await fetch(`${API}/products/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar plato');
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API}/products/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar plato');
}

// ─── Tables ─────────────────────────────────────────────────

export interface Table {
  id: number;
  warehouse: number;
  number: number;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied';
}

export interface TablePayload {
  warehouse: number;
  number: number;
  capacity: number;
  status?: string;
}

export async function getTables(): Promise<Table[]> {
  const res = await fetch(`${API}/tables/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener mesas');
  const data = await res.json();
  return data.results ?? data;
}

export async function getAvailableTables(minCapacity: number): Promise<Table[]> {
  const res = await fetch(`${API}/tables/?status=available&min_capacity=${minCapacity}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

export async function createTable(payload: TablePayload): Promise<Table> {
  const res = await fetch(`${API}/tables/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear mesa');
  return res.json();
}

export async function updateTable(id: number, payload: Partial<TablePayload>): Promise<Table> {
  const res = await fetch(`${API}/tables/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar mesa');
  return res.json();
}

export async function changeTableStatus(id: number, newStatus: string): Promise<Table> {
  const res = await fetch(`${API}/tables/${id}/change-status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error('Transición de estado inválida');
  return res.json();
}

export async function deleteTable(id: number): Promise<void> {
  const res = await fetch(`${API}/tables/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar mesa');
}

// ─── Reservations ────────────────────────────────────────────

export interface Reservation {
  id: number;
  customer: number;
  table: number;
  date: string;
  time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export async function getReservations(): Promise<Reservation[]> {
  const res = await fetch(`${API}/reservations/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener reservas');
  const data = await res.json();
  return data.results ?? data;
}

export async function cancelReservation(id: number): Promise<Reservation> {
  const res = await fetch(`${API}/reservations/${id}/cancel/`, {
    method: 'POST', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al cancelar reserva');
  return res.json();
}

// ─── Customers (público para reservas) ──────────────────────

export async function findOrCreateCustomer(name: string, email: string, address?: string): Promise<number> {
  const res = await fetch(`${API}/customers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, address: address ?? '' }),
  });
  if (res.ok) {
    const data = await res.json();
    return data.id;
  }
  // email ya existe — buscar por email
  const listRes = await fetch(`${API}/customers/`);
  const listData = await listRes.json();
  const list: Array<{ id: number; email: string }> = listData.results ?? listData;
  const found = list.find((c) => c.email === email);
  if (found) return found.id;
  throw new Error('No se pudo crear ni encontrar el cliente');
}

export async function createReservation(payload: {
  customer: number;
  table: number;
  date: string;
  time: string;
  party_size: number;
  notes?: string;
}): Promise<Reservation> {
  const res = await fetch(`${API}/reservations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Error al crear reserva');
  }
  return res.json();
}

// ─── Warehouses ──────────────────────────────────────────────

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  floors: number;
}

export interface WarehousePayload {
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  floors: number;
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const res = await fetch(`${API}/warehouses/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

export async function createWarehouse(payload: WarehousePayload): Promise<Warehouse> {
  const res = await fetch(`${API}/warehouses/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear local');
  return res.json();
}

export async function updateWarehouse(id: number, payload: Partial<WarehousePayload>): Promise<Warehouse> {
  const res = await fetch(`${API}/warehouses/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar local');
  return res.json();
}

export async function deleteWarehouse(id: number): Promise<void> {
  const res = await fetch(`${API}/warehouses/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar local');
}

// ─── Suppliers ───────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
}

export interface SupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_name?: string;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API}/suppliers/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener proveedores');
  const data = await res.json();
  return data.results ?? data;
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const res = await fetch(`${API}/suppliers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear proveedor');
  return res.json();
}

export async function updateSupplier(id: number, payload: Partial<SupplierPayload>): Promise<Supplier> {
  const res = await fetch(`${API}/suppliers/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar proveedor');
  return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
  const res = await fetch(`${API}/suppliers/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar proveedor');
}

// ─── Transport ───────────────────────────────────────────────

export interface Transport {
  id: number;
  license_plate: string;
  vehicle_type: 'motorcycle' | 'van' | 'bicycle';
  brand: string;
  model: string;
  status: 'available' | 'in_use' | 'maintenance';
}

export interface TransportPayload {
  license_plate: string;
  vehicle_type: string;
  brand?: string;
  model?: string;
  status?: string;
}

export async function getTransports(): Promise<Transport[]> {
  const res = await fetch(`${API}/transport/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener vehículos');
  const data = await res.json();
  return data.results ?? data;
}

export async function createTransport(payload: TransportPayload): Promise<Transport> {
  const res = await fetch(`${API}/transport/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear vehículo');
  return res.json();
}

export async function updateTransport(id: number, payload: Partial<TransportPayload>): Promise<Transport> {
  const res = await fetch(`${API}/transport/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar vehículo');
  return res.json();
}

export async function deleteTransport(id: number): Promise<void> {
  const res = await fetch(`${API}/transport/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar vehículo');
}

// ─── Drivers ─────────────────────────────────────────────────

export interface Driver {
  id: number;
  user: { id: number; username: string; email: string; first_name: string; last_name: string };
  license_number: string;
  phone: string;
  status: 'available' | 'on_route' | 'off_duty';
}

export async function getDrivers(): Promise<Driver[]> {
  const res = await fetch(`${API}/drivers/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener conductores');
  const data = await res.json();
  return data.results ?? data;
}

export async function updateDriverStatus(id: number, status: string): Promise<Driver> {
  const res = await fetch(`${API}/drivers/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar conductor');
  return res.json();
}

// ─── Routes ──────────────────────────────────────────────────

export interface RouteStop {
  id: number;
  route: number;
  stop_order: number;
  address: string;
  city: string;
  estimated_arrival: string | null;
}

export interface Route {
  id: number;
  name: string;
  origin_warehouse: number;
  stops: RouteStop[];
}

export interface RoutePayload {
  name: string;
  origin_warehouse: number;
}

export interface RouteStopPayload {
  route: number;
  stop_order: number;
  address: string;
  city: string;
  estimated_arrival?: string;
}

export async function getRoutes(): Promise<Route[]> {
  const res = await fetch(`${API}/routes/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener rutas');
  const data = await res.json();
  return data.results ?? data;
}

export async function createRoute(payload: RoutePayload): Promise<Route> {
  const res = await fetch(`${API}/routes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear ruta');
  return res.json();
}

export async function deleteRoute(id: number): Promise<void> {
  const res = await fetch(`${API}/routes/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar ruta');
}

export async function createRouteStop(payload: RouteStopPayload): Promise<RouteStop> {
  const res = await fetch(`${API}/route-stops/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear parada');
  return res.json();
}

export async function deleteRouteStop(id: number): Promise<void> {
  const res = await fetch(`${API}/route-stops/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar parada');
}

// ─── Shipments ───────────────────────────────────────────────

export interface Shipment {
  id: number;
  tracking_number: string;
  customer: number;
  origin_warehouse: number;
  destination_address: string;
  destination_city: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  estimated_delivery_date: string;
  actual_delivery_date: string | null;
  calculated_cost: string;
  driver: number | null;
  transport: number | null;
  route: number | null;
  notes: string | null;
  created_at: string;
}

export interface ShipmentPayload {
  customer: number;
  origin_warehouse: number;
  destination_address: string;
  destination_city: string;
  estimated_delivery_date: string;
  notes?: string;
}

export async function getShipments(): Promise<Shipment[]> {
  const res = await fetch(`${API}/shipments/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  const data = await res.json();
  return data.results ?? data;
}

export async function createShipment(payload: ShipmentPayload): Promise<Shipment> {
  const res = await fetch(`${API}/shipments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear pedido');
  return res.json();
}

export async function dispatchShipment(id: number, driver: number, transport: number, route: number): Promise<Shipment> {
  const res = await fetch(`${API}/shipments/${id}/dispatch/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ driver, transport, route }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Error al despachar');
  }
  return res.json();
}

export async function deliverShipment(id: number): Promise<Shipment> {
  const res = await fetch(`${API}/shipments/${id}/deliver/`, {
    method: 'POST', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al marcar entregado');
  return res.json();
}

export async function cancelShipment(id: number): Promise<Shipment> {
  const res = await fetch(`${API}/shipments/${id}/cancel/`, {
    method: 'POST', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al cancelar pedido');
  return res.json();
}

// ─── Customers (dropdown para pedidos) ───────────────────────

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API}/customers/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? data;
}

// ─── User Management (superadmin) ────────────────────────────

export interface UserGroup { id: number; name: string; }

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
  groups: UserGroup[];
  date_joined: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}

export async function getUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API}/auth/users/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  const res = await fetch(`${API}/auth/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(' '));
  }
  return res.json();
}

export async function updateUser(id: number, payload: Partial<CreateUserPayload & { is_active: boolean }>): Promise<AdminUser> {
  const res = await fetch(`${API}/auth/users/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API}/auth/users/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Error al eliminar usuario');
  }
}

export async function assignGroup(userId: number, groupId: number, action: 'add' | 'remove'): Promise<AdminUser> {
  const res = await fetch(`${API}/auth/users/${userId}/assign-group/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ group_id: groupId, action }),
  });
  if (!res.ok) throw new Error('Error al asignar grupo');
  return res.json();
}

export async function getGroups(): Promise<UserGroup[]> {
  const res = await fetch(`${API}/auth/groups/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function createGroup(name: string): Promise<UserGroup> {
  const res = await fetch(`${API}/auth/groups/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Error al crear rol');
  return res.json();
}

export async function deleteGroup(id: number): Promise<void> {
  const res = await fetch(`${API}/auth/groups/${id}/`, {
    method: 'DELETE', headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al eliminar rol');
}

export async function updateGroupPermissions(id: number, permissionIds: number[]): Promise<UserGroup & { permissions: Permission[] }> {
  const res = await fetch(`${API}/auth/groups/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  if (!res.ok) throw new Error('Error al actualizar permisos');
  return res.json();
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  app: string;
  model: string;
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await fetch(`${API}/auth/permissions/`, { headers: { ...authHeaders() }, cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}
