import { useEffect, useState } from "react";
import { getBookings, getCourts } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";

const STATUS_LABELS = ["قيد الانتظار", "مؤكد", "ملغي", "منتهي"];
const PAYMENT_LABELS = ["عند الوصول", "إلكتروني"];
const PAYMENT_STATUS_LABELS = ["غير مدفوع", "مدفوع", "فشل", "مسترد"];

function fmtTime(t) { return t.slice(0, 5); }

function initials(name) {
  if (!name) return "؟";
  return name.trim().slice(0, 2);
}

function statusBadgeStyle(status) {
  // 0 قيد الانتظار, 1 مؤكد, 2 ملغي, 3 منتهي
  if (status === 1) return { background: "rgba(204,255,0,0.3)", color: "var(--court-deep)" };
  if (status === 2) return { background: "#ffdad6", color: "var(--clay)" };
  return { background: "var(--surface)", color: "var(--ink-soft)" };
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

  // نفرد كل فترة حجز كسطر مستقل بالجدول (نفس بيانات الطلب تتكرر لو فيه أكثر من فترة)
  const rows = bookings.flatMap((b) =>
    b.slots.map((s) => ({ order: b, slot: s }))
  );

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>الحجوزات</h1>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={filter.courtId} onChange={(e) => setFilter({ ...filter, courtId: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">كل الملاعب</option>
            {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={filter.fromDate} onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)" }} />
          <input type="date" value={filter.toDate} onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)" }} />
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">كل الحالات</option>
            {STATUS_LABELS.map((s, i) => <option key={i} value={i}>{s}</option>)}
          </select>
          <select value={filter.paymentMethod} onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">كل طرق الدفع</option>
            {PAYMENT_LABELS.map((s, i) => <option key={i} value={i}>{s}</option>)}
          </select>
          <Button variant="ghost" onClick={() => setFilter({ courtId: "", fromDate: "", toDate: "", status: "", paymentMethod: "" })}>
            مسح الفلاتر
          </Button>
        </div>
      </Card>

      {loading ? <p>جارٍ التحميل...</p> : (
        <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          {rows.length === 0 ? (
            <p style={{ padding: 24, color: "var(--ink-soft)" }}>لا توجد حجوزات مطابقة.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                  {["العميل", "الملعب", "الفترة", "المبلغ", "الحالة", "الدفع"].map((h) => (
                    <th key={h} style={{ padding: 14, fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ order, slot }, i) => (
                  <tr key={`${order.id}-${slot.id}`} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", background: "rgba(204,255,0,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 12, color: "var(--court-deep)",
                        }}>
                          {initials(order.customerName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customerName || "بدون اسم"}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{order.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 14, fontSize: 14 }}>{slot.courtName}</td>
                    <td style={{ padding: 14 }}>
                      <div style={{ fontSize: 14 }}>{slot.date}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{fmtTime(slot.startTime)} - {fmtTime(slot.endTime)}</div>
                    </td>
                    <td style={{ padding: 14, fontSize: 14, fontWeight: 600 }}>{slot.price.toFixed(3)} ر.ع</td>
                    <td style={{ padding: 14 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, ...statusBadgeStyle(slot.status) }}>
                        {STATUS_LABELS[slot.status]}
                      </span>
                    </td>
                    <td style={{ padding: 14, fontSize: 13, color: "var(--ink-soft)" }}>
                      {PAYMENT_LABELS[order.paymentMethod]}
                      <div style={{ fontSize: 11 }}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
