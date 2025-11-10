// src/components/BookingAvailabilityManager.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getStoreAvailability,
  updateStoreAvailability,
} from "../api/store";

const DAYS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const SLOT_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;

const normalizeSlot = (slot) => {
  if (!slot) return "";
  const trimmed = slot.trim();
  if (!SLOT_REGEX.test(trimmed)) return "";
  const [hours, minutes] = trimmed.split(":");
  const formattedHours = hours.padStart(2, "0");
  return `${formattedHours}:${minutes}`;
};

const sortAvailability = (availability) => {
  const order = Object.fromEntries(DAYS.map((day, index) => [day.value, index]));
  return [...availability].sort(
    (a, b) => (order[a.dayOfWeek] || 0) - (order[b.dayOfWeek] || 0)
  );
};

// Para construir una vista de la próxima semana
const WEEK_DOW = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const buildWeekPreview = (availability) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dow = WEEK_DOW[d.getDay()];
    const entry = availability.find((item) => item.dayOfWeek === dow);

    result.push({
      date: d,
      dayOfWeek: dow,
      slots: entry?.slots || [],
    });
  }

  return result;
};

export default function BookingAvailabilityManager({ storeId }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState("monday");
  const [slotInput, setSlotInput] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getStoreAvailability(storeId);
        setAvailability(
          Array.isArray(data?.availability) ? data.availability : []
        );
      } catch (err) {
        console.error("Error al cargar disponibilidad", err?.response || err);
        setError(
          err?.response?.data?.message || "No se pudo cargar la disponibilidad"
        );
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      load();
    }
  }, [storeId]);

  const sortedAvailability = useMemo(
    () => sortAvailability(availability),
    [availability]
  );

  const weekPreview = useMemo(
    () => buildWeekPreview(availability),
    [availability]
  );

  const addSlot = () => {
    setError("");
    setMessage("");

    const normalized = normalizeSlot(slotInput);
    if (!normalized) {
      setError("Ingresa un horario válido en formato HH:MM");
      return;
    }

    setAvailability((prev) => {
      const copy = [...prev];
      const entryIndex = copy.findIndex(
        (item) => item.dayOfWeek === selectedDay
      );

      if (entryIndex === -1) {
        return [...copy, { dayOfWeek: selectedDay, slots: [normalized] }];
      }

      const slots = new Set(copy[entryIndex].slots || []);
      slots.add(normalized);
      copy[entryIndex] = {
        ...copy[entryIndex],
        slots: Array.from(slots).sort(),
      };
      return copy;
    });

    setSlotInput("");
  };

  const removeSlot = (day, slot) => {
    setAvailability((prev) =>
      prev
        .map((entry) => {
          if (entry.dayOfWeek !== day) return entry;
          const filtered = (entry.slots || []).filter((s) => s !== slot);
          return { ...entry, slots: filtered };
        })
        .filter((entry) => entry.slots.length > 0)
    );
  };

  const removeDay = (day) => {
    setAvailability((prev) =>
      prev.filter((entry) => entry.dayOfWeek !== day)
    );
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      console.log("➡️ Guardando disponibilidad para storeId:", storeId);
      console.log("➡️ Payload availability:", availability);

      const { data } = await updateStoreAvailability(storeId, availability);

      console.log("✅ Respuesta del backend al guardar disponibilidad:", data);

      setAvailability(
        Array.isArray(data?.availability) ? data.availability : []
      );
      setMessage("Disponibilidad guardada correctamente");
    } catch (err) {
      console.error("❌ Error al guardar disponibilidad", err?.response || err);
      setError(
        err?.response?.data?.message ||
          "No se pudo guardar la disponibilidad"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Horarios disponibles 
        </h3>
        <p className="text-sm text-slate-500">Cargando horarios…</p>
      </section>
    );
  }

  return (
    <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Horarios disponibles
          </h3>
          <p className="text-sm text-slate-500">
            Define los días y horarios en que tus clientes pueden reservar.
          </p>
        </div>
        <button
          type="button"
          onClick={saveAvailability}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      {/* Editor de patrones semanales */}
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Día de la semana
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Horario (HH:MM)
          </label>
          <input
            value={slotInput}
            onChange={(e) => setSlotInput(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="09:00"
          />
        </div>

        <button
          type="button"
          onClick={addSlot}
          className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-lg"
        >
          Agregar horario
        </button>
      </div>

      {/* Lista de patrones por día de la semana */}
      {sortedAvailability.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aún no tienes horarios configurados. Agrega tus primeros horarios para
          comenzar a recibir reservas.
        </p>
      ) : (
        <div className="grid gap-3">
          {sortedAvailability.map((entry) => {
            const day = DAYS.find((day) => day.value === entry.dayOfWeek);
            return (
              <div
                key={entry.dayOfWeek}
                className="border border-slate-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-700">
                    {day?.label || entry.dayOfWeek}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeDay(entry.dayOfWeek)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar día
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(entry.slots || []).map((slot) => (
                    <span
                      key={slot}
                      className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => removeSlot(entry.dayOfWeek, slot)}
                        className="text-slate-500 hover:text-red-600"
                        aria-label={`Eliminar horario ${slot}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista de la próxima semana */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Vista de la próxima semana
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Así verán tus clientes los horarios disponibles durante los próximos 7 días,
          según lo que configuraste arriba.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {weekPreview.map((dayInfo) => {
            const label = dayInfo.date.toLocaleDateString("es-CL", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <div
                key={dayInfo.date.toISOString()}
                className="border border-slate-200 rounded-xl px-4 py-3"
              >
                <h5 className="text-xs font-semibold text-slate-700 mb-2">
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </h5>
                {dayInfo.slots.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sin horarios disponibles este día.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dayInfo.slots.map((slot) => (
                      <span
                        key={slot}
                        className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
