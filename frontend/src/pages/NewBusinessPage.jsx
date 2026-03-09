import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const NewBusinessPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: "",
    business_type: "membership",
    country_code: "+506",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/businesses", {
        business_name: form.business_name,
        business_type: form.business_type,
        whatsapp_number: `${form.country_code}${form.phone_number}`,
      });
      navigate("/businesses");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el negocio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/businesses")}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 flex items-center gap-1"
          >
            ← Volver
          </button>
          <span className="text-xl font-bold tracking-tight text-white">
            SINPE<span className="text-emerald-400">Conecta</span>CR
          </span>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-white mb-6">Nuevo negocio</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre del negocio</label>
              <input
                type="text"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                required
                placeholder="Ej: Gym Fitness CR"
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo de negocio</label>
              <select
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="membership">Membresías</option>
                <option value="product_sales">Ventas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Número de WhatsApp</label>
              <div className="flex gap-2">
                <select
                  name="country_code"
                  value={form.country_code}
                  onChange={handleChange}
                  className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors mt-2"
            >
              {loading ? "Creando..." : "Crear negocio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBusinessPage;
