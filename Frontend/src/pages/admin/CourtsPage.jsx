import { useEffect, useState } from "react";
import { getCourts, createCourt, updateCourt, deleteCourt, getSchedule, setSchedule, getBookings } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function emptyForm() {
  return { name: "", description: "", pricePerHour: "", pricingTiers: [{ minHours: 1, pricePerHour: "" }] };
}

function StatCard({ label, value, icon }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
        <h3 style={{ fontSize: 32, marginTop: 6 }}>{value}</h3>
      </div>
      <Icon name={icon} size={26} style={{ color: "var(--lime)" }} />
    </Card>
  );
}

export default function CourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsCount, setBookingsCount] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);

  const [scheduleCourtId, setScheduleCourtId] = useState(null);
  const [scheduleDays, setScheduleDays] = useState(
    DAYS.map((_, i) => ({ dayOfWeek: i, openTime: "08:00:00", closeTime: "23:00:00", enabled: false }))
  );
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    getCourts(true).then(setCourts).finally(() => setLoading(false));
    getBookings({}).then((b) => setBookingsCount(b.length)).catch(() => setBookingsCount(null));
  }

  useEffect(load, []);

  function updateTier(index, field, value) {
    setForm((f) => {
      const tiers = [...f.pricingTiers];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...f, pricingTiers: tiers };
    });
  }

  function addTier() {
    setForm((f) => ({ ...f, pricingTiers: [...f.pricingTiers, { minHours: f.pricingTiers.length + 1, pricePerHour: "" }] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      pricePerHour: Number(form.pricePerHour),
      pricingTiers: form.pricingTiers
        .filter((t) => t.pricePerHour !== "")
        .map((t) => ({ minHours: Number(t.minHours), pricePerHour: Number(t.pricePerHour) })),
    };

    try {
      if (editingId) {
        await updateCourt(editingId, { ...payload, isActive: true });
      } else {
        await createCourt(payload);
      }
      setForm(emptyForm());
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data || "Something went wrong while saving.");
    }
  }

  function startEdit(court) {
    setEditingId(court.id);
    setForm({
      name: court.name,
      description: court.description || "",
      pricePerHour: court.pricePerHour,
      pricingTiers: court.pricingTiers.length
        ? court.pricingTiers.map((t) => ({ minHours: t.minHours, pricePerHour: t.pricePerHour }))
        : [{ minHours: 1, pricePerHour: "" }],
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete/disable this stadium?")) return;
    await deleteCourt(id);
    load();
  }

  async function openSchedule(courtId) {
    setScheduleCourtId(courtId);
    const existing = await getSchedule(courtId);
    setScheduleDays(
      DAYS.map((_, i) => {
        const found = existing.find((s) => s.dayOfWeek === i);
        return found
          ? { dayOfWeek: i, openTime: found.openTime, closeTime: found.closeTime, enabled: true }
          : { dayOfWeek: i, openTime: "08:00:00", closeTime: "23:00:00", enabled: false };
      })
    );
  }

  async function saveSchedule() {
    const days = scheduleDays.filter((d) => d.enabled).map(({ dayOfWeek, openTime, closeTime }) => ({ dayOfWeek, openTime, closeTime }));
    await setSchedule(scheduleCourtId, days);
    setScheduleCourtId(null);
  }

  const activeCourtsCount = courts.filter((c) => c.isActive).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Stadium Management</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginTop: 4 }}>
            Configure court assets &amp; operational hours
          </p>
        </div>
        <Button
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => {
            if (showForm && !editingId) { setShowForm(false); return; }
            setEditingId(null);
            setForm(emptyForm());
            setShowForm(true);
          }}
        >
          <Icon name="add_circle" size={18} /> {showForm && !editingId ? "Close Form" : "Add Stadium"}
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Courts" value={courts.length} icon="stadium" />
        <StatCard label="Active Courts" value={activeCourtsCount} icon="check_circle" />
        <StatCard label="Total Bookings" value={bookingsCount ?? "—"} icon="confirmation_number" />
      </div>

      {showForm && (
        <Card style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>{editingId ? "Edit Stadium" : "Add New Stadium"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <input placeholder="Stadium name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)" }} required />
            <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)" }} />
            <input type="number" step="0.001" placeholder="Default hourly rate" value={form.pricePerHour}
              onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-variant)" }} required />

            <div>
              <label style={{ fontWeight: 700, display: "block", marginBottom: 10, fontSize: 13, color: "var(--ink-soft)", textTransform: "uppercase" }}>
                Pricing Tiers by Duration
              </label>
              {form.pricingTiers.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="number" placeholder="Hours" value={t.minHours}
                    onChange={(e) => updateTier(i, "minHours", e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border-variant)", width: 120 }} />
                  <input type="number" step="0.001" placeholder="Price per hour" value={t.pricePerHour}
                    onChange={(e) => updateTier(i, "pricePerHour", e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border-variant)", flex: 1 }} />
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addTier}>+ Add Tier</Button>
            </div>

            {error && <p style={{ color: "var(--clay)" }}>{JSON.stringify(error)}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              <Button type="submit">{editingId ? "Save Changes" : "Add Stadium"}</Button>
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm()); setShowForm(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p style={{ color: "var(--ink-soft)" }}>Loading...</p>
      ) : courts.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48, border: "2px dashed var(--border-variant)" }}>
          <Icon name="add" size={32} style={{ color: "var(--ink-soft)" }} />
          <h4 style={{ marginTop: 14 }}>New Court Entry</h4>
          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 8 }}>
            Expand your club's inventory by adding a new stadium facility.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 24 }}>
          {courts.map((court) => (
            <Card key={court.id} style={{ opacity: court.isActive ? 1 : 0.55, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 19, textTransform: "uppercase" }}>{court.name}</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: "5px 12px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 1,
                    background: court.isActive ? "var(--lime)" : "var(--card-hi)",
                    color: court.isActive ? "var(--on-lime)" : "var(--ink-soft)",
                  }}>
                    {court.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>{court.description}</p>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                  padding: "18px 0", marginBottom: 20,
                }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Hourly Rate</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: "var(--lime)" }}>{court.pricePerHour} OMR</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Tiers</p>
                    {court.pricingTiers.length > 0 ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {court.pricingTiers.map((t) => (
                          <span key={t.id} style={{
                            fontSize: 10, fontWeight: 800, background: "var(--card-hi)", padding: "4px 8px",
                            borderRadius: 6, textTransform: "uppercase",
                          }}>
                            {t.minHours}h+ / {t.pricePerHour}
                          </span>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>None</p>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Button variant="secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => openSchedule(court.id)}>
                    <Icon name="schedule" size={16} /> Weekly Hours
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(court)}>
                    <Icon name="edit" size={16} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(court.id)}>
                    <Icon name="delete" size={16} />
                  </Button>
                </div>

                {scheduleCourtId === court.id && (
                  <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                    <h4 style={{ marginBottom: 14, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Weekly Operating Hours</h4>
                    {scheduleDays.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <label style={{ width: 100, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                          <input type="checkbox" checked={d.enabled}
                            onChange={(e) => {
                              const copy = [...scheduleDays];
                              copy[i].enabled = e.target.checked;
                              setScheduleDays(copy);
                            }} />
                          {DAYS[i]}
                        </label>
                        <input type="time" value={d.openTime.slice(0, 5)} disabled={!d.enabled}
                          onChange={(e) => {
                            const copy = [...scheduleDays];
                            copy[i].openTime = e.target.value + ":00";
                            setScheduleDays(copy);
                          }}
                          style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border-variant)" }} />
                        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>to</span>
                        <input type="time" value={d.closeTime.slice(0, 5)} disabled={!d.enabled}
                          onChange={(e) => {
                            const copy = [...scheduleDays];
                            copy[i].closeTime = e.target.value + ":00";
                            setScheduleDays(copy);
                          }}
                          style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border-variant)" }} />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <Button onClick={saveSchedule}>Save Hours</Button>
                      <Button variant="ghost" onClick={() => setScheduleCourtId(null)}>Close</Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
