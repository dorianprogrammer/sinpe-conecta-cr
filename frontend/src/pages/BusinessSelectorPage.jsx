import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const BUSINESS_TYPE_LABEL = {
  membership: "Membresías",
  product_sales: "Ventas",
};

const BUSINESS_TYPE_COLOR = {
  membership: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  product_sales: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const BusinessSelectorPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data } = await api.get("/businesses");
        setBusinesses(data);
      } catch (err) {
        setError("No se pudieron cargar los negocios.");
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const handleSelect = (business) => {
    localStorage.setItem("selectedBusiness", JSON.stringify(business));
    navigate(`/dashboard/${business.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              SINPE<span className="text-emerald-400">Conecta</span>CR
            </span>
            <p className="text-sm text-slate-400 mt-1">Hola, {user?.full_name}</p>
          </div>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Cerrar sesión
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Mis negocios</h1>
          <button
            onClick={() => navigate("/businesses/new")}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo negocio
          </button>
        </div>

        {/* States */}
        {loading && <div className="text-center text-slate-500 py-20 text-sm">Cargando...</div>}

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="text-center text-slate-500 py-20 text-sm">
            No tiene negocios registrados. Cree uno para comenzar.
          </div>
        )}

        {/* Business list */}
        {!loading && businesses.length > 0 && (
          <div className="space-y-3">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelect(b)}
                className="w-full text-left bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl px-5 py-4 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">
                      {b.business_name}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{b.whatsapp_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs border rounded-full px-2.5 py-1 ${BUSINESS_TYPE_COLOR[b.business_type]}`}>
                      {BUSINESS_TYPE_LABEL[b.business_type]}
                    </span>
                    <span className="text-slate-600 group-hover:text-emerald-400 transition-colors">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSelectorPage;
