import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import api from "@/api/client";

const SECTOR_LABELS = {
  apartment: "Apartments",
  commercial: "Commercial",
  residential: "Residential",
  plot: "Plots & Land",
  agriculture: "Agriculture",
  rental: "Rentals",
  industrial: "Industrial",
  construction_interior: "Construction & Interiors",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const NewlyLaunched = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/projects", { params: { type: "new" } }).then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      data-testid="newly-launched-section"
      className="py-20 md:py-24 bg-vs-surface border-y border-vs-border"
    >
      <div className="max-w-[80rem] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="flex items-end justify-between gap-4 flex-wrap mb-10"
        >
          <motion.div variants={fadeUp}>
            <div className="eyebrow flex items-center gap-2 text-vs-gold mb-3">
              <Sparkles size={13} />
              Newly Launched
            </div>
            <h2 className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight">
              Just landed on VisitSarva.
            </h2>
            <p className="mt-3 text-vs-text-secondary text-sm md:text-base max-w-lg">
              Fresh projects from trusted builders — see them before the rest of the market.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link
              to="/properties"
              className="text-sm text-vs-text-secondary hover:text-vs-gold flex items-center gap-2 transition-colors duration-300 group"
            >
              View all listings
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
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
          {items.map((p, i) => (
            <motion.article
              key={p.id}
              data-testid={`new-project-${p.id}`}
              variants={fadeUp}
              className="card relative group overflow-hidden"
            >
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1.5 text-[10px] tracking-wider uppercase rounded bg-vs-gold text-vs-bg font-medium shadow-glow-sm flex items-center gap-1.5">
                  <Sparkles size={11} /> New Launch
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-vs-bg">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-vs-text-muted">
                  <span className="chip !py-1 !px-2.5 !text-[10px]">
                    {SECTOR_LABELS[p.sector] || p.sector}
                  </span>
                  {p.rera_id && (
                    <span className="flex items-center gap-1 text-[10px]">
                      <BadgeCheck size={11} className="text-vs-gold" /> RERA
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display font-medium text-vs-text-primary text-lg leading-snug group-hover:text-vs-gold transition-colors duration-300">
                  {p.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-vs-text-muted">
                  <MapPin size={12} className="text-vs-gold" /> {p.location}, {p.city}
                </div>
                <div className="mt-5 pt-4 border-t border-vs-border flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-vs-text-muted mb-1">Price</div>
                    <div className="font-display font-medium text-vs-gold">{p.price_range}</div>
                  </div>
                  <Link
                    to="/properties"
                    className="text-xs text-vs-gold inline-flex items-center gap-1.5 hover:gap-2.5 transition-all duration-300"
                  >
                    Enquire <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default NewlyLaunched;
