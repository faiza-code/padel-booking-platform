import client from "./client";

// ---------- Auth ----------
export const login = (username, password) =>
  client.post("/auth/login", { username, password }).then((r) => r.data);

// ---------- Courts ----------
export const getCourts = (includeInactive = true) =>
  client.get(`/courts?includeInactive=${includeInactive}`).then((r) => r.data);

export const createCourt = (data) => client.post("/courts", data).then((r) => r.data);
export const updateCourt = (id, data) => client.put(`/courts/${id}`, data).then((r) => r.data);
export const deleteCourt = (id) => client.delete(`/courts/${id}`);

// ---------- Schedules ----------
export const getSchedule = (courtId) =>
  client.get(`/courts/${courtId}/schedule`).then((r) => r.data);

export const setSchedule = (courtId, days) =>
  client.put(`/courts/${courtId}/schedule`, { days }).then((r) => r.data);

// ---------- Closures ----------
export const getClosures = () => client.get("/closures").then((r) => r.data);
export const createClosure = (data) => client.post("/closures", data).then((r) => r.data);
export const deleteClosure = (id) => client.delete(`/closures/${id}`);

// ---------- Availability ----------
export const getAvailability = (date) =>
  client.get(`/availability?date=${date}`).then((r) => r.data);

// ---------- Bookings ----------
export const createBooking = (data) => client.post("/bookings", data).then((r) => r.data);
export const getBookings = (filter = {}) =>
  client.get("/bookings", { params: filter }).then((r) => r.data);
export const startCheckout = (bookingId) =>
  client.post(`/bookings/${bookingId}/checkout`).then((r) => r.data);
export const confirmPayment = (bookingId, sessionId) =>
  client.post(`/bookings/${bookingId}/confirm-payment`, { sessionId }).then((r) => r.data);
export const lookupBookingsByPhone = (phone) =>
  client.get(`/bookings/lookup`, { params: { phone } }).then((r) => r.data);
