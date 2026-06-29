import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MapPin, BadgeCheck } from "lucide-react";
import { INR, CATEGORY_LABEL } from "@/utils/format";

// Fix default leaflet icons in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom teal icon for verified properties
const verifiedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const fallbackImg =
  "https://images.pexels.com/photos/36676879/pexels-photo-36676879.jpeg?auto=compress&cs=tinysrgb&w=400";

// Recenter map when properties change
const AutoFit = ({ bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (_) {}
    }
  }, [bounds, map]);
  return null;
};

const PropertyMapView = ({ properties = [] }) => {
  // Only show properties that have lat/lng
  const mapped = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.location?.lat != null &&
          p.location?.lng != null &&
          !isNaN(Number(p.location.lat)) &&
          !isNaN(Number(p.location.lng))
      ),
    [properties]
  );

  const bounds = useMemo(
    () => mapped.map((p) => [Number(p.location.lat), Number(p.location.lng)]),
    [mapped]
  );

  // Fallback center — Bangalore
  const center = bounds.length > 0 ? bounds[0] : [12.9716, 77.5946];

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#e6e4dd]" style={{ height: 520 }} data-testid="property-map-view">
      {mapped.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#fafaf7] text-[#5b6371]">
          <MapPin size={32} className="mb-2 text-[#0D7A6B]/40" />
          <p className="text-sm">No properties with location data to show on the map.</p>
          <p className="text-xs mt-1">Switch to List view to see all listings.</p>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {bounds.length > 1 && <AutoFit bounds={bounds} />}
        {mapped.map((p) => {
          const lat = Number(p.location.lat);
          const lng = Number(p.location.lng);
          const img = p.images?.[0]?.url || fallbackImg;
          return (
            <Marker
              key={p.id}
              position={[lat, lng]}
              icon={p.is_featured ? verifiedIcon : defaultIcon}
            >
              <Popup maxWidth={240} className="property-popup">
                <div className="text-[#0F2340]" style={{ minWidth: 200 }}>
                  <img
                    src={img}
                    alt={p.title}
                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
                    loading="lazy"
                  />
                  {p.is_featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#0D7A6B] font-semibold mb-1">
                      <BadgeCheck size={11} /> Verified
                    </span>
                  )}
                  <div className="font-semibold text-sm leading-snug mb-1">{p.title}</div>
                  <div className="flex items-center gap-1 text-xs text-[#5b6371] mb-2">
                    <MapPin size={10} />
                    {p.location?.city || p.location?.address || "—"}
                  </div>
                  <div className="text-xs text-[#5b6371] mb-1">
                    {CATEGORY_LABEL[p.category] || p.category}
                    {p.bedrooms ? ` · ${p.bedrooms} BHK` : ""}
                  </div>
                  <div className="font-display font-bold text-base text-[#0F2340] mb-3">
                    {INR(p.price)}
                    {p.category === "rental" && (
                      <span className="text-xs font-normal text-[#5b6371]"> /mo</span>
                    )}
                  </div>
                  <Link
                    to={`/properties/${p.id}`}
                    className="block text-center text-xs py-1.5 px-3 rounded bg-[#0D7A6B] text-white hover:bg-[#0a5e52] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[999] bg-white/95 backdrop-blur rounded-lg p-2.5 border border-[#e6e4dd] shadow text-[10px] text-[#5b6371] space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0D7A6B]" /> Verified listing
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4a90d9]" /> Standard listing
        </div>
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[999] bg-white/95 backdrop-blur rounded-lg px-3 py-1.5 border border-[#e6e4dd] shadow text-xs text-[#0F2340] font-medium">
        {mapped.length} on map{properties.length > mapped.length ? ` (${properties.length - mapped.length} without location)` : ""}
      </div>
    </div>
  );
};

export default PropertyMapView;
