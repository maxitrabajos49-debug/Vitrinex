// src/components/BookingAvailabilityManager.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getStoreAvailability,
  updateStoreAvailability,
} from "../api/store";

const SLOT_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;

const normalizeSlotInput = (slot) => {
  if (!slot) return "";
  const trimmed = slot.trim();
  if (!SLOT_REGEX.test(trimmed)) return "";
  const [hours, minutes] = trimmed.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
};

const parseIsoDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const [year, month, day] = value.split("-").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

const sanitizeAvailability = (entries) => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      const date = typeof entry.date === "string" ? entry.date : "";
      const slots = Array.isArray(entry.slots)
        ? entry.slots
            .map((slot) => {
              if (typeof slot === "string") {
                const normalized = normalizeSlotInput(slot);
                return normalized ? { time: normalized, booked: false } : null;
              }
              if (slot && typeof slot.time === "string") {
                const normalized = normalizeSlotInput(slot.time);
                return normalized
                  ? { time: normalized, booked: Boolean(slot.booked) }
                  : null;
              }
              return null;
            })
            .filter((slot) => Boolean(slot))
        : [];

      if (!date || slots.length === 0) {
        return null;
      }

      const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));

      return { date, slots: sortedSlots };
    })
    .filter((entry) => Boolean(entry))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const buildMonthKey = (value) => {
  if (!value) return "";
  return value.slice(0, 7);
};

