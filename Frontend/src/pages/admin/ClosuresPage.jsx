import { useEffect, useState } from "react";
import { getClosures, createClosure, deleteClosure, getCourts } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

export default function ClosuresPage() {
  const [closures, setClosures] = useState([]);
  const [courts, setCourts] = useState([]);
  const [courtId, setCourtId] = useState(""); // "" = all stadiums
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
      setError(err.response?.data || "Something went wrong while saving.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Reopen this period?")) return;
    await deleteClosure(id);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Closures</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 4 }}>Close a stadium or all stadiums for a specific period.</p>
        </div>
        {closures.length > 0 && (
          <span style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            background: "var(--clay-bg)", color: "var(--clay)",
          }}>
            {closures.length} Active
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
        <Card>
          <h3 style={{ marginBottom: 18, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="lock" size={18} style={{ color: "var(--clay)" }} /> New Closure
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <select value={courtId} onChange={(e) => setCourtId(e.target.value)}
              style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)" }}>
              <option value="">All Stadiums</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)", flex: 1 }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)", flex: 1 }} />
            </div>
            <textarea placeholder="Reason for closure (optional)" value={reason} onChange={(e) => setReason(e.target.value)}
              rows={3}
              style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)", resize: "vertical" }} />
            {error && <p style={{ color: "var(--clay)" }}>{JSON.stringify(error)}</p>}
            <Button type="submit">Apply Closure</Button>
          </form>
        </Card>

        <div style={{ display: "grid", gap: 14 }}>
          {closures.length === 0 && (
            <Card style={{ textAlign: "center", padding: 32, color: "var(--ink-soft)" }}>No active closures.</Card>
          )}
          {closures.map((c) => (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: "var(--clay-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name="event_busy" size={22} style={{ color: "var(--clay)" }} />
                </div>
                <div>
                  <strong style={{ fontSize: 16 }}>{c.courtName}</strong>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "var(--card-hi)", padding: "4px 10px", borderRadius: 6 }}>
                      {c.startDate}
                    </span>
                    <span style={{ color: "var(--ink-soft)", alignSelf: "center" }}>&rarr;</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "var(--card-hi)", padding: "4px 10px", borderRadius: 6 }}>
                      {c.endDate}
                    </span>
                  </div>
                  {c.reason && <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 8 }}>{c.reason}</p>}
                </div>
              </div>
              <Button variant="outline" onClick={() => handleDelete(c.id)}>Reopen</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
