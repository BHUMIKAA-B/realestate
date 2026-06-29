import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import api from "@/api/client";
import { PROPERTY_CATEGORIES } from "@/utils/format";

const ALL_TABS = [{ value: "all", label: "All" }, ...PROPERTY_CATEGORIES.slice(0, 6)];

const ActiveProjects = () => {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.get("/projects", { params: { type: "active" } }).then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((p) => p.sector === tab)),
    [items, tab]
  );

  if (items.length === 0) return null;

  const featured = filtered[0];
  const rest = filtered.slice(1, 4);

  return (
    <section
      data-testid="active-projects-section"
      className="py-20 md:py-24 bg-white border-y border-[#e6e4dd]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="eyebrow mb-2">Currently Marketing</div>
            <h2 className="section-title">Projects we're working with.</h2>
            <p className="mt-2 text-[#5b6371] text-sm md:text-base max-w-xl">
              Active developments where our team is the appointed marketing partner.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
          {ALL_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              data-testid={`active-tab-${t.value}`}
              className={`chip whitespace-nowrap ${tab === t.value ? "chip-active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!featured ? (
          <div className="text-[#5b6371] py-8">No active projects in this category.</div>
        ) : (
          <div className="grid lg:grid-cols-10 gap-6">
            {/* Featured 70% */}
            <motion.article
              key={featured.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 card overflow-hidden group"
              data-testid={`active-featured-${featured.id}`}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] tracking-wider uppercase rounded bg-white/95 text-[#0F2340] font-medium">
                  Featured Project
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#7ec4b8] flex items-center gap-2">
                    {featured.builder} · <MapPin size={11} /> {featured.location}, {featured.city}
                  </div>
                  <h3 className="mt-2 font-display font-semibold text-2xl md:text-4xl leading-tight">
                    {featured.title}
                  </h3>
                  <p className="mt-3 text-white/85 text-sm max-w-2xl">{featured.description}</p>
                  <div className="mt-5 flex items-center gap-5 flex-wrap text-xs">
                    <span>
                      <div className="text-white/60 text-[10px] uppercase tracking-wider">Price</div>
                      <div className="font-display text-base font-semibold">{featured.price_range}</div>
                    </span>
                    <span>
                      <div className="text-white/60 text-[10px] uppercase tracking-wider">Area</div>
                      <div className="font-display text-base font-semibold">{featured.area}</div>
                    </span>
                    <span>
                      <div className="text-white/60 text-[10px] uppercase tracking-wider">Possession</div>
                      <div className="font-display text-base font-semibold">{featured.possession}</div>
                    </span>
                  </div>
                  <Link
                    to="/properties"
                    className="mt-6 inline-flex items-center gap-2 bg-[#0D7A6B] hover:bg-[#1a9686] px-5 py-2.5 rounded text-sm transition-colors"
                  >
                    Enquire <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.article>

            {/* Sidebar 30% — listings */}
            <div className="lg:col-span-3 space-y-4">
              {rest.length === 0 ? (
                <div className="text-sm text-[#5b6371]">More projects coming soon.</div>
              ) : (
                rest.map((p) => (
                  <Link
                    to="/properties"
                    key={p.id}
                    data-testid={`active-side-${p.id}`}
                    className="card flex gap-3 overflow-hidden hover:border-[#0D7A6B] transition-colors"
                  >
                    <div className="w-24 h-24 shrink-0 bg-[#fafaf7]">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 py-2 pr-3">
                      <div className="text-[10px] uppercase tracking-wider text-[#0D7A6B]">
                        {p.area}
                      </div>
                      <div className="font-display font-semibold text-[#0F2340] text-sm leading-snug line-clamp-2">
                        {p.title}
                      </div>
                      <div className="text-xs text-[#5b6371] mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {p.city}
                      </div>
                      <div className="text-xs font-display font-semibold text-[#0F2340] mt-1">
                        {p.price_range}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveProjects;
