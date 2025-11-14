// src/components/StoreCalendarManager.jsx
import { useEffect, useMemo, useState } from "react";
import { listStoreAppointments } from "../api/store";

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
  },
  confirmed: {
    label: "Confirmada",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
  },
  cancelled: {
    label: "Cancelada",
    className:
      "bg-rose-50 text-rose-700 border border-rose-200 line-through hover:bg-rose-100",
  },
};

function formatDateLabel(date) {
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function StoreCalendarManager({ storeId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [reloading, setReloading] = useState(false);

  // Cargar todas las citas de la tienda (igual que AppointmentsList)
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await listStoreAppointments(storeId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar citas para el calendario", err?.response || err);
      setError(
        err?.response?.data?.message || "No se pudo cargar el calendario de reservas"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Normalizamos la semana mostrada (7 días a partir de anchorDate)
  const weekDays = useMemo(() => {
    const start = new Date(anchorDate);
    // opcional: alinear al lunes
    const dayIndex = start.getDay(); // 0 dom, 1 lun ...
    const diffToMonday = (dayIndex + 6) % 7; // cuantos días retroceder
    start.setDate(start.getDate() - diffToMonday);

    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchorDate]);

  // Agrupamos citas por día
  const appointmentsByDay = useMemo(() => {
    const map = {};
    for (const appt of appointments) {
      if (!appt?.date) continue;
      const iso = appt.date.slice(0, 10); // "YYYY-MM-DD"
      if (!map[iso]) map[iso] = [];
      map[iso].push(appt);
    }

    // Ordenamos por hora
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        if (a.slot === b.slot) return 0;
        return a.slot < b.slot ? -1 : 1;
      });
    });

    return map;
  }, [appointments]);

  const handlePrevWeek = () => {
    setAnchorDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setAnchorDate((prev) => addDays(prev, 7));
  };

  const handleDateInputChange = (e) => {
    const value = e.target.value; // yyyy-mm-dd
    if (!value) return;
    setAnchorDate(new Date(value));
  };

  const handleReloadClick = () => {
    setReloading(true);
    loadAppointments();
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-5 mt-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Calendario de reservas
        </h3>
        <p className="text-sm text-slate-500">Cargando calendario…</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-5 mt-4">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Calendario de reservas
          </h3>
          <p className="text-xs text-slate-500">
            Visualiza rápidamente qué clientes tienes cada día y a qué horario.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50"
          >
            ← Semana anterior
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            className="border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50"
          >
            Semana siguiente →
          </button>
          <input
            type="date"
            className="border border-slate-300 rounded-lg px-2 py-1"
            value={toISO(anchorDate)}
            onChange={handleDateInputChange}
          />
          <button
            type="button"
            onClick={handleReloadClick}
            disabled={reloading}
            className="text-blue-600 hover:underline disabled:opacity-60"
          >
            {reloading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const iso = toISO(day);
          const dayAppointments = appointmentsByDay[iso] || [];

          return (
            <div
              key={iso}
              className="border border-slate-200 rounded-xl px-3 py-3 bg-slate-50/60 flex flex-col min-h-[110px]"
            >
              <div className="mb-2">
                <p className="text-xs font-semibold text-slate-700">
                  {formatDateLabel(day)}
                </p>
                <p className="text-[11px] text-slate-400">{iso}</p>
              </div>

              {dayAppointments.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Sin horarios reservados.
                </p>
              ) : (
                <div className="space-y-1">
                  {dayAppointments.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status || "pending"];
                    return (
                      <div
                        key={appt._id}
                        className="text-[11px] bg-white rounded-lg border border-slate-200 px-2 py-1 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-700">
                            {appt.slot}
                          </span>
                          <span
                            className={`px-2 py-[1px] rounded-full text-[10px] ${cfg.className}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-slate-700 truncate">
                          {appt.customerName || "Sin nombre"}
                        </p>
                        {appt.customerPhone && (
                          <p className="text-slate-400 truncate">
                            {appt.customerPhone}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
