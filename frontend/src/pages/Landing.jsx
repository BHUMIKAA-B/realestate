import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Headphones as HeadphonesIcon, Ban, ArrowRight, CircleCheck as CheckCircle2, Sparkles, FileCheck, ScrollText, Compass, Building2, ClipboardCheck, Landmark, Star } from "lucide-react";

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
  { v: "land_approval", l: "Land Approval", body: "DTCT, BMRDA, BIAAPA layout approvals and revenue conversions.", Icon: Landmark },
  { v: "plan_approval", l: "Plan Approval", body: "Sanctioned plans, occupancy certificate, deviation regularisation.", Icon: Compass },
  { v: "property_conversion", l: "Property Conversion", body: "Agriculture → residential / commercial DC conversion.", Icon: Building2 },
  { v: "government_approval", l: "Government Approval", body: "NoCs, fire, environmental and statutory clearances.", Icon: ShieldCheck },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

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
    <div className="min-h-screen bg-vs-bg">
      <Navbar />

      {/* ===== HERO ===== */}
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0908]/95 via-[#0A0908]/70 to-[#0A0908]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-[80rem] mx-auto px-6 lg:px-12 py-20 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="eyebrow text-vs-gold mb-6">
              Zero Brokerage · Verified Listings · Direct Contact
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display font-medium text-vs-text-primary text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight"
              data-testid="hero-headline"
            >
              {hero.headline.split(".")[0]}.
              <br />
              <span className="text-vs-gold">{hero.headline.split(".").slice(1).join(".").trim() || "Zero Brokerage."}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-vs-text-secondary text-base md:text-lg leading-relaxed max-w-2xl">
              {hero.sub_headline}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 max-w-2xl">
              <AISearchBar />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2.5 items-center">
              {PROPERTY_CATEGORIES.slice(0, 5).map((c) => (
                <Link
                  key={c.value}
                  to={c.value === "construction_interior" ? "/construction" : `/properties?category=${c.value}`}
                  data-testid={`hero-pill-${c.value}`}
                  className="chip bg-vs-surface border-vs-border text-vs-text-secondary hover:border-vs-gold hover:text-vs-gold transition-all duration-300"
                >
                  {c.label}
                </Link>
              ))}
              <Link to="/properties" className="chip bg-vs-gold text-vs-bg border-vs-gold hover:bg-vs-primary-hover transition-all duration-300">
                All Categories <ArrowRight size={12} className="ml-1" />
              </Link>
            </motion.div>

            {/* Valuation lead-magnet */}
            <motion.div
              variants={fadeUp}
              className="mt-10 inline-flex items-center gap-4 px-6 py-4 bg-vs-surface/80 backdrop-blur-xl border border-vs-border rounded-lg"
            >
              <Sparkles size={18} className="text-vs-gold" />
              <div className="text-sm text-vs-text-secondary">
                <span className="text-vs-text-primary font-medium">Selling or curious?</span> Get a free property valuation in 24 hours.
              </div>
              <button
                onClick={() => setValuationOpen(true)}
                data-testid="open-valuation"
                className="text-sm bg-vs-gold hover:bg-vs-primary-hover text-vs-bg font-medium px-5 py-2.5 rounded transition-all duration-300"
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

      {/* ===== ACTIVE PROJECTS ===== */}
      <ActiveProjects />

      {/* ===== FEATURED PROPERTIES ===== */}
      {featured.length > 0 && (
        <section className="py-20 md:py-24 bg-vs-bg">
          <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="flex items-end justify-between gap-4 flex-wrap mb-10"
            >
              <motion.div variants={fadeUp}>
                <div className="eyebrow text-vs-gold mb-2">Featured Listings</div>
                <h2 className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
                  Hand-picked properties.
                </h2>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link to="/properties" className="text-sm text-vs-text-secondary hover:text-vs-gold flex items-center gap-2 transition-colors duration-300 group">
                  View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featured.slice(0, 6).map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <PropertyCard property={p} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== BUYER / SELLER CARDS ===== */}
      <section className="py-24 md:py-28 bg-vs-surface border-y border-vs-border" data-testid="role-cta-section">
        <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="eyebrow text-vs-gold mb-4">Get Started</div>
            <h2 className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
              Buying or selling? Either way — zero brokerage for buyers.
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeUp}>
              <RoleCard
                role="buyer"
                title="Are you a Buyer?"
                copy="Browse verified properties, contact sellers directly through our team. No brokerage, ever."
                points={["Verified listings only", "Direct team contact", "AI-powered smart search"]}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <RoleCard
                role="seller"
                title="Are you a Seller?"
                copy="List your property for free. Our team verifies and publishes it within 48 hours."
                points={["Free listing", "AI-assisted form filling", "Internal verification before going live"]}
                variant="gold"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== MOTIVE ===== */}
      <section id="motive" className="py-28 md:py-36 bg-vs-bg text-vs-text-primary relative overflow-hidden" data-testid="motive-section">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #C89B5F 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-vs-gold/5 rounded-full blur-3xl" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center"
        >
          <motion.div variants={fadeUp} className="eyebrow text-vs-gold mb-6">Our Motive</motion.div>
          <motion.h2 variants={fadeUp} className="font-display font-medium text-vs-text-primary text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            "Buy property,
            <br />
            <span className="text-vs-gold">pay no brokerage."</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-8 text-vs-text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We believe buying a home should be simple, transparent, and fair. No middlemen. No hidden fees. Just you, the seller, and us.
          </motion.p>
          <motion.div variants={stagger} className="mt-16 grid sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            <motion.div variants={fadeUp}>
              <Pillar Icon={Ban} title="Zero Brokerage">Buyers pay nothing. We charge no commission on transactions.</Pillar>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Pillar Icon={ShieldCheck} title="Verified Listings Only">Every property is internally reviewed and approved before going live.</Pillar>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Pillar Icon={HeadphonesIcon} title="Direct Team Contact">Reach a human at VisitSarva — not a call centre, not a broker.</Pillar>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== 8-SECTOR SHOWCASE GRID ===== */}
      <SectorShowcase />

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 md:py-28 bg-vs-surface border-y border-vs-border" data-testid="how-it-works">
        <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <motion.div variants={fadeUp} className="eyebrow text-vs-gold mb-4">How It Works</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
              Four steps from sign-up to keys.
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="flex justify-center gap-3 mb-14"
          >
            <button
              data-testid="how-tab-buyer"
              onClick={() => setHowTab("buyer")}
              className={`chip ${howTab === "buyer" ? "chip-active" : ""}`}
            >
              For Buyers
            </button>
            <button
              data-testid="how-tab-seller"
              onClick={() => setHowTab("seller")}
              className={`chip ${howTab === "seller" ? "chip-active" : ""}`}
            >
              For Sellers
            </button>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
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
              <motion.div key={title} variants={fadeUp} className="relative">
                <div className="w-12 h-12 rounded-full bg-vs-gold text-vs-bg flex items-center justify-center font-display font-semibold text-lg">
                  {i + 1}
                </div>
                <h3 className="mt-5 font-display font-medium text-vs-text-primary text-lg">{title}</h3>
                <p className="mt-2 text-sm text-vs-text-muted leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ALL-IN-ONE DOCUMENTS ===== */}
      <section id="services" className="py-24 md:py-28 bg-vs-bg" data-testid="services-section">
        <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="max-w-2xl mb-14"
          >
            <motion.div variants={fadeUp} className="eyebrow text-vs-gold mb-4">Property Services</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
              All-in-One Documents.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-vs-text-secondary">
              Khata, valuation, conversions, approvals — handled end-to-end by our specialist team.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {DOCUMENT_SERVICES.map((s) => (
              <motion.div
                key={s.v}
                variants={fadeUp}
                className="card p-6 flex flex-col"
                data-testid={`service-card-${s.v}`}
              >
                <div className="w-12 h-12 rounded-lg bg-vs-gold/10 text-vs-gold flex items-center justify-center">
                  <s.Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-display font-medium text-vs-text-primary text-lg">{s.l}</h3>
                <p className="mt-2 text-sm text-vs-text-muted flex-1 leading-relaxed">{s.body}</p>
                <Link to="/services" className="mt-6 text-sm text-vs-gold hover:text-vs-primary-hover flex items-center gap-2 transition-colors duration-300 group">
                  Request Service <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20 bg-vs-surface border-y border-vs-border" data-testid="stats-section">
        <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              [1240, "Properties Listed"],
              [18, "Cities Covered"],
              [320, "Verified Sellers"],
              [980, "Happy Buyers"],
            ].map(([n, label]) => (
              <motion.div key={label} variants={fadeUp} className="text-center md:text-left">
                <div className="font-display text-4xl md:text-5xl font-medium text-vs-gold">
                  {n.toLocaleString("en-IN")}+
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-vs-text-muted">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 md:py-28 bg-vs-bg">
        <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="max-w-2xl mb-14"
          >
            <motion.div variants={fadeUp} className="eyebrow text-vs-gold mb-4">Customer Stories</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
              From the people who trusted us.
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { name: "Arjun Mehra", role: "Buyer, Bangalore", text: "Found my 3 BHK in Whitefield in two weeks — and paid zero brokerage. The team handled everything." },
              { name: "Kavya Iyer", role: "Seller, Hyderabad", text: "The AI listing form did half my work. Property was live in 3 days, sold in 6 weeks." },
              { name: "Rohit Bhandari", role: "Buyer, Pune", text: "What I loved most: a real person from VisitSarva calling me back, not a broker chasing commission." },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="card p-6">
                <div className="flex gap-1 text-vs-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-5 text-vs-text-primary leading-relaxed">"{t.text}"</p>
                <div className="mt-6 pt-5 border-t border-vs-border">
                  <div className="font-display font-medium text-vs-text-primary">{t.name}</div>
                  <div className="text-xs text-vs-text-muted mt-1">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const RoleCard = ({ role, title, copy, points, variant = "default" }) => {
  const isGold = variant === "gold";
  return (
    <div
      data-testid={`role-card-${role}`}
      className={`relative p-8 md:p-10 rounded-xl border transition-all duration-300 ${
        isGold
          ? "bg-vs-gold/10 border-vs-gold/30 hover:border-vs-gold"
          : "bg-vs-bg border-vs-border hover:border-vs-gold/50"
      }`}
    >
      <h3 className={`font-display text-2xl md:text-3xl font-medium ${isGold ? "text-vs-gold" : "text-vs-text-primary"}`}>
        {title}
      </h3>
      <p className={`mt-3 text-sm md:text-base leading-relaxed ${isGold ? "text-vs-text-secondary" : "text-vs-text-muted"}`}>
        {copy}
      </p>
      <ul className="mt-6 space-y-3 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-3 text-vs-text-secondary">
            <CheckCircle2 size={16} className="text-vs-gold shrink-0" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to={`/register?role=${role}`}
          data-testid={`role-${role}-signup`}
          className={isGold ? "btn-primary" : "btn-primary"}
        >
          Sign Up as {role === "buyer" ? "Buyer" : "Seller"}
        </Link>
        <Link
          to="/login"
          data-testid={`role-${role}-login`}
          className="btn-secondary"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

const Pillar = ({ Icon, title, children }) => (
  <div className="p-6 rounded-lg bg-vs-surface/50 border border-vs-border">
    <Icon size={28} className="text-vs-gold" strokeWidth={1.5} />
    <h4 className="mt-5 font-display text-xl font-medium text-vs-text-primary">{title}</h4>
    <p className="mt-2 text-sm text-vs-text-muted leading-relaxed">{children}</p>
  </div>
);

export default Landing;
