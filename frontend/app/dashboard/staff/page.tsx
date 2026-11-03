"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Users,
  Clock,
  Search,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  Building2
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "OFF_DUTY";
}

const initialStaff: StaffMember[] = [
  { id: "stf-01", name: "Eleanor Vance", role: "Hospital Administrator", department: "Executive Operations", shift: "09:00 AM - 06:00 PM (Executive Admin)", phone: "+1 555-0002", email: "admin@medicore.com", status: "ACTIVE" },
  { id: "stf-02", name: "Clara Oswald", role: "Receptionist", department: "Front Desk & Intake", shift: "08:00 AM - 04:00 PM (Morning Rota)", phone: "+1 555-0201", email: "receptionist@medicore.com", status: "ACTIVE" },
  { id: "stf-03", name: "Rory Williams", role: "Inpatient Nurse", department: "General & ICU Care", shift: "07:00 AM - 03:00 PM (Day Shift)", phone: "+1 555-0301", email: "nurse@medicore.com", status: "ACTIVE" },
  { id: "stf-04", name: "Grace Hopper", role: "Head Pharmacist", department: "Central Pharmacy", shift: "09:00 AM - 05:00 PM (Dispensary Core)", phone: "+1 555-0401", email: "pharmacist@medicore.com", status: "ACTIVE" },
  { id: "stf-05", name: "Rosalind Franklin", role: "Laboratory Specialist", department: "Diagnostic Pathology", shift: "08:30 AM - 04:30 PM (Diagnostic Rota)", phone: "+1 555-0501", email: "labtech@medicore.com", status: "ACTIVE" },
  { id: "stf-06", name: "Sarah Davis", role: "Pediatric Consultant", department: "Pediatrics", shift: "08:30 AM - 12:30 PM (Clinic Hours)", phone: "+1 555-0103", email: "dr.davis@medicore.com", status: "OFF_DUTY" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Roster & Shift Schedules</h1>
            <Badge variant="default">HR Operations</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Clinical and administrative employee directory, department allocation, and rota management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Hospital Employees</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{staff.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            👥
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Currently On Duty</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {staff.filter((s) => s.status === "ACTIVE").length} Active
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Clinical Departments</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">5 Core Wards</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            🏥
          </div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Staff Directory</h3>
            <p className="text-xs text-slate-500">Employee role, contact info, and current scheduled shift</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name, department..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Staff Member</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Role Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Shift</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-blue-600">{s.role}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{s.department}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{s.shift}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{s.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "secondary"}>
                      {s.status === "ACTIVE" ? "● On Duty" : "○ Off Duty"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
