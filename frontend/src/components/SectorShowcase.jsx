import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const SECTORS = [
  { key: "commercial", title: "Commercial", tagline: "Offices, retail, pre-leased income assets.", img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80" },
  { key: "residential", title: "Residential", tagline: "Villas, independent houses, builder floors.", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=80" },
  { key: "plot", title: "Plots & Agriculture", tagline: "DTCP-approved plots, farm land, plantations.", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80" },
  { key: "apartment", title: "Apartments", tagline: "1/2/3/4 BHK flats in gated communities.", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80" },
  { key: "industrial", title: "Industrial", tagline: "Warehouses, factories, logistics parks.", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=80" },
  { key: "rental", title: "Rentals", tagline: "Furnished & semi-furnished homes for rent.", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80" },
  { key: "construction_interior", title: "Construction & Interiors", tagline: "Build-to-spec, premium interiors.", to: "/construction", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80" },
  { key: "services", title: "All-in-One Documents", tagline: "Khata, valuation, conversions, approvals.", to: "/services", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80" },
];

const SectorShowcase = () => (
  <section data-testid="sector-showcase" className="py-20 md:py-24">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="max-w-2xl mb-10">
        <div className="eyebrow mb-2">Eight Sectors</div>
        <h2 className="section-title">Everything property-related, under one roof.</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTORS.map((s, i) => {
          const target = s.to || `/properties?category=${s.key}`;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
            >
              <Link
                to={target}
                data-testid={`sector-tile-${s.key}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-[#e6e4dd]"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-[#0D7A6B]/70 transition-all" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display font-semibold text-lg md:text-xl">{s.title}</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{s.tagline}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#7ec4b8] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowUpRight size={11} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default SectorShowcase;
