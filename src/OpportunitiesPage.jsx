import React, { useState, useEffect } from 'react';

// ════════════════════════════════════════════════
// FIRSAT (Opportunities) STATUS CONFIG
// ════════════════════════════════════════════════

const OPPORTUNITY_STATUS = {
  lead:               { label:"🎯 Potansiyel Lead",       color:"#9CA3AF", bg:"#9CA3AF20", order:1 },
  qualified:          { label:"🔍 Kalifiye",              color:"#3B82F6", bg:"#3B82F620", order:2 },
  concept_prep:       { label:"📝 Kavramsal Hazırlanıyor",color:"#8B5CF6", bg:"#8B5CF620", order:3 },
  concept_approved:   { label:"✅ Kavramsal Onaylandı",   color:"#10B981", bg:"#10B98120", order:4 },
  proposal_prep:      { label:"💰 Teklif Hazırlanıyor",  color:"#F59E0B", bg:"#F59E0B20", order:5 },
  proposal_sent:      { label:"📤 Teklif Gönderildi",    color:"#06B6D4", bg:"#06B6D420", order:6 },
  negotiation:        { label:"🤝 Müzakere",              color:"#EC4899", bg:"#EC489920", order:7 },
  won:                { label:"🎉 Kazanıldı",             color:"#22C55E", bg:"#22C55E20", order:8 },
  lost:               { label:"❌ Kaybedildi",            color:"#EF4444", bg:"#EF444420", order:9 },
};

const OPPORTUNITY_SOURCE = {
  website:    { label:"Web Sitesi",  icon:"🌐" },
  referral:   { label:"Referans",    icon:"👥" },
  event:      { label:"Etkinlik",    icon:"📅" },
  cold_call:  { label:"Soğuk Arama", icon:"📞" },
  email:      { label:"E-posta",     icon:"✉️" },
  social:     { label:"Sosyal Medya", icon:"📱" },
};

const PRIORITY_CONFIG = {
  Low:    { label:"Düşük",  color:"#10B981", bg:"#10B98120" },
  Medium: { label:"Orta",   color:"#F59E0B", bg:"#F59E0B20" },
  High:   { label:"Yüksek", color:"#EF4444", bg:"#EF444420" },
};

// ════════════════════════════════════════════════
// OPPORTUNITIES PAGE
// ════════════════════════════════════════════════

