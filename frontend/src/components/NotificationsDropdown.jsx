import React, { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/client";

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const unread = items.filter((n) => !n.is_read).length;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setItems(data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, []);

  const markRead = async (n) => {
    try {
      await api.put(`/notifications/${n.id}/read`);
      setItems((s) => s.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/read-all");
      setItems((s) => s.map((x) => ({ ...x, is_read: true })));
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        data-testid="notif-toggle"
        className="relative w-9 h-9 border border-[#e6e4dd] hover:border-[#0D7A6B] rounded-md flex items-center justify-center text-[#5b6371] hover:text-[#0D7A6B] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span
            data-testid="notif-badge"
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0D7A6B] text-white text-[10px] flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          data-testid="notif-panel"
          className="absolute right-0 mt-2 w-80 bg-white border border-[#e6e4dd] rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e6e4dd]">
            <div className="font-display font-semibold text-[#0F2340]">Notifications</div>
            {unread > 0 && (
              <button onClick={markAll} data-testid="notif-mark-all" className="text-xs text-[#0D7A6B] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 size={16} className="animate-spin text-[#0D7A6B]" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#5b6371]">
                You're all caught up.
              </div>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || "#"}
                  onClick={() => {
                    markRead(n);
                    setOpen(false);
                  }}
                  data-testid={`notif-item-${n.id}`}
                  className={`block px-4 py-3 border-b border-[#e6e4dd] hover:bg-[#fafaf7] ${
                    !n.is_read ? "bg-[#0D7A6B]/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0D7A6B] shrink-0" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#0F2340]">{n.title}</div>
                      <div className="text-xs text-[#5b6371] mt-0.5">{n.body}</div>
                      <div className="text-[10px] text-[#5b6371] mt-1">
                        {new Date(n.created_at).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
