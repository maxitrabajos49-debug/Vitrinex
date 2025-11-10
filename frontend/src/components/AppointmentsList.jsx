// src/components/AppointmentsList.jsx
import { useEffect, useState } from "react";
import { listStoreAppointments } from "../api/store";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "full",
});

export default function AppointmentsList({ storeId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreAppointments(storeId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar reservas", err?.response || err);
      setError(err?.response?.data?.message || "No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Reservas recibidas
          </h3>
          <p className="text-sm text-slate-500">
            Revisa las citas que tus clientes han solicitado.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-sm text-blue-600 hover:underline"
        >
          Actualizar
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Cargando reservas…</p>}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && appointments.length === 0 && !error && (
        <p className="text-sm text-slate-500">
          Aún no tienes reservas. Comparte tu enlace público para recibir tus
          primeras citas.
        </p>
      )}

      <div className="grid gap-3">
        {appointments.map((appointment) => {
          const date = appointment.date ? new Date(appointment.date) : null;
          return (
            <article
              key={appointment._id}
              className="border border-slate-200 rounded-xl px-4 py-3 space-y-1"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-semibold text-slate-700">
                  {appointment.customerName}
                </h4>
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {appointment.status === "pending"
                    ? "Pendiente"
                    : appointment.status === "confirmed"
                    ? "Confirmada"
                    : "Cancelada"}
                </span>
              </div>

              {date && (
                <p className="text-sm text-slate-600">
                  {dateFormatter.format(date)} · {appointment.slot}
                </p>
              )}

              {appointment.customerEmail && (
                <p className="text-xs text-slate-500">
                  📧 {appointment.customerEmail}
                </p>
              )}

              {appointment.customerPhone && (
                <p className="text-xs text-slate-500">
                  📞 {appointment.customerPhone}
                </p>
              )}

              {appointment.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  {appointment.notes}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
