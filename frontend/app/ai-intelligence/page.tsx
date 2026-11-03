"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  Pill,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  IndianRupee
} from "lucide-react";

interface DemandDay {
  date: string;
  day: string;
  predicted: number;
  lower: number;
  upper: number;
}

const mockDemandForecast: DemandDay[] = [
  { date: "2026-11-04", day: "Wed", predicted: 44, lower: 39, upper: 49 },
  { date: "2026-11-05", day: "Thu", predicted: 42, lower: 37, upper: 47 },
  { date: "2026-11-06", day: "Fri", predicted: 48, lower: 42, upper: 53 },
  { date: "2026-11-07", day: "Sat", predicted: 26, lower: 21, upper: 31 },
  { date: "2026-11-08", day: "Sun", predicted: 18, lower: 13, upper: 23 },
  { date: "2026-11-09", day: "Mon", predicted: 56, lower: 50, upper: 62 },
  { date: "2026-11-10", day: "Tue", predicted: 51, lower: 45, upper: 57 },
  { date: "2026-11-11", day: "Wed", predicted: 45, lower: 40, upper: 51 },
  { date: "2026-11-12", day: "Thu", predicted: 43, lower: 38, upper: 49 },
  { date: "2026-11-13", day: "Fri", predicted: 49, lower: 44, upper: 55 },
];

const mockRevenueProjection = [
  { month: "Dec 2026", projected: 122400, growth: "+3.2%" },
  { month: "Jan 2027", projected: 126300, growth: "+3.2%" },
  { month: "Feb 2027", projected: 130350, growth: "+3.2%" },
  { month: "Mar 2027", projected: 134520, growth: "+3.2%" },
  { month: "Apr 2027", projected: 138820, growth: "+3.2%" },
  { month: "May 2027", projected: 143260, growth: "+3.2%" },
];

const mockStockPredictions = [
  { name: "Paracetamol (500mg)", currentStock: 24, dailyUsage: 12, daysLeft: 2.0, risk: "CRITICAL", reorder: 76 },
  { name: "Amoxicillin (250mg)", currentStock: 18, dailyUsage: 6, daysLeft: 3.0, risk: "HIGH", reorder: 62 },
  { name: "Atorvastatin (20mg)", currentStock: 95, dailyUsage: 14, daysLeft: 6.8, risk: "MEDIUM", reorder: 0 },
  { name: "Ibuprofen (400mg)", currentStock: 120, dailyUsage: 10, daysLeft: 12.0, risk: "LOW", reorder: 0 },
  { name: "Aspirin (100mg)", currentStock: 150, dailyUsage: 8, daysLeft: 18.7, risk: "LOW", reorder: 0 },
  { name: "Metformin (500mg)", currentStock: 210, dailyUsage: 9, daysLeft: 23.3, risk: "LOW", reorder: 0 },
];

