import { useEffect, useState } from "react";
import { confirmPayment } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

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
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <Card>
        {status === "checking" && <p>جارٍ التحقق من الدفع...</p>}
        {status === "paid" && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", background: "var(--ball-lime)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(205,242,0,0.3)",
            }}>
              <Icon name="check_circle" size={36} style={{ color: "var(--ink)" }} />
            </div>
            <h2>تم الدفع بنجاح</h2>
            <p style={{ color: "var(--ink-soft)" }}>تم تأكيد حجزك.</p>
          </>
        )}
        {status === "failed" && (
          <>
            <h2 style={{ color: "var(--clay)" }}>تعذّر تأكيد الدفع</h2>
            <p style={{ color: "var(--ink-soft)" }}>تواصل معنا إذا تم خصم المبلغ من حسابك.</p>
          </>
        )}
        <Button style={{ marginTop: 20 }} onClick={() => (window.location.href = "/")}>
          العودة للرئيسية
        </Button>
      </Card>
    </div>
  );
}

export function PaymentCancelPage() {
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <Card>
        <h2>تم إلغاء الدفع</h2>
        <p style={{ color: "var(--ink-soft)" }}>لم يتم إتمام عملية الدفع.</p>
        <Button style={{ marginTop: 20 }} onClick={() => (window.location.href = "/")}>
          العودة للرئيسية
        </Button>
      </Card>
    </div>
  );
}
