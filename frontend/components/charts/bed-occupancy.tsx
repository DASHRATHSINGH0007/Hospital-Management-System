"use client";

import React from "react";
import { BedDouble, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function BedOccupancyWidget() {
  const stats = {
    total: 36,
    occupied: 28,
    available: 8,
    icuOccupied: 4,
    icuTotal: 5,
  };

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ward & Bed Occupancy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time monitored inpatient bed utilization</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            {occupancyRate}% In Use
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${(20 / stats.total) * 100}%` }}
              title="General Wards (20)"
            />
            <div
              className="bg-purple-600 h-full transition-all"
              style={{ width: `${(stats.icuOccupied / stats.total) * 100}%` }}
              title="ICU Occupied (4)"
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${(4 / stats.total) * 100}%` }}
              title="Private Suites (4)"
            />
          </div>
        </div>

        {/* Status Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              🛏️
            </div>
            <div>
              <p className="text-xs text-slate-500">Occupied Beds</p>
              <p className="text-base font-bold text-slate-900">{stats.occupied} / {stats.total}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-medium">Available Beds</p>
              <p className="text-base font-bold text-emerald-900">{stats.available} Available</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
              🚨
            </div>
            <div>
              <p className="text-xs text-rose-700 font-medium">ICU Beds</p>
              <p className="text-base font-bold text-rose-900">1 Available (4/5)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
              ⭐
            </div>
            <div>
              <p className="text-xs text-purple-700 font-medium">Private Suites</p>
              <p className="text-base font-bold text-purple-900">2 Available (4/6)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