export default function AiIntelligencePage() {
  const [horizon, setHorizon] = useState<"10d" | "30d">("10d");
  const maxDemand = 70;

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Applied Machine Learning • Scikit-Learn Regression</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Operational Intelligence</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Predictive demand forecasting, revenue estimation, and automated inventory depletion horizons.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setHorizon("10d")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              horizon === "10d" ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            10-Day Outlook
          </button>
          <button
            onClick={() => setHorizon("30d")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              horizon === "30d" ? "bg-blue-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            30-Day Outlook
          </button>
        </div>
      </div>

      {/* Compliance / Scope Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start space-x-3 text-xs text-blue-900">
        <BrainCircuit className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Healthcare Operational Intelligence Policy:</span> All AI models deployed in MediCore generate operational, logistical, and financial forecasts exclusively. The AI does not perform medical diagnosis, automated drug dosage changes, or triage prioritization.
        </div>
      </div>

      {/* Section 1: Appointment Demand Forecasting Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Patient Consultation Demand Forecast</h3>
            <p className="text-xs text-slate-500 mt-0.5">Projected patient influx using seasonal trend decomposition with 95% confidence intervals</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-slate-600 font-medium">Predicted Appointments</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span><span className="text-slate-600 font-medium">Confidence Interval</span></span>
          </div>
        </div>

        <div className="mt-8 h-64 flex items-end justify-between space-x-3">
          {mockDemandForecast.map((d) => {
            const barHeight = Math.round((d.predicted / maxDemand) * 100);
            const isPeak = d.predicted >= 50;

            return (
              <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className={`text-[11px] font-extrabold mb-1.5 ${isPeak ? "text-indigo-600" : "text-slate-600"}`}>
                  {d.predicted}
                </span>

                {/* Bar with confidence interval indicator */}
                <div className="w-full max-w-[36px] flex flex-col items-center justify-end h-full">
                  <div
                    className={`w-full rounded-t-xl transition-all shadow-sm ${
                      isPeak
                        ? "bg-gradient-to-t from-blue-700 to-indigo-600 group-hover:from-blue-800"
                        : "bg-gradient-to-t from-blue-500 to-blue-400 group-hover:from-blue-600"
                    }`}
                    style={{ height: `${barHeight}%` }}
                    title={`Predicted: ${d.predicted} (Range: ${d.lower} - ${d.upper})`}
                  />
                </div>

                <span className="mt-3 text-xs font-bold text-slate-700">{d.day}</span>
                <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Revenue Forecasting & Inventory Depletion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Projection */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Hospital Revenue Forecast (6 Months)</h3>
              </div>
              <Badge variant="success">Trend: +3.2% MoM</Badge>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {mockRevenueProjection.map((m) => (
                <div key={m.month} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      📈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.month}</p>
                      <p className="text-[10px] text-slate-400">Baseline Multi-Variable Model</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">{formatCurrency(m.projected)}</p>
                    <span className="text-[10px] font-bold text-emerald-600">{m.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medicine Depletion Radar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Medicine Stockout Risk Radar</h3>
              </div>
              <Badge variant="warning">Inventory AI</Badge>
            </div>

            <div className="mt-4 space-y-2.5">
              {mockStockPredictions.map((med) => {
                const isCrit = med.risk === "CRITICAL";
                const isHigh = med.risk === "HIGH";

                return (
                  <div
                    key={med.name}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isCrit
                        ? "bg-rose-50/70 border-rose-200"
                        : isHigh
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.currentStock} units • Usage: ~{med.dailyUsage}/day
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isCrit
                            ? "bg-rose-200 text-rose-900"
                            : isHigh
                            ? "bg-amber-200 text-amber-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {med.daysLeft} days left
                      </span>
                      {med.reorder > 0 && (
                        <p className="text-[10px] font-bold text-rose-700 mt-1">
                          Reorder: +{med.reorder} units
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: AI Operational Recommendations */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">AI-Generated Operational Recommendations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Synthesized actionable insights across human resources, clinical scheduling, and supply chain</p>
          </div>
          <Badge variant="purple">Autonomous Synthesis</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="warning">Staffing Latency</Badge>
                <span className="text-[10px] font-bold text-amber-800">Priority: Medium</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Intake Queue Surge Expected on Monday</h4>
              <p className="text-xs text-slate-600">
                Model forecasts 56 appointments next Monday (33% above average). Recommend scheduling an auxiliary receptionist between 09:30 AM and 12:00 PM.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="destructive">Critical Stockout</Badge>
                <span className="text-[10px] font-bold text-rose-800">Priority: High</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Paracetamol & Amoxicillin Depletion in 48h</h4>
              <p className="text-xs text-slate-600">
                Daily dispensary consumption rates will exhaust safety thresholds in 2.0 days. Automated purchase orders recommended for 76 and 62 units respectively.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">Department Utilization</Badge>
                <span className="text-[10px] font-bold text-blue-800">Priority: Low</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Cardiology Capacity at 92%</h4>
              <p className="text-xs text-slate-600">
                Dr. John Smith's morning consultation slots are booked to maximum capacity. Open an additional 2-hour afternoon slot on Wednesdays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
