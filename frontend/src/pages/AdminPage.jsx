import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });

const ROLE_STYLES = {
  superuser: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  readonly_admin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  user: "bg-slate-700/50 text-slate-400 border-slate-600",
};

const ROLE_LABELS = {
  superuser: "Superusuario",
  readonly_admin: "Admin (solo lectura)",
  user: "Usuario",
};

const BUSINESS_TYPE_LABEL = {
  membership: "Membresías",
  product_sales: "Ventas",
};

// ─── Create User Modal ────────────────────────────────────────────────────────

const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/users", form);
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Nuevo usuario</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { name: "full_name", label: "Nombre completo", type: "text", placeholder: "Juan Pérez" },
            { name: "email", label: "Correo", type: "email", placeholder: "correo@ejemplo.com" },
            { name: "phone", label: "Teléfono", type: "tel", placeholder: "88001234" },
            { name: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                placeholder={placeholder}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="user">Usuario</option>
              <option value="readonly_admin">Admin (solo lectura)</option>
              <option value="superuser">Superusuario</option>
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors mt-1"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Create Business Modal ────────────────────────────────────────────────────

const CreateBusinessModal = ({ users, onClose, onCreated }) => {
  const [form, setForm] = useState({
    user_id: users[0]?.id || "",
    business_name: "",
    business_type: "membership",
    country_code: "+506",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/businesses", {
        user_id: Number(form.user_id),
        business_name: form.business_name,
        business_type: form.business_type,
        whatsapp_number: `${form.country_code}${form.phone_number}`,
      });
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el negocio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Nuevo negocio</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Asignar a usuario</label>
            <select
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del negocio</label>
            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              required
              placeholder="Ej: Gym Fitness CR"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de negocio</label>
            <select
              name="business_type"
              value={form.business_type}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="membership">Membresías</option>
              <option value="product_sales">Ventas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Número de WhatsApp</label>
            <div className="flex gap-2">
              <select
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="+506">🇨🇷 +506</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+52">🇲🇽 +52</option>
                <option value="+57">🇨🇴 +57</option>
                <option value="+502">🇬🇹 +502</option>
                <option value="+503">🇸🇻 +503</option>
                <option value="+504">🇭🇳 +504</option>
                <option value="+505">🇳🇮 +505</option>
                <option value="+507">🇵🇦 +507</option>
              </select>
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                required
                placeholder="88881111"
                className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors mt-1"
          >
            {loading ? "Creando..." : "Crear negocio"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Assign Business Modal ────────────────────────────────────────────────────

const AssignBusinessModal = ({ business, users, onClose, onAssigned }) => {
  const [userId, setUserId] = useState(business.user_id);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.put(`/admin/businesses/${business.id}/assign`, { user_id: Number(userId) });
      onAssigned(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al reasignar el negocio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Reasignar negocio</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Negocio: <span className="text-white">{business.business_name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Asignar a</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminPage = () => {
  const { user, logout } = useAuth();
  const isSuperuser = user?.role === "superuser";

  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, businessesRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/businesses")]);
      setUsers(usersRes.data);
      setBusinesses(businessesRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUserCreated = (newUser) => setUsers((prev) => [newUser, ...prev]);
  const handleBusinessCreated = (newBusiness) => setBusinesses((prev) => [newBusiness, ...prev]);
  const handleBusinessAssigned = (updated) =>
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              SINPE<span className="text-emerald-400">Conecta</span>CR
            </span>
            <p className="text-xs text-slate-400 mt-1">Panel de administración · {user?.full_name}</p>
          </div>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Cerrar sesión
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Cargando...</p>}

        {!loading && (
          <>
            {/* ── Users section ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  Usuarios <span className="text-slate-500 font-normal text-sm ml-1">{users.length}</span>
                </h2>
                {isSuperuser && (
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    + Nuevo usuario
                  </button>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Usuario</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Teléfono</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Rol</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-800 last:border-0">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{u.full_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs border rounded-full px-2.5 py-1 ${ROLE_STYLES[u.role]}`}>
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Businesses section ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  Negocios <span className="text-slate-500 font-normal text-sm ml-1">{businesses.length}</span>
                </h2>
                {isSuperuser && (
                  <button
                    onClick={() => setShowCreateBusiness(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    + Nuevo negocio
                  </button>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Negocio</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Propietario</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Tipo</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">WhatsApp</th>
                      {isSuperuser && <th className="px-4 py-3" />}
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b) => (
                      <tr key={b.id} className="border-b border-slate-800 last:border-0">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{b.business_name}</p>
                          <p className="text-xs text-slate-500">ID {b.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-300 text-xs">{b.owner_name}</p>
                          <p className="text-xs text-slate-500">{b.owner_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-400">{BUSINESS_TYPE_LABEL[b.business_type]}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{b.whatsapp_number}</td>
                        {isSuperuser && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setAssignTarget(b)}
                              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                            >
                              Reasignar →
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onCreated={handleUserCreated} />}
      {showCreateBusiness && (
        <CreateBusinessModal
          users={users.filter((u) => u.role === "user")}
          onClose={() => setShowCreateBusiness(false)}
          onCreated={handleBusinessCreated}
        />
      )}
      {assignTarget && (
        <AssignBusinessModal
          business={assignTarget}
          users={users.filter((u) => u.role === "user")}
          onClose={() => setAssignTarget(null)}
          onAssigned={handleBusinessAssigned}
        />
      )}
    </div>
  );
};

export default AdminPage;
