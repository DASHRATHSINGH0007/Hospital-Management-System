"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  CreditCard,
  BedDouble,
  Briefcase,
  BrainCircuit,
  LogOut,
  Activity,
  ShieldCheck,
  User
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: "Admin Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { title: "AI Intelligence", href: "/ai-intelligence", icon: BrainCircuit, badge: "AI" },
  { title: "Doctor Workspace", href: "/dashboard/doctor", icon: UserCheck },
  { title: "Patient Directory", href: "/dashboard/receptionist", icon: Users },
  { title: "Appointments", href: "/dashboard/receptionist#appointments", icon: CalendarDays },
  { title: "Nurse & Wards", href: "/dashboard/nurse", icon: Activity },
  { title: "Beds Management", href: "/dashboard/beds", icon: BedDouble },
  { title: "Pharmacy Inventory", href: "/dashboard/pharmacy", icon: Pill, badge: "Stock" },
  { title: "Laboratory Tests", href: "/dashboard/laboratory", icon: FlaskConical },
  { title: "Billing & Invoices", href: "/dashboard/billing", icon: CreditCard },
  { title: "Staff & Rota", href: "/dashboard/staff", icon: Briefcase },
  { title: "Patient Portal", href: "/dashboard/patient", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between shadow-xl border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md mr-3">
            🏥
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-white">MediCore</span>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-md">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Enterprise Healthcare</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System Modules
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        isActive
                          ? "bg-blue-700 text-white"
                          : "bg-slate-800 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Session Footer & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Admin Eleanor</p>
              <p className="text-[10px] text-slate-400 truncate">Hospital Admin</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
