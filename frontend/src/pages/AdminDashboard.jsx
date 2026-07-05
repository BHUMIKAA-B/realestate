import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, XCircle, Users, Building, AlertCircle, Inbox, FileCheck, Palette, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/api/client";
import { INR, formatArea, CATEGORY_LABEL } from "@/utils/format";
import { applyAccentColor } from "@/lib/theme";

const TABS = [
  { id: "pending", label: "Pending verification" },
  { id: "all_props", label: "All properties" },
  { id: "users", label: "Users" },
  { id: "enquiries", label: "Enquiries" },
  { id: "services", label: "Service requests" },
  { id: "site_settings", label: "Site Settings" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    api.get("/admin/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="min-h-screen bg-vs-bg">
      <Navbar />
      <section className="bg-vs-bg border-b border-vs-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-vs-text-primary" data-testid="admin-title">
            Admin Console
          </h1>
          <p className="text-sm text-vs-text-secondary mt-1">
            Verify listings, manage users, monitor activity.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard Icon={AlertCircle} label="Pending" value={stats.pending_listings} accent />
            <StatCard Icon={Building} label="Published" value={stats.published_listings} />
            <StatCard Icon={Users} label="Users" value={stats.users_total} />
            <StatCard Icon={Inbox} label="Enquiries" value={stats.enquiries} />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 border-b border-vs-border mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
                tab === t.id
                  ? "border-vs-gold text-vs-gold font-medium"
                  : "border-transparent text-vs-text-secondary hover:text-vs-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pending" && <PendingQueue />}
        {tab === "all_props" && <AllProperties />}
        {tab === "users" && <UsersList />}
        {tab === "enquiries" && <EnquiriesList />}
        {tab === "services" && <ServicesList />}
        {tab === "site_settings" && <SiteSettings />}
      </section>
      <Footer />
    </div>
  );
};

const StatCard = ({ Icon, label, value, accent }) => (
  <div
    data-testid={`admin-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    className={
      accent
        ? "p-4 rounded-lg overflow-hidden bg-vs-gold text-white border border-vs-gold"
        : "card p-4"
    }
  >
    <Icon size={18} className={accent ? "text-white" : "text-vs-gold"} />
    <div className={`text-xs uppercase tracking-wider mt-2 ${accent ? "text-white/85" : "text-vs-text-secondary"}`}>
      {label}
    </div>
    <div className={`font-display text-3xl font-bold mt-1 ${accent ? "text-white" : "text-vs-text-primary"}`}>
      {value}
    </div>
  </div>
);

const PendingQueue = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api.get("/admin/properties/pending").then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  };
  useEffect(() => reload(), []);

  const approve = async (id) => {
    try {
      await api.put(`/admin/properties/${id}/verify`, { notes: "" });
      toast.success("Listing published");
      reload();
    } catch {
      toast.error("Could not approve");
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    try {
      await api.put(`/admin/properties/${id}/reject`, { reason });
      toast.success("Listing rejected");
      reload();
    } catch {
      toast.error("Could not reject");
    }
  };

  if (loading) return <Spin />;
  if (!items.length)
    return <div className="text-vs-text-secondary">Nothing in the queue — you're all caught up.</div>;

  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4" data-testid={`pending-${p.id}`}>
          <div className="w-full md:w-28 h-24 md:h-20 rounded overflow-hidden bg-vs-bg">
            {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip">{CATEGORY_LABEL[p.category]}</span>
              <span className="text-xs text-vs-text-secondary">By {p.listed_by_name}</span>
            </div>
            <div className="font-display font-semibold text-vs-text-primary mt-1.5">{p.title}</div>
            <div className="text-xs text-vs-text-secondary mt-1">
              {INR(p.price)} · {formatArea(p.area)} · {p.location?.city || "—"}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve(p.id)} className="btn-primary !py-2" data-testid={`approve-${p.id}`}>
              <CheckCircle2 size={14} /> Approve
            </button>
            <button onClick={() => reject(p.id)} className="btn-outline !py-2 !text-[#DC2626]" data-testid={`reject-${p.id}`}>
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const AllProperties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/admin/properties").then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spin />;
  return (
    <div className="overflow-x-auto card">
      <table className="w-full text-sm">
        <thead className="bg-vs-bg text-vs-text-secondary">
          <tr>
            <Th>Title</Th><Th>Category</Th><Th>City</Th><Th>Price</Th><Th>Status</Th><Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-vs-border">
              <Td><div className="font-display font-medium text-vs-text-primary">{p.title}</div><div className="text-xs text-vs-text-secondary">{p.listed_by_name}</div></Td>
              <Td>{CATEGORY_LABEL[p.category]}</Td>
              <Td>{p.location?.city || "—"}</Td>
              <Td>{INR(p.price)}</Td>
              <Td><span className="chip">{p.status}</span></Td>
              <Td>{new Date(p.created_at).toLocaleDateString("en-IN")}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UsersList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api.get("/admin/users").then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  };
  useEffect(() => reload(), []);
  const toggle = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/status`, { is_active: !u.is_active });
      toast.success(`User ${u.is_active ? "deactivated" : "activated"}`);
      reload();
    } catch {
      toast.error("Could not update");
    }
  };
  if (loading) return <Spin />;
  return (
    <div className="overflow-x-auto card">
      <table className="w-full text-sm">
        <thead className="bg-vs-bg text-vs-text-secondary">
          <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th></Th></tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-vs-border">
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td><span className="chip">{u.role}</span></Td>
              <Td>{u.is_active ? <span className="text-emerald-700">Active</span> : <span className="text-red-700">Disabled</span>}</Td>
              <Td>{new Date(u.created_at).toLocaleDateString("en-IN")}</Td>
              <Td>
                {u.role !== "admin" && (
                  <button onClick={() => toggle(u)} className="text-xs text-vs-gold hover:underline">
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EnquiriesList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/admin/enquiries").then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spin />;
  return (
    <div className="space-y-3">
      {items.map((e) => (
        <div key={e.id} className="card p-5">
          <div className="font-display font-semibold text-vs-text-primary">{e.property_title}</div>
          <div className="text-sm text-vs-text-secondary mt-1">{e.name} · {e.email} · {e.phone}</div>
          <div className="text-sm text-vs-text-primary mt-2">{e.message || "(no message)"}</div>
          <div className="text-xs text-vs-text-secondary mt-1">
            Prefers {e.contact_preference} · {new Date(e.created_at).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="text-vs-text-secondary">No enquiries yet.</div>}
    </div>
  );
};

const ServicesList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/admin/service-requests").then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spin />;
  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div key={s.id} className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-display font-semibold text-vs-text-primary flex items-center gap-2">
              <FileCheck size={16} className="text-vs-gold" />
              {s.request_type.replace(/_/g, " ")}
            </div>
            <span className="chip">{s.status}</span>
          </div>
          <div className="text-sm text-vs-text-secondary mt-2">{s.name} · {s.email} · {s.phone}</div>
          <div className="text-sm mt-2 text-vs-text-primary">{s.description || "—"}</div>
        </div>
      ))}
      {items.length === 0 && <div className="text-vs-text-secondary">No service requests yet.</div>}
    </div>
  );
};

