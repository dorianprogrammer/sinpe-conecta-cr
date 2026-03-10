import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const formatAmount = (amount) => (amount ? `₡${Number(amount).toLocaleString("es-CR")}` : "—");

const CustomersList = ({ businessId }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/customers/business/${businessId}`);
        setCustomers(data);
      } catch {
        setError("No se pudieron cargar los clientes.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [businessId]);

  if (loading) return <p className="text-sm text-slate-500">Cargando...</p>;
  if (error)
    return <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>;
  if (customers.length === 0) return <p className="text-sm text-slate-500">No hay clientes registrados.</p>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Cliente</th>
            <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Cuota / Día</th>
            <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Estado</th>
            <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Verificado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const isMembership = c.payment_due_day !== null || c.monthly_fee !== null;
            const flag = isMembership ? c.good_standing_flag : c.frequent_buyer_flag;
            const flagLabel = isMembership ? (flag ? "Al día" : "En riesgo") : flag ? "Frecuente" : "Normal";
            const flagStyle = flag
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-slate-700/50 text-slate-400 border-slate-600";

            return (
              <tr
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}/edit`, { state: { customer: c } })}
                className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{c.full_name || "—"}</p>
                  <p className="text-xs text-slate-500">{c.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {isMembership ? (
                    <>
                      {formatAmount(c.monthly_fee)} <span className="text-slate-600">· día {c.payment_due_day}</span>
                    </>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs border rounded-full px-2.5 py-1 ${flagStyle}`}>{flagLabel}</span>
                </td>
                <td className="px-4 py-3">
                  {c.is_verified ? (
                    <span className="text-xs text-emerald-400">✓ Verificado</span>
                  ) : (
                    <span className="text-xs text-slate-500">Sin verificar</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600 text-xs">→</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersList;
