"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  consultation: number;
  pharmacy: number;
  lab: number;
  beds: number;
}

const mockRevenueData: MonthlyData[] = [
  { month: "Jun", consultation: 28400, pharmacy: 21200, lab: 18500, beds: 14200 },
  { month: "Jul", consultation: 31200, pharmacy: 23500, lab: 19800, beds: 15100 },
  { month: "Aug", consultation: 29800, pharmacy: 22800, lab: 21000, beds: 16400 },
  { month: "Sep", consultation: 34500, pharmacy: 25400, lab: 22500, beds: 17800 },
  { month: "Oct", consultation: 38200, pharmacy: 27900, lab: 24200, beds: 19500 },
  { month: "Nov", consultation: 41200, pharmacy: 29800, lab: 26100, beds: 21400 },
];

export function RevenueChart() {
  const maxVal = 120000;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Hospital Operational Revenue</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly revenue breakdown across key clinical departments</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span><span className="text-slate-600 font-medium">Consultations</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span><span className="text-slate-600 font-medium">Pharmacy</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span><span className="text-slate-600 font-medium">Laboratory</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span><span className="text-slate-600 font-medium">Inpatient Beds</span></span>
        </div>
      </div>

      <div className="mt-6 h-64 flex items-end justify-between space-x-4 pt-4">
        {mockRevenueData.map((d) => {
          const total = d.consultation + d.pharmacy + d.lab + d.beds;
          const heightPercent = Math.round((total / maxVal) * 100);

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="text-[10px] font-bold text-slate-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatCurrency(total)}
              </div>
              <div className="w-full max-w-[42px] rounded-xl overflow-hidden flex flex-col justify-end bg-slate-100 shadow-inner" style={{ height: `${heightPercent}%` }}>
                <div style={{ height: `${(d.beds / total) * 100}%` }} className="bg-amber-500 w-full" title={`Beds: ${formatCurrency(d.beds)}`} />
                <div style={{ height: `${(d.lab / total) * 100}%` }} className="bg-purple-500 w-full" title={`Lab: ${formatCurrency(d.lab)}`} />
                <div style={{ height: `${(d.pharmacy / total) * 100}%` }} className="bg-emerald-500 w-full" title={`Pharmacy: ${formatCurrency(d.pharmacy)}`} />
                <div style={{ height: `${(d.consultation / total) * 100}%` }} className="bg-blue-600 w-full" title={`Consultations: ${formatCurrency(d.consultation)}`} />
              </div>
              <span className="mt-3 text-xs font-bold text-slate-600">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
