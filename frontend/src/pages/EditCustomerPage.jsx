import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../api/axios";

const EditCustomerPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const customer = state?.customer;

  const [form, setForm] = useState({
    full_name: customer?.full_name || "",
    is_verified: customer?.is_verified ?? false,
    payment_due_day: customer?.payment_due_day || "",
    monthly_fee: customer?.monthly_fee || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isMembership = customer?.payment_due_day !== null || customer?.monthly_fee !== null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put(`/customers/${customerId}`, {
        full_name: form.full_name || null,
        is_verified: form.is_verified,
        payment_due_day: form.payment_due_day ? Number(form.payment_due_day) : null,
        monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : null,
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">No se encontró el cliente.</p>
          <button onClick={() => navigate(-1)} className="text-emerald-400 text-sm hover:text-emerald-300">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
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
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">Editar cliente</h1>
            <p className="text-xs text-slate-500 mt-1">{customer.phone}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre completo</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Nombre del cliente"
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Membership-only fields */}
            {isMembership && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Cuota mensual (₡)</label>
                  <input
                    type="number"
                    name="monthly_fee"
                    value={form.monthly_fee}
                    onChange={handleChange}
                    placeholder="15000"
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Día de pago (1–31)</label>
                  <input
                    type="number"
                    name="payment_due_day"
                    value={form.payment_due_day}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                    max="31"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Verified toggle */}
            <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5">
              <span className="text-sm text-slate-300">Cliente verificado</span>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_verified: !prev.is_verified }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  form.is_verified ? "bg-emerald-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    form.is_verified ? "left-5" : "left-1"
                  }`}
                />
              </button>
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPage;
