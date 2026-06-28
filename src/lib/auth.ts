const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'admin_token';
const SUPERUSER_KEY = 'admin_is_superuser';
const USERNAME_KEY = 'admin_username';

export async function loginAdmin(username: string, password: string): Promise<{ isSuperuser: boolean }> {
  const res = await fetch(`${API}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(SUPERUSER_KEY, String(data.is_superuser));
  localStorage.setItem(USERNAME_KEY, data.username ?? username);
  return { isSuperuser: data.is_superuser };
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isSuperuser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SUPERUSER_KEY) === 'true';
}

export function getUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USERNAME_KEY) ?? '';
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SUPERUSER_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
}

// ─── Public user (customer) auth ─────────────────────────────

const USER_TOKEN_KEY = 'user_token';
const USER_NAME_KEY = 'user_first_name';

export async function loginCustomer(email: string, password: string): Promise<{ isSuperuser: boolean }> {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(`${API}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error('Email o contraseña incorrectos');
  const data = await res.json();
  if (data.is_superuser) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(SUPERUSER_KEY, 'true');
    localStorage.setItem(USERNAME_KEY, data.username ?? email);
  } else {
    localStorage.setItem(USER_TOKEN_KEY, data.token);
    localStorage.setItem(USER_NAME_KEY, data.first_name || email.split('@')[0]);
  }
  return { isSuperuser: data.is_superuser };
}

export async function registerCustomer(payload: {
  first_name: string; last_name: string; username: string; email: string; password: string; confirm_password: string;
}): Promise<void> {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(`${API}/auth/register-customer/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(Object.values(err).flat().join(' '));
  }
  const data = await res.json();
  localStorage.setItem(USER_TOKEN_KEY, data.token);
  localStorage.setItem(USER_NAME_KEY, data.first_name || payload.first_name);
}

export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserFirstName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_NAME_KEY) ?? '';
}

export function logoutCustomer() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}