const OpportunitiesPage = ({ profile, companies, consultants, supabase, showToast }) => {
  const isAdmin   = profile?.role === "admin";
  const isManager = profile?.role === "manager";
  const isCons    = profile?.role === "consultant";

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterConsultant, setFilterConsultant] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");

  // Form
  const [form, setForm] = useState({
    name: "",
    company_id: "",
    assigned_consultant: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    estimated_value: "",
    status: "lead",
    description: "",
    source: "website",
    priority: "Medium",
    expected_close_date: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadOpportunities(); }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error("Load opportunities error:", err);
      showToast("Fırsatlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateOppNo = async () => {
    const { data } = await supabase.from("opportunities").select("no").order("created_at", { ascending: false }).limit(100);
    let maxNum = 995;
    (data || []).forEach(o => {
      const n = parseInt((o.no || "").replace("FRS-", ""));
      if (!isNaN(n) && n >= 1000 && n <= 9999 && n > maxNum) maxNum = n;
    });
    return `FRS-${maxNum + 5}`;
  };

  const saveOpportunity = async () => {
    if (!form.name || !form.company_id) {
      showToast("Fırsat adı ve firma zorunlu", "error");
      return;
    }

    setSaving(true);
    try {
      if (selectedOpp) {
        // Update
        const { error } = await supabase
          .from("opportunities")
          .update({
            ...form,
            estimated_value: parseFloat(form.estimated_value) || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedOpp.id);

        if (error) throw error;

        // Log
        await addLog(selectedOpp.id, selectedOpp.no, "opportunity_updated", "Fırsat güncellendi", profile?.full_name);
        showToast("Fırsat güncellendi!");
      } else {
        // Create
        const oppNo = await generateOppNo();
        const { data: newOpp, error } = await supabase
          .from("opportunities")
          .insert([{
            ...form,
            no: oppNo,
            estimated_value: parseFloat(form.estimated_value) || 0,
          }])
          .select()
          .single();

        if (error) throw error;

        // Log
        await addLog(newOpp.id, oppNo, "opportunity_created", `Fırsat oluşturuldu: ${form.name}`, profile?.full_name);
        showToast("Fırsat oluşturuldu!");
      }

      setShowModal(false);
      setSelectedOpp(null);
      resetForm();
      loadOpportunities();
    } catch (err) {
      console.error("Save opportunity error:", err);
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const addLog = async (oppId, oppNo, event, detail, actor) => {
    try {
      await supabase.from("opportunity_logs").insert([{
        opportunity_id: oppId,
        opportunity_no: oppNo,
        event,
        detail,
        actor,
      }]);
    } catch (err) {
      console.error("Add log error:", err);
    }
  };

  const updateStatus = async (opp, newStatus) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", opp.id);

      if (error) throw error;

      const statusConfig = OPPORTUNITY_STATUS[newStatus];
      await addLog(opp.id, opp.no, "status_changed", `Durum değişti: ${statusConfig?.label}`, profile?.full_name);

      // Eğer "Kazanıldı" olduysa dönüşüm modal'ı göster
      if (newStatus === "won") {
        setShowConvertModal(opp);
      }

      loadOpportunities();
      showToast("Durum güncellendi!");
    } catch (err) {
      console.error("Update status error:", err);
      showToast(err.message, "error");
    }
  };

  const convertToProject = async (opp) => {
    try {
      const projectNo = await generateProjectNo();
      const { data: project, error } = await supabase.from("projects").insert([{
        no: projectNo,
        name: opp.name,
        company_id: opp.company_id,
        description: opp.description,
        status: "Planning",
        billable: true,
        assignees: opp.assigned_consultant ? [opp.assigned_consultant] : [],
        start_date: new Date().toISOString().split("T")[0],
      }]).select().single();

      if (error) throw error;

      // Update opportunity
      await supabase.from("opportunities").update({
        converted_to: "project",
        converted_id: project.id,
        closed_at: new Date().toISOString(),
      }).eq("id", opp.id);

      await addLog(opp.id, opp.no, "converted_to_project", `Projeye dönüştürüldü: ${projectNo}`, profile?.full_name);
      
      showToast(`Proje oluşturuldu: ${projectNo}`);
      setShowConvertModal(null);
      loadOpportunities();
    } catch (err) {
      console.error("Convert to project error:", err);
      showToast(err.message, "error");
    }
  };

  const convertToTicket = async (opp) => {
    try {
      const ticketNo = await generateTicketNo();
      const { data: ticket, error } = await supabase.from("tickets").insert([{
        no: ticketNo,
        title: opp.name,
        company_id: opp.company_id,
        description: opp.description,
        status: "Open",
        priority: opp.priority || "Medium",
        assignees: opp.assigned_consultant ? [opp.assigned_consultant] : [],
      }]).select().single();

      if (error) throw error;

      // Update opportunity
      await supabase.from("opportunities").update({
        converted_to: "ticket",
        converted_id: ticket.id,
        closed_at: new Date().toISOString(),
      }).eq("id", opp.id);

      await addLog(opp.id, opp.no, "converted_to_ticket", `Ticket'a dönüştürüldü: ${ticketNo}`, profile?.full_name);
      
      showToast(`Ticket oluşturuldu: ${ticketNo}`);
      setShowConvertModal(null);
      loadOpportunities();
    } catch (err) {
      console.error("Convert to ticket error:", err);
      showToast(err.message, "error");
    }
  };

  const generateProjectNo = async () => {
    const { data } = await supabase.from("projects").select("no").order("created_at", { ascending: false }).limit(100);
    let maxNum = 995;
    (data || []).forEach(p => {
      const n = parseInt((p.no || "").replace("PRJ-", ""));
      if (!isNaN(n) && n >= 1000 && n <= 9999 && n > maxNum) maxNum = n;
    });
    return `PRJ-${maxNum + 5}`;
  };

  const generateTicketNo = async () => {
    const { data } = await supabase.from("tickets").select("no").order("created_at", { ascending: false }).limit(100);
    let maxNum = 995;
    (data || []).forEach(t => {
      const n = parseInt((t.no || "").replace("TKT-", ""));
      if (!isNaN(n) && n >= 1000 && n <= 9999 && n > maxNum) maxNum = n;
    });
    return `TKT-${maxNum + 5}`;
  };

  const deleteOpportunity = async (id) => {
    if (!confirm("Bu fırsatı silmek istediğinizden emin misiniz?")) return;
    try {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
      showToast("Fırsat silindi");
      loadOpportunities();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message, "error");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      company_id: "",
      assigned_consultant: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      estimated_value: "",
      status: "lead",
      description: "",
      source: "website",
      priority: "Medium",
      expected_close_date: "",
    });
  };

  const openEditModal = (opp) => {
    setSelectedOpp(opp);
    setForm({
      name: opp.name || "",
      company_id: opp.company_id || "",
      assigned_consultant: opp.assigned_consultant || "",
      contact_person: opp.contact_person || "",
      contact_email: opp.contact_email || "",
      contact_phone: opp.contact_phone || "",
      estimated_value: opp.estimated_value || "",
      status: opp.status || "lead",
      description: opp.description || "",
      source: opp.source || "website",
      priority: opp.priority || "Medium",
      expected_close_date: opp.expected_close_date || "",
    });
    setShowModal(true);
  };

  // Filtering
  const filtered = opportunities.filter(opp => {
    if (search && !opp.name.toLowerCase().includes(search.toLowerCase()) && !opp.no.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && opp.status !== filterStatus) return false;
    if (filterConsultant !== "all" && opp.assigned_consultant !== filterConsultant) return false;
    if (filterCompany !== "all" && opp.company_id !== filterCompany) return false;
    return true;
  });

  const T = {
    bg: "#0F172A",
    bg2: "#1E293B",
    bg3: "#334155",
    card: "#1E293B",
    border: "#334155",
    text: "#F1F5F9",
    text2: "#CBD5E1",
    text3: "#94A3B8",
    accent: "#6366F1",
    accent2: "#818CF8",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.text }}>Fırsatlar</h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: T.text3 }}>{filtered.length} fırsat</p>
        </div>
        <button
          onClick={() => { resetForm(); setSelectedOpp(null); setShowModal(true); }}
          style={{
            background: T.accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Yeni Fırsat
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Fırsat ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            background: T.bg3,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "9px 14px",
            color: T.text,
            fontSize: 13,
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            background: T.bg3,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "9px 14px",
            color: T.text,
            fontSize: 13,
          }}
        >
          <option value="all">Tüm Durumlar</option>
          {Object.entries(OPPORTUNITY_STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        {(isAdmin || isManager) && (
          <select
            value={filterConsultant}
            onChange={(e) => setFilterConsultant(e.target.value)}
            style={{
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "9px 14px",
              color: T.text,
              fontSize: 13,
            }}
          >
            <option value="all">Tüm Danışmanlar</option>
            {consultants.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          style={{
            background: T.bg3,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "9px 14px",
            color: T.text,
            fontSize: 13,
          }}
        >
          <option value="all">Tüm Firmalar</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>Yükleniyor...</div>
      ) : (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 150px 150px 120px 150px 150px 100px",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
            fontSize: 12,
            fontWeight: 700,
            color: T.text3,
          }}>
            <span>No</span>
            <span>Fırsat Adı</span>
            <span>Firma</span>
            <span>Danışman</span>
            <span>Tahmini Değer</span>
            <span>Durum</span>
            <span>Kaynak</span>
            <span>İşlem</span>
          </div>
          {filtered.map(opp => {
            const company = companies.find(c => c.id === opp.company_id);
            const statusConfig = OPPORTUNITY_STATUS[opp.status] || OPPORTUNITY_STATUS.lead;
            const sourceConfig = OPPORTUNITY_SOURCE[opp.source] || OPPORTUNITY_SOURCE.website;
            
            return (
              <div
                key={opp.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 150px 150px 120px 150px 150px 100px",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: `1px solid ${T.border}`,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, fontFamily: "monospace", color: T.text3 }}>{opp.no}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{opp.name}</div>
                  {opp.contact_person && (
                    <div style={{ fontSize: 12, color: T.text3 }}>İletişim: {opp.contact_person}</div>
                  )}
                </div>
                <span style={{ fontSize: 13, color: T.text2 }}>{company?.name || "—"}</span>
                <span style={{ fontSize: 13, color: T.text2 }}>{opp.assigned_consultant || "—"}</span>
                <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>
                  {opp.estimated_value ? `₺${Number(opp.estimated_value).toLocaleString()}` : "—"}
                </span>
                <select
                  value={opp.status}
                  onChange={(e) => updateStatus(opp, e.target.value)}
                  style={{
                    background: statusConfig.bg,
                    color: statusConfig.color,
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {Object.entries(OPPORTUNITY_STATUS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: 12, color: T.text3 }}>
                  {sourceConfig.icon} {sourceConfig.label}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => openEditModal(opp)}
                    style={{
                      background: `${T.accent}20`,
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 8px",
                      cursor: "pointer",
                      color: T.accent2,
                      fontSize: 12,
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteOpportunity(opp.id)}
                    style={{
                      background: "#EF444420",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 8px",
                      cursor: "pointer",
                      color: "#EF4444",
                      fontSize: 12,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: T.text3 }}>Fırsat bulunamadı</div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: T.card,
            borderRadius: 14,
            padding: 24,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: T.text }}>
              {selectedOpp ? "Fırsatı Düzenle" : "Yeni Fırsat"}
            </h3>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  Fırsat Adı *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Örn: SAP Implementasyonu"
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Firma *
                  </label>
                  <select
                    value={form.company_id}
                    onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Firma Seçin</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Danışman
                  </label>
                  <select
                    value={form.assigned_consultant}
                    onChange={(e) => setForm({ ...form, assigned_consultant: e.target.value })}
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Danışman Seçin</option>
                    {consultants.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Tahmini Değer (₺)
                  </label>
                  <input
                    type="number"
                    value={form.estimated_value}
                    onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                    placeholder="50000"
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Durum
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  >
                    {Object.entries(OPPORTUNITY_STATUS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Öncelik
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  Kaynak
                </label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: T.text,
                    fontSize: 14,
                  }}
                >
                  {Object.entries(OPPORTUNITY_SOURCE).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  İletişim Kişisi
                </label>
                <input
                  type="text"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="ahmet@firma.com"
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="+90 555 123 4567"
                    style={{
                      width: "100%",
                      background: T.bg3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: T.text,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  Beklenen Kapanış Tarihi
                </label>
                <input
                  type="date"
                  value={form.expected_close_date}
                  onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
                  Açıklama
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Fırsat detayları..."
                  rows={4}
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: T.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowModal(false); setSelectedOpp(null); }}
                style={{
                  background: T.bg3,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: T.text2,
                }}
              >
                İptal
              </button>
              <button
                onClick={saveOpportunity}
                disabled={saving}
                style={{
                  background: T.accent,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  color: "#fff",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: T.card,
            borderRadius: 14,
            padding: 24,
            maxWidth: 400,
            width: "90%",
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: T.text }}>
              🎉 Fırsat Kazanıldı!
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: T.text2 }}>
              <strong>{showConvertModal.name}</strong> için ne oluşturmak istersiniz?
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <button
                onClick={() => convertToProject(showConvertModal)}
                style={{
                  background: `${T.accent}20`,
                  border: `2px solid ${T.accent}`,
                  borderRadius: 8,
                  padding: "16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: T.accent2,
                  textAlign: "left",
                }}
              >
                📁 <strong>Proje Oluştur</strong>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                  Uzun süreli çalışma için proje açılır
                </div>
              </button>

              <button
                onClick={() => convertToTicket(showConvertModal)}
                style={{
                  background: `${T.success}20`,
                  border: `2px solid ${T.success}`,
                  borderRadius: 8,
                  padding: "16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: T.success,
                  textAlign: "left",
                }}
              >
                🎫 <strong>Ticket Oluştur</strong>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                  Tekil talep veya destek için ticket açılır
                </div>
              </button>

              <button
                onClick={() => setShowConvertModal(null)}
                style={{
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: T.text3,
                  marginTop: 8,
                }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