const ACCENT_PRESETS = ["#78AFCF", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#171717"];

const SiteSettings = () => {
  const [form, setForm] = useState({
    accent_color: "#78AFCF",
    image_url: "",
    headline: "",
    sub_headline: "",
    cta_text: "",
    cta_link: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/hero")
      .then(({ data }) =>
        setForm((f) => ({
          ...f,
          accent_color: data.accent_color || "#78AFCF",
          image_url: data.image_url || "",
          headline: data.headline || "",
          sub_headline: data.sub_headline || "",
          cta_text: data.cta_text || "",
          cta_link: data.cta_link || "",
        }))
      )
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const previewColor = (hex) => {
    setForm((f) => ({ ...f, accent_color: hex }));
    applyAccentColor(hex);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/hero", form);
      applyAccentColor(form.accent_color);
      toast.success("Site settings updated");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <form onSubmit={save} className="grid lg:grid-cols-12 gap-6" data-testid="site-settings-form">
      <div className="lg:col-span-7 space-y-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-vs-text-primary flex items-center gap-2">
            <Palette size={16} className="text-vs-gold" /> Accent Color
          </h3>
          <p className="text-xs text-vs-text-secondary mt-1">
            Applied instantly across buttons, links and highlights site-wide.
          </p>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {ACCENT_PRESETS.map((hex) => (
              <button
                type="button"
                key={hex}
                onClick={() => previewColor(hex)}
                data-testid={`accent-preset-${hex}`}
                className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${
                  form.accent_color.toLowerCase() === hex.toLowerCase() ? "border-vs-text-primary" : "border-transparent"
                }`}
                style={{ backgroundColor: hex }}
                aria-label={hex}
              />
            ))}
            <label className="flex items-center gap-2 ml-2">
              <input
                type="color"
                value={form.accent_color}
                onChange={(e) => previewColor(e.target.value)}
                className="w-9 h-9 rounded-full border border-vs-border cursor-pointer bg-transparent"
                data-testid="accent-color-picker"
              />
              <input
                type="text"
                value={form.accent_color}
                onChange={(e) => previewColor(e.target.value)}
                className="input-field !py-2 !w-28 !text-sm font-mono"
                data-testid="accent-color-hex"
              />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-vs-text-primary">Hero Image</h3>
          <p className="text-xs text-vs-text-secondary mt-1">
            Shown behind the headline on the homepage.
          </p>
          <input
            className="input-field mt-4"
            placeholder="https://…"
            value={form.image_url}
            onChange={set("image_url")}
            data-testid="hero-image-url"
          />
          {form.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden border border-vs-border aspect-[16/7]">
              <img src={form.image_url} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="card p-6 space-y-3 lg:sticky lg:top-24">
          <h3 className="font-display font-semibold text-vs-text-primary">Hero Copy</h3>
          <div>
            <label className="label">Headline</label>
            <input className="input-field" value={form.headline} onChange={set("headline")} data-testid="hero-headline-input" />
          </div>
          <div>
            <label className="label">Sub-headline</label>
            <textarea className="input-field min-h-[70px]" value={form.sub_headline} onChange={set("sub_headline")} data-testid="hero-subheadline-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">CTA text</label>
              <input className="input-field" value={form.cta_text} onChange={set("cta_text")} data-testid="hero-cta-text" />
            </div>
            <div>
              <label className="label">CTA link</label>
              <input className="input-field" value={form.cta_link} onChange={set("cta_link")} data-testid="hero-cta-link" />
            </div>
          </div>
          <button disabled={saving} type="submit" className="btn-primary w-full justify-center mt-2" data-testid="save-site-settings">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Settings
          </button>
        </div>
      </div>
    </form>
  );
};

const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 align-top">{children}</td>;
const Spin = () => <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-vs-gold" /></div>;

export default AdminDashboard;
