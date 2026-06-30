import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { INR } from "@/utils/format";

/**
 * EMICalculator — estimates home-loan EMI for a given property price.
 * Uses the standard reducing-balance (PMT) formula.
 */
const EMICalculator = ({ priceINR = 0 }) => {
  const [loanPct, setLoanPct] = useState(80); // % of property price to borrow
  const [rate, setRate] = useState(8.5);       // annual interest rate (%)
  const [tenure, setTenure] = useState(20);    // loan tenure in years

  const loanAmt = Math.round((priceINR * loanPct) / 100);
  const downPayment = priceINR - loanAmt;
  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;

  let emi = 0;
  if (monthlyRate > 0 && months > 0 && loanAmt > 0) {
    const factor = Math.pow(1 + monthlyRate, months);
    emi = Math.round((loanAmt * monthlyRate * factor) / (factor - 1));
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmt;
  const interestPct = totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-[#0D7A6B]" />
        <h3 className="font-display text-xl font-semibold text-[#0F2340]">
          EMI Calculator
        </h3>
      </div>

      <div className="space-y-5">
        {/* Loan % slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="label" style={{ marginBottom: 0 }}>
              Loan amount&nbsp;
              <span className="text-[#0D7A6B]">({loanPct}% of price)</span>
            </span>
            <span className="text-sm font-semibold text-[#0D7A6B]">{INR(loanAmt)}</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            value={loanPct}
            onChange={(e) => setLoanPct(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
          />
          <div className="flex justify-between text-xs text-[#5b6371] mt-1">
            <span>Down payment: {INR(downPayment)}</span>
            <span>Loan: {INR(loanAmt)}</span>
          </div>
        </div>

        {/* Interest rate slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="label" style={{ marginBottom: 0 }}>
              Interest rate&nbsp;
              <span className="text-[#0D7A6B]">(per year)</span>
            </span>
            <span className="text-sm font-semibold text-[#0D7A6B]">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
          />
          <div className="flex justify-between text-xs text-[#5b6371] mt-1">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="label" style={{ marginBottom: 0 }}>
              Loan tenure
            </span>
            <span className="text-sm font-semibold text-[#0D7A6B]">
              {tenure} {tenure === 1 ? "year" : "years"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-[#0D7A6B]"
          />
          <div className="flex justify-between text-xs text-[#5b6371] mt-1">
            <span>1 yr</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="mt-5 rounded-lg bg-[#0D7A6B]/5 border border-[#0D7A6B]/20 p-4">
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-wider text-[#0D7A6B] mb-0.5">
            Monthly EMI
          </div>
          <div className="font-display text-3xl font-bold text-[#0F2340]">
            {emi > 0 ? INR(emi) : "—"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-3 text-center border border-[#e6e4dd]">
            <div className="text-xs text-[#5b6371]">Principal</div>
            <div className="font-semibold text-[#0F2340]">{INR(loanAmt)}</div>
          </div>
          <div className="bg-white rounded p-3 text-center border border-[#e6e4dd]">
            <div className="text-xs text-[#5b6371]">Total interest</div>
            <div className="font-semibold text-red-500">{INR(totalInterest)}</div>
          </div>
          <div className="bg-white rounded p-3 text-center border border-[#e6e4dd] col-span-2">
            <div className="text-xs text-[#5b6371]">
              Total payment&nbsp;
              {interestPct > 0 && (
                <span>({interestPct}% is interest)</span>
              )}
            </div>
            <div className="font-semibold text-[#0F2340]">{INR(totalPayment)}</div>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#5b6371] text-center">
          Estimates based on reducing-balance method. Actual rates depend on your lender &amp; profile.
        </p>
      </div>
    </div>
  );
};

export default EMICalculator;
