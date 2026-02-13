import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mpcfozvnmddgyobkfnsk.supabase.co",
  "sb_publishable_qlB_iAuffoFcfrrM42M6og_fdvjMHiN"
);

const CONSULTANTS = ["Ali Kaya", "Fatma Şahin", "Burak Aydın", "Selin Çelik"];
const PRIORITY_CONFIG = {
  Critical: { color: "#FF3B5C", bg: "#FF3B5C20", label: "Kritik" },
  High:     { color: "#FF8C00", bg: "#FF8C0020", label: "Yüksek" },
  Medium:   { color: "#F5C518", bg: "#F5C51820", label: "Orta" },
  Low:      { color: "#30C97E", bg: "#30C97E20", label: "Düşük" },
};
const STATUS_CONFIG = {
  "Open":        { color: "#60A5FA", bg: "#60A5FA18", label: "Açık" },
  "In Progress": { color: "#A78BFA", bg: "#A78BFA18", label: "İşlemde" },
  "Waiting":     { color: "#F59E0B", bg: "#F59E0B18", label: "Bekliyor" },
  "Closed":      { color: "#6B7280", bg: "#6B728018", label: "Kapalı" },
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    companies:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M9 16h1m5 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>,
    tickets:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
    timesheet:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    invoices:   <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
    reports:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    users:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    plus:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
    chevron:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>,
    logout:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    eye:        <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeoff:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    spinner:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>,
    check:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>,
    x:          <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
    clock:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    trend_up:   <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>,
    shield:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    mail:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    db:         <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  };
  return icons[name] || null;
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const inp = { background: "#141520", border: "1px solid #1E2130", borderRadius: 8, padding: "10px 12px", color: "#E2E8F0", fontSize: 14, width: "100%", outline: "none", transition: "border-color 0.2s" };

function Badge({ label, color, bg }) {
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, whiteSpace: "nowrap" }}>{label}</span>;
}

