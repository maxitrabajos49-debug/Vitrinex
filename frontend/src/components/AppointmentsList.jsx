// src/components/AppointmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listStoreAppointments,
  updateAppointmentStatus,
} from "../api/store";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const STATUS_COLORS = {
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:
    "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function AppointmentsList({ storeId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreAppointments(storeId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar citas", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las reservas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const appt of appointments) {
      const key = appt.date; // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appt);
    }

    // ordenar días y horarios
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, list]) => ({
        date,
        items: list.sort((a, b) =>
          a.slot < b.slot ? -1 : 1
        ),
      }));
  }, [appointments]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleChangeStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      setMsg("");

      const { data } = await updateAppointmentStatus(
        storeId,
        bookingId,
        status
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === bookingId ? data : appt
        )
      );
      setMsg("Estado de la cita actualizado.");
    } catch (err) {
      console.error("Error al cambiar estado", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado de la cita"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-white border rounded-2xl p-5 shadow-sm mt-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Reservas recibidas
        </h3>
        <p className="text-sm text-slate-500">
          Cargando reservas…
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm mt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Reservas recibidas
          </h3>
          <p className="text-sm text-slate-500">
            Revisa quién ha agendado, en qué día y a qué hora.
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

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {msg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {msg}
        </p>
      )}

      {groupedByDate.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no tienes reservas. Comparte tu enlace público
          para recibir tus primeras citas.
        </p>
      ) : (
        <div className="space-y-3">
          {groupedByDate.map((group) => (
            <article
              key={group.date}
              className="border border-slate-200 rounded-xl px-4 py-3 space-y-2"
            >
              <h4 className="font-semibold text-slate-700 text-sm">
                {formatDate(group.date)}
              </h4>

              <div className="space-y-2">
                {group.items.map((appt) => (
                  <div
                    key={appt._id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-slate-100 pt-2 first:border-t-0 first:pt-0"
                  >
                    <div className="text-sm text-slate-700 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {appt.slot}
                        </span>
                        <span className="font-medium">
                          {appt.customerName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {appt.customerEmail} · {appt.customerPhone}
                      </div>
                      {appt.notes && (
                        <div className="text-xs text-slate-500">
                          Nota: {appt.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                          (STATUS_COLORS[appt.status] ||
                            "bg-slate-100 text-slate-700 border border-slate-200")
                        }
                      >
                        {STATUS_LABELS[appt.status] ||
                          appt.status ||
                          "Sin estado"}
                      </span>

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-1">
                        {appt.status !== "confirmed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "confirmed"
                              )
                            }
                            disabled={updatingId === appt._id}
                            className="text-xs px-2 py-1 rounded-md border border-emerald-500 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            Confirmar
                          </button>
                        )}

                        {appt.status !== "pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "pending"
                              )
                            }
                            disabled={updatingId === appt._id}
                            className="text-xs px-2 py-1 rounded-md border border-amber-500 text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                          >
                            Pendiente
                          </button>
                        )}

                        {appt.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(
                                appt._id,
                                "cancelled"
                              )
                            }
                            disabled={updatingId === appt._id}
                            className="text-xs px-2 py-1 rounded-md border border-rose-500 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
