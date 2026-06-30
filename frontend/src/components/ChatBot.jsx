import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, RotateCcw } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "@/api/client";
import { useAuthStore } from "@/store/authStore";

const WELCOME = "Hi! 👋 I'm the VisitSarva assistant. I can help you find properties, answer questions about listings, explain our zero-brokerage model, or walk you through our services. How can I help you today?";

const SUGGESTED = [
  "Show me 2 BHK flats under ₹60 lakhs",
  "How does zero brokerage work?",
  "What documents do I need to buy a property?",
  "Tell me about verified listings",
];

function BotMessage({ text, typing }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0D7A6B] flex items-center justify-center">
        <Bot size={14} className="text-white" />
      </div>
      <div className="max-w-[80%] bg-white border border-[#e6e4dd] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#0F2340] leading-relaxed shadow-sm">
        {typing ? (
          <span className="flex gap-1 items-center py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A6B]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A6B]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A6B]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex items-start gap-2 flex-row-reverse">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0F2340] flex items-center justify-center">
        <User size={14} className="text-white" />
      </div>
      <div className="max-w-[80%] bg-[#0D7A6B] text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

export default function ChatBot({ forceOpen = false, fullPage = false }) {
  const [open, setOpen] = useState(forceOpen || fullPage);
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();
  const location = useLocation();

  // Hide floating bubble on dedicated /chat page
  const isChatPage = location.pathname === "/chat";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    // Optimistic typing indicator
    setMessages((prev) => [...prev, { role: "bot", text: "", typing: true }]);

    try {
      const userContext = user
        ? { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
        : null;

      const { data } = await api.post("/chat/message", {
        message: trimmed,
        session_id: sessionId,
        user_context: userContext,
      });

      if (!sessionId) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove typing indicator
        { role: "bot", text: data.reply },
      ]);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Sorry, I couldn't connect to the assistant right now. Please try again in a moment.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "bot", text: detail },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([{ role: "bot", text: WELCOME }]);
    setSessionId(null);
    setInput("");
  };

  // ── Full-page mode ──────────────────────────────────────────────────────
  if (fullPage) {
    return (
      <div className="flex flex-col h-full">
        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          loading={loading}
          onSend={() => sendMessage(input)}
          onKeyDown={handleKeyDown}
          onSuggest={sendMessage}
          onReset={resetChat}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          fullPage
        />
      </div>
    );
  }

  // ── Floating bubble mode ────────────────────────────────────────────────
  if (isChatPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div
          className="w-[360px] max-h-[560px] flex flex-col bg-[#fafaf7] rounded-2xl shadow-2xl border border-[#e6e4dd] overflow-hidden"
          style={{ animation: "slideUp 0.2s ease" }}
          role="dialog"
          aria-label="VisitSarva chatbot"
          aria-modal="false"
        >
          {/* Header */}
          <div className="bg-[#0D7A6B] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">VisitSarva Assistant</div>
                <div className="text-white/70 text-[10px]">Property search & support</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <ChatWindow
            messages={messages}
            input={input}
            setInput={setInput}
            loading={loading}
            onSend={() => sendMessage(input)}
            onKeyDown={handleKeyDown}
            onSuggest={sendMessage}
            onReset={resetChat}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
          />
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-[#0D7A6B] hover:bg-[#0a5e52] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
        style={{ boxShadow: "0 4px 24px rgba(13,122,107,0.4)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Shared chat window ──────────────────────────────────────────────────────
function ChatWindow({
  messages, input, setInput, loading,
  onSend, onKeyDown, onSuggest, messagesEndRef, inputRef, fullPage,
}) {
  const showSuggestions = messages.length === 1; // only the welcome message

  return (
    <>
      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${fullPage ? "min-h-0" : "max-h-[380px]"}`}>
        {messages.map((msg, i) =>
          msg.role === "bot" ? (
            <BotMessage key={i} text={msg.text} typing={msg.typing} />
          ) : (
            <UserMessage key={i} text={msg.text} />
          )
        )}

        {/* Suggested prompts */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => onSuggest(s)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-[#0D7A6B]/30 text-[#0D7A6B] hover:bg-[#0D7A6B]/5 transition-colors leading-tight text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e6e4dd] px-3 py-3 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about properties, pricing, documents…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#e6e4dd] px-3.5 py-2.5 text-sm text-[#0F2340] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0D7A6B]/30 focus:border-[#0D7A6B] transition-colors bg-[#fafaf7]"
            style={{ maxHeight: 96, overflowY: "auto" }}
            disabled={loading}
            aria-label="Chat message input"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0D7A6B] hover:bg-[#0a5e52] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-[#9ca3af] mt-2 text-center">
          Powered by VisitSarva AI · Zero brokerage platform
        </p>
      </div>
    </>
  );
}