function Btn({ children, onClick, variant = "primary", size = "md", icon, disabled = false, loading = false, style: ex = {}, type = "button" }) {
  const sz = { sm: { fontSize: 12, padding: "6px 14px" }, md: { fontSize: 14, padding: "10px 18px" }, lg: { fontSize: 15, padding: "13px 24px" } }[size];
  const v = {
    primary:   { background: "linear-gradient(135deg,#6366F1,#7C3AED)", color: "#fff", border: "none" },
    secondary: { background: "#141520", color: "#94A3B8", border: "1px solid #1E2130" },
    danger:    { background: "#FF3B5C18", color: "#FF3B5C", border: "1px solid #FF3B5C30" },
    ghost:     { background: "transparent", color: "#64748B", border: "none" },
  }[variant] || {};
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 9, fontWeight: 600, cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: (disabled || loading) ? 0.6 : 1, fontFamily: "inherit", transition: "all 0.15s ease", ...sz, ...v, ...ex }}>
      {loading ? <div style={{ animation: "spin 1s linear infinite" }}><Icon name="spinner" size={15} /></div> : icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = 500 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 16, width, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", animation: "fadeIn 0.2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #1E2130" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}{required && <span style={{ color: "#FF3B5C", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Toast({ message, type = "success" }) {
  const colors = { success: "#10B981", error: "#FF3B5C", info: "#6366F1" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0D0E14", border: `1px solid ${colors[type]}40`, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease" }}>
      <span style={{ color: colors[type], fontSize: 16 }}>{type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}</span>
      <span style={{ fontSize: 13, color: "#E2E8F0" }}>{message}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color = "#6366F1", icon }) {
  return (
    <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#F1F5F9", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "#64748B", marginTop: 5 }}>{sub}</div>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          <Icon name={icon} size={18} />
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("E-posta ve şifre gereklidir."); return; }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError("Hatalı e-posta veya şifre."); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0B0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        input::placeholder{color:#475569}
        input:focus{border-color:#6366F1!important}
      `}</style>

      {/* BG decorations */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, background: "radial-gradient(circle, #6366F120 0%, transparent 70%)", borderRadius: "50%", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 250, height: 250, background: "radial-gradient(circle, #8B5CF620 0%, transparent 70%)", borderRadius: "50%", animation: "float 8s ease-in-out infinite reverse" }} />

      <div style={{ width: 420, animation: "fadeIn 0.5s ease", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 16px", boxShadow: "0 8px 32px #6366F140" }}>C</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", letterSpacing: -0.5 }}>ConsultFlow</h1>
          <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Danışmanlık Yönetim Platformu</p>
        </div>

        {/* Card */}
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 20, padding: "32px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>Giriş Yap</h2>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>Hesabınıza giriş yapın</p>

          {error && (
            <div style={{ background: "#FF3B5C12", border: "1px solid #FF3B5C35", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#FF3B5C", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>E-posta</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }}><Icon name="mail" size={15} /></div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@firma.com" style={{ ...inp, paddingLeft: 38 }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Şifre</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }}><Icon name="lock" size={15} /></div>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Icon name={showPass ? "eyeoff" : "eye"} size={15} />
                </button>
              </div>
            </div>

            <Btn type="submit" loading={loading} disabled={!email || !password} style={{ width: "100%", justifyContent: "center" }} size="lg">
              Giriş Yap
            </Btn>
          </form>

          <div style={{ marginTop: 20, padding: "14px", background: "#141520", borderRadius: 10, border: "1px solid #1E2130" }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>💡 Hesap bilgileri için</div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>Admin, danışman veya müşteri hesabınız için yöneticinizle iletişime geçin.</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="db" size={12} />
          <span style={{ fontSize: 11, color: "#334155" }}>Supabase ile güvende</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*, companies(*)").eq("id", userId).single();
    setProfile(data);
    setAuthLoading(false);
  };

  const loadAll = useCallback(async () => {
    if (!profile) return;
    setDataLoading(true);
    try {
      // Companies — RLS handles filtering automatically
      const { data: c } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
      setCompanies(c || []);

      // Tickets — RLS handles filtering
      const { data: t } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
      setTickets(t || []);

      // Time entries
      const { data: ts } = await supabase.from("time_entries").select("*").order("created_at", { ascending: false });
      setTimesheets(ts || []);

      // Invoices
      const { data: inv } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      setInvoices(inv || []);
    } catch (err) {
      showToast("Veri yüklenemedi: " + err.message, "error");
    }
    setDataLoading(false);
  }, [profile, showToast]);

  useEffect(() => { if (profile) loadAll(); }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPage("dashboard");
  };

  const isAdmin = profile?.role === "admin";
  const isConsultant = profile?.role === "consultant";
  const isCustomer = profile?.role === "customer";

  const roleLabel = { admin: "Admin", consultant: "Danışman", customer: "Müşteri" }[profile?.role] || "";
  const roleColor = { admin: "#8B5CF6", consultant: "#6366F1", customer: "#10B981" }[profile?.role] || "#6366F1";

  const nav = [
    { id: "dashboard", label: "Gösterge Paneli", icon: "dashboard", roles: ["admin", "consultant", "customer"] },
    { id: "companies",  label: "Firmalar",        icon: "companies",  roles: ["admin", "consultant"] },
    { id: "tickets",    label: "Ticket'lar",       icon: "tickets",    roles: ["admin", "consultant", "customer"] },
    { id: "timesheet",  label: "Efor Girişi",      icon: "timesheet",  roles: ["admin", "consultant"] },
    { id: "invoices",   label: "Faturalama",       icon: "invoices",   roles: ["admin", "customer"] },
    { id: "reports",    label: "Raporlar",         icon: "reports",    roles: ["admin", "consultant"] },
    { id: "admin",      label: "Admin Paneli",     icon: "shield",     roles: ["admin"] },
  ].filter(item => item.roles.includes(profile?.role));

  const criticalCount = tickets.filter(t => t.priority === "Critical" && t.status !== "Closed").length;
  const openCount = tickets.filter(t => t.status !== "Closed").length;
  const unbilledHours = timesheets.filter(t => !t.billed).reduce((s, t) => s + (t.hours || 0), 0);

  if (authLoading) {
    return (
      <div style={{ height: "100vh", background: "#0A0B0F", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, fontFamily: "'DM Sans',sans-serif" }}>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>C</div>
        <div style={{ animation: "spin 1s linear infinite", color: "#6366F1" }}><Icon name="spinner" size={24} /></div>
        <span style={{ fontSize: 13, color: "#475569" }}>Yükleniyor...</span>
      </div>
    );
  }

  if (!user || !profile) return <LoginPage onLogin={(u) => { setUser(u); loadProfile(u.id); }} />;

  const pageProps = { companies, tickets, timesheets, invoices, reload: loadAll, showToast, profile, isAdmin, isConsultant, isCustomer, setPage, openCount, criticalCount, unbilledHours };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0A0B0F", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2D3748;border-radius:4px}
        button,input,select,textarea{font-family:inherit}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .page-enter{animation:fadeIn 0.3s ease both}
        .nav-item:hover{background:rgba(99,102,241,0.12)!important}
        .tr-hover:hover{background:rgba(255,255,255,0.03)!important}
        input:focus,select:focus,textarea:focus{border-color:#6366F1!important;outline:none}
        input::placeholder,textarea::placeholder{color:#475569}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 228 : 64, background: "#0D0E14", borderRight: "1px solid #1E2130", display: "flex", flexDirection: "column", transition: "width 0.25s ease", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid #1E2130", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>C</div>
          {sidebarOpen && <div><div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>ConsultFlow</div><div style={{ fontSize: 10, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />Canlı</div></div>}
        </div>

        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {nav.map(item => (
            <button key={item.id} className="nav-item" onClick={() => setPage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: page === item.id ? "rgba(99,102,241,0.18)" : "transparent", color: page === item.id ? "#818CF8" : "#94A3B8", fontWeight: page === item.id ? 600 : 400, fontSize: 13, textAlign: "left", width: "100%", cursor: "pointer" }}>
              <span style={{ flexShrink: 0, color: page === item.id ? "#818CF8" : "#64748B" }}><Icon name={item.icon} size={17} /></span>
              {sidebarOpen && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>}
              {item.id === "tickets" && criticalCount > 0 && (
                <span style={{ background: "#FF3B5C", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, marginLeft: "auto", flexShrink: 0 }}>{criticalCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid #1E2130" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "#141520", borderRadius: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: roleColor + "20", border: `1.5px solid ${roleColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: roleColor, flexShrink: 0 }}>
                {(profile.full_name || profile.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.full_name || profile.email}</div>
                <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>{roleLabel}</div>
              </div>
            </div>
          )}
          <button className="nav-item" onClick={() => setSidebarOpen(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#64748B", fontSize: 12, width: "100%", cursor: "pointer", marginBottom: 4 }}>
            <span style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s ease", display: "inline-block" }}><Icon name="chevron" size={15} /></span>
            {sidebarOpen && "Daralt"}
          </button>
          <button className="nav-item" onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#FF3B5C", fontSize: 12, width: "100%", cursor: "pointer" }}>
            <Icon name="logout" size={15} />
            {sidebarOpen && "Çıkış Yap"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 52, background: "#0D0E14", borderBottom: "1px solid #1E2130", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: "#475569" }}>
            {isCustomer && profile.companies && (
              <span style={{ color: "#818CF8", fontWeight: 600 }}>🏢 {profile.companies.name}</span>
            )}
            {(isAdmin || isConsultant) && <span>Hoş geldiniz, <span style={{ color: "#94A3B8", fontWeight: 600 }}>{profile.full_name || profile.email}</span></span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, background: roleColor + "15", color: roleColor, border: `1px solid ${roleColor}30`, borderRadius: 6, padding: "4px 10px", fontWeight: 600 }}>{roleLabel}</span>
            {dataLoading && <div style={{ animation: "spin 1s linear infinite", color: "#6366F1" }}><Icon name="spinner" size={14} /></div>}
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "22px" }}>
          {page === "dashboard"  && <DashboardPage {...pageProps} />}
          {page === "companies"  && <CompaniesPage {...pageProps} />}
          {page === "tickets"    && <TicketsPage {...pageProps} />}
          {page === "timesheet"  && <TimesheetPage {...pageProps} />}
          {page === "invoices"   && <InvoicesPage {...pageProps} />}
          {page === "reports"    && <ReportsPage {...pageProps} />}
          {page === "admin"      && isAdmin && <AdminPage {...pageProps} />}
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ tickets, timesheets, invoices, companies, openCount, criticalCount, unbilledHours, setPage, isCustomer, isAdmin, profile }) {
  const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Gösterge Paneli</h2>
        <p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>
          {isCustomer ? `${profile.companies?.name || ""} — Hoş geldiniz` : "Danışmanlık operasyonlarına genel bakış"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isCustomer ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard label="Açık Ticket" value={openCount} sub={`${criticalCount} kritik`} color="#6366F1" icon="tickets" />
        {!isCustomer && <StatCard label="Faturalanmamış" value={unbilledHours.toFixed(1) + "s"} color="#F59E0B" icon="clock" />}
        {isAdmin && <StatCard label="Tahsilat" value={"₺" + (totalRevenue / 1000).toFixed(1) + "K"} color="#10B981" icon="trend_up" />}
        {isAdmin && <StatCard label="Firmalar" value={companies.length} color="#8B5CF6" icon="companies" />}
        {isCustomer && <StatCard label="Toplam Ticket" value={tickets.length} color="#8B5CF6" icon="tickets" />}
      </div>

      <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>Son Ticket'lar</h3>
          <button onClick={() => setPage("tickets")} style={{ fontSize: 12, color: "#6366F1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Tümünü Gör →</button>
        </div>
        {recentTickets.length === 0
          ? <div style={{ textAlign: "center", color: "#475569", fontSize: 13, padding: "30px 0" }}>Henüz ticket yok.</div>
          : recentTickets.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#141520", borderRadius: 8, marginBottom: 7, border: "1px solid #1E213040" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Mono',monospace" }}>{t.no}</span>
                  {t.priority && <Badge {...PRIORITY_CONFIG[t.priority]} label={PRIORITY_CONFIG[t.priority]?.label} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#CBD5E1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{companies.find(c => c.id === t.company_id)?.name || "—"}</div>
              </div>
              {t.status && <Badge {...STATUS_CONFIG[t.status]} label={STATUS_CONFIG[t.status]?.label} />}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── COMPANIES ────────────────────────────────────────────────────────────────
function CompaniesPage({ companies, reload, showToast, isAdmin }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const empty = { name: "", tax_no: "", city: "", contact: "", email: "", contract_type: "Saatlik", hourly_rate: "", currency: "TRY", billing_period: "Aylık" };
  const [form, setForm] = useState(empty);
  const cc = { Saatlik: "#6366F1", "Adam/Gün": "#10B981", "Sabit Aylık": "#F59E0B", Retainer: "#8B5CF6" };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    const { error } = await supabase.from("companies").insert([{ ...form, hourly_rate: +form.hourly_rate }]);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Firma eklendi!"); setShowModal(false); setForm(empty); reload();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Firmalar</h2><p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>{companies.length} firma</p></div>
        {isAdmin && <Btn icon="plus" onClick={() => setShowModal(true)}>Firma Ekle</Btn>}
      </div>
      {companies.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div><div>Henüz firma eklenmedi.</div></div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cc[c.contract_type] || "#6366F1" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: (cc[c.contract_type] || "#6366F1") + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: cc[c.contract_type] || "#6366F1" }}>{c.name?.[0]}</div>
                <Badge label={c.contract_type} color={cc[c.contract_type] || "#6366F1"} bg={(cc[c.contract_type] || "#6366F1") + "18"} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>{c.email}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Yetkili", c.contact], ["Şehir", c.city], ["Vergi No", c.tax_no], ["Birim Ücret", `${c.currency} ${c.hourly_rate}`]].map(([l, v]) => (
                  <div key={l} style={{ background: "#141520", borderRadius: 7, padding: "7px 10px" }}>
                    <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 12, color: "#CBD5E1" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
      {showModal && (
        <Modal title="Yeni Firma" onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <div style={{ gridColumn: "1/-1" }}><FormField label="Firma Adı" required><input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField></div>
            <FormField label="Vergi No"><input style={inp} value={form.tax_no} onChange={e => setForm(p => ({ ...p, tax_no: e.target.value }))} /></FormField>
            <FormField label="Şehir"><input style={inp} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></FormField>
            <FormField label="Yetkili"><input style={inp} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} /></FormField>
            <FormField label="E-posta"><input style={inp} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></FormField>
            <FormField label="Sözleşme"><select style={inp} value={form.contract_type} onChange={e => setForm(p => ({ ...p, contract_type: e.target.value }))}>{["Saatlik","Adam/Gün","Sabit Aylık","Retainer"].map(t => <option key={t}>{t}</option>)}</select></FormField>
            <FormField label="Birim Ücret"><input style={inp} type="number" value={form.hourly_rate} onChange={e => setForm(p => ({ ...p, hourly_rate: e.target.value }))} /></FormField>
            <FormField label="Para Birimi"><select style={inp} value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>{["TRY","USD","EUR"].map(c => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Faturalama"><select style={inp} value={form.billing_period} onChange={e => setForm(p => ({ ...p, billing_period: e.target.value }))}>{["Aylık","Proje Sonu"].map(p => <option key={p}>{p}</option>)}</select></FormField>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>İptal</Btn>
            <Btn onClick={save} loading={saving} disabled={!form.name}>Kaydet</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────
function TicketsPage({ tickets, companies, timesheets, reload, showToast, profile, isAdmin, isConsultant, isCustomer }) {
  const [sel, setSel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [msgs, setMsgs] = useState({});
  const [newMsg, setNewMsg] = useState("");
  const [efors, setEfors] = useState({});
  const [showEforForm, setShowEforForm] = useState(false);
  const [eforForm, setEforForm] = useState({ date: new Date().toISOString().slice(0,10), hours: "", description: "" });
  const [savingEfor, setSavingEfor] = useState(false);
  const empty = { title: "", description: "", company_id: isCustomer ? profile.company_id : "", priority: "Medium", assignee: "" };
  const [form, setForm] = useState(empty);

  const filtered = tickets.filter(t => fStatus === "all" || t.status === fStatus);

  // Load messages and efors from DB for selected ticket
  useEffect(() => {
    if (sel) loadTicketData(sel.id, sel.no);
  }, [sel?.id]);

  const loadTicketData = async (ticketId, ticketNo) => {
    const { data: m } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
    if (m) setMsgs(p => ({ ...p, [ticketId]: m }));
    const { data: e } = await supabase.from("time_entries").select("*").eq("ticket_no", ticketNo).order("date");
    if (e) setEfors(p => ({ ...p, [ticketNo]: e }));
  };

  const save = async () => {
    if (!form.title) return;
    const companyId = isCustomer ? profile.company_id : form.company_id;
    if (!companyId) { showToast("Lütfen firma seçin", "error"); return; }
    setSaving(true);
    const no = "TKT-" + Date.now().toString().slice(-6);
    const ticketData = { ...form, company_id: companyId, no, status: "Open", assignee: form.assignee || null };
    const { error } = await supabase.from("tickets").insert([ticketData]);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Ticket oluşturuldu!"); setShowModal(false); setForm(empty); reload();
  };

  const changeStatus = async (ticket, status) => {
    await supabase.from("tickets").update({ status, closed_at: status === "Closed" ? new Date().toISOString() : null }).eq("id", ticket.id);
    showToast("Durum: " + STATUS_CONFIG[status]?.label);
    setSel(p => p ? { ...p, status } : p);
    reload();
  };

  const assignConsultant = async (ticket, assignee) => {
    const { error } = await supabase.from("tickets").update({ assignee, status: ticket.status === "Open" ? "In Progress" : ticket.status }).eq("id", ticket.id);
    if (error) { showToast(error.message, "error"); return; }
    showToast(assignee + " atandı!");
    setSel(p => p ? { ...p, assignee, status: p.status === "Open" ? "In Progress" : p.status } : p);
    reload();
  };

  const sendMsg = async () => {
    if (!newMsg.trim() || !sel) return;
    const msgData = { ticket_id: sel.id, author_name: profile.full_name || profile.email, author_role: profile.role, message: newMsg };
    const { data, error } = await supabase.from("ticket_messages").insert([msgData]).select().single();
    if (error) {
      // Fallback: store locally if table doesn't exist yet
      const time = new Date().toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit" });
      setMsgs(p => ({ ...p, [sel.id]: [...(p[sel.id] || []), { id: Date.now(), author_name: profile.full_name || profile.email, author_role: profile.role, message: newMsg, created_at: new Date().toISOString() }] }));
    } else {
      setMsgs(p => ({ ...p, [sel.id]: [...(p[sel.id] || []), data] }));
    }
    setNewMsg("");
  };

  const saveEfor = async () => {
    if (!eforForm.hours || !sel) return;
    setSavingEfor(true);
    const { data, error } = await supabase.from("time_entries").insert([{ consultant: profile.full_name || profile.email, ticket_no: sel.no, date: eforForm.date, hours: +eforForm.hours, description: eforForm.description, billed: false }]).select().single();
    setSavingEfor(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast(eforForm.hours + " saat kaydedildi!");
    setEfors(p => ({ ...p, [sel.no]: [...(p[sel.no] || []), data] }));
    setEforForm({ date: new Date().toISOString().slice(0,10), hours: "", description: "" });
    setShowEforForm(false);
    reload();
  };

  // ── TICKET DETAIL ──
  if (sel) {
    const ticketMsgs = msgs[sel.id] || [];
    const ticketTime = efors[sel.no] || timesheets.filter(t => t.ticket_no === sel.no);
    const totalHrs = ticketTime.reduce((s, t) => s + (t.hours || 0), 0);
    const company = companies.find(c => c.id === sel.company_id);
    const priorityCfg = PRIORITY_CONFIG[sel.priority] || {};
    const statusCfg = STATUS_CONFIG[sel.status] || {};

    return (
      <div className="page-enter">
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={() => { setSel(null); setShowEforForm(false); }} style={{ background: "#141520", border: "1px solid #1E2130", borderRadius: 7, padding: "7px 14px", color: "#94A3B8", fontSize: 13, cursor: "pointer" }}>← Geri</button>
          <span style={{ color: "#334155" }}>/</span>
          <span style={{ fontSize: 13, color: "#818CF8", fontFamily: "'DM Mono',monospace", fontWeight: 700, background: "#6366F118", padding: "4px 12px", borderRadius: 6, border: "1px solid #6366F130" }}>{sel.no}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {priorityCfg.color && <Badge {...priorityCfg} label={priorityCfg.label} />}
            {statusCfg.color && <Badge {...statusCfg} label={statusCfg.label} />}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Ticket Info */}
            <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "22px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: priorityCfg.color || "#6366F1" }} />
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{company?.name}</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", marginBottom: 10 }}>{sel.title}</h1>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7 }}>{sel.description || "Açıklama eklenmemiş."}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid #1E2130" }}>
                <div style={{ fontSize: 12, color: "#475569" }}>📅 {sel.created_at?.slice(0,10)}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>⏱️ {totalHrs} saat toplam efor</div>
                {sel.assignee && <div style={{ fontSize: 12, color: "#818CF8" }}>👤 {sel.assignee}</div>}
              </div>
            </div>

            {/* Mesajlaşma */}
            <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                💬 Mesajlar
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 400 }}>Müşteri & Danışman iletişimi</span>
              </h3>
              <div style={{ minHeight: 100, maxHeight: 340, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
                {ticketMsgs.length === 0
                  ? <div style={{ textAlign: "center", color: "#334155", fontSize: 13, padding: "30px 0" }}>Henüz mesaj yok. İlk mesajı gönderin!</div>
                  : ticketMsgs.map((m, i) => {
                    const isMe = m.author_role === profile.role;
                    const isCustomerMsg = m.author_role === "customer";
                    return (
                      <div key={m.id || i} style={{ display: "flex", flexDirection: "column", alignItems: isCustomerMsg ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "78%", background: isCustomerMsg ? "linear-gradient(135deg,#6366F120,#8B5CF620)" : "#141520", border: isCustomerMsg ? "1px solid #6366F135" : "1px solid #1E2130", borderRadius: isCustomerMsg ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 10, marginBottom: 5, alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isCustomerMsg ? "#818CF8" : "#10B981" }}>{m.author_name}</span>
                            <span style={{ fontSize: 10, color: "#334155" }}>{new Date(m.created_at).toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Mesaj yazın... (Enter ile gönderin)" style={{ ...inp, flex: 1, borderRadius: 10 }} />
                <button onClick={sendMsg} disabled={!newMsg.trim()} style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", border: "none", borderRadius: 10, padding: "0 18px", color: "#fff", fontWeight: 700, cursor: newMsg.trim() ? "pointer" : "not-allowed", opacity: newMsg.trim() ? 1 : 0.5, fontSize: 13 }}>Gönder</button>
              </div>
            </div>

            {/* Zaman Çizelgesi */}
            <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", display: "flex", alignItems: "center", gap: 8 }}>
                  📊 Zaman Çizelgesi
                  <span style={{ fontSize: 11, background: "#6366F118", color: "#818CF8", padding: "2px 8px", borderRadius: 5, fontWeight: 600 }}>{totalHrs}s toplam</span>
                </h3>
                {(isAdmin || isConsultant) && (
                  <button onClick={() => setShowEforForm(p => !p)} style={{ background: showEforForm ? "#FF3B5C18" : "linear-gradient(135deg,#6366F1,#7C3AED)", border: showEforForm ? "1px solid #FF3B5C30" : "none", borderRadius: 8, padding: "7px 14px", color: showEforForm ? "#FF3B5C" : "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {showEforForm ? "✕ İptal" : "+ Efor Gir"}
                  </button>
                )}
              </div>

              {showEforForm && (
                <div style={{ background: "#141520", borderRadius: 10, padding: "14px", marginBottom: 16, border: "1px solid #6366F130", animation: "fadeIn 0.2s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", marginBottom: 10 }}>
                    <FormField label="Tarih"><input type="date" style={inp} value={eforForm.date} onChange={e => setEforForm(p => ({ ...p, date: e.target.value }))} /></FormField>
                    <FormField label="Süre (Saat)"><input type="number" step="0.5" min="0.5" style={inp} value={eforForm.hours} onChange={e => setEforForm(p => ({ ...p, hours: e.target.value }))} placeholder="0.5, 1, 2..."/></FormField>
                  </div>
                  <FormField label="Açıklama"><input style={inp} value={eforForm.description} onChange={e => setEforForm(p => ({ ...p, description: e.target.value }))} placeholder="Yapılan iş açıklaması" /></FormField>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button onClick={saveEfor} disabled={savingEfor || !eforForm.hours} style={{ background: "linear-gradient(135deg,#6366F1,#7C3AED)", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !eforForm.hours ? 0.5 : 1 }}>
                      {savingEfor ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              )}

              {ticketTime.length === 0 ? (
                <div style={{ textAlign: "center", color: "#334155", fontSize: 13, padding: "20px 0" }}>Henüz efor girilmedi.</div>
              ) : (
                <div style={{ position: "relative" }}>
                  {/* Timeline line */}
                  <div style={{ position: "absolute", left: 16, top: 8, bottom: 8, width: 2, background: "linear-gradient(to bottom, #6366F1, #1E2130)", borderRadius: 2 }} />
                  {ticketTime.map((t, i) => (
                    <div key={t.id || i} style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.billed ? "#10B98120" : "#6366F120", border: `2px solid ${t.billed ? "#10B981" : "#6366F1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.billed ? "#10B981" : "#818CF8", fontFamily: "'DM Mono',monospace" }}>{t.hours}s</span>
                      </div>
                      <div style={{ flex: 1, background: "#141520", borderRadius: 10, padding: "10px 14px", border: "1px solid #1E2130" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{t.consultant}</span>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#475569" }}>{t.date}</span>
                            {t.billed ? <span style={{ fontSize: 10, background: "#10B98118", color: "#10B981", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>Faturalandı</span> : <span style={{ fontSize: 10, background: "#F59E0B18", color: "#F59E0B", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>Bekliyor</span>}
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748B" }}>{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Danışman Atama - Admin için */}
            {isAdmin && (
              <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "18px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>👤 Danışman Ata</h3>
                {sel.assignee ? (
                  <div style={{ background: "#6366F118", border: "1px solid #6366F130", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{sel.assignee[0]}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#818CF8" }}>{sel.assignee}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>Atanmış danışman</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#F59E0B", background: "#F59E0B12", border: "1px solid #F59E0B30", borderRadius: 7, padding: "8px 10px", marginBottom: 10 }}>⚠️ Danışman atanmadı</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {CONSULTANTS.map(c => (
                    <button key={c} onClick={() => assignConsultant(sel, c)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${sel.assignee===c?"#6366F150":"#1E2130"}`, background: sel.assignee===c?"#6366F118":"#141520", color: sel.assignee===c?"#818CF8":"#64748B", fontSize: 12, fontWeight: sel.assignee===c?700:400, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: sel.assignee===c?"#6366F130":"#1E2130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: sel.assignee===c?"#818CF8":"#475569" }}>{c[0]}</div>
                      {c}
                      {sel.assignee===c && <span style={{ marginLeft: "auto", color: "#10B981" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Durum Değiştir */}
            {(isAdmin || isConsultant) && (
              <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "18px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>🔄 Durum</h3>
                {["Open","In Progress","Waiting","Closed"].map(s => (
                  <button key={s} onClick={() => changeStatus(sel, s)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginBottom: 6, padding: "9px 12px", borderRadius: 8, border: `1px solid ${sel.status===s?STATUS_CONFIG[s].color+"50":"#1E2130"}`, background: sel.status===s?STATUS_CONFIG[s].bg:"#141520", color: sel.status===s?STATUS_CONFIG[s].color:"#64748B", fontSize: 12, fontWeight: sel.status===s?700:400, cursor: "pointer" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_CONFIG[s].color, display: "inline-block" }} />
                    {STATUS_CONFIG[s].label}
                    {sel.status===s && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Ticket Özeti */}
            <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 14, padding: "18px" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>📋 Detaylar</h3>
              {[
                ["Firma", company?.name],
                ["Ticket No", sel.no],
                ["Atanan", sel.assignee || "Atanmadı"],
                ["Açılış", sel.created_at?.slice(0,10)],
                ["Toplam Efor", totalHrs + " saat"],
                ["Mesaj", ticketMsgs.length + " adet"],
              ].map(([l,v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1E213050" }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>{l}</span>
                  <span style={{ fontSize: 12, color: l==="Atanan" && !sel.assignee ? "#F59E0B" : "#CBD5E1", fontWeight: 500, fontFamily: l==="Ticket No"?"'DM Mono',monospace":"inherit" }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TICKET LIST (CARD VIEW) ──
  const statusGroups = ["Open","In Progress","Waiting","Closed"];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Ticket'lar</h2>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>{filtered.length} ticket</p>
        </div>
        <Btn icon="plus" onClick={() => setShowModal(true)}>Yeni Ticket</Btn>
      </div>

      {/* Filtreler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all",...statusGroups].map(s => (
          <button key={s} onClick={() => setFStatus(s)}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${fStatus===s?(STATUS_CONFIG[s]?.color||"#6366F1"):"#1E2130"}`, background: fStatus===s?(STATUS_CONFIG[s]?.bg||"#6366F118"):"#141520", color: fStatus===s?(STATUS_CONFIG[s]?.color||"#818CF8"):"#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {s==="all"?"Tümü":STATUS_CONFIG[s]?.label} {s!=="all" && <span style={{ opacity: 0.7 }}>({tickets.filter(t=>t.status===s).length})</span>}
          </button>
        ))}
      </div>

      {/* CARD GRID */}
      {filtered.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>Ticket bulunamadı.</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map(t => {
            const pc = PRIORITY_CONFIG[t.priority] || {};
            const sc = STATUS_CONFIG[t.status] || {};
            const co = companies.find(c => c.id === t.company_id);
            const tEfors = timesheets.filter(e => e.ticket_no === t.no);
            const tHrs = tEfors.reduce((s, e) => s + (e.hours || 0), 0);
            const needsAssign = !t.assignee && isAdmin;
            return (
              <div key={t.id} onClick={() => setSel(t)} style={{ background: "#0D0E14", border: `1px solid ${needsAssign?"#F59E0B40":"#1E2130"}`, borderRadius: 14, padding: "18px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                {/* Priority bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: pc.color || "#6366F1" }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: "#6366F1", fontFamily: "'DM Mono',monospace", fontWeight: 700, background: "#6366F115", padding: "2px 8px", borderRadius: 4 }}>{t.no}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {pc.color && <Badge {...pc} label={pc.label} />}
                    {sc.color && <Badge {...sc} label={sc.label} />}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 6, lineHeight: 1.4 }}>{t.title}</h3>

                {/* Description preview */}
                <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.description || "Açıklama yok"}</p>

                {/* Company */}
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                  🏢 <span style={{ color: "#94A3B8", fontWeight: 500 }}>{co?.name || "—"}</span>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #1E213060" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.assignee ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366F130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#818CF8" }}>{t.assignee[0]}</div>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{t.assignee}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#F59E0B", background: "#F59E0B12", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>⚠ Atanmadı</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {tHrs > 0 && <span style={{ fontSize: 11, color: "#475569" }}>⏱ {tHrs}s</span>}
                    <span style={{ fontSize: 11, color: "#334155" }}>{t.created_at?.slice(0,10)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }

      {/* NEW TICKET MODAL */}
      {showModal && (
        <Modal title="Yeni Ticket" onClose={() => setShowModal(false)}>
          <FormField label="Başlık" required><input style={inp} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ticket başlığı" autoFocus /></FormField>
          <FormField label="Açıklama"><textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Sorunu detaylı açıklayın..." /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            {!isCustomer && (
              <FormField label="Firma" required>
                <select style={inp} value={form.company_id} onChange={e => setForm(p => ({ ...p, company_id: e.target.value }))}>
                  <option value="">Seçin...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            )}
            <FormField label="Öncelik">
              <select style={inp} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            {isAdmin && (
              <FormField label="Danışman Ata">
                <select style={inp} value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}>
                  <option value="">Sonra ata...</option>
                  {CONSULTANTS.map(c => <option key={c}>{c}</option>)}
                </select>
              </FormField>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>İptal</Btn>
            <Btn onClick={save} loading={saving} disabled={!form.title || (!isCustomer && !form.company_id)}>Oluştur</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TIMESHEET ────────────────────────────────────────────────────────────────
function TimesheetPage({ timesheets, tickets, reload, showToast, profile }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const empty = { consultant: profile.full_name || "", ticket_no: "", date: new Date().toISOString().slice(0,10), hours: "", description: "" };
  const [form, setForm] = useState(empty);
  const openTickets = tickets.filter(t => t.status !== "Closed");
  const total = timesheets.reduce((s, t) => s + (t.hours || 0), 0);
  const billed = timesheets.filter(t => t.billed).reduce((s, t) => s + (t.hours || 0), 0);

  const save = async () => {
    if (!form.ticket_no || !form.hours) return;
    setSaving(true);
    const { error } = await supabase.from("time_entries").insert([{ ...form, hours: +form.hours, billed: false }]);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Efor kaydedildi!"); setShowModal(false); setForm(empty); reload();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Efor Girişi</h2><p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>Günlük çalışma saatleri</p></div>
        <Btn icon="plus" onClick={() => setShowModal(true)}>Efor Gir</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Toplam" value={total.toFixed(1) + "s"} color="#6366F1" icon="clock" />
        <StatCard label="Faturalandı" value={billed.toFixed(1) + "s"} color="#10B981" icon="check" />
        <StatCard label="Bekliyor" value={(total-billed).toFixed(1) + "s"} color="#F59E0B" icon="clock" />
      </div>
      <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, overflow: "hidden" }}>
        {timesheets.length === 0
          ? <div style={{ padding: "50px", textAlign: "center", color: "#475569" }}><div style={{ fontSize: 32, marginBottom: 10 }}>⏱️</div>Henüz efor girilmedi.</div>
          : <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid #1E2130" }}>{["Danışman","Ticket","Tarih","Süre","Açıklama","Durum"].map(h => <th key={h} style={{ padding: "11px 13px", fontSize: 11, fontWeight: 600, color: "#475569", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {timesheets.map(t => (
                <tr key={t.id} className="tr-hover" style={{ borderBottom: "1px solid #1E213040" }}>
                  <td style={{ padding: "10px 13px", fontSize: 13, color: "#CBD5E1", fontWeight: 500 }}>{t.consultant}</td>
                  <td style={{ padding: "10px 13px", fontSize: 12, color: "#818CF8", fontFamily: "'DM Mono',monospace" }}>{t.ticket_no}</td>
                  <td style={{ padding: "10px 13px", fontSize: 12, color: "#94A3B8" }}>{t.date}</td>
                  <td style={{ padding: "10px 13px", fontSize: 13, fontWeight: 700, color: "#F1F5F9", fontFamily: "'DM Mono',monospace" }}>{t.hours}s</td>
                  <td style={{ padding: "10px 13px", fontSize: 12, color: "#64748B", maxWidth: 180 }}><span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</span></td>
                  <td style={{ padding: "10px 13px" }}>{t.billed ? <Badge label="Faturalandı" color="#10B981" bg="#10B98118" /> : <Badge label="Bekliyor" color="#F59E0B" bg="#F59E0B18" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
      {showModal && (
        <Modal title="Efor Kaydı" onClose={() => setShowModal(false)}>
          <FormField label="Danışman"><select style={inp} value={form.consultant} onChange={e => setForm(p => ({ ...p, consultant: e.target.value }))}>{CONSULTANTS.map(c => <option key={c}>{c}</option>)}</select></FormField>
          <FormField label="Ticket" required><select style={inp} value={form.ticket_no} onChange={e => setForm(p => ({ ...p, ticket_no: e.target.value }))}><option value="">Seçin...</option>{openTickets.map(t => <option key={t.no} value={t.no}>{t.no} – {t.title}</option>)}</select></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Tarih"><input type="date" style={inp} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></FormField>
            <FormField label="Süre (Saat)" required><input type="number" step="0.5" style={inp} value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} /></FormField>
          </div>
          <FormField label="Açıklama"><textarea style={{ ...inp, height: 65, resize: "vertical" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>İptal</Btn>
            <Btn onClick={save} loading={saving} disabled={!form.ticket_no || !form.hours}>Kaydet</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INVOICES ────────────────────────────────────────────────────────────────
function InvoicesPage({ invoices, companies, timesheets, tickets, reload, showToast, isAdmin, isCustomer }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ companyId: "" });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const unbilled = timesheets.filter(t => {
    if (t.billed) return false;
    const ticket = tickets.find(tk => tk.no === t.ticket_no);
    return ticket?.company_id === sel.companyId;
  });
  const company = companies.find(c => c.id === sel.companyId);
  const totalHours = unbilled.reduce((s, t) => s + (t.hours || 0), 0);
  const subtotal = totalHours * (company?.hourly_rate || 0);
  const vat = subtotal * 0.18;
  const total = subtotal + vat;

  const createInvoice = async () => {
    if (!preview) return;
    setSaving(true);
    const no = "INV-" + new Date().getFullYear() + "-" + String(invoices.length + 1).padStart(3, "0");
    const { error } = await supabase.from("invoices").insert([{ no, company_id: sel.companyId, company_name: company.name, date: new Date().toISOString().slice(0,10), total_hours: totalHours, unit_rate: company.hourly_rate, subtotal, vat, total, currency: company.currency || "TRY", status: "Bekliyor" }]);
    if (error) { showToast(error.message, "error"); setSaving(false); return; }
    for (const t of unbilled) await supabase.from("time_entries").update({ billed: true, invoice_no: no }).eq("id", t.id);
    showToast("Fatura oluşturuldu!"); setSaving(false); setStep(0); setPreview(null); reload();
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Faturalama</h2><p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>{invoices.length} fatura</p></div>
        {isAdmin && step === 0 && <Btn icon="plus" onClick={() => setStep(1)}>Fatura Oluştur</Btn>}
        {isAdmin && step === 1 && <Btn variant="secondary" onClick={() => { setStep(0); setPreview(null); }}>← Geri</Btn>}
      </div>

      {step === 0 && (
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, overflow: "hidden" }}>
          {invoices.length === 0
            ? <div style={{ padding: "50px", textAlign: "center", color: "#475569" }}><div style={{ fontSize: 32, marginBottom: 10 }}>🧾</div>Henüz fatura yok.</div>
            : <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid #1E2130" }}>{["Fatura No","Firma","Tarih","Saat","Toplam","Durum"].map(h => <th key={h} style={{ padding: "11px 13px", fontSize: 11, fontWeight: 600, color: "#475569", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>)}</tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="tr-hover" style={{ borderBottom: "1px solid #1E213040" }}>
                    <td style={{ padding: "11px 13px", fontSize: 12, color: "#818CF8", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{inv.no}</td>
                    <td style={{ padding: "11px 13px", fontSize: 13, color: "#CBD5E1" }}>{inv.company_name}</td>
                    <td style={{ padding: "11px 13px", fontSize: 12, color: "#94A3B8" }}>{inv.date}</td>
                    <td style={{ padding: "11px 13px", fontSize: 12, color: "#94A3B8", fontFamily: "'DM Mono',monospace" }}>{inv.total_hours}s</td>
                    <td style={{ padding: "11px 13px", fontSize: 13, fontWeight: 700, color: "#F1F5F9", fontFamily: "'DM Mono',monospace" }}>₺{(inv.total||0).toLocaleString("tr")}</td>
                    <td style={{ padding: "11px 13px" }}><Badge label={inv.status} color={inv.status==="Ödendi"?"#10B981":"#F59E0B"} bg={inv.status==="Ödendi"?"#10B98118":"#F59E0B18"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}

      {step === 1 && isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "22px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Parametreler</h3>
            <FormField label="Firma" required>
              <select style={inp} value={sel.companyId} onChange={e => { setSel({ companyId: e.target.value }); setPreview(null); }}>
                <option value="">Firma seçin...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            {sel.companyId && (
              <div style={{ background: "#141520", borderRadius: 8, padding: "12px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Faturalanmamış ({unbilled.length} kayıt)</div>
                {unbilled.length === 0 ? <p style={{ fontSize: 12, color: "#475569" }}>Faturalanmamış efor yok.</p>
                  : unbilled.map(t => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{t.date} · {t.ticket_no}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#818CF8", fontFamily: "'DM Mono',monospace" }}>{t.hours}s</span>
                    </div>
                  ))}
              </div>
            )}
            <Btn onClick={() => setPreview({ company, totalHours, subtotal, vat, total })} disabled={!sel.companyId || totalHours === 0} style={{ width: "100%", justifyContent: "center" }}>Önizle</Btn>
          </div>
          <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "22px" }}>
            {!preview ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", textAlign: "center" }}><div><div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>Önizlemek için firma seçin</div></div>
              : <div style={{ animation: "fadeIn 0.3s ease" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 14 }}>Fatura Önizleme</h3>
                <div style={{ background: "#141520", borderRadius: 10, padding: "16px", marginBottom: 14, border: "1px solid #1E2130" }}>
                  {[["Firma", preview.company?.name], ["Toplam Saat", `${preview.totalHours}s`], ["Birim Ücret", `₺${preview.company?.hourly_rate}/s`]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span style={{ fontSize: 13, color: "#94A3B8" }}>{l}</span><span style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{v}</span></div>
                  ))}
                  <div style={{ borderTop: "1px solid #1E2130", paddingTop: 10, marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "#94A3B8" }}>Ara Toplam</span><span style={{ fontSize: 13, color: "#F1F5F9", fontFamily: "'DM Mono',monospace" }}>₺{preview.subtotal.toLocaleString("tr")}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 13, color: "#94A3B8" }}>KDV %18</span><span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'DM Mono',monospace" }}>₺{preview.vat.toLocaleString("tr")}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#6366F118", borderRadius: 7, padding: "10px 12px" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>Genel Toplam</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#818CF8", fontFamily: "'DM Mono',monospace" }}>₺{preview.total.toLocaleString("tr")}</span>
                    </div>
                  </div>
                </div>
                <Btn onClick={createInvoice} loading={saving} style={{ width: "100%", justifyContent: "center" }}>Oluştur & Kilitle</Btn>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function ReportsPage({ timesheets, tickets, companies, invoices }) {
  const [tab, setTab] = useState("effort");
  const effortByCompany = companies.map(c => {
    const nos = tickets.filter(t => t.company_id === c.id).map(t => t.no);
    const entries = timesheets.filter(t => nos.includes(t.ticket_no));
    const total = entries.reduce((s, t) => s + (t.hours || 0), 0);
    const billed = entries.filter(t => t.billed).reduce((s, t) => s + (t.hours || 0), 0);
    return { ...c, total, billed, unbilled: total - billed };
  });
  const byConsultant = CONSULTANTS.map(name => {
    const e = timesheets.filter(t => t.consultant === name);
    return { name, hours: e.reduce((s, t) => s + (t.hours || 0), 0), count: e.length };
  }).sort((a, b) => b.hours - a.hours);
  const maxH = Math.max(...byConsultant.map(c => c.hours), 1);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Raporlar</h2></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["effort","Efor Analizi"],["consultant","Danışman Performansı"],["invoice","Fatura Geçmişi"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (tab===id?"#6366F1":"#1E2130"), background: tab===id?"#6366F118":"#141520", color: tab===id?"#818CF8":"#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {tab === "effort" && (
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Firma Bazlı Efor</h3>
          {effortByCompany.map(c => (
            <div key={c.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1E213050" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{c.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#818CF8", fontFamily: "'DM Mono',monospace" }}>{c.total}s</span>
              </div>
              <div style={{ display: "flex", gap: 4, height: 8, marginBottom: 6 }}>
                {c.billed > 0 && <div style={{ flex: c.billed, background: "#10B981", borderRadius: 4 }} />}
                {c.unbilled > 0 && <div style={{ flex: c.unbilled, background: "#F59E0B40", borderRadius: 4, border: "1px solid #F59E0B50" }} />}
                {c.total === 0 && <div style={{ flex: 1, background: "#1E2130", borderRadius: 4 }} />}
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ fontSize: 11, color: "#10B981" }}>● Faturalandı: {c.billed}s</span>
                <span style={{ fontSize: 11, color: "#F59E0B" }}>● Bekliyor: {c.unbilled.toFixed(1)}s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "consultant" && (
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Danışman Performansı</h3>
          {byConsultant.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "12px 14px", background: "#141520", borderRadius: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i===0?"linear-gradient(135deg,#6366F1,#8B5CF6)":"#1E2130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i===0?"#fff":"#475569", flexShrink: 0 }}>#{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{c.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#818CF8", fontFamily: "'DM Mono',monospace" }}>{c.hours}s</span>
                </div>
                <div style={{ height: 5, background: "#1E2130", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${(c.hours/maxH)*100}%`, background: i===0?"linear-gradient(90deg,#6366F1,#8B5CF6)":"#334155", borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "invoice" && (
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Fatura Geçmişi</h3>
          {invoices.length === 0 ? <div style={{ color: "#475569", fontSize: 13 }}>Henüz fatura yok.</div> : invoices.map(inv => (
            <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", background: "#141520", borderRadius: 9, marginBottom: 9 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#818CF8", fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>{inv.no}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{inv.company_name} · {inv.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>₺{(inv.total||0).toLocaleString("tr")}</div>
                <Badge label={inv.status} color={inv.status==="Ödendi"?"#10B981":"#F59E0B"} bg={inv.status==="Ödendi"?"#10B98118":"#F59E0B18"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
function AdminPage({ companies, showToast, reload }) {
  const [tab, setTab] = useState("users");
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const empty = { email: "", password: "", full_name: "", role: "customer", company_id: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    supabase.from("profiles").select("*, companies(name)").order("created_at", { ascending: false })
      .then(({ data }) => { setProfiles(data || []); setLoadingProfiles(false); });
  }, []);

  const createUser = async () => {
    if (!form.email || !form.password || !form.full_name) return;
    setSaving(true);
    // Create auth user via Supabase Admin (using service role would be ideal, but for demo we use signUp)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } }
    });
    if (error) { showToast(error.message, "error"); setSaving(false); return; }
    // Update profile with company_id and role
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email: form.email, full_name: form.full_name, role: form.role, company_id: form.company_id || null });
    }
    showToast("Kullanıcı oluşturuldu! E-posta onayı gerekebilir.");
    setSaving(false); setShowModal(false); setForm(empty);
    // Reload profiles
    const { data: p } = await supabase.from("profiles").select("*, companies(name)").order("created_at", { ascending: false });
    setProfiles(p || []);
  };

  const roleColors = { admin: { color: "#8B5CF6", bg: "#8B5CF618" }, consultant: { color: "#6366F1", bg: "#6366F118" }, customer: { color: "#10B981", bg: "#10B98118" } };
  const roleLabels = { admin: "Admin", consultant: "Danışman", customer: "Müşteri" };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="shield" size={20} /> Admin Paneli
        </h2>
        <p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>Kullanıcı ve sistem yönetimi</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["users","Kullanıcılar"],["settings","Sistem"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (tab===id?"#8B5CF6":"#1E2130"), background: tab===id?"#8B5CF618":"#141520", color: tab===id?"#A78BFA":"#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Btn icon="plus" onClick={() => setShowModal(true)}>Yeni Kullanıcı</Btn>
          </div>
          <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, overflow: "hidden" }}>
            {loadingProfiles ? <div style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Yükleniyor...</div>
              : profiles.length === 0 ? <div style={{ padding: "50px", textAlign: "center", color: "#475569" }}>Kullanıcı bulunamadı.</div>
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #1E2130" }}>{["Kullanıcı","E-posta","Rol","Firma","Tarih"].map(h => <th key={h} style={{ padding: "11px 14px", fontSize: 11, fontWeight: 600, color: "#475569", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {profiles.map(u => (
                    <tr key={u.id} className="tr-hover" style={{ borderBottom: "1px solid #1E213040" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: (roleColors[u.role]?.bg || "#1E2130"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: roleColors[u.role]?.color || "#64748B", flexShrink: 0 }}>
                            {(u.full_name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{u.full_name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748B" }}>{u.email}</td>
                      <td style={{ padding: "12px 14px" }}><Badge label={roleLabels[u.role] || u.role} color={roleColors[u.role]?.color || "#64748B"} bg={roleColors[u.role]?.bg || "#64748B18"} /></td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#94A3B8" }}>{u.companies?.name || "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 11, color: "#475569" }}>{u.created_at?.slice(0,10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </>
      )}

      {tab === "settings" && (
        <div style={{ background: "#0D0E14", border: "1px solid #1E2130", borderRadius: 12, padding: "24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Sistem Bilgileri</h3>
          {[["Platform", "ConsultFlow v2.0"], ["Veritabanı", "Supabase PostgreSQL"], ["Auth", "Supabase Auth"], ["Hosting", "Vercel"], ["Rol Sistemi", "Admin / Danışman / Müşteri"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1E213060" }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>{l}</span>
              <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Yeni Kullanıcı Oluştur" onClose={() => setShowModal(false)} width={460}>
          <FormField label="Ad Soyad" required>
            <input style={inp} value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Ad Soyad" autoFocus />
          </FormField>
          <FormField label="E-posta" required>
            <input style={inp} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ornek@firma.com" />
          </FormField>
          <FormField label="Şifre" required>
            <input style={inp} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="En az 6 karakter" />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Rol" required>
              <select style={inp} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="customer">Müşteri</option>
                <option value="consultant">Danışman</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            {form.role === "customer" && (
              <FormField label="Firma">
                <select style={inp} value={form.company_id} onChange={e => setForm(p => ({ ...p, company_id: e.target.value }))}>
                  <option value="">Firma seçin...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>İptal</Btn>
            <Btn onClick={createUser} loading={saving} disabled={!form.email || !form.password || !form.full_name}>Oluştur</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
