import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, Loader2 } from "lucide-react";
import api from "@/api/client";
import toast from "react-hot-toast";

const AISearchBar = ({ compact = false }) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/ai/smart-search", { query: q });
      // Persist for the results page
      sessionStorage.setItem(
        "vs_smart_search",
        JSON.stringify({ query: q, ...data })
      );
      toast.success(data.summary || "Search ready");
      navigate("/properties?smart=1");
    } catch (err) {
      toast.error("AI search unavailable. Showing all listings.");
      navigate("/properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      data-testid="ai-search-form"
      className={`relative w-full ${
        compact ? "" : "shadow-xl"
      } bg-white border border-[#e6e4dd] rounded-xl overflow-hidden`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <Sparkles className="text-[#0D7A6B] shrink-0" size={18} />
        <input
          data-testid="ai-search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Describe what you need — e.g. "2 BHK flat in Bangalore under 80 lakhs with parking"'
          className="flex-1 outline-none bg-transparent text-sm md:text-base placeholder:text-[#9ca3af]"
        />
        <button
          type="submit"
          data-testid="ai-search-submit"
          disabled={loading || !q.trim()}
          className="btn-primary !py-2 !px-4 shrink-0"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
      <div className="px-4 pb-3 text-[11px] text-[#5b6371]">
        Powered by AI · Natural language search in English or Hindi
      </div>
    </form>
  );
};

export default AISearchBar;
