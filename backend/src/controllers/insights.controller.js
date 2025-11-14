// backend/src/controllers/insights.controller.js
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Booking from "../models/booking.model.js";
import Store from "../models/store.model.js";

const parseDaysWindow = (value, fallback = 30) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 365) {
    return Math.round(parsed);
  }
  return fallback;
};

const buildSinceDate = (days) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);
  return since;
};

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

// ---------------------------------------------------------------------
// 📦 INSIGHTS PARA VENTA DE PRODUCTOS
// ---------------------------------------------------------------------
export const getProductInsightsForStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const windowInDays = parseDaysWindow(req.query?.days);
    const since = buildSinceDate(windowInDays);

    const [store, products, orders] = await Promise.all([
      Store.findById(storeId).lean(),
      Product.find({ store: storeId }).lean(),
      Order.find({
        store: storeId,
        createdAt: { $gte: since },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!store) {
      return res.status(404).json({
        ok: false,
        message: "Tienda no encontrada",
      });
    }

    const productCatalog = new Map();
    for (const product of products) {
      productCatalog.set(String(product._id), product);
    }

    const salesByProduct = new Map();
    let totalItemsSold = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      totalRevenue += order.total || 0;
      for (const item of order.items || []) {
        const productId = String(item.product || item.productId || "");
        if (!productId) continue;

        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice ?? item.price ?? 0;
        const revenue = quantity * unitPrice;

        totalItemsSold += quantity;

        if (!salesByProduct.has(productId)) {
          salesByProduct.set(productId, {
            productId,
            totalSold: 0,
            totalRevenue: 0,
            name:
              item.productName || productCatalog.get(productId)?.name || "Producto",
          });
        }

        const stat = salesByProduct.get(productId);
        stat.totalSold += quantity;
        stat.totalRevenue += revenue || item.subtotal || 0;
      }
    }

    const stats = [];
    for (const product of products) {
      const productId = String(product._id);
      const saleInfo = salesByProduct.get(productId) || {
        productId,
        name: product.name,
        totalSold: 0,
        totalRevenue: 0,
      };

      stats.push({
        ...saleInfo,
        stock: product.stock ?? null,
        price: product.price ?? null,
      });
    }

    // agregar productos vendidos que ya no están en catálogo
    for (const [productId, saleInfo] of salesByProduct.entries()) {
      if (!productCatalog.has(productId)) {
        stats.push({ ...saleInfo, stock: null, price: null });
      }
    }

    const topProducts = [...stats]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const lowProducts = [...stats]
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 5);

    const inventoryAlerts = [];
    for (const product of stats) {
      if (typeof product.stock === "number" && product.stock <= 3) {
        inventoryAlerts.push({
          level: "warning",
          message: `Stock crítico en "${product.name}" (quedan ${product.stock} uds).`,
        });
      } else if (product.totalSold === 0 && (product.stock ?? 0) > 0) {
        inventoryAlerts.push({
          level: "info",
          message: `"${product.name}" tiene stock disponible pero no registró ventas en los últimos ${windowInDays} días.`,
        });
      }
    }

    const suggestions = [];

    if (!orders.length) {
      suggestions.push(
        `Aún no registras ventas en los últimos ${windowInDays} días. Comparte tu tienda ${
          store.name ? `"${store.name}"` : ""
        } en redes sociales o con tus clientes frecuentes para activar las primeras compras.`
      );
    }

    if (topProducts.length) {
      const [best] = topProducts;
      const share = totalItemsSold
        ? Math.round((best.totalSold / totalItemsSold) * 100)
        : 0;
      suggestions.push(
        `"${best.name}" concentra ${share}% de las unidades vendidas. Destaca este producto en la portada y considera armar bundles para subir el ticket promedio (${currencyFormatter.format(
          best.totalRevenue
        )}).`
      );
    }

    const lowPerformers = lowProducts
      .filter((p) => p.totalSold === 0)
      .map((p) => p.name)
      .slice(0, 3);
    if (lowPerformers.length) {
      suggestions.push(
        `Los productos ${lowPerformers.join(", ")} no han salido en este período. Prueba cambiar sus fotos, ajustar precio o incluirlos en promociones relámpago.`
      );
    }

    const criticalStock = inventoryAlerts
      .filter((a) => a.level === "warning")
      .map((a) => a.message.match(/"(.+?)"/)?.[1])
      .filter(Boolean);
    if (criticalStock.length) {
      suggestions.push(
        `Reabastece cuanto antes ${criticalStock.join(", ")}, porque podrían quedarse sin stock si mantienen la misma demanda.`
      );
    }

    const averageOrderValue = orders.length
      ? totalRevenue / orders.length
      : 0;
    if (averageOrderValue && totalItemsSold > orders.length) {
      suggestions.push(
        `El ticket promedio está en ${currencyFormatter.format(
          averageOrderValue
        )}. Ofrece envíos gratis sobre ese monto o paquetes de productos para impulsar compras mayores.`
      );
    }

    const summary = {
      totalOrders: orders.length,
      totalItemsSold,
      totalRevenue,
      uniqueProducts: salesByProduct.size,
      windowInDays,
      averageOrderValue,
    };

    res.json({
      ok: true,
      summary,
      topProducts,
      lowProducts,
      inventoryAlerts,
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
    const windowInDays = parseDaysWindow(req.query?.days);
    const since = buildSinceDate(windowInDays);

    const [store, bookings] = await Promise.all([
      Store.findById(storeId).lean(),
      Booking.find({
        store: storeId,
        date: { $gte: since },
      })
        .sort({ date: 1, slot: 1 })
        .lean(),
    ]);

    if (!store) {
      return res.status(404).json({
        ok: false,
        message: "Tienda no encontrada",
      });
    }

    if (!bookings.length) {
      return res.json({
        ok: true,
        summary: {
          totalAppointments: 0,
          confirmed: 0,
          cancelled: 0,
          completionRate: 0,
          windowInDays,
        },
        busySlots: [],
        services: [],
        suggestions: [
          `Todavía no recibes reservas en los últimos ${windowInDays} días. Publica los horarios de "${store.name}" en redes sociales e invita a tus mejores clientes a agendar en línea.`,
        ],
      });
    }

    let confirmed = 0;
    let cancelled = 0;
    const bySlot = new Map();

    for (const booking of bookings) {
      const slot = booking.slot || "Sin horario";
      bySlot.set(slot, (bySlot.get(slot) || 0) + 1);

      if (booking.status === "cancelled") cancelled++;
      if (booking.status === "confirmed") confirmed++;
    }

    const totalAppointments = bookings.length;
    const completionRate = totalAppointments
      ? Math.round((confirmed / totalAppointments) * 100)
      : 0;

    const busySlots = [...bySlot.entries()]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const services = [];

    const suggestions = [];

    if (busySlots.length) {
      suggestions.push(
        `Tus horarios más solicitados son ${busySlots
          .map((slot) => slot.hour)
          .join(", ")}. Refuerza la disponibilidad en esos tramos o considera subir el precio premium para ellos.`
      );
    }

    const quietSlots = [...bySlot.entries()]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 3);
    if (quietSlots.length) {
      suggestions.push(
        `Bloques con menos reservas: ${quietSlots
          .map((slot) => slot.hour)
          .join(", ")}. Envía recordatorios a tus clientes o arma promociones específicas para mover esos horarios.`
      );
    }

    if (cancelled > 0) {
      suggestions.push(
        `Registraste ${cancelled} cancelaciones en ${windowInDays} días. Contacta a los clientes para entender las razones y ajusta tu política de confirmación si es necesario.`
      );
    }

    if (completionRate < 60 && totalAppointments >= 5) {
      suggestions.push(
        `Tu tasa de confirmación es del ${completionRate}%. Envía recordatorios automáticos 24 horas antes y ofrece confirmación vía WhatsApp para reducir ausencias.`
      );
    }

    const summary = {
      totalAppointments,
      confirmed,
      cancelled,
      completionRate,
      windowInDays,
    };

    res.json({
      ok: true,
      summary,
      busySlots,
      services,
      suggestions,
      suggestionsByCategory,
      quietSlots,
    });
  } catch (err) {
    console.error("Error en getBookingInsightsForStore:", err);
    res.status(500).json({
      ok: false,
      message: "Error al calcular insights de agendamiento.",
    });
  }
};
