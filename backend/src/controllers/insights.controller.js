// backend/src/controllers/insights.controller.js
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js"; // 👈 AQUÍ EL CAMBIO

// ---------------------------------------------------------------------
// 📦 INSIGHTS PARA VENTA DE PRODUCTOS
// ---------------------------------------------------------------------
export const getProductInsightsForStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;

    // 1) Traer productos de la tienda
    const products = await Product.find({ store: storeId }).lean();

    // 2) Traer pedidos de la tienda
    // ⚠️ Si en tu modelo Order el campo no se llama "store", cámbialo aquí.
    const orders = await Order.find({ store: storeId }).lean();

    // Mapas auxiliares
    const salesByProduct = {};
    const revenueByProduct = {};

    for (const order of orders) {
      // ⚠️ Ajusta "items" si en tu esquema se llama distinto
      for (const item of order.items || []) {
        const pid = String(item.product);

        if (!salesByProduct[pid]) {
          salesByProduct[pid] = 0;
          revenueByProduct[pid] = 0;
        }

        const qty = item.quantity || 1;
        const price = item.price || 0;

        salesByProduct[pid] += qty;
        revenueByProduct[pid] += qty * price;
      }
    }

    // Construimos lista combinando productos + ventas
    const productStats = products.map((p) => {
      const pid = String(p._id);
      const sold = salesByProduct[pid] || 0;
      const revenue = revenueByProduct[pid] || 0;

      return {
        id: pid,
        name: p.name,
        price: p.price,
        stock: p.stock,
        sold,
        revenue,
      };
    });

    // Ordenar por más vendidos / menos vendidos
    const bestSellers = [...productStats]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const slowMovers = [...productStats]
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 5);

    // Productos con poco stock (umbral configurable)
    const LOW_STOCK_THRESHOLD = 5;
    const lowStock = productStats.filter(
      (p) => typeof p.stock === "number" && p.stock <= LOW_STOCK_THRESHOLD
    );

    // Sugerencias básicas
    const suggestions = {
      inventory: [],
      pricing: [],
      marketing: [],
    };

    for (const p of lowStock) {
      suggestions.inventory.push(
        `Reabastecer "${p.name}" (stock actual ${p.stock}, ventas: ${p.sold}).`
      );
    }

    for (const p of slowMovers) {
      if (p.sold === 0) {
        suggestions.marketing.push(
          `Producto "${p.name}" casi no tiene movimiento. Prueba destacar en portada o agrégalo a un combo.`
        );
      } else {
        suggestions.pricing.push(
          `Considera aplicar un descuento temporal a "${p.name}" para aumentar sus ventas (ventas: ${p.sold}).`
        );
      }
    }

    res.json({
      ok: true,
      summary: {
        totalProducts: products.length,
        totalOrders: orders.length,
      },
      bestSellers,
      slowMovers,
      lowStock,
      suggestions,
    });
  } catch (err) {
    console.error("Error en getProductInsightsForStore:", err);
    res.status(500).json({
      ok: false,
      message: "Error al calcular insights de productos.",
    });
  }
};

// ---------------------------------------------------------------------
// 📅 INSIGHTS PARA AGENDAMIENTO (BOOKINGS)
// ---------------------------------------------------------------------
export const getBookingInsightsForStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;

    // ⚠️ Ajusta campos según tu Booking si son distintos
    const bookings = await Booking.find({ store: storeId }).lean();

    if (!bookings.length) {
      return res.json({
        ok: true,
        summary: {
          totalBookings: 0,
          completed: 0,
          cancelled: 0,
        },
        peakHours: [],
        lowDemandSlots: [],
        popularServices: [],
        suggestions: {
          schedule: [],
          marketing: [],
        },
      });
    }

    let completed = 0;
    let cancelled = 0;

    const byHour = {};
    const byService = {};

    for (const b of bookings) {
      const status = b.status || "pending";

      if (status === "completed") completed++;
      if (status === "cancelled") cancelled++;

      // hora (ej: "14:00", o del campo timeSlot)
      const hourKey = b.timeSlot || (b.date && b.date.getHours?.());
      if (hourKey != null) {
        byHour[hourKey] = (byHour[hourKey] || 0) + 1;
      }

      // servicio (ej: b.serviceName)
      const serviceKey = b.serviceName || "Servicio";
      byService[serviceKey] = (byService[serviceKey] || 0) + 1;
    }

    const peakHours = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const lowDemandSlots = Object.entries(byHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    const popularServices = Object.entries(byService)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);

    const suggestions = {
      schedule: [],
      marketing: [],
    };

    if (peakHours.length) {
      suggestions.schedule.push(
        `Tus horarios con más demanda son: ${peakHours
          .map((h) => h.hour)
          .join(", ")}. Asegúrate de tener suficientes cupos allí.`
      );
    }

    if (lowDemandSlots.length) {
      suggestions.schedule.push(
        `Horarios con poca demanda: ${lowDemandSlots
          .map((h) => h.hour)
          .join(", ")}. Prueba ofrecer descuentos o packs en esos bloques.`
      );
    }

    if (popularServices.length) {
      suggestions.marketing.push(
        `Tus servicios más pedidos son: ${popularServices
          .slice(0, 3)
          .map((s) => s.service)
          .join(", ")}. Considera destacarlos en tu página pública.`
      );
    }

    res.json({
      ok: true,
      summary: {
        totalBookings: bookings.length,
        completed,
        cancelled,
      },
      peakHours,
      lowDemandSlots,
      popularServices,
      suggestions,
    });
  } catch (err) {
    console.error("Error en getBookingInsightsForStore:", err);
    res.status(500).json({
      ok: false,
      message: "Error al calcular insights de agendamiento.",
    });
  }
};
