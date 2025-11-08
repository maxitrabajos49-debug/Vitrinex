// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signin, isAuthenticated, authErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Después de iniciar sesión, lo dejamos en el mapa
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    await signin(values); // 👈 usamos signin del AuthContext
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-500">
          Accede a tu cuenta para administrar tus negocios o crear nuevos en Vitrinex.
        </p>

        {authErrors &&
          authErrors.map((err, i) => (
            <p
              key={i}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {err}
            </p>
          ))}

        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-slate-700">
              Correo electrónico
            </label>
            <input
              type="email"
              {...register("email", {
                required: "El correo es obligatorio",
              })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-slate-700">Contraseña</label>
            <input
              type="password"
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
