import { useState } from "react";
import { lookupBookingsByPhone } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import CustomerHeader from "../../components/CustomerHeader";

const STATUS_LABELS = ["Pending", "Confirmed", "Cancelled", "Completed"];

function fmtTime(t) { return t.slice(0, 5); }

function statusStyle(status) {
  if (status === 1) return { background: "var(--lime)", color: "var(--on-lime)" };
  if (status === 2) return { background: "var(--clay-bg)", color: "var(--clay)" };
  return { background: "var(--card-hi)", color: "var(--ink-soft)" };
}

export default function MyBookingsPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await lookupBookingsByPhone(phone.trim());
      setOrders(result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const allSlots = (orders || []).flatMap((o) => o.slots.map((s) => ({ order: o, slot: s })));
  const upcoming = allSlots.filter((r) => r.slot.date >= today).sort((a, b) => a.slot.date.localeCompare(b.slot.date));
  const past = allSlots.filter((r) => r.slot.date < today).sort((a, b) => b.slot.date.localeCompare(a.slot.date));

  return (
    <div>
      <CustomerHeader />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>My Bookings</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>
          Enter the phone number you used when booking to view your reservations.
        </p>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              onKeyDown={(e) => e.key === "Enter" && search()}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)" }}
            />
            <Button onClick={search} disabled={loading} style={{ whiteSpace: "nowrap" }}>
              {loading ? "Searching..." : "Find Bookings"}
            </Button>
          </div>
          {error && <p style={{ color: "var(--clay)", marginTop: 12, fontSize: 13 }}>{error}</p>}
        </Card>

        {orders !== null && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="schedule" size={20} style={{ color: "var(--lime)" }} />
                <h3 style={{ fontSize: 16 }}>Upcoming Bookings</h3>
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)",
                  background: "var(--card-hi)", padding: "4px 10px", borderRadius: 999,
                }}>
                  {upcoming.length} sessions
                </span>
              </div>

              {upcoming.length === 0 ? (
                <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>No upcoming bookings found.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {upcoming.map(({ order, slot }, i) => (
                    <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 12, background: "var(--card-hi)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--lime)" }}>
                            {new Date(slot.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                          </span>
                          <span style={{ fontSize: 20, fontWeight: 900 }}>{new Date(slot.date).getDate()}</span>
                        </div>
                        <div>
                          <h4 style={{ fontSize: 15 }}>Booking #{order.id}</h4>
                          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                            {fmtTime(slot.startTime)} - {fmtTime(slot.endTime)}
                          </p>
                        </div>
                      </div>
                      <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, ...statusStyle(slot.status) }}>
                        {STATUS_LABELS[slot.status]}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="history" size={20} style={{ color: "var(--ink-soft)" }} />
                <h3 style={{ fontSize: 16 }}>Past Bookings</h3>
              </div>

              {past.length === 0 ? (
                <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>No past bookings yet.</p>
              ) : (
                <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border-variant)", overflow: "hidden" }}>
                  {past.map(({ order, slot }, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", padding: 16,
                      borderBottom: i < past.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <span style={{ fontSize: 14 }}>{slot.date} &middot; {fmtTime(slot.startTime)}-{fmtTime(slot.endTime)}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{STATUS_LABELS[slot.status]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
