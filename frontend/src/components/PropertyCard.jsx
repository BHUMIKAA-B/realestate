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
      className="card group flex flex-col overflow-hidden"
    >
      <Link
        to={`/properties/${property.id}`}
        className="block relative aspect-[4/3] overflow-hidden bg-vs-surface"
      >
        <img
          src={img}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vs-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-3 left-3 px-2.5 py-1.5 text-[10px] uppercase tracking-wider rounded bg-vs-surface/95 backdrop-blur-sm text-vs-text-primary font-medium border border-vs-border">
          {CATEGORY_LABEL[property.category] || property.category}
        </span>
        {property.is_featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1.5 text-[10px] uppercase tracking-wider rounded bg-vs-gold text-vs-bg font-medium flex items-center gap-1.5">
            <BadgeCheck size={12} /> Verified
          </span>
        )}
      </Link>
      <div className="p-5 flex-1 flex flex-col bg-vs-bg">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-medium text-vs-text-primary text-base leading-snug line-clamp-2">
            <Link
              to={`/properties/${property.id}`}
              className="hover:text-vs-gold transition-colors duration-300"
            >
              {property.title}
            </Link>
          </h3>
          {onSave && (
            <button
              data-testid={`property-save-${property.id}`}
              onClick={() => onSave(property.id)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isSaved
                  ? "text-vs-gold bg-vs-gold/10"
                  : "text-vs-text-muted hover:text-vs-gold hover:bg-vs-gold/10"
              }`}
              aria-label="Save property"
            >
              <Bookmark size={18} fill={isSaved ? "#C89B5F" : "none"} />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-vs-text-muted">
          <MapPin size={14} className="text-vs-gold shrink-0" />
          <span className="truncate">
            {loc.city || loc.address || "—"}
            {loc.state ? `, ${loc.state}` : ""}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-5 text-xs text-vs-text-secondary">
          {property.bedrooms ? (
            <span className="flex items-center gap-1.5">
              <Bed size={14} className="text-vs-gold" /> {property.bedrooms} BHK
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <Maximize2 size={14} className="text-vs-gold" /> {formatArea(property.area)}
          </span>
        </div>
        <div className="mt-auto pt-5 flex items-end justify-between border-t border-vs-border mt-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-vs-text-muted mb-1">
              Price
            </div>
            <div className="font-display text-xl font-medium text-vs-gold">
              {INR(property.price)}
              {property.category === "rental" && (
                <span className="text-xs text-vs-text-muted font-normal ml-1">/mo</span>
              )}
            </div>
          </div>
          <Link
            to={`/properties/${property.id}`}
            data-testid={`property-view-${property.id}`}
            className="btn-secondary text-xs px-4 py-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
