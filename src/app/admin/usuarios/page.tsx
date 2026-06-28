'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isSuperuser } from '@/lib/auth';
import {
  getUsers, createUser, updateUser, deleteUser, assignGroup,
  getGroups, createGroup, deleteGroup, updateGroupPermissions, getPermissions,
  AdminUser, UserGroup, CreateUserPayload, Permission,
} from '@/lib/adminApi';
import AdminNav from '@/components/admin/AdminNav';

const EMPTY_FORM: CreateUserPayload = {
  username: '', password: '', email: '', first_name: '', last_name: '', is_superuser: false,
};

const APP_LABELS: Record<string, string> = {
  products: 'Platos', tables: 'Mesas', reservations: 'Reservas',
  shipments: 'Pedidos', warehouses: 'Locales', suppliers: 'Proveedores',
  transport: 'Vehículos', drivers: 'Conductores', routes: 'Rutas', customers: 'Clientes',
};

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [groups, setGroups] = useState<(UserGroup & { permissions?: Permission[] })[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'roles'>('users');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);

  const [assigningUser, setAssigningUser] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('');

  // editor de permisos
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<number>>(new Set());
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    if (!getToken() || !isSuperuser()) { router.push('/'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [u, g, p] = await Promise.all([getUsers(), getGroups(), getPermissions()]);
    setUsers(u);
    setGroups(g as (UserGroup & { permissions?: Permission[] })[]);
    setAllPerms(p);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createUser(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    await updateUser(user.id, { is_active: !user.is_active });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await deleteUser(id); load(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  async function handleAssignGroup(userId: number) {
    if (!selectedGroup) return;
    await assignGroup(userId, Number(selectedGroup), 'add');
    setAssigningUser(null);
    setSelectedGroup('');
    load();
  }

  async function handleRemoveGroup(userId: number, groupId: number) {
    await assignGroup(userId, groupId, 'remove');
    load();
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setSavingGroup(true);
    try { await createGroup(newGroupName); setNewGroupName(''); load(); }
    finally { setSavingGroup(false); }
  }

  async function handleDeleteGroup(id: number) {
    if (!confirm('¿Eliminar este rol?')) return;
    await deleteGroup(id);
    load();
  }

  function openPermEditor(group: UserGroup & { permissions?: Permission[] }) {
    setEditingGroup(group.id);
    setSelectedPerms(new Set((group.permissions ?? []).map(p => p.id)));
  }

  function togglePerm(id: number) {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSavePerms() {
    if (editingGroup === null) return;
    setSavingPerms(true);
    await updateGroupPermissions(editingGroup, Array.from(selectedPerms));
    setSavingPerms(false);
    setEditingGroup(null);
    load();
  }

  // agrupar permisos por app
  const permsByApp = allPerms.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.app] = acc[p.app] ?? []).push(p);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080404' }}>
      <span className="text-[#b08080] text-sm">Cargando...</span>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080404' }}>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[#f0e6e6] text-2xl font-bold">Usuarios y Roles</h1>
            <p className="text-[#b08080] text-xs mt-1">{users.length} usuarios · {groups.length} roles</p>
          </div>
          {tab === 'users' && (
            <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
              className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-semibold transition">
              + Nuevo usuario
            </button>
          )}
        </div>

        <div className="flex gap-8 mb-6 border-b border-[#8b0000]/15">
          {(['users', 'roles'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 text-xs tracking-[0.2em] uppercase transition border-b-2 ${
                tab === t ? 'text-[#f0e6e6] border-[#c0392b]' : 'text-[#b08080]/60 border-transparent hover:text-[#b08080]'
              }`}>
              {t === 'users' ? 'Usuarios' : 'Roles'}
            </button>
          ))}
        </div>

        {/* ── TAB USUARIOS ── */}
        {tab === 'users' && (
          <>
            {showForm && (
              <form onSubmit={handleCreate}
                className="border border-[#8b0000]/30 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
                style={{ background: '#0f0505' }}>
                <h2 className="col-span-2 text-[#f0e6e6] text-sm font-semibold mb-1">Nuevo usuario</h2>
                {([
                  ['username', 'Usuario *'],
                  ['password', 'Contraseña *'],
                  ['email', 'Email'],
                  ['first_name', 'Nombre'],
                  ['last_name', 'Apellido'],
                ] as const).map(([k, label]) => (
                  <div key={k}>
                    <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">{label}</label>
                    <input type={k === 'password' ? 'password' : 'text'}
                      value={form[k] as string ?? ''}
                      onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                      required={k === 'username' || k === 'password'}
                      className="w-full bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="is_superuser" checked={form.is_superuser ?? false}
                    onChange={e => setForm(p => ({ ...p, is_superuser: e.target.checked }))}
                    className="accent-[#c0392b]" />
                  <label htmlFor="is_superuser" className="text-[#b08080] text-xs uppercase tracking-wide">Superadmin</label>
                </div>
                {formError && <p className="col-span-2 text-[#c0392b] text-xs">{formError}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-[#8b0000]/30 text-[#b08080] text-xs transition">Cancelar</button>
                  <button type="submit" disabled={saving}
                    className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2 text-xs uppercase tracking-wide transition disabled:opacity-40">
                    {saving ? '...' : 'Crear'}
                  </button>
                </div>
              </form>
            )}

            <div className="border border-[#8b0000]/15 overflow-hidden" style={{ background: '#0f0505' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#8b0000]/20">
                    {['Usuario', 'Nombre', 'Tipo', 'Roles', 'Estado', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[#b08080] text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#8b0000]/10 ${i % 2 === 0 ? '' : 'bg-[#8b0000]/5'}`}>
                      <td className="px-4 py-3 text-[#f0e6e6] font-mono text-xs font-semibold">{u.username}</td>
                      <td className="px-4 py-3 text-[#b08080] text-xs">{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td className="px-4 py-3">
                        {u.is_superuser
                          ? <span className="text-xs px-2 py-0.5 border border-[#c0392b]/40 bg-[#8b0000]/20 text-[#c0392b]">Superadmin</span>
                          : <span className="text-xs text-[#b08080]/60">Usuario</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 items-center">
                          {u.groups.map(g => (
                            <span key={g.id} className="flex items-center gap-1 text-xs px-1.5 py-0.5 border border-[#8b0000]/30 text-[#b08080]">
                              {g.name}
                              <button onClick={() => handleRemoveGroup(u.id, g.id)}
                                className="text-[#c0392b]/60 hover:text-[#c0392b] ml-0.5">✕</button>
                            </span>
                          ))}
                          {assigningUser === u.id ? (
                            <div className="flex gap-1">
                              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                                className="bg-[#0a0303] border border-[#8b0000]/30 text-[#f0e6e6] px-1 py-0.5 text-xs focus:outline-none">
                                <option value="">Rol...</option>
                                {groups.filter(g => !u.groups.find(ug => ug.id === g.id)).map(g => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                              <button onClick={() => handleAssignGroup(u.id)} className="text-xs px-1.5 py-0.5 bg-[#8b0000] text-[#f0e6e6]">✓</button>
                              <button onClick={() => setAssigningUser(null)} className="text-xs px-1.5 text-[#b08080]">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setAssigningUser(u.id); setSelectedGroup(''); }}
                              className="text-xs text-[#b08080]/50 hover:text-[#b08080] border border-[#8b0000]/20 px-1.5 py-0.5 transition">
                              + rol
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(u)}
                          className={`text-xs px-2 py-0.5 border transition ${
                            u.is_active
                              ? 'text-green-400 border-green-800/40 hover:bg-green-900/20'
                              : 'text-[#b08080]/50 border-[#8b0000]/20'
                          }`}>
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(u.id)}
                          className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-[#b08080]/40 text-sm">No hay usuarios.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── TAB ROLES ── */}
        {tab === 'roles' && (
          <div className="space-y-4">
            <form onSubmit={handleCreateGroup} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[#b08080] text-xs uppercase tracking-wide block mb-1">Nombre del rol</label>
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required
                  placeholder="Ej: Gerente, Cajero, Delivery..."
                  className="w-full bg-[#0f0505] border border-[#8b0000]/30 text-[#f0e6e6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]" />
              </div>
              <button type="submit" disabled={savingGroup}
                className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2.5 text-xs uppercase tracking-wide transition disabled:opacity-40">
                {savingGroup ? '...' : '+ Crear rol'}
              </button>
            </form>

            {groups.map((g, i) => {
              const count = users.filter(u => u.groups.find(ug => ug.id === g.id)).length;
              const isEditing = editingGroup === g.id;
              const gPerms = (g.permissions ?? []);
              return (
                <div key={g.id} className="border border-[#8b0000]/20" style={{ background: '#0f0505' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-[#f0e6e6] font-semibold text-sm">{g.name}</span>
                      <span className="text-[#b08080]/50 text-xs ml-3">{count} usuarios · {gPerms.length} permisos</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => isEditing ? setEditingGroup(null) : openPermEditor(g)}
                        className="text-xs text-[#b08080] hover:text-[#f0e6e6] border border-[#8b0000]/30 px-3 py-1 transition">
                        {isEditing ? 'Cerrar' : 'Editar permisos'}
                      </button>
                      <button onClick={() => handleDeleteGroup(g.id)}
                        className="text-xs text-[#c0392b]/60 hover:text-[#c0392b] transition">Eliminar</button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="border-t border-[#8b0000]/10 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {Object.entries(permsByApp).map(([app, perms]) => (
                          <div key={app} className="border border-[#8b0000]/10 p-3" style={{ background: '#0a0303' }}>
                            <p className="text-[#c0392b] text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
                              {APP_LABELS[app] ?? app}
                            </p>
                            {perms.map(p => (
                              <label key={p.id} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                                <input type="checkbox"
                                  checked={selectedPerms.has(p.id)}
                                  onChange={() => togglePerm(p.id)}
                                  className="accent-[#c0392b]" />
                                <span className="text-[#b08080] text-xs group-hover:text-[#f0e6e6] transition">{p.name}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingGroup(null)}
                          className="px-4 py-2 border border-[#8b0000]/30 text-[#b08080] text-xs transition">
                          Cancelar
                        </button>
                        <button onClick={handleSavePerms} disabled={savingPerms}
                          className="bg-[#8b0000] hover:bg-[#c0392b] text-[#f0e6e6] px-6 py-2 text-xs uppercase tracking-wide transition disabled:opacity-40">
                          {savingPerms ? '...' : 'Guardar permisos'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {groups.length === 0 && (
              <div className="border border-[#8b0000]/15 py-12 text-center" style={{ background: '#0f0505' }}>
                <p className="text-[#b08080]/40 text-sm">No hay roles creados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
