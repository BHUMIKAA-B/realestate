import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  HeadphonesIcon,
  Ban,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileCheck,
  ScrollText,
  Compass,
  Building2,
  ClipboardCheck,
  Landmark,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AISearchBar from "@/components/AISearchBar";
import PropertyCard from "@/components/PropertyCard";
import NewlyLaunched from "@/components/NewlyLaunched";
import ActiveProjects from "@/components/ActiveProjects";
import SectorShowcase from "@/components/SectorShowcase";
import ValuationModal from "@/components/ValuationModal";
import api from "@/api/client";
import { PROPERTY_CATEGORIES } from "@/utils/format";

const DEFAULT_HERO = {
  image_url:
    "https://images.unsplash.com/photo-1748063578185-3d68121b11ff?w=1920&auto=format&fit=crop&q=80",
  headline: "Find Your Dream Property. Zero Brokerage.",
  sub_headline:
    "Buy property, pay no brokerage. We connect you directly to verified sellers — every listing vetted by our team.",
  cta_text: "Explore Properties",
  cta_link: "/properties",
};

const DOCUMENT_SERVICES = [
  { v: "pre_registration", l: "Pre-Registration Assistance", body: "End-to-end help before sub-registrar: stamp duty, drafting, EC, encumbrance.", Icon: ScrollText },
  { v: "khata_assistance", l: "Khatha Assistance", body: "BBMP / GP Khata transfers, bifurcation, A-Khata conversion.", Icon: ClipboardCheck },
  { v: "property_valuation", l: "Property Valuation", body: "Market-honest valuation reports — for loans, sale, ITR or transfer.", Icon: FileCheck },
  { v: "land_approval", l: "Land Approval", body: "DTCP, BMRDA, BIAAPA layout approvals and revenue conversions.", Icon: Landmark },
  { v: "plan_approval", l: "Plan Approval", body: "Sanctioned plans, occupancy certificate, deviation regularisation.", Icon: Compass },
  { v: "property_conversion", l: "Property Conversion", body: "Agriculture → residential / commercial DC conversion.", Icon: Building2 },
  { v: "government_approval", l: "Government Approval", body: "NoCs, fire, environmental and statutory clearances.", Icon: ShieldCheck },
];

