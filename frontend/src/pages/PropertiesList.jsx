import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import AISearchBar from "@/components/AISearchBar";
import PropertyMapView from "@/components/PropertyMapView";
import EMICalculator from "@/components/EMICalculator";
import api from "@/api/client";
import { PROPERTY_CATEGORIES } from "@/utils/format";
import {
  Loader2,
  Map,
  LayoutGrid,
  BadgeCheck,
  Calculator,
  X,
} from "lucide-react";

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
  // Honour ?view=map from URL (e.g. linked from BuyerHome Map View tool)
  const [viewMode, setViewMode] = useState(
    () => params.get("view") === "map" ? "map" : "grid"
  );
  const [emiOpen, setEmiOpen] = useState(false);

  const filters = useMemo(
    () => ({
      category: params.get("category") || "",
      city: params.get("city") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      bedrooms: params.get("bedrooms") || "",
      sort_by: params.get("sort_by") || "newest",
      verified_only: params.get("verified_only") === "1",
    }),
    [params]
  );

  useEffect(() => {
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
    if (filters.verified_only) q.verified_only = "1";
    api
      .get("/properties", { params: q })
      .then(({ data }) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [params, filters.category, filters.city, filters.min_price, filters.max_price, filters.bedrooms, filters.sort_by, filters.verified_only]);

  const updateFilter = (k, v) => {
    const n = new URLSearchParams(params);
    n.delete("smart");
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };

  const toggleVerified = () => {
    const n = new URLSearchParams(params);
    n.delete("smart");
    if (filters.verified_only) n.delete("verified_only");
    else n.set("verified_only", "1");
    setParams(n, { replace: true });
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    sessionStorage.removeItem("vs_smart_search");
  };

  const activeFilterCount = [
    filters.category,
    filters.city,
    filters.min_price,
    filters.max_price,
    filters.bedrooms,
    filters.verified_only ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />

      {/* Hero bar */}
      <section className="bg-white border-b border-[#e6e4dd]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F2340]">
                Browse Properties
              </h1>
              <p className="mt-1 text-sm text-[#5b6371]">
                Every listing on VisitSarva is internally verified. Zero brokerage for buyers.
              </p>
            </div>
            <button
              onClick={() => setEmiOpen(true)}
              className="btn-outline !py-2 !px-4 !text-sm flex items-center gap-2"
              data-testid="open-emi-calculator"
            >
              <Calculator size={15} className="text-[#0D7A6B]" />
              EMI Calculator
            </button>
          </div>
          <div className="mt-5 max-w-3xl">
            <AISearchBar compact />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid lg:grid-cols-12 gap-8">
        {/* ===== SIDEBAR FILTERS ===== */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5b6371]">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-[#0D7A6B] hover:underline flex items-center gap-1"
                data-testid="clear-filters"
              >
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          {/* Verified Only Toggle */}
          <div className="mb-5">
            <button
              onClick={toggleVerified}
              data-testid="filter-verified"
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                filters.verified_only
                  ? "bg-[#0D7A6B] border-[#0D7A6B] text-white"
                  : "bg-white border-[#e6e4dd] text-[#0F2340] hover:border-[#0D7A6B]"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <BadgeCheck size={15} />
                Verified Only
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  filters.verified_only
                    ? "bg-white/20 text-white"
                    : "bg-[#0D7A6B]/10 text-[#0D7A6B]"
                }`}
              >
                {filters.verified_only ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          <FilterGroup label="Category">
            <select
              className="input-field"
              data-testid="filter-category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All</option>
              {PROPERTY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
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
                <option key={n} value={n}>{`${n}+ BHK`}</option>
              ))}
            </select>
          </FilterGroup>

          {/* Inline EMI Calculator in sidebar */}
          <div className="pt-4 hidden lg:block">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5b6371]">
              Quick Tools
            </div>
            <button
              onClick={() => setEmiOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e6e4dd] bg-white hover:border-[#0D7A6B] hover:text-[#0D7A6B] transition-all text-sm text-[#0F2340]"
              data-testid="sidebar-emi-btn"
            >
              <Calculator size={15} className="text-[#0D7A6B]" />
              EMI Calculator
            </button>
          </div>
        </aside>

        {/* ===== MAIN RESULTS ===== */}
        <main className="lg:col-span-9">
          {smartSummary && (
            <div
              data-testid="smart-search-banner"
              className="mb-6 p-4 rounded-lg border border-[#0D7A6B]/30 bg-[#0D7A6B]/5"
            >
              <div className="text-[11px] uppercase tracking-wider text-[#0D7A6B] mb-1">
                AI understood your query as
              </div>
              <div className="font-display text-[#0F2340]">{smartSummary}</div>
              <button
                onClick={clearAll}
                className="mt-2 text-xs text-[#0D7A6B] hover:underline"
              >
                Browse all listings instead
              </button>
            </div>
          )}

          {/* Toolbar: count + view toggle + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#5b6371]" data-testid="results-count">
                <span className="font-semibold text-[#0F2340]">
                  {loading ? "…" : total || items.length}
                </span>{" "}
                {(total || items.length) === 1 ? "result" : "results"}
              </div>
              {filters.verified_only && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#0D7A6B]/10 text-[#0D7A6B] font-medium">
                  <BadgeCheck size={11} /> Verified only
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center border border-[#e6e4dd] rounded-md overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#0F2340] text-white"
                      : "text-[#5b6371] hover:text-[#0F2340]"
                  }`}
                  data-testid="view-grid"
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline text-xs">List</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                    viewMode === "map"
                      ? "bg-[#0F2340] text-white"
                      : "text-[#5b6371] hover:text-[#0F2340]"
                  }`}
                  data-testid="view-map"
                  title="Map view"
                >
                  <Map size={14} />
                  <span className="hidden sm:inline text-xs">Map</span>
                </button>
              </div>

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
              No listings match these filters.{" "}
              <button onClick={clearAll} className="text-[#0D7A6B] hover:underline">
                Clear all filters
              </button>
            </div>
          ) : viewMode === "map" ? (
            <PropertyMapView properties={items} />
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

      {/* EMI Calculator Modal */}
      <EMICalculator isOpen={emiOpen} onClose={() => setEmiOpen(false)} />
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
