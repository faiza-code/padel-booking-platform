import { useEffect, useState } from "react";
import { confirmPayment } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import CustomerHeader from "../../components/CustomerHeader";

export function PaymentSuccessPage() {
  const [status, setStatus] = useState("checking"); // checking | paid | failed

  useEffect(() => {
    const bookingId = localStorage.getItem("pending_booking_id");
    const sessionId = localStorage.getItem("pending_session_id");

    if (!bookingId || !sessionId) {
      setStatus("failed");
      return;
    }

    confirmPayment(Number(bookingId), sessionId)
      .then(() => {
        setStatus("paid");
        localStorage.removeItem("pending_booking_id");
        localStorage.removeItem("pending_session_id");
      })
      .catch(() => setStatus("failed"));
  }, []);

  return (
    <div>
      <CustomerHeader />
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <Card>
          {status === "checking" && <p>Verifying your payment...</p>}
          {status === "paid" && (
            <>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "var(--lime)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                boxShadow: "0 0 30px rgba(195,244,0,0.25)",
              }}>
                <Icon name="check_circle" size={40} style={{ color: "var(--on-lime)" }} />
              </div>
              <h2>Payment Successful</h2>
              <p style={{ color: "var(--ink-soft)" }}>Your booking has been confirmed.</p>
            </>
          )}
          {status === "failed" && (
            <>
              <h2 style={{ color: "var(--clay)" }}>Payment Verification Failed</h2>
              <p style={{ color: "var(--ink-soft)" }}>If an amount was deducted, please contact support.</p>
            </>
          )}
          <Button style={{ marginTop: 20 }} onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function PaymentCancelPage() {
  return (
    <div>
      <CustomerHeader />
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <Card>
          <h2>Payment Cancelled</h2>
          <p style={{ color: "var(--ink-soft)" }}>Your payment was not completed.</p>
          <Button style={{ marginTop: 20 }} onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </Card>
      </div>
    </div>
  );
}
