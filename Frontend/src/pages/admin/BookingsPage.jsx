import { useEffect, useState } from "react";
import { getBookings, getCourts } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";

const STATUS_LABELS = ["Pending", "Confirmed", "Cancelled", "Completed"];
const PAYMENT_LABELS = ["Cash on Arrival", "E-Payment"];
const PAYMENT_STATUS_LABELS = ["Unpaid", "Paid", "Failed", "Refunded"];

function fmtTime(t) { return t.slice(0, 5); }

function initials(name) {
  if (!name) return "?";
  return name.trim().slice(0, 2).toUpperCase();
}

function statusBadgeStyle(status) {
  if (status === 1) return { background: "var(--lime)", color: "var(--on-lime)" };
  if (status === 2) return { background: "var(--clay-bg)", color: "var(--clay)" };
  return { background: "var(--card-hi)", color: "var(--ink-soft)" };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ courtId: "", fromDate: "", toDate: "", status: "", paymentMethod: "" });

  function load() {
    setLoading(true);
    const params = {};
    if (filter.courtId) params.CourtId = filter.courtId;
    if (filter.fromDate) params.FromDate = filter.fromDate;
    if (filter.toDate) params.ToDate = filter.toDate;
    if (filter.status !== "") params.Status = filter.status;
    if (filter.paymentMethod !== "") params.PaymentMethod = filter.paymentMethod;

    getBookings(params).then(setBookings).finally(() => setLoading(false));
  }

  useEffect(() => { getCourts(true).then(setCourts); }, []);
  useEffect(load, [filter]);

  const rows = bookings.flatMap((b) => b.slots.map((s) => ({ order: b, slot: s })));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26 }}>Bookings</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 4 }}>View and filter all customer bookings.</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Stadium</label>
            <select value={filter.courtId} onChange={(e) => setFilter({ ...filter, courtId: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border-variant)", width: "100%" }}>
              <option value="">All Stadiums</option>
              {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>From Date</label>
            <input type="date" value={filter.fromDate} onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border-variant)", width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>To Date</label>
            <input type="date" value={filter.toDate} onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border-variant)", width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Payment</label>
            <select value={filter.paymentMethod} onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border-variant)", width: "100%" }}>
              <option value="">All Methods</option>
              {PAYMENT_LABELS.map((s, i) => <option key={i} value={i}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Status</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setFilter({ ...filter, status: "" })} style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, textTransform: "uppercase",
              border: filter.status === "" ? "none" : "1px solid var(--border-variant)",
              background: filter.status === "" ? "var(--lime)" : "transparent",
              color: filter.status === "" ? "var(--on-lime)" : "var(--ink-soft)",
            }}>
              All
            </button>
            {STATUS_LABELS.map((s, i) => (
              <button key={i} onClick={() => setFilter({ ...filter, status: String(i) })} style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, textTransform: "uppercase",
                border: filter.status === String(i) ? "none" : "1px solid var(--border-variant)",
                background: filter.status === String(i) ? "var(--lime)" : "transparent",
                color: filter.status === String(i) ? "var(--on-lime)" : "var(--ink-soft)",
              }}>
                {s}
              </button>
            ))}
            <Button variant="ghost" onClick={() => setFilter({ courtId: "", fromDate: "", toDate: "", status: "", paymentMethod: "" })}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? <p style={{ color: "var(--ink-soft)" }}>Loading...</p> : (
        <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid var(--border-variant)", overflow: "hidden" }}>
          {rows.length === 0 ? (
            <p style={{ padding: 28, color: "var(--ink-soft)" }}>No matching bookings.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--card-hi)", borderBottom: "1px solid var(--border-variant)" }}>
                  {["Customer", "Stadium", "Time Period", "Amount", "Status", "Payment"].map((h) => (
                    <th key={h} style={{ padding: 16, fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ order, slot }, i) => (
                  <tr key={`${order.id}-${slot.id}`} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", background: "var(--card-hi)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 13, color: "var(--lime)", border: "1px solid var(--border-variant)",
                        }}>
                          {initials(order.customerName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{order.customerName || "No name"}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{order.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 600 }}>{slot.courtName}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{slot.date}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{fmtTime(slot.startTime)} - {fmtTime(slot.endTime)}</div>
                    </td>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 800, color: "var(--lime)" }}>{slot.price.toFixed(3)} OMR</td>
                    <td style={{ padding: 16 }}>
                      <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, textTransform: "uppercase", ...statusBadgeStyle(slot.status) }}>
                        {STATUS_LABELS[slot.status]}
                      </span>
                    </td>
                    <td style={{ padding: 16, fontSize: 12, color: "var(--ink-soft)" }}>
                      {PAYMENT_LABELS[order.paymentMethod]}
                      <div style={{ fontSize: 10 }}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rows.length > 0 && (
            <div style={{
              padding: 18, borderTop: "1px solid var(--border-variant)", background: "var(--card-hi)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                Showing {rows.length} of {rows.length} bookings
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled style={{
                  padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border-variant)",
                  background: "transparent", color: "var(--ink-soft)", fontSize: 11, fontWeight: 800,
                  textTransform: "uppercase", opacity: 0.4, cursor: "not-allowed",
                }}>
                  Previous
                </button>
                <button disabled style={{
                  padding: "8px 18px", borderRadius: 10, border: "none",
                  background: "var(--lime)", color: "var(--on-lime)", fontSize: 11, fontWeight: 800,
                  textTransform: "uppercase", opacity: 0.4, cursor: "not-allowed",
                }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
