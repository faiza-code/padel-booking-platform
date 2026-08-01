import { useEffect, useState } from "react";
import { getAvailability, createBooking, startCheckout } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import StepBadge from "../../components/StepBadge";
import DateStrip from "../../components/DateStrip";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function fmtTime(t) {
  // "10:00:00" -> "10:00"
  return t.slice(0, 5);
}

function addHours(t, hours) {
  const [h, m] = t.split(":").map(Number);
  const total = h + hours;
  return `${String(total).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export default function BookingPage() {
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedStart, setSelectedStart] = useState(null);
  const [duration, setDuration] = useState(1);
  const [cart, setCart] = useState([]); // { date, startTime, endTime }

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = عند الوصول, 1 = إلكتروني

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setSelectedStart(null);
    getAvailability(date)
      .then(setSlots)
      .catch(() => setError("تعذّر تحميل الأوقات المتاحة. حاول مرة أخرى."))
      .finally(() => setLoading(false));
  }, [date]);

  function addToCart() {
    if (!selectedStart) return;
    const endTime = addHours(selectedStart, duration);
    setCart((c) => [...c, { date, startTime: selectedStart, endTime }]);
    setSelectedStart(null);
  }

  function removeFromCart(index) {
    setCart((c) => c.filter((_, i) => i !== index));
  }

  async function submitBooking() {
    setSubmitError("");
    if (!phone.trim()) {
      setSubmitError("رقم الهاتف مطلوب.");
      return;
    }
    if (cart.length === 0) {
      setSubmitError("أضف فترة حجز واحدة على الأقل.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createBooking({
        customerPhone: phone,
        customerName: name || null,
        customerEmail: email || null,
        paymentMethod,
        slots: cart,
      });

      if (paymentMethod === 1) {
        localStorage.setItem("pending_booking_id", order.id);
        const session = await startCheckout(order.id);
        localStorage.setItem("pending_session_id", session.sessionId);
        window.location.href = session.checkoutUrl;
        return;
      }

      setResult(order);
      setCart([]);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "تعذّر إتمام الحجز. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- شاشة النجاح ----------
  if (result) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px 80px", textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "var(--ball-lime)", display: "flex", alignItems: "center",
            justifyContent: "center", position: "relative", zIndex: 1,
            boxShadow: "0 0 40px rgba(205,242,0,0.35)",
          }}>
            <Icon name="check_circle" size={44} style={{ color: "var(--ink)" }} />
          </div>
        </div>

        <h2 style={{ fontSize: 28, marginBottom: 8 }}>تم تأكيد حجزك!</h2>
        <p style={{ color: "var(--ink-soft)", marginBottom: 32 }}>
          ملعبك جاهز. سيتم التواصل معك على الرقم المسجّل عند الحاجة.
        </p>

        <Card style={{ textAlign: "right" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "var(--ink-soft)" }}>رقم الحجز</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>#{result.id}</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {result.slots.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="schedule" size={16} style={{ color: "var(--ball-lime-dark)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
                    {s.date} | {fmtTime(s.startTime)} - {fmtTime(s.endTime)}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{s.price.toFixed(3)} ر.ع</span>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "1px dashed var(--border)", marginTop: 16, paddingTop: 16,
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>الإجمالي</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>
              {result.totalPrice.toFixed(3)} ر.ع
            </span>
          </div>

          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "var(--surface)", borderRadius: 12, padding: 14, marginTop: 20,
          }}>
            <Icon name="info" size={18} style={{ color: "var(--ink)", marginTop: 2 }} />
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
              الدفع عند الوصول للملعب. برجاء الحضور قبل 15 دقيقة من موعدك.
            </p>
          </div>
        </Card>

        <Button style={{ marginTop: 24 }} onClick={() => setResult(null)}>
          حجز جديد
        </Button>
      </div>
    );
  }

  // ---------- شاشة الحجز ----------
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <Icon name="sports_tennis" size={26} style={{ color: "var(--court-deep)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--court-deep)" }}>PadelPlay</span>
        </div>
        <h1 style={{ fontSize: 30 }}>احجز ملعب البادل</h1>
        <p style={{ color: "var(--ink-soft)" }}>اختر التاريخ والوقت المناسب لك</p>
      </header>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <StepBadge number={1} />
          <h2 style={{ fontSize: 18 }}>اختر الموعد</h2>
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>التاريخ</label>
        <DateStrip value={date} onChange={setDate} />

        <div style={{ marginTop: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>مدة الحجز</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                onClick={() => setDuration(h)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 10,
                  border: duration === h ? "2px solid var(--court-deep)" : "1px solid var(--border)",
                  background: duration === h ? "var(--court-deep)" : "white",
                  color: duration === h ? "white" : "var(--ink)",
                  fontFamily: "var(--font-mono)", fontWeight: 600,
                }}
              >
                {h} {h === 1 ? "ساعة" : "ساعات"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>الأوقات المتاحة</label>
          {loading && <p style={{ color: "var(--ink-soft)" }}>جارٍ التحميل...</p>}
          {error && <p style={{ color: "var(--clay)" }}>{error}</p>}
          {!loading && !error && slots.length === 0 && (
            <p style={{ color: "var(--ink-soft)" }}>لا توجد أوقات متاحة بهذا التاريخ.</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {slots.map((s) => (
              <button
                key={s.startTime}
                onClick={() => setSelectedStart(s.startTime)}
                style={{
                  padding: "10px 16px", borderRadius: 999,
                  border: selectedStart === s.startTime ? "2px solid var(--ball-lime-dark)" : "1px solid var(--border)",
                  background: selectedStart === s.startTime ? "var(--ball-lime)" : "white",
                  fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
                }}
              >
                {fmtTime(s.startTime)}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          style={{ marginTop: 20, width: "100%" }}
          disabled={!selectedStart}
          onClick={addToCart}
        >
          + إضافة للحجز
        </Button>
      </Card>

      {cart.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>فترات الحجز المختارة</h3>
          {cart.map((c, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="schedule" size={16} style={{ color: "var(--ball-lime-dark)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
                  {c.date} | {fmtTime(c.startTime)} - {fmtTime(c.endTime)}
                </span>
              </div>
              <button onClick={() => removeFromCart(i)} style={{ background: "none", border: "none", color: "var(--clay)", fontWeight: 700 }}>
                حذف
              </button>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <StepBadge number={2} />
          <h2 style={{ fontSize: 18 }}>بياناتك</h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <input placeholder="رقم الهاتف *" value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", height: 48 }} />
          <input placeholder="الاسم (اختياري)" value={name} onChange={(e) => setName(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", height: 48 }} />
          <input placeholder="البريد الإلكتروني (اختياري)" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border)", height: 48 }} />
        </div>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <StepBadge number={3} />
          <h2 style={{ fontSize: 18 }}>طريقة الدفع</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={() => setPaymentMethod(0)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, textAlign: "right",
            border: paymentMethod === 0 ? "2px solid var(--court-deep)" : "1px solid var(--border)",
            background: "white",
          }}>
            <Icon name="payments" size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>الدفع عند الوصول</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>ادفع عند الاستقبال</div>
            </div>
          </button>
          <button onClick={() => setPaymentMethod(1)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, textAlign: "right",
            border: paymentMethod === 1 ? "2px solid var(--court-deep)" : "1px solid var(--border)",
            background: "white",
          }}>
            <Icon name="credit_card" size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>دفع إلكتروني</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>بطاقة أو محفظة رقمية</div>
            </div>
          </button>
        </div>

        {submitError && <p style={{ color: "var(--clay)", marginTop: 16 }}>{submitError}</p>}

        <Button
          style={{ width: "100%", marginTop: 20 }}
          disabled={submitting}
          onClick={submitBooking}
        >
          {submitting ? "جارٍ التأكيد..." : "تأكيد الحجز"}
        </Button>
      </Card>
    </div>
  );
}
