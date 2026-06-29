import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Maximize2, BadgeCheck, Bookmark } from "lucide-react";
import { INR, formatArea, CATEGORY_LABEL } from "@/utils/format";

const fallbackImg =
  "https://images.pexels.com/photos/36676879/pexels-photo-36676879.jpeg?auto=compress&cs=tinysrgb&w=900";

const PropertyCard = ({ property, onSave, isSaved }) => {
  const img = property.images?.[0]?.url || fallbackImg;
  const loc = property.location || {};
  return (
    <article
      data-testid={`property-card-${property.id}`}
      className="card group flex flex-col"
    >
      <Link
        to={`/properties/${property.id}`}
        className="block relative aspect-[4/3] overflow-hidden bg-[#fafaf7]"
      >
        <img
          src={img}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider rounded bg-white/95 text-[#0F2340] font-medium">
          {CATEGORY_LABEL[property.category] || property.category}
        </span>
        {property.is_featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] uppercase tracking-wider rounded bg-[#0D7A6B] text-white font-medium flex items-center gap-1">
            <BadgeCheck size={11} /> Verified
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-[#0F2340] text-base leading-snug line-clamp-2">
            <Link to={`/properties/${property.id}`} className="hover:text-[#0D7A6B]">
              {property.title}
            </Link>
          </h3>
          {onSave && (
            <button
              data-testid={`property-save-${property.id}`}
              onClick={() => onSave(property.id)}
              className={`p-1.5 rounded ${
                isSaved ? "text-[#0D7A6B]" : "text-[#5b6371] hover:text-[#0D7A6B]"
              }`}
              aria-label="Save property"
            >
              <Bookmark size={16} fill={isSaved ? "#0D7A6B" : "none"} />
            </button>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#5b6371]">
          <MapPin size={12} />
          <span className="truncate">
            {loc.city || loc.address || "—"}
            {loc.state ? `, ${loc.state}` : ""}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-[#5b6371]">
          {property.bedrooms ? (
            <span className="flex items-center gap-1">
              <Bed size={12} /> {property.bedrooms} BHK
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Maximize2 size={12} /> {formatArea(property.area)}
          </span>
        </div>
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#5b6371]">
              Price
            </div>
            <div className="font-display text-lg font-semibold text-[#0F2340]">
              {INR(property.price)}
              {property.category === "rental" && (
                <span className="text-xs text-[#5b6371] font-normal"> /mo</span>
              )}
            </div>
          </div>
          <Link
            to={`/properties/${property.id}`}
            data-testid={`property-view-${property.id}`}
            className="text-xs px-3 py-1.5 border border-[#e6e4dd] hover:border-[#0D7A6B] hover:text-[#0D7A6B] rounded transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
