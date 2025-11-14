// src/pages/HomePage.jsx
import MainHeader from "../components/MainHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-violet-50">
      <MainHeader subtitle="Inicio" />
      <main className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-violet-800 mb-6">
          Bienvenido a Vitrinex
        </h1>
        <p className="text-slate-700 text-lg leading-relaxed">
          Explora, gestiona y potencia tus negocios locales desde una sola
          plataforma.
        </p>
        <div className="mt-10">
          <a
            href="/explorar"
            className="px-6 py-3 bg-violet-700 text-white rounded-xl hover:bg-violet-800 transition"
          >
            Explorar tiendas
          </a>
        </div>
      </main>
    </div>
  );
}
