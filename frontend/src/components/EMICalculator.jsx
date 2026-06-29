import React, { useState, useMemo } from "react";
import { X, Calculator, TrendingDown, DollarSign, Info } from "lucide-react";

/**
 * EMI Calculator modal/widget.
 * Can be used as an inline widget (inline=true) or modal overlay (triggered by isOpen/onClose).
 */
const EMICalculator = ({ isOpen, onClose, inline = false }) => {
  const [loanAmount, setLoanAmount] = useState(5000000); // ₹50 L default
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const { emi, totalAmount, totalInterest } = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const R = (Number(interestRate) || 0) / 12 / 100;
    const N = (Number(tenureYears) || 0) * 12;
    if (P <= 0 || R <= 0 || N <= 0) return { emi: 0, totalAmount: 0, totalInterest: 0 };
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;
    return { emi, totalAmount, totalInterest };
  }, [loanAmount, interestRate, tenureYears]);

  const fmt = (n) => {
    if (!n || isNaN(n)) return "—";
    if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(2)} L`;
    return `₹ ${Math.round(n).toLocaleString("en-IN")}`;
  };

  const principalPct = totalAmount > 0 ? (loanAmount / totalAmount) * 100 : 0;
  const interestPct = 100 - principalPct;

  const content = (
    <div className="p-6" data-testid="emi-calculator">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D7A6B]/10 flex items-center justify-center">
            <Calculator size={16} className="text-[#0D7A6B]" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#0F2340]">
            EMI Calculator
          </h2>
        </div>
        {!inline && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#fafaf7] text-[#5b6371]"
            aria-label="Close"
            data-testid="emi-close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Loan Amount</label>
            <span className="text-sm font-semibold text-[#0D7A6B]">{fmt(loanAmount)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={100000000}
            step={100000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            data-testid="emi-loan-amount-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5">
            <span>₹5 L</span>
            <span>₹10 Cr</span>
          </div>
          <input
            type="number"
            className="input-field mt-2 !py-2 !text-sm"
            placeholder="Enter amount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            data-testid="emi-loan-amount-input"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Interest Rate (p.a.)</label>
            <span className="text-sm font-semibold text-[#0D7A6B]">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            data-testid="emi-rate-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label mb-0">Loan Tenure</label>
            <span className="text-sm font-semibold text-[#0D7A6B]">{tenureYears} yrs</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
            data-testid="emi-tenure-slider"
          />
          <div className="flex justify-between text-[10px] text-[#5b6371] mt-0.5">
            <span>1 yr</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 p-4 rounded-xl bg-[#0F2340] text-white">
        <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Monthly EMI</div>
        <div className="font-display text-2xl font-bold" data-testid="emi-result">
          {fmt(emi)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-1 uppercase tracking-wider">
              <DollarSign size={10} /> Principal
            </div>
            <div className="text-sm font-semibold">{fmt(loanAmount)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60 mb-1 uppercase tracking-wider">
              <TrendingDown size={10} /> Total Interest
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
          <div className="h-2 rounded-full bg-white/20 overflow-hidden flex">
            <div
              className="h-full bg-[#0D7A6B] transition-all duration-500"
              style={{ width: `${principalPct}%` }}
            />
            <div
              className="h-full bg-[#c89b5f] transition-all duration-500"
              style={{ width: `${interestPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/60 mt-1">
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
        <Info size={11} className="mt-0.5 shrink-0" />
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
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        data-testid="emi-modal"
      >
        {content}
      </div>
    </div>
  );
};

export default EMICalculator;
