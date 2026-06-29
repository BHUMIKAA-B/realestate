import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bookmark,
  Inbox,
  ArrowRight,
  Loader2,
  Calculator,
  Map,
  BadgeCheck,
  FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AISearchBar from "@/components/AISearchBar";
import PropertyCard from "@/components/PropertyCard";
import EMICalculator from "@/components/EMICalculator";
import api from "@/api/client";
import { useAuthStore } from "@/store/authStore";

const BuyerHome = () => {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emiOpen, setEmiOpen] = useState(false);

  useEffect(() => {
    api
      .get("/properties/featured")
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />

      {/* Welcome header */}
      <section className="py-10 md:py-14 bg-white border-b border-[#e6e4dd]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1
            className="font-display text-2xl md:text-3xl font-bold text-[#0F2340]"
            data-testid="buyer-greeting"
          >
            Welcome back, {user?.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-1 text-[#5b6371]">
            Tell us what you're looking for and our team will help.
          </p>
          <div className="mt-5 max-w-3xl">
            <AISearchBar compact />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/properties" className="chip">
              Browse all <ArrowRight size={12} />
            </Link>
            <Link to="/saved" className="chip">
              <Bookmark size={12} /> Saved
            </Link>
            <Link to="/enquiries" className="chip">
              <Inbox size={12} /> My Enquiries
            </Link>
            <Link to="/services" className="chip">
              Document Services
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BUYER TOOLS ===== */}
      <section className="py-10 border-b border-[#e6e4dd] bg-[#fafaf7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="eyebrow mb-1">Buyer Tools</div>
          <h2 className="font-display text-xl font-semibold text-[#0F2340] mb-6">
            Everything you need to make a smart decision
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Verified Properties */}
            <Link
              to="/properties?verified_only=1"
              data-testid="tool-verified"
              className="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-[#e6e4dd] hover:border-[#0D7A6B] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0D7A6B]/10 flex items-center justify-center group-hover:bg-[#0D7A6B]/20 transition-colors">
                <BadgeCheck size={20} className="text-[#0D7A6B]" />
              </div>
              <div>
                <div className="font-display font-semibold text-[#0F2340] text-sm">
                  Verified Properties
                </div>
                <div className="text-xs text-[#5b6371] mt-1 leading-relaxed">
                  Browse listings that have been internally verified by our team.
                </div>
              </div>
              <div className="mt-auto text-xs text-[#0D7A6B] font-medium flex items-center gap-1">
                Browse now <ArrowRight size={12} />
              </div>
            </Link>

            {/* Map View */}
            <Link
              to="/properties?view=map"
              data-testid="tool-map"
              className="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-[#e6e4dd] hover:border-[#0D7A6B] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0F2340]/10 flex items-center justify-center group-hover:bg-[#0F2340]/20 transition-colors">
                <Map size={20} className="text-[#0F2340]" />
              </div>
              <div>
                <div className="font-display font-semibold text-[#0F2340] text-sm">
                  Map View
                </div>
                <div className="text-xs text-[#5b6371] mt-1 leading-relaxed">
                  Explore properties on an interactive map to find your ideal location.
                </div>
              </div>
              <div className="mt-auto text-xs text-[#0D7A6B] font-medium flex items-center gap-1">
                Open map <ArrowRight size={12} />
              </div>
            </Link>

            {/* EMI Calculator */}
            <button
              onClick={() => setEmiOpen(true)}
              data-testid="tool-emi"
              className="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-[#e6e4dd] hover:border-[#0D7A6B] hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#c89b5f]/15 flex items-center justify-center group-hover:bg-[#c89b5f]/25 transition-colors">
                <Calculator size={20} className="text-[#c89b5f]" />
              </div>
              <div>
                <div className="font-display font-semibold text-[#0F2340] text-sm">
                  EMI Calculator
                </div>
                <div className="text-xs text-[#5b6371] mt-1 leading-relaxed">
                  Calculate monthly instalments based on loan amount, rate &amp; tenure.
                </div>
              </div>
              <div className="mt-auto text-xs text-[#0D7A6B] font-medium flex items-center gap-1">
                Calculate now <ArrowRight size={12} />
              </div>
            </button>

            {/* Document Services */}
            <Link
              to="/services"
              data-testid="tool-services"
              className="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-[#e6e4dd] hover:border-[#0D7A6B] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0D7A6B]/10 flex items-center justify-center group-hover:bg-[#0D7A6B]/20 transition-colors">
                <FileText size={20} className="text-[#0D7A6B]" />
              </div>
              <div>
                <div className="font-display font-semibold text-[#0F2340] text-sm">
                  Document Services
                </div>
                <div className="text-xs text-[#5b6371] mt-1 leading-relaxed">
                  Registration, Khata, valuation &amp; government approvals — all in one.
                </div>
              </div>
              <div className="mt-auto text-xs text-[#0D7A6B] font-medium flex items-center gap-1">
                Explore <ArrowRight size={12} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="eyebrow mb-1">Featured</div>
              <h2 className="font-display text-2xl font-semibold text-[#0F2340]">
                Recommended for you
              </h2>
            </div>
            <Link
              to="/properties"
              className="text-sm text-[#0D7A6B] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-[#0D7A6B]" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-[#5b6371]">No properties yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* EMI Calculator modal */}
      <EMICalculator isOpen={emiOpen} onClose={() => setEmiOpen(false)} />
    </div>
  );
};

export default BuyerHome;
