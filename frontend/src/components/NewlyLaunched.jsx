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

const NewlyLaunched = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/projects", { params: { type: "new" } }).then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      data-testid="newly-launched-section"
      className="py-20 md:py-24 bg-gradient-to-b from-[#fafaf7] to-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <div className="eyebrow flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[#0D7A6B]" />
              Newly Launched
            </div>
            <h2 className="section-title">Just landed on VisitSarva.</h2>
            <p className="mt-2 text-[#5b6371] text-sm md:text-base">
              Fresh projects from trusted builders — see them before the rest of the market.
            </p>
          </div>
          <Link to="/properties" className="text-sm text-[#0D7A6B] hover:underline">
            View all listings →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p, i) => (
            <motion.article
              key={p.id}
              data-testid={`new-project-${p.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="card relative group overflow-hidden"
            >
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase rounded bg-[#0D7A6B] text-white font-medium shadow flex items-center gap-1">
                  <Sparkles size={10} /> New Launch
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-[#fafaf7]">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-[#5b6371]">
                  <span className="chip !py-0.5 !px-2 !text-[10px]">
                    {SECTOR_LABELS[p.sector] || p.sector}
                  </span>
                  {p.rera_id && (
                    <span className="flex items-center gap-1 text-[10px]">
                      <BadgeCheck size={11} className="text-[#0D7A6B]" /> RERA
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display font-semibold text-[#0F2340] text-lg leading-snug">
                  {p.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-[#5b6371]">
                  <MapPin size={11} /> {p.location}, {p.city}
                </div>
                <div className="mt-4 pt-4 border-t border-[#e6e4dd] flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#5b6371]">Price</div>
                    <div className="font-display font-semibold text-[#0F2340]">{p.price_range}</div>
                  </div>
                  <Link
                    to="/properties"
                    className="text-xs text-[#0D7A6B] inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Enquire <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewlyLaunched;
