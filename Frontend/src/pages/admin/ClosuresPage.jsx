import { useEffect, useState } from "react";
import { getClosures, createClosure, deleteClosure, getCourts } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

export default function ClosuresPage() {
  const [closures, setClosures] = useState([]);
  const [courts, setCourts] = useState([]);
  const [courtId, setCourtId] = useState(""); // "" = جميع الملاعب
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function load() {
    getClosures().then(setClosures);
    getCourts(true).then(setCourts);
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createClosure({
        courtId: courtId === "" ? null : Number(courtId),
        startDate,
        endDate: endDate || startDate,
        reason: reason || null,
      });
      setStartDate(""); setEndDate(""); setReason(""); setCourtId("");
      load();
    } catch (err) {
      setError(err.response?.data || "حدث خطأ أثناء الحفظ.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("إعادة فتح هذه الفترة؟")) return;
    await deleteClosure(id);
    load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>الإغلاقات</h1>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>إغلاق ملعب أو جميع الملاعب</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">جميع الملاعب</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
              style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)", flex: 1 }} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              placeholder="نفس تاريخ البداية إذا فارغ"
              style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)", flex: 1 }} />
          </div>
          <input placeholder="السبب (اختياري)" value={reason} onChange={(e) => setReason(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)" }} />
          {error && <p style={{ color: "var(--clay)" }}>{JSON.stringify(error)}</p>}
          <Button type="submit">إضافة إغلاق</Button>
        </form>
      </Card>

      <div style={{ display: "grid", gap: 12 }}>
        {closures.map((c) => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: "#ffdad6",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name="event_busy" size={20} style={{ color: "var(--clay)" }} />
              </div>
              <div>
                <strong style={{ fontSize: 15 }}>{c.courtName}</strong>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, background: "var(--surface)", padding: "3px 8px", borderRadius: 6 }}>
                    من: {c.startDate}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: "var(--surface)", padding: "3px 8px", borderRadius: 6 }}>
                    إلى: {c.endDate}
                  </span>
                </div>
                {c.reason && <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 6 }}>{c.reason}</p>}
              </div>
            </div>
            <Button variant="outline" onClick={() => handleDelete(c.id)}>إعادة فتح</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
