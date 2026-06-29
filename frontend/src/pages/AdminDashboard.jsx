import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, XCircle, Users, Building, AlertCircle, Inbox, FileCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/api/client";
import { INR, formatArea, CATEGORY_LABEL } from "@/utils/format";

const TABS = [
  { id: "pending", label: "Pending verification" },
  { id: "all_props", label: "All properties" },
  { id: "users", label: "Users" },
  { id: "enquiries", label: "Enquiries" },
  { id: "services", label: "Service requests" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    api.get("/admin/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />
      <section className="bg-white border-b border-[#e6e4dd]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F2340]" data-testid="admin-title">
            Admin Console
          </h1>
          <p className="text-sm text-[#5b6371] mt-1">
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

        <div className="flex flex-wrap gap-2 border-b border-[#e6e4dd] mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#0D7A6B] text-[#0D7A6B] font-medium"
                  : "border-transparent text-[#5b6371] hover:text-[#0F2340]"
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
        ? "p-4 rounded-lg overflow-hidden bg-[#0D7A6B] text-white border border-[#0D7A6B]"
        : "card p-4"
    }
  >
    <Icon size={18} className={accent ? "text-white" : "text-[#0D7A6B]"} />
    <div className={`text-xs uppercase tracking-wider mt-2 ${accent ? "text-white/85" : "text-[#5b6371]"}`}>
      {label}
    </div>
    <div className={`font-display text-3xl font-bold mt-1 ${accent ? "text-white" : "text-[#0F2340]"}`}>
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
    return <div className="text-[#5b6371]">Nothing in the queue — you're all caught up.</div>;

  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4" data-testid={`pending-${p.id}`}>
          <div className="w-full md:w-28 h-24 md:h-20 rounded overflow-hidden bg-[#fafaf7]">
            {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip">{CATEGORY_LABEL[p.category]}</span>
              <span className="text-xs text-[#5b6371]">By {p.listed_by_name}</span>
            </div>
            <div className="font-display font-semibold text-[#0F2340] mt-1.5">{p.title}</div>
            <div className="text-xs text-[#5b6371] mt-1">
              {INR(p.price)} · {formatArea(p.area)} · {p.location?.city || "—"}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve(p.id)} className="btn-primary !py-2" data-testid={`approve-${p.id}`}>
              <CheckCircle2 size={14} /> Approve
            </button>
            <button onClick={() => reject(p.id)} className="btn-outline !py-2 !text-[#c0392b]" data-testid={`reject-${p.id}`}>
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
        <thead className="bg-[#fafaf7] text-[#5b6371]">
          <tr>
            <Th>Title</Th><Th>Category</Th><Th>City</Th><Th>Price</Th><Th>Status</Th><Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-[#e6e4dd]">
              <Td><div className="font-display font-medium text-[#0F2340]">{p.title}</div><div className="text-xs text-[#5b6371]">{p.listed_by_name}</div></Td>
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
        <thead className="bg-[#fafaf7] text-[#5b6371]">
          <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th></Th></tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-[#e6e4dd]">
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td><span className="chip">{u.role}</span></Td>
              <Td>{u.is_active ? <span className="text-emerald-700">Active</span> : <span className="text-red-700">Disabled</span>}</Td>
              <Td>{new Date(u.created_at).toLocaleDateString("en-IN")}</Td>
              <Td>
                {u.role !== "admin" && (
                  <button onClick={() => toggle(u)} className="text-xs text-[#0D7A6B] hover:underline">
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
          <div className="font-display font-semibold text-[#0F2340]">{e.property_title}</div>
          <div className="text-sm text-[#5b6371] mt-1">{e.name} · {e.email} · {e.phone}</div>
          <div className="text-sm text-[#1a1f2e] mt-2">{e.message || "(no message)"}</div>
          <div className="text-xs text-[#5b6371] mt-1">
            Prefers {e.contact_preference} · {new Date(e.created_at).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="text-[#5b6371]">No enquiries yet.</div>}
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
            <div className="font-display font-semibold text-[#0F2340] flex items-center gap-2">
              <FileCheck size={16} className="text-[#0D7A6B]" />
              {s.request_type.replace(/_/g, " ")}
            </div>
            <span className="chip">{s.status}</span>
          </div>
          <div className="text-sm text-[#5b6371] mt-2">{s.name} · {s.email} · {s.phone}</div>
          <div className="text-sm mt-2 text-[#1a1f2e]">{s.description || "—"}</div>
        </div>
      ))}
      {items.length === 0 && <div className="text-[#5b6371]">No service requests yet.</div>}
    </div>
  );
};

const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 align-top">{children}</td>;
const Spin = () => <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#0D7A6B]" /></div>;

export default AdminDashboard;
