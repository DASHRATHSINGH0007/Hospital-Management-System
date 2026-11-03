import React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    period?: string;
  };
  colorTheme?: "blue" | "emerald" | "amber" | "purple" | "rose";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorTheme = "blue",
}: KpiCardProps) {
  const themeStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-transform group-hover:scale-105",
            themeStyles[colorTheme]
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-50">
        {trend ? (
          <div className="flex items-center space-x-1.5">
            <span
              className={cn(
                "font-bold px-1.5 py-0.5 rounded-md text-[11px]",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-slate-400">{trend.period || "vs last month"}</span>
          </div>
        ) : (
          <span className="text-slate-400">{subtitle || "Real-time sync"}</span>
        )}
      </div>
    </div>
  );
}
