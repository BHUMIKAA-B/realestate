import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/api/client";

const STATUS_LABEL = {
  new: "New",
  viewed: "Viewed",
  responded: "Responded",
  closed: "Closed",
};

const STATUS_COLOR = {
  new: "bg-[#0D7A6B] text-white",
  viewed: "bg-[#fafaf7] text-[#0F2340] border border-[#e6e4dd]",
  responded: "bg-[#0F2340] text-white",
  closed: "bg-[#fafaf7] text-[#5b6371] border border-[#e6e4dd]",
};

const MyEnquiries = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/enquiries/me")
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-[#0F2340]">
          My Enquiries
        </h1>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-[#0D7A6B]" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 text-[#5b6371]">No enquiries yet.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((e) => (
              <Link
                key={e.id}
                to={`/properties/${e.property_id}`}
                className="card p-5 flex items-center justify-between gap-4 hover:border-[#0D7A6B]"
                data-testid={`my-enquiry-${e.id}`}
              >
                <div>
                  <div className="font-display font-semibold text-[#0F2340]">
                    {e.property_title || "Property"}
                  </div>
                  <div className="text-sm text-[#5b6371] mt-1">
                    {e.message || `Contact preference: ${e.contact_preference}`}
                  </div>
                  <div className="text-xs text-[#5b6371] mt-1">
                    {new Date(e.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLOR[e.status] || ""}`}>
                  {STATUS_LABEL[e.status] || e.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default MyEnquiries;
