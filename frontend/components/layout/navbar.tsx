"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  UserCheck,
  ChevronDown,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const router = useRouter();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentRole, setCurrentRole] = useState("HOSPITAL_ADMIN");

  const rolesList = [
    { label: "Super Admin", role: "SUPER_ADMIN", path: "/dashboard/admin" },
    { label: "Hospital Admin", role: "HOSPITAL_ADMIN", path: "/dashboard/admin" },
    { label: "Doctor Portal", role: "DOCTOR", path: "/dashboard/doctor" },
    { label: "Reception Desk", role: "RECEPTIONIST", path: "/dashboard/receptionist" },
    { label: "Nurse Station", role: "NURSE", path: "/dashboard/nurse" },
    { label: "Pharmacy", role: "PHARMACIST", path: "/dashboard/pharmacy" },
    { label: "Laboratory", role: "LAB_TECHNICIAN", path: "/dashboard/laboratory" },
    { label: "Patient Portal", role: "PATIENT", path: "/dashboard/patient" },
  ];

  const [notifications, setNotifications] = useState([
    {
      id: "nt-1",
      title: "Pharmacy Low Stock",
      desc: "Paracetamol 500mg has 24 units remaining.",
      type: "warning",
      read: false,
    },
    {
      id: "nt-2",
      title: "ICU Bed Occupancy at 80%",
      desc: "Only 1 ICU bed currently available in West Wing.",
      type: "info",
      read: false,
    },
    {
      id: "nt-3",
      title: "Stat Lab Work Received",
      desc: "CBC Profile ready for Patient #PAT-10022.",
      type: "info",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRoleSwitch = (item: (typeof rolesList)[0]) => {
    setCurrentRole(item.role);
    setShowRoleMenu(false);
    router.push(item.path);
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patients, doctors, records, or bills..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-5">
        {/* Date & Campus */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Main Hospital Campus</span>
          <span className="text-slate-300">•</span>
          <span>{todayStr}</span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role: {currentRole.replace("_", " ")}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Operational Role
              </p>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSwitch(item)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                >
                  <span>{item.label}</span>
                  {currentRole === item.role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Hospital Alerts</span>
                {unreadCount > 0 ? (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">All caught up</span>
                )}
              </div>
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border flex items-start space-x-2.5 transition-all ${
                      n.read
                        ? "bg-slate-50/60 border-slate-100 opacity-75"
                        : n.type === "warning"
                        ? "bg-amber-50/70 border-amber-100"
                        : "bg-blue-50/70 border-blue-100"
                    }`}
                  >
                    {n.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
