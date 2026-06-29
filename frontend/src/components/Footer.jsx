import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Instagram, Linkedin, Facebook, Twitter } from "lucide-react";

const Footer = () => (
  <footer data-testid="footer" className="bg-[#0F2340] text-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <Logo size={32} color="#fff" />
            <div>
              <div className="font-display font-bold text-xl">VisitSarva</div>
              <div className="text-[10px] tracking-[0.18em] uppercase text-[#7ec4b8]">
                Zero Brokerage Property Platform
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm text-white/70 leading-relaxed max-w-sm">
            VisitSarva connects buyers directly with verified sellers across
            India — no brokers, no hidden fees, no middlemen.
          </p>
          <p className="mt-6 font-display text-xl text-[#7ec4b8]">
            Buy property, pay no brokerage.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[Instagram, Linkedin, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 border border-white/20 hover:border-[#7ec4b8] hover:text-[#7ec4b8] flex items-center justify-center rounded-md transition-colors"
                aria-label="social"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
        <FooterCol
          title="Explore"
          links={[
            { to: "/properties", label: "All Properties" },
            { to: "/properties?category=residential", label: "Residential" },
            { to: "/properties?category=commercial", label: "Commercial" },
            { to: "/properties?category=plot", label: "Plots & Land" },
            { to: "/services", label: "Document Services" },
          ]}
        />
        <FooterCol
          title="For You"
          links={[
            { to: "/register", label: "Sign Up" },
            { to: "/login", label: "Login" },
            { to: "/seller/listings/new", label: "List Property" },
            { to: "/services", label: "Request Service" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "#", label: "About" },
            { to: "#", label: "Contact" },
            { to: "#", label: "Privacy" },
            { to: "#", label: "Terms" },
          ]}
        />
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-white/60">
        <div>© {new Date().getFullYear()} VisitSarva. All rights reserved.</div>
        <div className="tracking-wider">India · Zero Brokerage Platform</div>
      </div>
    </div>
  </footer>
);

const FooterCol = ({ title, links }) => (
  <div className="md:col-span-2">
    <div className="text-[11px] uppercase tracking-[0.2em] text-[#7ec4b8] mb-4">
      {title}
    </div>
    <ul className="space-y-2.5">
      {links.map((l, i) => (
        <li key={i}>
          <Link to={l.to} className="text-sm text-white/75 hover:text-white transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