export default function BookingAvailabilityManager({ storeId }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }, []);

  const [monthFilter, setMonthFilter] = useState(today);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await getStoreAvailability(storeId);
        const sanitized = sanitizeAvailability(data?.availability);
        setAvailability(sanitized);
        const hasSelected = sanitized.some((entry) => entry.date === selectedDate);
        if (sanitized.length > 0 && (!selectedDate || !hasSelected)) {
          setSelectedDate(sanitized[0].date);
        }
        if (sanitized.length === 0) {
          setSelectedDate("");
        }
      } catch (err) {
        console.error("Error al cargar disponibilidad", err?.response || err);
        setAvailability([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => {
    if (selectedDate) {
      setMonthFilter(buildMonthKey(selectedDate) || today);
    }
  }, [selectedDate, today]);

  const filteredAvailability = useMemo(() => {
    if (!monthFilter) return availability;
    return availability.filter((entry) => entry.date.startsWith(monthFilter));
  }, [availability, monthFilter]);

  const startEditSlot = (date, slot) => {
    if (slot.booked) {
      setError(
        "No puedes editar un horario que ya tiene una reserva registrada."
      );
      return;
    }

    setError("");
    setMessage("");
    setEditingSlot({ date, time: slot.time });
    setSelectedDate(date);
    setTimeInput(slot.time);
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    setTimeInput("");
  };

  const handleMonthChange = (value) => {
    setMonthFilter(value);
    if (value && (!selectedDate || !selectedDate.startsWith(value))) {
      setSelectedDate(`${value}-01`);
    }
  };

  const upsertSlot = () => {
    setError("");
    setMessage("");

    if (!selectedDate) {
      setError("Selecciona un día para agregar horarios.");
      return;
    }

    const parsedDate = parseIsoDate(selectedDate);
    if (!parsedDate) {
      setError("Selecciona una fecha válida.");
      return;
    }

    const normalizedSlot = normalizeSlotInput(timeInput);
    if (!normalizedSlot) {
      setError("Ingresa un horario válido en formato HH:MM.");
      return;
    }

    const duplicate = availability.some((entry) => {
      if (entry.date !== selectedDate) return false;
      return entry.slots.some((slot) => {
        if (slot.time !== normalizedSlot) return false;
        if (!editingSlot) return true;
        return !(editingSlot.date === entry.date && editingSlot.time === slot.time);
      });
    });

    if (duplicate) {
      setError("Ese horario ya está registrado para el día seleccionado.");
      return;
    }

    setAvailability((prev) => {
      const draft = prev.map((entry) => ({
        ...entry,
        slots: entry.slots.map((slot) => ({ ...slot })),
      }));

      if (editingSlot) {
        const previousEntry = draft.find(
          (entry) => entry.date === editingSlot.date
        );
        if (previousEntry) {
          previousEntry.slots = previousEntry.slots.filter(
            (slot) => slot.time !== editingSlot.time
          );
        }
      }

      let target = draft.find((entry) => entry.date === selectedDate);
      if (!target) {
        target = { date: selectedDate, slots: [] };
        draft.push(target);
      }

      target.slots.push({ time: normalizedSlot, booked: false });
      target.slots.sort((a, b) => a.time.localeCompare(b.time));

      const cleaned = draft
        .map((entry) => ({
          ...entry,
          slots: entry.slots.filter((slot) => Boolean(slot.time)),
        }))
        .filter((entry) => entry.slots.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date));

      return cleaned;
    });

    setEditingSlot(null);
    setTimeInput("");
    setMessage("Horario agregado correctamente. Recuerda guardar los cambios.");
  };

  const removeSlot = (date, slot) => {
    if (slot.booked) {
      setError(
        "No puedes eliminar un horario que ya tiene una reserva confirmada."
      );
      return;
    }

    setAvailability((prev) =>
      prev
        .map((entry) => {
          if (entry.date !== date) return entry;
          return {
            ...entry,
            slots: entry.slots.filter((item) => item.time !== slot.time),
          };
        })
        .filter((entry) => entry.slots.length > 0)
    );

    if (editingSlot && editingSlot.date === date && editingSlot.time === slot.time) {
      cancelEdit();
    }
  };

  const removeDay = (date) => {
    const day = availability.find((entry) => entry.date === date);
    if (day?.slots?.some((slot) => slot.booked)) {
      setError(
        "No puedes eliminar un día que ya tiene reservas asignadas. Cancela o reubica esas citas primero."
      );
      return;
    }

    setAvailability((prev) => prev.filter((entry) => entry.date !== date));

    if (editingSlot?.date === date) {
      cancelEdit();
    }
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = availability.map((entry) => ({
        date: entry.date,
        slots: entry.slots.map((slot) => slot.time),
      }));

      const { data } = await updateStoreAvailability(storeId, payload);
      const sanitized = sanitizeAvailability(data?.availability);
      setAvailability(sanitized);
      setMessage("Disponibilidad guardada correctamente.");
      cancelEdit();
    } catch (err) {
      console.error("Error al guardar disponibilidad", err?.response || err);
      setError(
        err?.response?.data?.message || "No se pudo guardar la disponibilidad"
      );
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = useMemo(() => {
    const parsed = parseIsoDate(`${monthFilter || today}-01`);
    return parsed ? monthFormatter.format(parsed) : "";
  }, [monthFilter, today]);

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
            Define las fechas y horas exactas en que tus clientes pueden reservar.
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

      <div className="grid gap-3 md:grid-cols-3 md:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Mes de trabajo
          </label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Día disponible
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            min={monthFilter ? `${monthFilter}-01` : ""}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Horario (HH:MM)
          </label>
          <input
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="09:00"
            type="time"
          />
        </div>
        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={upsertSlot}
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-lg"
          >
            {editingSlot ? "Actualizar horario" : "Agregar horario"}
          </button>
          {editingSlot && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-slate-600 hover:underline"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="button"
            onClick={() => setMonthFilter("")}
            className="text-xs text-blue-600 hover:underline"
          >
            Ver todos los meses
          </button>
          {monthLabel && (
            <span className="text-xs text-slate-500">
              Mes seleccionado: <span className="font-medium">{monthLabel}</span>
            </span>
          )}
        </div>
      </div>

      {filteredAvailability.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aún no tienes horarios configurados para este mes. Agrega tus primeros
          horarios para comenzar a recibir reservas.
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredAvailability.map((entry) => {
            const dateObj = parseIsoDate(entry.date);
            return (
              <div
                key={entry.date}
                className="border border-slate-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-700">
                      {dateObj ? dateFormatter.format(dateObj) : entry.date}
                    </h4>
                    {entry.slots.some((slot) => slot.booked) && (
                      <p className="text-xs text-amber-600">
                        Algunos horarios ya tienen reservas confirmadas.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDay(entry.date)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar día
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.slots.map((slot) => (
                    <span
                      key={`${entry.date}-${slot.time}`}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
                        slot.booked
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-slate-300 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {slot.time}
                      {slot.booked ? (
                        <span className="text-[10px] uppercase tracking-wide">
                          Reservado
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditSlot(entry.date, slot)}
                            className="text-slate-500 hover:text-slate-800"
                            aria-label={`Editar horario ${slot.time}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSlot(entry.date, slot)}
                            className="text-slate-500 hover:text-red-600"
                            aria-label={`Eliminar horario ${slot.time}`}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
