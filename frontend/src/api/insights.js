// frontend/src/api/insights.js
import axios from "./axios";

export const fetchProductInsights = (storeId, days = 30) =>
  axios.get(`/stores/${storeId}/insights/products`, {
    params: { days },
  });

export const fetchBookingInsights = (storeId, days = 30) =>
  axios.get(`/stores/${storeId}/insights/bookings`, {
    params: { days },
  });
