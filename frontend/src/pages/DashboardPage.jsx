import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABEL = {
  confirmed: "Confirmado",
  pending: "Pendiente",
  rejected: "Rechazado",
};

const NOTIFICATION_LABELS = {
  new_customer: "Nuevo cliente",
  duplicate_payment: "Pago duplicado",
  amount_mismatch: "Monto incorrecto",
  payment_received: "Pago recibido",
  overdue_payment: "Pago vencido",
};

const NOTIFICATION_COLORS = {
  new_customer: "text-sky-400",
  duplicate_payment: "text-yellow-400",
  amount_mismatch: "text-orange-400",
  payment_received: "text-emerald-400",
  overdue_payment: "text-red-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
};

const formatAmount = (amount) => `₡${Number(amount).toLocaleString("es-CR")}`;

// ─── Subcomponents ───────────────────────────────────────────────────────────

const NotificationsPanel = ({ businessId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/notifications/business/${businessId}`);
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [businessId]);

  const markAllRead = async () => {
    await api.put(`/notifications/business/${businessId}/read-all`);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-sm font-semibold text-white">Notificaciones</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading && <p className="text-xs text-slate-500 p-4">Cargando...</p>}
        {!loading && notifications.length === 0 && <p className="text-xs text-slate-500 p-4">Sin notificaciones.</p>}
        {!loading &&
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-slate-800 last:border-0 ${!n.is_read ? "bg-slate-800/50" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                <span className={`text-xs font-medium ${NOTIFICATION_COLORS[n.notification_type]}`}>
                  {NOTIFICATION_LABELS[n.notification_type]}
                </span>
              </div>
              <p className="text-xs text-slate-400">{n.message}</p>
              <p className="text-xs text-slate-600 mt-1">{formatDate(n.created_at)}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { businessId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(() => {
    const stored = localStorage.getItem("selectedBusiness");
    return stored ? JSON.parse(stored) : null;
  });
  const [payments, setPayments] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [paymentsRes, notifRes] = await Promise.all([
        api.get(`/payments/business/${businessId}`),
        api.get(`/notifications/business/${businessId}`),
      ]);
      setPayments(paymentsRes.data);
      setUnreadCount(notifRes.data.filter((n) => !n.is_read).length);
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-6 border-b border-slate-800">
          <span className="text-base font-bold tracking-tight text-white">
            SINPE<span className="text-emerald-400">Conecta</span>CR
          </span>
          {business && <p className="text-xs text-slate-400 mt-1 truncate">{business.business_name}</p>}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              activeTab === "payments"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              activeTab === "customers"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Clientes
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <button
            onClick={() => navigate("/businesses")}
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ← Mis negocios
          </button>
          <button
            onClick={logout}
            className="w-full text-left text-sm px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800">
          <h1 className="text-sm font-semibold text-white capitalize">
            {activeTab === "payments" ? "Pagos" : "Clientes"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">{user?.full_name}</span>
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsPanel businessId={businessId} onClose={() => setShowNotifications(false)} />
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6 overflow-auto">
          {loading && <p className="text-sm text-slate-500">Cargando...</p>}

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
          )}

          {/* Payments tab */}
          {!loading && activeTab === "payments" && (
            <div>
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500">No hay pagos registrados.</p>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Cliente</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Referencia</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Monto</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Fecha</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{p.customer_name || p.sender_name || "—"}</p>
                            <p className="text-xs text-slate-500">{p.customer_phone}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sinpe_reference}</td>
                          <td className="px-4 py-3 text-white font-semibold">{formatAmount(p.amount)}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(p.payment_date)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}
                            >
                              {STATUS_LABEL[p.status] || p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Customers tab placeholder */}
          {!loading && activeTab === "customers" && (
            <p className="text-sm text-slate-500">Módulo de clientes — próximamente.</p>
          )}
        </main>
      </div>

      {/* Close notifications on outside click */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </div>
  );
};

export default DashboardPage;
