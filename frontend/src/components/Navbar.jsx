import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Bookmark, Inbox, ChevronDown, MessageCircle } from "lucide-react";
import ThemeToggle from '@/components/ThemeToggle';
import Logo from "@/components/Logo";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { useAuthStore } from "@/store/authStore";
import { PROPERTY_CATEGORIES } from "@/utils/format";

const SECTOR_LINKS = [
  ...PROPERTY_CATEGORIES.map((c) => ({
    label: c.label,
    to: c.value === "construction_interior" ? "/construction" : `/properties?category=${c.value}`,
  })),
  { label: "All-in-One Documents", to: "/services" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [sectorsOpen, setSectorsOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const sectorRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();
  const isAuthed = !!accessToken && !!user;

  useEffect(() => {
    const handleClick = (e) => {
      if (sectorRef.current && !sectorRef.current.contains(e.target)) setSectorsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenu(false);
    navigate("/");
  };

  const dashboardPath =
    user?.role === "seller"
      ? "/seller/dashboard"
      : user?.role === "admin"
      ? "/admin/dashboard"
      : "/home";

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 bg-white border-b border-[#e6e4dd]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" data-testid="navbar-logo">
          <Logo size={32} />
          <div className="leading-tight">
            <div className="font-display font-bold text-lg text-[#0F2340]">
              VisitSarva
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#0D7A6B] font-medium">
              Zero Brokerage
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          <div className="relative" ref={sectorRef}>
            <button
              data-testid="nav-sectors-btn"
              onClick={() => setSectorsOpen((s) => !s)}
              className="text-sm text-[#1a1f2e] hover:text-[#0D7A6B] transition-colors flex items-center gap-1"
            >
              Sectors <ChevronDown size={13} className={`transition-transform ${sectorsOpen ? "rotate-180" : ""}`} />
            </button>
            {sectorsOpen && (
              <div
                data-testid="nav-sectors-panel"
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-[640px] bg-white border border-[#e6e4dd] rounded-lg shadow-xl p-3 grid grid-cols-2 gap-1"
              >
                {SECTOR_LINKS.map((s) => (
                  <Link
                    key={s.label}
                    to={s.to}
                    data-testid={`nav-sector-${s.label.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`}
                    onClick={() => setSectorsOpen(false)}
                    className="px-4 py-3 text-sm rounded-md hover:bg-[#fafaf7] hover:text-[#0D7A6B] transition-colors text-[#1a1f2e]"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/properties" className="text-sm text-[#1a1f2e] hover:text-[#0D7A6B] transition-colors">
            Browse
          </Link>
          <Link to="/construction" className="text-sm text-[#1a1f2e] hover:text-[#0D7A6B] transition-colors">
            Construction
          </Link>
          <Link to="/services" className="text-sm text-[#1a1f2e] hover:text-[#0D7A6B] transition-colors">
            Documents
          </Link>
          <Link to="/chat" className="text-sm text-[#1a1f2e] hover:text-[#0D7A6B] transition-colors flex items-center gap-1">
            <MessageCircle size={14} /> Assistant
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {!isAuthed ? (
            <>
              <Link to="/login" className="btn-outline" data-testid="nav-login">
                Login
              </Link>
              <Link to="/register" className="btn-primary" data-testid="nav-signup">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <NotificationsDropdown />
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setMenu((s) => !s)}
                  data-testid="user-menu-toggle"
                  className="flex items-center gap-2 px-3 py-2 border border-[#e6e4dd] rounded-md hover:border-[#0D7A6B]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0D7A6B] text-white text-xs flex items-center justify-center font-medium">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm">{user.name?.split(" ")[0]}</span>
                </button>
                {menu && (
                  <div
                    data-testid="user-menu"
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#e6e4dd] rounded-md shadow-lg overflow-hidden"
                  >
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenu(false)}
                      data-testid="menu-dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fafaf7]"
                    >
                      <LayoutDashboard size={15} className="text-[#0D7A6B]" />
                      Dashboard
                    </Link>
                    {user.role === "buyer" && (
                      <>
                        <Link to="/saved" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fafaf7]">
                          <Bookmark size={15} className="text-[#0D7A6B]" /> Saved
                        </Link>
                        <Link to="/enquiries" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fafaf7]">
                          <Inbox size={15} className="text-[#0D7A6B]" /> My Enquiries
                        </Link>
                      </>
                    )}
                    <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-[#5b6371] border-t border-[#e6e4dd]">
                      {user.role} · {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      data-testid="menu-logout"
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#fafaf7] border-t border-[#e6e4dd] text-[#c0392b]"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-[#0F2340]"
          onClick={() => setOpen((s) => !s)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#e6e4dd] bg-white">
          <div className="px-6 py-4 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
            <div className="text-[10px] uppercase tracking-wider text-[#5b6371] mt-2 mb-1">Sectors</div>
            {SECTOR_LINKS.map((s) => (
              <Link key={s.label} to={s.to} onClick={() => setOpen(false)} className="text-sm py-2 text-[#1a1f2e]">
                {s.label}
              </Link>
            ))}
            <Link to="/properties" onClick={() => setOpen(false)} className="text-sm py-2 border-t border-[#e6e4dd] mt-2 pt-3">Browse all</Link>
            <Link to="/construction" onClick={() => setOpen(false)} className="text-sm py-2">Construction</Link>
            <Link to="/services" onClick={() => setOpen(false)} className="text-sm py-2">Documents</Link>
            <Link to="/chat" onClick={() => setOpen(false)} className="text-sm py-2 flex items-center gap-2"><MessageCircle size={14} className="text-[#0D7A6B]" /> AI Assistant</Link>
            <div className="border-t border-[#e6e4dd] pt-3 flex flex-col gap-2">
              {!isAuthed ? (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline justify-center">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-center">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to={dashboardPath} onClick={() => setOpen(false)} className="btn-outline justify-center">
                    <User size={15} /> {user.name}
                  </Link>
                  <button onClick={handleLogout} className="btn-outline justify-center">
                    <LogOut size={15} /> Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
