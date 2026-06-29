import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/api/client";
import { useAuthStore } from "@/store/authStore";

const Register = () => {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "seller" ? "seller" : "buyer";
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, role });
      setSession(data);
      toast.success(`Welcome to VisitSarva, ${data.user.name.split(" ")[0]}!`);
      navigate(role === "seller" ? "/seller/dashboard" : "/home", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="card p-8 md:p-10">
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl font-bold text-[#0F2340]">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-[#5b6371]">
                Free forever for buyers. Free listings for sellers.
              </p>
            </div>

            <div className="flex p-1 bg-[#fafaf7] rounded-md border border-[#e6e4dd] mb-6">
              {["buyer", "seller"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  data-testid={`register-role-${r}`}
                  className={`flex-1 py-2 text-sm rounded transition-colors ${
                    role === r ? "bg-white text-[#0D7A6B] shadow-sm font-medium" : "text-[#5b6371]"
                  }`}
                >
                  I'm a {r === "buyer" ? "Buyer" : "Seller"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4" data-testid="register-form">
              <div>
                <label className="label">Full name</label>
                <input className="input-field" required value={form.name} onChange={set("name")} placeholder="Your name" data-testid="register-name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" data-testid="register-email" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" required value={form.phone} onChange={set("phone")} placeholder="+91 98xx xxx xxx" data-testid="register-phone" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input-field pr-10"
                    type={show ? "text" : "password"}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min 6 characters"
                    data-testid="register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b6371]"
                    aria-label="Toggle password visibility"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit"
                className="btn-primary w-full justify-center"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                Create account
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#5b6371]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0D7A6B] font-medium hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
