import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import AISearchBar from "@/components/AISearchBar";
import FilterPanel from "@/components/FilterPanel";
import api from "@/api/client";
import { PROPERTY_CATEGORIES } from "@/utils/format";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "price_asc", l: "Price: Low → High" },
  { v: "price_desc", l: "Price: High → Low" },
  { v: "popular", l: "Most viewed" },
];

const PropertiesList = () => {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [smartSummary, setSmartSummary] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      category: params.get("category") || "",
      city: params.get("city") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      bedrooms: params.get("bedrooms") || "",
      sort_by: params.get("sort_by") || "newest",
    }),
    [params]
  );

  /* Unused handleFilters removed; filters are updated directly via updateFilter */

  // Fetch data based on filters and params
  useEffect(() => {
    // smart search results
    if (params.get("smart") === "1") {
      const cached = sessionStorage.getItem("vs_smart_search");
      if (cached) {
        const parsed = JSON.parse(cached);
        setItems(parsed.results || []);
        setTotal(parsed.count || 0);
        setSmartSummary(parsed.summary);
        setLoading(false);
        return;
      }
    }
    setSmartSummary(null);
    setLoading(true);
    const q = {};
    if (filters.category) q.category = filters.category;
    if (filters.city) q.city = filters.city;
    if (filters.min_price) q.min_price = filters.min_price;
    if (filters.max_price) q.max_price = filters.max_price;
    if (filters.bedrooms) q.bedrooms = filters.bedrooms;
    if (filters.sort_by) q.sort_by = filters.sort_by;
    api
      .get("/properties", { params: q })
      .then(({ data }) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [params, filters.category, filters.city, filters.min_price, filters.max_price, filters.bedrooms, filters.sort_by]);

  const updateFilter = (k, v) => {
    const n = new URLSearchParams(params);
    n.delete("smart");
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    sessionStorage.removeItem("vs_smart_search");
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />
      <section className="bg-white border-b border-[#e6e4dd]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F2340]">
            Browse Properties
          </h1>
          <p className="mt-1 text-sm text-[#5b6371]">
            Every listing on VisitSarva is internally verified. Zero brokerage for buyers.
          </p>
          <div className="mt-5 max-w-3xl">
            <AISearchBar compact />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid lg:grid-cols-12 gap-8">
        {/* ===== FILTERS ===== */}
        <aside className="lg:col-span-3">
          <FilterGroup label="Category">
            <select
              className="input-field"
              data-testid="filter-category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All</option>
              {PROPERTY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} label={c.label} />
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="City">
            <input
              className="input-field"
              placeholder="e.g. Bangalore"
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              data-testid="filter-city"
            />
          </FilterGroup>

          <FilterGroup label="Min price (INR)">
            <input
              className="input-field"
              type="number"
              placeholder="0"
              value={filters.min_price}
              onChange={(e) => updateFilter("min_price", e.target.value)}
              data-testid="filter-min-price"
            />
          </FilterGroup>

          <FilterGroup label="Max price (INR)">
            <input
              className="input-field"
              type="number"
              placeholder="No limit"
              value={filters.max_price}
              onChange={(e) => updateFilter("max_price", e.target.value)}
              data-testid="filter-max-price"
            />
          </FilterGroup>

          <FilterGroup label="Bedrooms">
            <select
              className="input-field"
              value={filters.bedrooms}
              onChange={(e) => updateFilter("bedrooms", e.target.value)}
              data-testid="filter-bedrooms"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} label={`${n}+ BHK`} />
              ))}
            </select>
          </FilterGroup>
        </aside>

        {/* ===== RESULTS ===== */}
        <main className="lg:col-span-9">
          {smartSummary && (
            <div data-testid="smart-search-banner" className="mb-6 p-4 rounded-lg border border-[#0D7A6B]/30 bg-[#0D7A6B]/5">
              <div className="text-[11px] uppercase tracking-wider text-[#0D7A6B] mb-1">
                AI understood your query as
              </div>
              <div className="font-display text-[#0F2340]">{smartSummary}</div>
              <button onClick={clearAll} className="mt-2 text-xs text-[#0D7A6B] hover:underline">
                Browse all listings instead
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="text-sm text-[#5b6371]" data-testid="results-count">
              <span className="font-semibold text-[#0F2340]">{loading ? "…" : total || items.length}</span>{" "}
              {(total || items.length) === 1 ? "result" : "results"}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden chip"
                onClick={() => setFiltersOpen(true)}
                data-testid="open-filters"
              >
                <SlidersHorizontal size={13} /> Filters
              </button>
              <select
                className="input-field !py-2 !text-sm !w-auto"
                value={filters.sort_by}
                onChange={(e) => updateFilter("sort_by", e.target.value)}
                data-testid="filter-sort"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-[#0D7A6B]" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-[#5b6371]">
              No listings match these filters. Try clearing some filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const FilterGroup = ({ label, children }) => (
  <div className="mb-5">
    <label className="label">{label}</label>
    {children}
  </div>
);

export default PropertiesList;
