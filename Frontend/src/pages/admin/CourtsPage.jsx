import { useEffect, useState } from "react";
import { getCourts, createCourt, updateCourt, deleteCourt, getSchedule, setSchedule } from "../../api";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function emptyForm() {
  return { name: "", description: "", pricePerHour: "", pricingTiers: [{ minHours: 1, pricePerHour: "" }] };
}

export default function CourtsPage() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      load();
    } catch (err) {
      setError(err.response?.data || "حدث خطأ أثناء الحفظ.");
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
  }

  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف/تعطيل هذا الملعب؟")) return;
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

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>الملاعب</h1>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? "تعديل ملعب" : "إضافة ملعب جديد"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input placeholder="اسم الملعب" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)" }} required />
          <input placeholder="الوصف (اختياري)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)" }} />
          <input type="number" step="0.001" placeholder="السعر الافتراضي للساعة" value={form.pricePerHour}
            onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)" }} required />

          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>شرائح التسعير حسب عدد الساعات</label>
            {form.pricingTiers.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="number" placeholder="عدد الساعات" value={t.minHours}
                  onChange={(e) => updateTier(i, "minHours", e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", width: 120 }} />
                <input type="number" step="0.001" placeholder="سعر الساعة" value={t.pricePerHour}
                  onChange={(e) => updateTier(i, "pricePerHour", e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", flex: 1 }} />
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={addTier}>+ إضافة شريحة</Button>
          </div>

          {error && <p style={{ color: "var(--clay)" }}>{JSON.stringify(error)}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit">{editingId ? "حفظ التعديلات" : "إضافة الملعب"}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm()); }}>
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </Card>

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {courts.map((court) => (
            <Card key={court.id} style={{ opacity: court.isActive ? 1 : 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "rgba(204,255,0,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="stadium" size={20} style={{ color: "var(--court-deep)" }} />
                  </div>
                  <h3 style={{ fontSize: 17 }}>{court.name}</h3>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                  background: court.isActive ? "var(--court-deep)" : "var(--border)",
                  color: court.isActive ? "white" : "var(--ink-soft)",
                }}>
                  {court.isActive ? "نشط" : "معطّل"}
                </span>
              </div>

              <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 12px" }}>{court.description}</p>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                padding: "12px 0", marginBottom: 16,
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>السعر الافتراضي</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--court-deep)" }}>{court.pricePerHour} ر.ع</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>شرائح التسعير</p>
                  {court.pricingTiers.length > 0 ? (
                    <ul style={{ margin: 0, paddingRight: 16, fontSize: 12, color: "var(--ink-soft)" }}>
                      {court.pricingTiers.map((t) => (
                        <li key={t.id}>{t.minHours}+ ساعة → {t.pricePerHour} ر.ع</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>لا توجد</p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => openSchedule(court.id)}>
                  <Icon name="schedule" size={16} /> ساعات العمل
                </Button>
                <Button variant="outline" onClick={() => startEdit(court)}>
                  <Icon name="edit" size={16} />
                </Button>
                <Button variant="danger" onClick={() => handleDelete(court.id)}>
                  <Icon name="delete" size={16} />
                </Button>
              </div>

              {scheduleCourtId === court.id && (
                <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 15 }}>ساعات العمل الأسبوعية</h4>
                  {scheduleDays.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <label style={{ width: 90, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
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
                        style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)" }} />
                      <span style={{ fontSize: 13 }}>إلى</span>
                      <input type="time" value={d.closeTime.slice(0, 5)} disabled={!d.enabled}
                        onChange={(e) => {
                          const copy = [...scheduleDays];
                          copy[i].closeTime = e.target.value + ":00";
                          setScheduleDays(copy);
                        }}
                        style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button onClick={saveSchedule}>حفظ ساعات العمل</Button>
                    <Button variant="ghost" onClick={() => setScheduleCourtId(null)}>إغلاق</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
