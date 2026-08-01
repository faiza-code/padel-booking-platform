import { useEffect, useState } from "react";
import { getAvailability, createBooking, startCheckout } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import DateStrip from "../../components/DateStrip";
import CustomerHeader from "../../components/CustomerHeader";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function fmtTime(t) {
  return t.slice(0, 5); // "10:00:00" -> "10:00"
}

function addHours(t, hours) {
  const [h, m] = t.split(":").map(Number);
  const total = h + hours;
  return `${String(total).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export default function BookingPage() {
  const [step, setStep] = useState("select"); // select | checkout | success

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
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = cash on arrival, 1 = e-payment

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setSelectedStart(null);
    getAvailability(date)
      .then(setSlots)
      .catch(() => setError("Couldn't load available times. Please try again."))
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
      setSubmitError("Phone number is required.");
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
      setStep("success");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Couldn't complete the booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ================= SUCCESS =================
  if (step === "success" && result) {
    return (
      <div>
        <CustomerHeader />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 20px 80px", textAlign: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%", background: "var(--lime)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
            boxShadow: "0 0 40px rgba(195,244,0,0.25)",
          }}>
            <Icon name="check_circle" size={48} style={{ color: "var(--on-lime)" }} />
          </div>

          <h1 style={{ fontSize: 30, textTransform: "uppercase", marginBottom: 8 }}>Booking Confirmed!</h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 32 }}>
            Order ID: <span style={{ color: "var(--lime)", fontWeight: 800 }}>#PAD-{result.id}</span>
          </p>

          <Card style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="description" size={18} style={{ color: "var(--lime)" }} /> Reservation Summary
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              {result.slots.map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 14, borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="sports_tennis" size={18} style={{ color: "var(--lime)" }} />
                    <span style={{ fontSize: 14 }}>{s.date} &middot; {fmtTime(s.startTime)} - {fmtTime(s.endTime)}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--lime)" }}>{s.price.toFixed(3)} OMR</span>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "var(--card-hi)", borderRadius: 12, padding: 18, marginTop: 20,
              borderLeft: "4px solid var(--lime)",
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "var(--ink-soft)", textTransform: "uppercase" }}>
                  Total Amount
                </p>
              </div>
              <span style={{ fontSize: 24, fontWeight: 900, color: "var(--lime)" }}>{result.totalPrice.toFixed(3)} OMR</span>
            </div>
          </Card>

          <Button style={{ marginTop: 24, width: "100%" }} onClick={() => { setResult(null); setStep("select"); }}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ================= CHECKOUT =================
  if (step === "checkout") {
    return (
      <div>
        <CustomerHeader />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>
          <button onClick={() => setStep("select")} style={{
            background: "none", border: "none", color: "var(--ink-soft)",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 14, fontWeight: 700,
          }}>
            <Icon name="arrow_back" size={18} /> Back to Court
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
            {/* Left: forms */}
            <div style={{ display: "grid", gap: 32 }}>
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", background: "var(--lime)", color: "var(--on-lime)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13,
                  }}>1</span>
                  <h2 style={{ fontSize: 20, textTransform: "uppercase" }}>Player Information</h2>
                </div>
                <Card>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "var(--lime)", marginBottom: 8, textTransform: "uppercase" }}>
                        Phone Number (Mandatory) *
                      </label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+000 000 0000"
                        style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--lime)" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase" }}>
                          Full Name (Optional)
                        </label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe"
                          style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--border-variant)" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "var(--ink-soft)", marginBottom: 8, textTransform: "uppercase" }}>
                          Email (Optional)
                        </label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                          style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--border-variant)" }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", background: "var(--lime)", color: "var(--on-lime)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13,
                  }}>2</span>
                  <h2 style={{ fontSize: 20, textTransform: "uppercase" }}>Payment Selection</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Card
                    onClick={() => setPaymentMethod(0)}
                    style={{ cursor: "pointer", border: paymentMethod === 0 ? "2px solid var(--lime)" : "2px solid transparent" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <Icon name="payments" size={30} style={{ color: paymentMethod === 0 ? "var(--lime)" : "var(--ink-soft)" }} />
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: `2px solid ${paymentMethod === 0 ? "var(--lime)" : "var(--border-variant)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {paymentMethod === 0 && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--lime)" }} />}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>Cash on Arrival</h3>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Pay at the front desk before your session starts.</p>
                  </Card>

                  <Card
                    onClick={() => setPaymentMethod(1)}
                    style={{ cursor: "pointer", border: paymentMethod === 1 ? "2px solid var(--lime)" : "2px solid transparent" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <Icon name="account_balance_wallet" size={30} style={{ color: paymentMethod === 1 ? "var(--lime)" : "var(--ink-soft)" }} />
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: `2px solid ${paymentMethod === 1 ? "var(--lime)" : "var(--border-variant)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {paymentMethod === 1 && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--lime)" }} />}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>E-Payment</h3>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Secure checkout via Thawani payment gateway.</p>
                  </Card>
                </div>
              </section>

              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: 20,
                background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)",
              }}>
                <Icon name="lock" size={20} style={{ color: "var(--ink-soft)" }} />
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  All transactions are secured with 256-bit encryption. Your data is never shared with third parties.
                </p>
              </div>
            </div>

            {/* Right: dark summary */}
            <div style={{
              background: "var(--card)", borderRadius: 20, padding: 24,
              position: "sticky", top: 88, border: "1px solid var(--border-variant)",
            }}>
              <h3 style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
                Booking Summary
              </h3>

              <div style={{ display: "grid", gap: 14, borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
                {cart.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}>
                      <Icon name="calendar_today" size={14} /> {c.date}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}>
                      <Icon name="schedule" size={14} /> {fmtTime(c.startTime)} - {fmtTime(c.endTime)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700 }}>Sessions</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "var(--lime)" }}>{cart.length}</span>
              </div>

              {submitError && <p style={{ color: "var(--clay)", fontSize: 13, marginBottom: 12 }}>{submitError}</p>}

              <Button style={{ width: "100%" }} disabled={submitting} onClick={submitBooking}>
                {submitting ? "Processing..." : "Confirm Booking"}
              </Button>
              <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink-soft)", marginTop: 10 }}>
                Final price is calculated automatically based on duration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= SELECT =================
  return (
    <div>
      <CustomerHeader />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32 }}>Reserve Your Court</h1>
          <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>Select your preferred date and duration to see available slots.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Main column */}
          <div style={{ display: "grid", gap: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="calendar_month" size={18} style={{ color: "var(--lime)" }} />
                <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--ink-soft)" }}>Select Date</h2>
              </div>
              <DateStrip value={date} onChange={setDate} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="timer" size={18} style={{ color: "var(--lime)" }} />
                <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--ink-soft)" }}>Booking Duration</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[1, 2, 3].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDuration(h)}
                    style={{
                      padding: "16px 0", borderRadius: 14, fontWeight: 800, fontSize: 14,
                      border: duration === h ? "none" : "1px solid var(--border-variant)",
                      background: duration === h ? "var(--lime)" : "transparent",
                      color: duration === h ? "var(--on-lime)" : "var(--ink-soft)",
                      boxShadow: duration === h ? "0 0 15px rgba(195,244,0,0.15)" : "none",
                    }}
                  >
                    {h} {h === 1 ? "Hour" : "Hours"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="schedule" size={18} style={{ color: "var(--lime)" }} />
                <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--ink-soft)" }}>Available Slots</h2>
              </div>

              {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}
              {error && <p style={{ color: "var(--clay)" }}>{error}</p>}
              {!loading && !error && slots.length === 0 && (
                <p style={{ color: "var(--ink-soft)" }}>No available times for this date.</p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                {slots.map((s) => {
                  const active = selectedStart === s.startTime;
                  return (
                    <button
                      key={s.startTime}
                      onClick={() => setSelectedStart(s.startTime)}
                      style={{
                        padding: "12px 16px", borderRadius: 999, fontWeight: 700, fontSize: 14,
                        border: active ? "none" : "1px solid var(--border-variant)",
                        background: active ? "var(--lime)" : "var(--card)",
                        color: active ? "var(--on-lime)" : "var(--ink)",
                        boxShadow: active ? "0 0 10px rgba(195,244,0,0.2)" : "none",
                      }}
                    >
                      {fmtTime(s.startTime)}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                style={{ marginTop: 18, width: "100%" }}
                disabled={!selectedStart}
                onClick={addToCart}
              >
                + Add to Basket
              </Button>
            </div>
          </div>

          {/* Sticky basket */}
          <div style={{
            position: "sticky", top: 88, background: "var(--card)", border: "1px solid var(--border-variant)",
            borderRadius: 24, padding: 28,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Your Basket</h3>
              {cart.length > 0 && (
                <span style={{
                  background: "var(--lime)", color: "var(--on-lime)", padding: "4px 8px",
                  borderRadius: 6, fontSize: 10, fontWeight: 900,
                }}>
                  {cart.length} ITEM{cart.length > 1 ? "S" : ""}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--ink-soft)" }}>
                <Icon name="shopping_basket" size={36} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: 13, marginTop: 10 }}>No slots selected yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
                {cart.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    paddingBottom: 16, borderBottom: "1px solid var(--border)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.date}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                        {fmtTime(c.startTime)} - {fmtTime(c.endTime)}
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(i)} style={{
                      background: "none", border: "none", color: "var(--clay)",
                      fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                    }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              style={{ width: "100%" }}
              disabled={cart.length === 0}
              onClick={() => setStep("checkout")}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
