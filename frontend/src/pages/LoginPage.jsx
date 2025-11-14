import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainHeader from "../components/MainHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signin, loading } = useAuth(); // alias compatible

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signin(form);
      navigate("/", { replace: true }); // 👈 redirige al home (mapa)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.[0] ||
        "Credenciales inválidas";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MainHeader subtitle="Iniciar sesión" />
      <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
        <section className="hidden md:flex items-center justify-center">
          <img
            src="/logo-vitrinex.png"
            alt="Vitrinex"
            className="h-40 w-auto object-contain"
          />
        </section>

        <section>
          <div className="bg-white rounded-2xl shadow p-6 border">
            <h1 className="text-2xl font-semibold text-slate-800">Iniciar sesión</h1>
            <p className="text-slate-600 text-sm mt-1">
              Accede a tu cuenta para administrar tus negocios o crear nuevos en Vitrinex.
            </p>

            {error && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="text-sm text-slate-600 mt-4">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/register" className="text-blue-600 underline">
                Crear una cuenta
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