const Landing = () => {
  const [featured, setFeatured] = useState([]);
  const [howTab, setHowTab] = useState("buyer");
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [valuationOpen, setValuationOpen] = useState(false);

  useEffect(() => {
    api.get("/properties/featured").then(({ data }) => setFeatured(data || [])).catch(() => {});
    api.get("/hero").then(({ data }) => setHero({ ...DEFAULT_HERO, ...data })).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />

      {/* ===== HERO (backend-driven) ===== */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        data-testid="hero-section"
      >
        <div className="absolute inset-0">
          {hero.video_url ? (
            <video
              autoPlay muted loop playsInline poster={hero.image_url}
              className="w-full h-full object-cover"
            >
              <source src={hero.video_url} type="video/mp4" />
            </video>
          ) : (
            <img src={hero.image_url} alt="VisitSarva" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2340]/85 via-[#0F2340]/65 to-[#0F2340]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="eyebrow text-[#7ec4b8] mb-5">
              Zero Brokerage · Verified Listings · Direct Contact
            </div>
            <h1 className="font-display font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight" data-testid="hero-headline">
              {hero.headline.split(".")[0]}.
              <br />
              <span className="text-[#7ec4b8]">{hero.headline.split(".").slice(1).join(".").trim() || "Zero Brokerage."}</span>
            </h1>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed max-w-2xl">
              {hero.sub_headline}
            </p>

            <div className="mt-8 max-w-2xl">
              <AISearchBar />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 items-center">
              {PROPERTY_CATEGORIES.slice(0, 5).map((c) => (
                <Link
                  key={c.value}
                  to={c.value === "construction_interior" ? "/construction" : `/properties?category=${c.value}`}
                  data-testid={`hero-pill-${c.value}`}
                  className="chip bg-white/95 hover:bg-white border-white text-[#0F2340]"
                >
                  {c.label}
                </Link>
              ))}
              <Link to="/properties" className="chip bg-[#0D7A6B] text-white border-[#0D7A6B]">
                All Categories <ArrowRight size={12} />
              </Link>
            </div>

            {/* ===== Valuation lead-magnet ===== */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg"
            >
              <Sparkles size={16} className="text-[#7ec4b8]" />
              <div className="text-sm text-white/90">
                <strong className="text-white">Selling or curious?</strong> Get a free property valuation in 24 hours.
              </div>
              <button
                onClick={() => setValuationOpen(true)}
                data-testid="open-valuation"
                className="text-sm bg-[#7ec4b8] hover:bg-[#a3d7ce] text-[#0F2340] font-medium px-4 py-2 rounded transition-colors"
              >
                Get free valuation
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ValuationModal open={valuationOpen} onClose={() => setValuationOpen(false)} />

      {/* ===== NEWLY LAUNCHED PROJECTS ===== */}
      <NewlyLaunched />

      {/* ===== ACTIVE PROJECTS (70/30 magazine) ===== */}
      <ActiveProjects />

      {/* ===== FEATURED PROPERTIES ===== */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20 bg-[#fafaf7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
              <div>
                <div className="eyebrow mb-2">Featured Listings</div>
                <h2 className="section-title">Hand-picked properties.</h2>
              </div>
              <Link to="/properties" className="text-sm text-[#0D7A6B] hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 6).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== BUYER / SELLER CARDS ===== */}
      <section className="py-20 md:py-24 bg-white border-y border-[#e6e4dd]" data-testid="role-cta-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="eyebrow mb-3">Get Started</div>
            <h2 className="section-title">Buying or selling? Either way — zero brokerage for buyers.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <RoleCard role="buyer" title="Are you a Buyer?" copy="Browse verified properties, contact sellers directly through our team. No brokerage, ever." points={["Verified listings only", "Direct team contact", "AI-powered smart search"]} />
            <RoleCard role="seller" title="Are you a Seller?" copy="List your property for free. Our team verifies and publishes it within 48 hours." points={["Free listing", "AI-assisted form filling", "Internal verification before going live"]} variant="navy" />
          </div>
        </div>
      </section>

      {/* ===== MOTIVE ===== */}
      <section id="motive" className="py-24 md:py-32 bg-[#0F2340] text-white relative overflow-hidden" data-testid="motive-section">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="eyebrow text-[#7ec4b8] mb-5">Our Motive</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            "Buy property,
            <br />
            <span className="text-[#7ec4b8]">pay no brokerage."</span>
          </h2>
          <p className="mt-8 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We believe buying a home should be simple, transparent, and fair. No middlemen. No hidden fees. Just you, the seller, and us.
          </p>
          <div className="mt-14 grid sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <Pillar Icon={Ban} title="Zero Brokerage">Buyers pay nothing. We charge no commission on transactions.</Pillar>
            <Pillar Icon={ShieldCheck} title="Verified Listings Only">Every property is internally reviewed and approved before going live.</Pillar>
            <Pillar Icon={HeadphonesIcon} title="Direct Team Contact">Reach a human at VisitSarva — not a call centre, not a broker.</Pillar>
          </div>
        </div>
      </section>

      {/* ===== 8-SECTOR SHOWCASE GRID ===== */}
      <SectorShowcase />

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-24 bg-white border-y border-[#e6e4dd]" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="eyebrow mb-3">How It Works</div>
            <h2 className="section-title">Four steps from sign-up to keys.</h2>
          </div>
          <div className="flex justify-center gap-2 mb-12">
            <button data-testid="how-tab-buyer" onClick={() => setHowTab("buyer")} className={`chip ${howTab === "buyer" ? "chip-active" : ""}`}>For Buyers</button>
            <button data-testid="how-tab-seller" onClick={() => setHowTab("seller")} className={`chip ${howTab === "seller" ? "chip-active" : ""}`}>For Sellers</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {(howTab === "buyer"
              ? [
                  ["Sign Up", "Create a free buyer account in 30 seconds."],
                  ["Search & Browse", "Use AI smart search or filters to find your match."],
                  ["Save & Enquire", "Shortlist favourites and send an enquiry."],
                  ["Our Team Connects You", "We coordinate directly between you and the seller."],
                ]
              : [
                  ["Sign Up", "Create a free seller account."],
                  ["List Your Property", "Our AI assistant fills the form from your description."],
                  ["Team Verifies", "We audit the listing within 48 hours."],
                  ["Property Goes Live", "Verified listings appear to buyers across India."],
                ]
            ).map(([title, body], i) => (
              <div key={title} className="relative">
                <div className="w-10 h-10 rounded-full bg-[#0D7A6B] text-white flex items-center justify-center font-display font-semibold">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display font-semibold text-[#0F2340]">{title}</h3>
                <p className="mt-2 text-sm text-[#5b6371] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALL-IN-ONE DOCUMENTS (redesigned with icons + descriptions) ===== */}
      <section id="services" className="py-20 md:py-24" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">Property Services</div>
            <h2 className="section-title">All-in-One Documents.</h2>
            <p className="mt-4 text-[#5b6371]">
              Khata, valuation, conversions, approvals — handled end-to-end by our specialist team.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOCUMENT_SERVICES.map((s) => (
              <div key={s.v} className="card p-6 flex flex-col hover:border-[#0D7A6B] transition-colors" data-testid={`service-card-${s.v}`}>
                <div className="w-11 h-11 rounded-lg bg-[#0D7A6B]/10 text-[#0D7A6B] flex items-center justify-center">
                  <s.Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-display font-semibold text-[#0F2340] text-lg">{s.l}</h3>
                <p className="mt-2 text-sm text-[#5b6371] flex-1 leading-relaxed">{s.body}</p>
                <Link to="/services" className="mt-5 text-sm text-[#0D7A6B] hover:underline flex items-center gap-1">
                  Request Service <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 bg-[#0F2340] text-white" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            [1240, "Properties Listed"],
            [18, "Cities Covered"],
            [320, "Verified Sellers"],
            [980, "Happy Buyers"],
          ].map(([n, label]) => (
            <div key={label} className="text-center md:text-left">
              <div className="font-display text-4xl md:text-5xl font-bold text-[#7ec4b8]">
                {n.toLocaleString("en-IN")}+
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">Customer Stories</div>
            <h2 className="section-title">From the people who trusted us.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Arjun Mehra", role: "Buyer, Bangalore", text: "Found my 3 BHK in Whitefield in two weeks — and paid zero brokerage. The team handled everything." },
              { name: "Kavya Iyer", role: "Seller, Hyderabad", text: "The AI listing form did half my work. Property was live in 3 days, sold in 6 weeks." },
              { name: "Rohit Bhandari", role: "Buyer, Pune", text: "What I loved most: a real person from VisitSarva calling me back, not a broker chasing commission." },
            ].map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-0.5 text-[#0D7A6B]">
                  {Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="mt-4 text-[#1a1f2e] leading-relaxed">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-[#e6e4dd]">
                  <div className="font-display font-semibold text-[#0F2340]">{t.name}</div>
                  <div className="text-xs text-[#5b6371]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const RoleCard = ({ role, title, copy, points, variant = "teal" }) => {
  const isNavy = variant === "navy";
  return (
    <div data-testid={`role-card-${role}`} className={`relative p-8 md:p-10 rounded-xl border ${isNavy ? "bg-[#0F2340] text-white border-[#0F2340]" : "bg-white border-[#e6e4dd]"}`}>
      <h3 className={`font-display text-2xl md:text-3xl font-bold ${isNavy ? "text-white" : "text-[#0F2340]"}`}>{title}</h3>
      <p className={`mt-3 text-sm md:text-base leading-relaxed ${isNavy ? "text-white/80" : "text-[#5b6371]"}`}>{copy}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className={isNavy ? "text-[#7ec4b8]" : "text-[#0D7A6B]"} />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link to={`/register?role=${role}`} data-testid={`role-${role}-signup`} className={isNavy ? "btn-primary bg-[#7ec4b8] !text-[#0F2340] hover:bg-[#9ed5cb]" : "btn-primary"}>
          Sign Up as {role === "buyer" ? "Buyer" : "Seller"}
        </Link>
        <Link to="/login" data-testid={`role-${role}-login`} className={isNavy ? "btn-outline !bg-transparent !text-white !border-white/40 hover:!border-white" : "btn-outline"}>
          Login
        </Link>
      </div>
    </div>
  );
};

const Pillar = ({ Icon, title, children }) => (
  <div>
    <Icon size={28} className="text-[#7ec4b8]" strokeWidth={1.5} />
    <h4 className="mt-4 font-display text-xl font-semibold">{title}</h4>
    <p className="mt-2 text-sm text-white/75 leading-relaxed">{children}</p>
  </div>
);

export default Landing;
