import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Calculator, TrendingDown, DollarSign, Info } from "lucide-react";

const LOAN_MIN = 100000;   // ₹1 L
const LOAN_MAX = 100000000; // ₹10 Cr
const RATE_MIN = 1;
const RATE_MAX = 20;
const TENURE_MIN = 1;
const TENURE_MAX = 30;

const clamp = (v, min, max) => Math.min(Math.max(Number(v) || min, min), max);

/**
 * EMI Calculator modal/widget.
 * Can be used as an inline widget (inline=true) or as an accessible modal overlay
 * (triggered by isOpen/onClose). Supports Esc to close, focus trap, and ARIA dialog.
 */
const EMICalculator = ({ isOpen, onClose, inline = false }) => {
  const [loanAmount, setLoanAmount] = useState(5000000); // ₹50 L default
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  // Accessibility: focus management
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);

  // Focus first focusable element when modal opens; restore on close
  useEffect(() => {
    if (inline) return;
    if (isOpen) {
      // Small delay to let layout settle
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, inline]);

  // Esc to close
  useEffect(() => {
    if (inline || !isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, inline, onClose]);

  // Focus trap inside dialog
  useEffect(() => {
    if (inline || !isOpen || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    dialogRef.current.addEventListener("keydown", trap);
    return () => dialogRef.current?.removeEventListener("keydown", trap);
  }, [isOpen, inline]);

  const { emi, totalAmount, totalInterest } = useMemo(() => {
    const P = clamp(loanAmount, LOAN_MIN, LOAN_MAX);
    const R = clamp(interestRate, RATE_MIN, RATE_MAX) / 12 / 100;
    const N = clamp(tenureYears, TENURE_MIN, TENURE_MAX) * 12;
    if (P <= 0 || R <= 0 || N <= 0) return { emi: 0, totalAmount: 0, totalInterest: 0 };
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;
    return { emi, totalAmount, totalInterest };
  }, [loanAmount, interestRate, tenureYears]);

  const fmt = (n) => {
    if (!n || isNaN(n) || n <= 0) return "—";
    if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(2)} L`;
    return `₹ ${Math.round(n).toLocaleString("en-IN")}`;
  };

  // Clamp percentages so progress bar never overflows
  const principalPct = totalAmount > 0
    ? Math.min(100, Math.max(0, (loanAmount / totalAmount) * 100))
    : 0;
  const interestPct = Math.min(100, Math.max(0, 100 - principalPct));

  const handleLoanInput = (v) => {
    const n = Number(v);
    if (!isNaN(n)) setLoanAmount(Math.max(0, n)); // allow typing; clamp only in calc
  };

  const content = (
    <div
      className="p-6"
      data-testid="emi-calculator"
      ref={dialogRef}
      role={inline ? undefined : "dialog"}
      aria-modal={inline ? undefined : "true"}
      aria-labelledby="emi-calc-title"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D7A6B]/10 flex items-center justify-center">
            <Calculator size={16} className="text-[#0D7A6B]" aria-hidden="true" />
          </div>
          <h2 id="emi-calc-title" className="font-display text-lg font-semibold text-[#0F2340]">
            EMI Calculator
          </h2>
        </div>
        {!inline && onClose && (
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#fafaf7] text-[#5b6371]"
            aria-label="Close EMI Calculator"
            data-testid="emi-close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="emi-loan-slider" className="label mb-0">Loan Amount</label>
            <span className="text-sm font-semibold text-[#0D7A6B]" aria-live="polite">
              {fmt(loanAmount)}
            </span>
          </div>
          <input
            id="emi-loan-slider"
            type="range"
            min={LOAN_MIN}
            max={LOAN_MAX}
            step={100000}
            value={clamp(loanAmount, LOAN_MIN, LOAN_MAX)}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            aria-label="Loan amount slider"
            data-testid="emi-loan-amount-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5" aria-hidden="true">
            <span>₹1 L</span>
            <span>₹10 Cr</span>
          </div>
          <input
            type="number"
            className="input-field mt-2 !py-2 !text-sm"
            placeholder="Enter amount"
            value={loanAmount}
            min={LOAN_MIN}
            max={LOAN_MAX}
            onChange={(e) => handleLoanInput(e.target.value)}
            onBlur={(e) => setLoanAmount(clamp(e.target.value, LOAN_MIN, LOAN_MAX))}
            aria-label="Loan amount in rupees"
            data-testid="emi-loan-amount-input"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="emi-rate-slider" className="label mb-0">Interest Rate (p.a.)</label>
            <span className="text-sm font-semibold text-[#0D7A6B]" aria-live="polite">
              {interestRate}%
            </span>
          </div>
          <input
            id="emi-rate-slider"
            type="range"
            min={RATE_MIN}
            max={RATE_MAX}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            aria-label="Interest rate slider"
            data-testid="emi-rate-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5" aria-hidden="true">
            <span>{RATE_MIN}%</span>
            <span>{RATE_MAX}%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="emi-tenure-slider" className="label mb-0">Loan Tenure</label>
            <span className="text-sm font-semibold text-[#0D7A6B]" aria-live="polite">
              {tenureYears} yrs
            </span>
          </div>
          <input
            id="emi-tenure-slider"
            type="range"
            min={TENURE_MIN}
            max={TENURE_MAX}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            aria-label="Loan tenure slider"
            data-testid="emi-tenure-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5" aria-hidden="true">
            <span>{TENURE_MIN} yr</span>
            <span>{TENURE_MAX} yrs</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 p-4 rounded-xl bg-[#0F2340] text-white" aria-live="polite" aria-atomic="true">
        <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Monthly EMI</div>
        <div className="font-display text-2xl font-bold" data-testid="emi-result">
          {fmt(emi)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-1 uppercase tracking-wider">
              <DollarSign size={10} aria-hidden="true" /> Principal
            </div>
            <div className="text-sm font-semibold">{fmt(loanAmount)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-1 uppercase tracking-wider">
              <TrendingDown size={10} aria-hidden="true" /> Total Interest
            </div>
            <div className="text-sm font-semibold">{fmt(totalInterest)}</div>
          </div>
        </div>
        <div className="mt-3 bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/60">Total Payable</span>
            <span className="font-semibold">{fmt(totalAmount)}</span>
          </div>
          {/* Progress bar */}
          <div
            className="h-2 rounded-full bg-white/20 overflow-hidden flex"
            role="img"
            aria-label={`Principal ${principalPct.toFixed(0)}%, Interest ${interestPct.toFixed(0)}%`}
          >
            <div
              className="h-full bg-[#0D7A6B] transition-all duration-500"
              style={{ width: `${principalPct}%` }}
            />
            <div
              className="h-full bg-[#c89b5f] transition-all duration-500"
              style={{ width: `${interestPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/60 mt-1" aria-hidden="true">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#0D7A6B]" />
              Principal {principalPct.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c89b5f]" />
              Interest {interestPct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-[#5b6371] flex items-start gap-1.5">
        <Info size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
        Indicative figures only. Actual EMI may vary based on your bank's terms.
      </p>
    </div>
  );

  if (inline) return <div className="bg-white rounded-xl border border-[#e6e4dd]">{content}</div>;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        data-testid="emi-modal"
        aria-hidden="false"
      >
        {content}
      </div>
    </div>
  );
};

export default EMICalculator;
