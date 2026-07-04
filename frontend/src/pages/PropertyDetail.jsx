import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Bed, Bath, Maximize2, Compass, Sofa, BadgeCheck, ArrowLeft, Loader as Loader2, Phone, Mail, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EMICalculator from "@/components/EMICalculator";
import api from "@/api/client";
import { INR, formatArea, CATEGORY_LABEL } from "@/utils/format";

// Fix default Leaflet marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PropertyDetail = () => {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setP(data))
      .catch(() => toast.error("Could not load property"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vs-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-vs-gold" size={32} />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-vs-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h2 className="font-display font-medium text-vs-text-primary text-2xl">Property not found</h2>
          <Link to="/properties" className="btn-primary mt-8">Browse all properties</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = p.images?.length
    ? p.images
    : [{ url: "https://images.pexels.com/photos/36676879/pexels-photo-36676879.jpeg?auto=compress&cs=tinysrgb&w=1600" }];
  const loc = p.location || {};
  const hasMap = loc.lat && loc.lng;
  const isForSale = p.category !== "rental";

  return (
    <div className="min-h-screen bg-vs-bg">
      <Navbar />

      <div className="max-w-[80rem] mx-auto px-6 lg:px-12 py-6">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-sm text-vs-text-muted hover:text-vs-gold transition-colors duration-300"
          data-testid="back-link"
        >
          <ArrowLeft size={14} /> Back to listings
        </Link>
      </div>

      <div className="max-w-[80rem] mx-auto px-6 lg:px-12 pb-16 grid lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-xl bg-vs-surface border border-vs-border">
              <img
                src={images[activeImg].url}
                alt={p.title}
                className="w-full aspect-[16/10] object-cover"
                data-testid="property-main-image"
              />
              <span className="absolute top-4 left-4 chip bg-vs-surface/95 backdrop-blur-sm border-vs-border text-vs-text-primary">
                {CATEGORY_LABEL[p.category]}
              </span>
              <span className="absolute top-4 right-4 chip bg-vs-gold text-vs-bg border-vs-gold">
                <BadgeCheck size={12} /> Verified by VisitSarva
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      activeImg === i ? "border-vs-gold" : "border-vs-border hover:border-vs-gold/50"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + price */}
          <div>
            <h1
              className="font-display font-medium text-vs-text-primary text-3xl md:text-4xl tracking-tight"
              data-testid="property-title"
            >
              {p.title}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-vs-text-secondary text-sm">
              <MapPin size={14} className="text-vs-gold" />
              {[loc.address, loc.city, loc.state].filter(Boolean).join(", ")}
            </div>
            <div className="mt-5 flex items-baseline gap-4 flex-wrap">
              <div className="font-display text-3xl md:text-4xl font-medium text-vs-gold">
                {INR(p.price)}
                {!isForSale && (
                  <span className="text-base text-vs-text-muted font-normal"> /month</span>
                )}
              </div>
              {p.price_negotiable && (
                <span className="chip bg-vs-gold/10 border-vs-gold/30 text-vs-gold">Negotiable</span>
              )}
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KV icon={Maximize2} label="Area" value={formatArea(p.area)} />
            {p.bedrooms && <KV icon={Bed} label="Bedrooms" value={`${p.bedrooms} BHK`} />}
            {p.bathrooms && <KV icon={Bath} label="Bathrooms" value={p.bathrooms} />}
            {p.facing && <KV icon={Compass} label="Facing" value={p.facing} />}
            {p.furnishing && <KV icon={Sofa} label="Furnishing" value={p.furnishing} />}
          </div>

          {/* Map */}
          {hasMap && (
            <div className="rounded-xl overflow-hidden border border-vs-border" style={{ height: 280 }}>
              <MapContainer
                center={[loc.lat, loc.lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                />
                <Marker position={[loc.lat, loc.lng]}>
                  <Popup>{p.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <Section title="About this property">
              <p className="text-vs-text-secondary leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            </Section>
          )}

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <Section title="Amenities">
              <div className="flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <span key={a} className="chip">{a}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Features */}
          {p.features?.length > 0 && (
            <Section title="Features">
              <div className="flex flex-wrap gap-2">
                {p.features.map((f) => (
                  <span key={f} className="chip">{f}</span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <SidebarTabs key={p.id} propertyId={p.id} price={p.price} isForSale={isForSale} />
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

/* Sidebar with Contact / EMI tabs */

const SidebarTabs = ({ propertyId, price, isForSale }) => {
  const [tab, setTab] = useState(isForSale ? "contact" : "contact");

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      {isForSale && price > 0 && (
        <div className="flex border-b border-vs-border">
          {[
            { id: "contact", label: "Contact" },
            { id: "emi", label: "EMI Calculator" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3.5 text-sm font-medium transition-all duration-300 ${
                tab === t.id
                  ? "text-vs-gold border-b-2 border-vs-gold bg-vs-surface/50"
                  : "text-vs-text-muted hover:text-vs-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        {tab === "contact" && <EnquireCard propertyId={propertyId} />}
        {tab === "emi" && isForSale && price > 0 && (
          <EMICalculator priceINR={price} />
        )}
      </div>
    </div>
  );
};

/* Sub-components */

const Section = ({ title, children }) => (
  <div className="pt-6 border-t border-vs-border">
    <h3 className="font-display font-medium text-vs-text-primary text-xl mb-4">{title}</h3>
    {children}
  </div>
);

const KV = ({ icon: Icon, label, value }) => (
  <div className="card p-4">
    <Icon size={18} className="text-vs-gold" />
    <div className="mt-2 text-[10px] uppercase tracking-wider text-vs-text-muted">{label}</div>
    <div className="font-display font-medium text-vs-text-primary mt-1">{value}</div>
  </div>
);

const EnquireCard = ({ propertyId }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "", contact_preference: "call",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/enquiries", { ...form, property_id: propertyId });
      toast.success("Enquiry sent! Our team will reach out shortly.");
      setForm({ name: "", email: "", phone: "", message: "", contact_preference: "call" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="font-display font-medium text-vs-text-primary text-lg">
          Contact VisitSarva Team
        </h3>
        <p className="mt-1 text-sm text-vs-text-muted">
          Zero brokerage. We coordinate directly with the seller.
        </p>
      </div>
      <div className="space-y-3">
        <input
          className="input-field"
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Your name"
          data-testid="enquiry-name"
        />
        <input
          className="input-field"
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          placeholder="Email"
          data-testid="enquiry-email"
        />
        <input
          className="input-field"
          required
          value={form.phone}
          onChange={set("phone")}
          placeholder="Phone"
          data-testid="enquiry-phone"
        />
        <textarea
          className="input-field min-h-[80px]"
          value={form.message}
          onChange={set("message")}
          placeholder="A note (optional)"
          data-testid="enquiry-message"
        />
        <div>
          <label className="text-xs text-vs-text-muted uppercase tracking-wider mb-2 block">
            Preferred contact
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "call", l: "Call", Icon: Phone },
              { v: "email", l: "Email", Icon: Mail },
              { v: "whatsapp", l: "WhatsApp", Icon: MessageSquare },
            ].map(({ v, l, Icon }) => (
              <button
                type="button"
                key={v}
                onClick={() => setForm((s) => ({ ...s, contact_preference: v }))}
                data-testid={`enquiry-pref-${v}`}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-xs transition-all duration-300 ${
                  form.contact_preference === v
                    ? "border-vs-gold text-vs-gold bg-vs-gold/10"
                    : "border-vs-border text-vs-text-muted hover:border-vs-gold/50"
                }`}
              >
                <Icon size={14} />
                {l}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
          data-testid="enquiry-submit"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          Send Enquiry
        </button>
      </div>
    </form>
  );
};

export default PropertyDetail;
