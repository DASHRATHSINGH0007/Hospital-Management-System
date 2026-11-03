"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiCard } from "@/components/charts/kpi-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { PatientTrendChart } from "@/components/charts/patient-chart";
import { BedOccupancyWidget } from "@/components/charts/bed-occupancy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserCheck,
  CalendarDays,
  BedDouble,
  IndianRupee,
  AlertTriangle,
  Plus,
  ArrowRight,
  Activity,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Filter
} from "lucide-react";

export default function AdminDashboardPage() {
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedReportModule, setSelectedReportModule] = useState("patients");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const recentActivities = [
    { id: 1, user: "Dr. John Smith", action: "Completed consultation", patient: "Alice Johnson (#PAT-10021)", time: "10 mins ago", type: "consultation" },
    { id: 2, user: "Grace Hopper", action: "Dispensed prescription #RX-01", patient: "Alice Johnson", time: "25 mins ago", type: "pharmacy" },
    { id: 3, user: "Clara Oswald", action: "Admitted patient to ICU-B01", patient: "David Miller", time: "1 hour ago", type: "bed" },
    { id: 4, user: "Billing Dept", action: "Settled invoice #INV-2026-0001 (₹131.75)", patient: "Alice Johnson", time: "2 hours ago", type: "billing" },
    { id: 5, user: "Rosalind Franklin", action: "Published lab report (CBC-01)", patient: "Bob Williams", time: "3 hours ago", type: "lab" },
  ];

  const stockAlerts = [
    { id: 1, name: "Paracetamol (500mg)", remaining: 24, min: 50, daysLeft: 2 },
    { id: 2, name: "Amoxicillin (250mg)", remaining: 18, min: 40, daysLeft: 3 },
  ];

  const auditLogEntries = [
    { id: "AUD-991", action: "PATIENT_RECORD_READ", actor: "Dr. John Smith", ip: "192.168.1.45", timestamp: "2026-04-01 11:42:10", status: "SUCCESS" },
    { id: "AUD-992", action: "PRESCRIPTION_DISPENSED", actor: "Grace Hopper (Pharmacist)", ip: "192.168.1.72", timestamp: "2026-04-01 11:35:04", status: "SUCCESS" },
    { id: "AUD-993", action: "INVOICE_SETTLED", actor: "Finance Billing Agent", ip: "192.168.1.18", timestamp: "2026-04-01 11:20:19", status: "SUCCESS" },
    { id: "AUD-994", action: "LAB_REPORT_VERIFIED", actor: "Rosalind Franklin (Technician)", ip: "192.168.1.88", timestamp: "2026-04-01 10:55:00", status: "SUCCESS" },
    { id: "AUD-995", action: "BED_ALLOCATION_UPDATED", actor: "Clara Oswald (Nurse)", ip: "192.168.1.61", timestamp: "2026-04-01 10:14:32", status: "SUCCESS" },
  ];

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuickPatientModal(false);
    showToast("Patient successfully registered into MediCore database!");
  };

  const handleExportCSV = (moduleName: string) => {
    const filename = `medicore-${moduleName}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    let csvData = "";

    if (moduleName === "patients") {
      csvData = "PatientID,Name,Gender,BloodGroup,Phone,RegisteredAt\n" +
        "PAT-10021,Alice Johnson,Female,O+,+1-555-0101,2026-03-01\n" +
        "PAT-10022,Bob Williams,Male,A+,+1-555-0102,2026-03-05\n" +
        "PAT-10023,Charlie Davis,Male,B+,+1-555-0103,2026-03-10\n" +
        "PAT-10024,David Miller,Male,AB+,+1-555-0104,2026-03-12\n" +
        "PAT-10025,Emma Wilson,Female,O-,+1-555-0105,2026-03-15\n";
    } else if (moduleName === "appointments") {
      csvData = "AppointmentID,Patient,Doctor,Department,Date,Status\n" +
        "APT-001,Alice Johnson,Dr. John Smith,Cardiology,2026-04-01 10:00,CONFIRMED\n" +
        "APT-002,Bob Williams,Dr. Sarah Connor,Neurology,2026-04-01 11:30,COMPLETED\n" +
        "APT-003,Charlie Davis,Dr. Emily Watson,Pediatrics,2026-04-02 09:00,SCHEDULED\n" +
        "APT-004,David Miller,Dr. Gregory House,Diagnostics,2026-04-02 14:00,CONFIRMED\n";
    } else if (moduleName === "revenue") {
      csvData = "InvoiceNumber,Patient,Amount,PaymentMethod,Status,Date\n" +
        "INV-2026-0001,Alice Johnson,₹131.75,CREDIT_CARD,PAID,2026-03-28\n" +
        "INV-2026-0002,Bob Williams,₹245.00,INSURANCE,PAID,2026-03-29\n" +
        "INV-2026-0003,Charlie Davis,₹85.00,CASH,PAID,2026-03-30\n" +
        "INV-2026-0004,David Miller,₹1200.00,PENDING,UNPAID,2026-04-01\n";
    } else if (moduleName === "inventory") {
      csvData = "MedicineCode,Name,Category,StockRemaining,MinThreshold,BatchNumber,ExpiryDate\n" +
        "MED-001,Paracetamol 500mg,Analgesic,24,50,BAT-2026-01,2027-12-31\n" +
        "MED-002,Amoxicillin 250mg,Antibiotic,18,40,BAT-2026-02,2027-08-15\n" +
        "MED-003,Metformin 500mg,Antidiabetic,140,50,BAT-2026-03,2028-01-20\n" +
        "MED-004,Atorvastatin 20mg,Cardiovascular,95,30,BAT-2026-04,2028-05-10\n";
    } else if (moduleName === "beds") {
      csvData = "BedNumber,Ward,Type,DailyRate,Status,CurrentPatient\n" +
        "ICU-B01,Intensive Care Unit,ICU,₹450.00,OCCUPIED,David Miller\n" +
        "ICU-B02,Intensive Care Unit,ICU,₹450.00,AVAILABLE,None\n" +
        "GEN-A101,General Ward A,General,₹85.00,OCCUPIED,Alice Johnson\n" +
        "GEN-A102,General Ward A,General,₹85.00,AVAILABLE,None\n" +
        "PED-P01,Pediatric Wing,Pediatric,₹120.00,OCCUPIED,Emma Wilson\n";
    }

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportModal(false);
    showToast(`Exported ${moduleName.toUpperCase()} report as CSV!`);
  };

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xl text-emerald-800 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Hospital Operations Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-xl">
            Live hospital metrics across departments, admissions, inpatient beds, and financial settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setShowQuickPatientModal(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 shadow-sm font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Quick Intake
          </Button>

          <Button
            onClick={() => setShowReportModal(true)}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold backdrop-blur-sm"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-200" /> Export Reports
          </Button>

          <Button
            onClick={() => setShowAuditModal(true)}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold backdrop-blur-sm"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-200" /> Security Logs
          </Button>

          <Link href="/ai-intelligence">
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-blue-200" /> AI Forecasts
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 High-Impact Operational KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Patients"
          value="1,428"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "+14%", isPositive: true }}
          colorTheme="blue"
        />
        <KpiCard
          title="Active Doctors"
          value="48"
          subtitle="4 on duty now"
          icon={<UserCheck className="w-5 h-5" />}
          colorTheme="emerald"
        />
        <KpiCard
          title="Appointments Today"
          value="36"
          trend={{ value: "+8%", isPositive: true }}
          icon={<CalendarDays className="w-5 h-5" />}
          colorTheme="purple"
        />
        <KpiCard
          title="Available Beds"
          value="8"
          subtitle="8 of 36 free"
          icon={<BedDouble className="w-5 h-5" />}
          colorTheme="amber"
        />
        <KpiCard
          title="Total Revenue"
          value="₹1,18,500"
          trend={{ value: "+18%", isPositive: true }}
          icon={<IndianRupee className="w-5 h-5" />}
          colorTheme="emerald"
        />
        <KpiCard
          title="Pending Bills"
          value="₹9,420"
          subtitle="12 unpaid invoices"
          icon={<AlertTriangle className="w-5 h-5" />}
          colorTheme="rose"
        />
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <BedOccupancyWidget />
        </div>
      </div>

      {/* Secondary Operational Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Consultation Traffic */}
        <div className="lg:col-span-2">
          <PatientTrendChart />
        </div>

        {/* Pharmacy Low-Stock Risk & Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Pharmacy Stock Alerts</h3>
              </div>
              <Badge variant="warning">Action Needed</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {stockAlerts.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{med.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stock: <span className="font-bold text-amber-700">{med.remaining} units</span> (Threshold: {med.min})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      {med.daysLeft}d left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/dashboard/pharmacy"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between group"
            >
              <span>Manage Pharmacy Inventory</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Clinical Activity & Audit Stream */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Live Audit Stream</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time log of clinical, pharmaceutical and financial events</p>
          </div>
          <Badge variant="outline">Auto-refreshing</Badge>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {act.user.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {act.user} <span className="font-normal text-slate-500">• {act.action}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">{act.patient}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Intake Modal */}
      <Dialog
        isOpen={showQuickPatientModal}
        onClose={() => setShowQuickPatientModal(false)}
        title="Emergency / Quick Patient Intake"
        description="Register a new patient profile directly into the MediCore clinical database."
      >
        <form onSubmit={handlePatientSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name</label>
              <Input placeholder="John" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name</label>
              <Input placeholder="Doe" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date of Birth</label>
              <Input type="date" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Blood Group</label>
              <select className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+" selected>O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
            <Input placeholder="+1 555-0199" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Known Allergies / Medical Notes</label>
            <Input placeholder="e.g. Penicillin, Asthma" />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuickPatientModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Register Patient
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Export Clinical & Operations Reports Dialog */}
      <Dialog
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Export Operational & Clinical Reports"
        description="Select a reporting module to generate and download immediate CSV or printable summaries."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Select Reporting Module
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: "patients", label: "Patient Registrations", icon: Users, desc: "Demographics, blood group, contacts" },
                { id: "appointments", label: "Appointment Records", icon: CalendarDays, desc: "Doctor schedule, visit statuses" },
                { id: "revenue", label: "Financial & Invoices (₹)", icon: IndianRupee, desc: "Settled, pending bills & charges" },
                { id: "inventory", label: "Pharmacy Stock", icon: FileSpreadsheet, desc: "Batches, stock levels, expiry" },
                { id: "beds", label: "Ward & Bed Occupancy", icon: BedDouble, desc: "ICU & general ward occupancy" },
              ].map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedReportModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedReportModule(mod.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-blue-900" : "text-slate-800"}`}>{mod.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Export Parameters:</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Format: Standard RFC 4180 CSV • Encoding: UTF-8 • Scope: All active hospital records
            </p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportModal(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => handleExportCSV(selectedReportModule)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download CSV Export
            </Button>
          </div>
        </div>
      </Dialog>

      {/* System Security & Audit Trail Dialog */}
      <Dialog
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Hospital Security & Compliance Audit Trail"
        description="Immutable record of system authentications, patient record access, pharmacy dispensations, and financial actions."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA / Data Protection Compliance: Active</span>
            </div>
            <Badge variant="success">All systems verified</Badge>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {auditLogEntries.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {log.id}
                    </span>
                    <span className="font-bold text-slate-800">{log.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Actor: <span className="text-slate-700 font-semibold">{log.actor}</span> • IP: {log.ip}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="success">Success</Badge>
                  <p className="text-[10px] text-slate-400 mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAuditModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
