"use client";

import React from "react";

const weeklyTraffic = [
  { day: "Mon", appointments: 48, walkIns: 18 },
  { day: "Tue", appointments: 42, walkIns: 14 },
  { day: "Wed", appointments: 39, walkIns: 12 },
  { day: "Thu", appointments: 36, walkIns: 15 },
  { day: "Fri", appointments: 44, walkIns: 20 },
  { day: "Sat", appointments: 25, walkIns: 9 },
  { day: "Sun", appointments: 16, walkIns: 7 },
];

export function PatientTrendChart() {
  const max = 70;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Patient Consultation Traffic</h3>
          <p className="text-xs text-slate-500 mt-0.5">Scheduled appointments vs walk-in admissions this week</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-slate-600 font-medium">Scheduled</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span><span className="text-slate-600 font-medium">Walk-ins</span></span>
        </div>
      </div>

      <div className="mt-6 h-56 flex items-end justify-between space-x-3">
        {weeklyTraffic.map((w) => {
          const appHeight = Math.round((w.appointments / max) * 100);
          const walkHeight = Math.round((w.walkIns / max) * 100);

          return (
            <div key={w.day} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="flex items-end space-x-1.5 h-full">
                <div
                  className="w-4 rounded-t-lg bg-blue-600 transition-all group-hover:bg-blue-700"
                  style={{ height: `${appHeight}%` }}
                  title={`${w.appointments} Scheduled`}
                />
                <div
                  className="w-4 rounded-t-lg bg-slate-300 transition-all group-hover:bg-slate-400"
                  style={{ height: `${walkHeight}%` }}
                  title={`${w.walkIns} Walk-ins`}
                />
              </div>
              <span className="mt-3 text-xs font-bold text-slate-500">{w.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
