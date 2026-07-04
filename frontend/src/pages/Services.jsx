import React, { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, FileCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/api/client";
import { SERVICE_TYPES } from "@/utils/format";

const Services = () => {
  const [form, setForm] = useState({
    request_type: "pre_registration",
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/services", form);
      toast.success("Request submitted. Our specialist team will reach out.");
      setForm({
        request_type: "pre_registration",
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="eyebrow mb-2">Property Services</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#171717]">
            All-in-One Documents.
          </h1>
          <p className="mt-3 text-[#6B7280] max-w-2xl">
            Khata, valuation, conversions, approvals — handled end-to-end by our specialist team.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICE_TYPES.map((s) => (
              <div
                key={s.value}
                className={`card p-5 cursor-pointer transition-all ${
                  form.request_type === s.value
                    ? "border-[#78AFCF] ring-2 ring-[#78AFCF]/20"
                    : ""
                }`}
                onClick={() => setForm((f) => ({ ...f, request_type: s.value }))}
                data-testid={`service-pick-${s.value}`}
              >
                <FileCheck size={18} className="text-[#78AFCF]" />
                <h3 className="mt-3 font-display font-semibold text-[#171717]">
                  {s.label}
                </h3>
                <p className="mt-1.5 text-xs text-[#6B7280]">
                  Specialist team · end-to-end paperwork
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-5 card p-6 md:p-8 h-fit lg:sticky lg:top-24" data-testid="service-request-form">
          <h3 className="font-display text-xl font-semibold text-[#171717]">
            Request a service
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            We'll review and call you within one business day.
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <label className="label">Service type</label>
              <select className="input-field" value={form.request_type} onChange={set("request_type")} data-testid="service-type">
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <input className="input-field" required placeholder="Your name" value={form.name} onChange={set("name")} data-testid="service-name" />
            <input className="input-field" type="email" required placeholder="Email" value={form.email} onChange={set("email")} data-testid="service-email" />
            <input className="input-field" required placeholder="Phone" value={form.phone} onChange={set("phone")} data-testid="service-phone" />
            <input className="input-field" placeholder="Property address (optional)" value={form.address} onChange={set("address")} />
            <textarea className="input-field min-h-[80px]" placeholder="Describe your requirement" value={form.description} onChange={set("description")} data-testid="service-description" />
          </div>
          <button disabled={loading} type="submit" className="btn-primary w-full mt-5 justify-center" data-testid="service-submit">
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Submit Request
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
};

export default Services;
