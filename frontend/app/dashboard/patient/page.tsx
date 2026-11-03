"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  User,
  Heart,
  Pill,
  CalendarDays,
  FileText,
  CreditCard,
  Download,
  Clock,
  AlertCircle,
  Plus,
  Activity,
  CheckCircle2
} from "lucide-react";

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState<"prescriptions" | "records" | "appointments" | "bills">("prescriptions");
  const [showBookModal, setShowBookModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const patient = {
    name: "Alice Johnson",
    code: "PAT-10021",
    age: 34,
    gender: "Female",
    bloodGroup: "A+",
    allergies: "Penicillin, Latex",
    phone: "+1 555-0601",
    email: "alice@medicore.com",
    emergencyContact: "+1 555-9988 (Husband: Mark)",
  };

  const prescriptions = [
    {
      id: "RX-401",
      doctorName: "Dr. John Smith",
      specialty: "Cardiology",
      date: "2026-10-25",
      status: "DISPENSED",
      notes: "Take after breakfast with water. Avoid grapefruit.",
      items: [
        { medicine: "Aspirin (100mg)", dosage: "1 tablet", frequency: "Once daily after breakfast", duration: "30 days" },
        { medicine: "Atorvastatin (20mg)", dosage: "1 tablet", frequency: "Once at bedtime", duration: "30 days" },
      ],
    },
    {
      id: "RX-402",
      doctorName: "Dr. Emily Jones",
      specialty: "Neurology",
      date: "2026-11-03",
      status: "PENDING_PHARMACY",
      notes: "Use only when acute tension headache symptoms emerge.",
      items: [
        { medicine: "Paracetamol (500mg)", dosage: "1-2 tablets", frequency: "Every 6-8 hrs as needed (max 3/day)", duration: "7 days" },
      ],
    },
  ];

  const medicalHistory = [
    { id: "EMR-101", date: "2026-10-25", doctor: "Dr. John Smith", diagnosis: "Essential Hypertension (Stage 1)", vitals: "BP: 135/85 mmHg, Pulse: 78 bpm, SpO2: 99%", plan: "Lifestyle sodium restriction, daily walking 30 mins, low-dose aspirin maintenance." },
    { id: "EMR-092", date: "2025-06-14", doctor: "Dr. Sarah Davis", diagnosis: "Acute Bronchitis", vitals: "BP: 122/78 mmHg, Temp: 100.4°F", plan: "Inhalation therapy, oral hydration, rest." },
  ];

  const appointments = [
    { id: "APT-201", doctor: "Dr. John Smith", specialty: "Cardiology", date: "2026-11-03", time: "10:00 AM", status: "CONFIRMED", clinic: "OPD Room 101" },
    { id: "APT-184", doctor: "Dr. John Smith", specialty: "Cardiology", date: "2026-10-25", time: "09:30 AM", status: "COMPLETED", clinic: "OPD Room 101" },
  ];

  const invoices = [
    { id: "INV-2026-0001", date: "2026-10-25", total: 131.75, status: "PAID", desc: "Cardiology Consultation + Aspirin Pharmacy" },
    { id: "INV-2026-0042", date: "2026-11-03", total: 35.00, status: "PENDING", desc: "Complete Blood Count (CBC) Lab Panel" },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <DashboardLayout>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xl text-emerald-800 text-sm font-semibold animate-fadeIn">
          <span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center mr-3 text-xs font-bold">✓</span>
          {toastMessage}
        </div>
      )}

      {/* Patient Profile Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold">
            👩‍💼
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{patient.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold">{patient.code}</span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              {patient.age} yrs • {patient.gender} • Blood Group: <span className="font-bold text-white">{patient.bloodGroup}</span>
            </p>
            <p className="text-[11px] text-amber-200 mt-0.5 font-medium">
              ⚠️ Allergies: {patient.allergies}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowBookModal(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Book Consultation
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "prescriptions" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          💊 My Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "records" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📋 Clinical Records & Vitals ({medicalHistory.length})
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "appointments" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📅 Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("bills")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "bills" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          💳 Invoices & Payments ({invoices.length})
        </button>
      </div>

      {/* Tab 1: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{rx.id}</span>
                    <span className="text-xs text-slate-400">• Prescribed on {rx.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {rx.doctorName} <span className="text-xs font-normal text-slate-500">({rx.specialty})</span>
                  </h3>
                </div>
                <div>
                  <Badge variant={rx.status === "DISPENSED" ? "success" : "warning"}>
                    {rx.status === "DISPENSED" ? "✓ Dispensed" : "⏳ Pending Pharmacy"}
                  </Badge>
                </div>
              </div>

              {/* Prescribed Items Table */}
              <div className="mt-4 space-y-3">
                {rx.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                        💊
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.medicine}</p>
                        <p className="text-[11px] text-slate-500">{item.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">{item.dosage}</span>
                      <span className="text-[11px] text-slate-400 block">{item.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <p><span className="font-bold text-slate-700">Physician Notes:</span> {rx.notes}</p>
                <Button size="sm" variant="outline" onClick={() => triggerToast("Downloading PDF Prescription...")} className="text-xs font-bold">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Clinical Records */}
      {activeTab === "records" && (
        <div className="space-y-4">
          {medicalHistory.map((rec) => (
            <div key={rec.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{rec.id}</span>
                  <span className="text-xs text-slate-400">• Recorded on {rec.date}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{rec.doctor}</span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</p>
                  <p className="text-sm font-bold text-slate-900">{rec.diagnosis}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Recorded Vitals:</span> {rec.vitals}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Treatment Plan</p>
                  <p className="text-xs text-slate-600">{rec.plan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
          {appointments.map((app) => (
            <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold text-slate-400">#{app.id}</p>
                <h4 className="text-sm font-bold text-slate-900">{app.doctor} ({app.specialty})</h4>
                <p className="text-xs text-slate-500 mt-0.5">{app.date} at {app.time} • {app.clinic}</p>
              </div>
              <div>
                <Badge variant={app.status === "CONFIRMED" ? "default" : "success"}>
                  {app.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Invoices & Billing */}
      {activeTab === "bills" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold text-slate-400">#{inv.id}</p>
                <h4 className="text-sm font-bold text-slate-900">{inv.desc}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Date: {inv.date}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-extrabold text-slate-900">{formatCurrency(inv.total)}</p>
                <Badge variant={inv.status === "PAID" ? "success" : "warning"} className="mt-1">
                  {inv.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Book Consultation */}
      <Dialog
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Book Doctor Consultation"
        description="Select department and preferred physician time slot."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowBookModal(false);
            triggerToast("Appointment request submitted successfully!");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Physician</label>
            <select className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option value="Dr. John Smith">Dr. John Smith (Cardiology) - ₹120</option>
              <option value="Dr. Emily Jones">Dr. Emily Jones (Neurology) - ₹150</option>
              <option value="Dr. Sarah Davis">Dr. Sarah Davis (Pediatrics) - ₹100</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Date</label>
              <Input type="date" defaultValue="2026-11-05" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Time</label>
              <select className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reason for Consultation</label>
            <Input placeholder="Describe your symptoms or review requirement" required />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowBookModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Submit Booking</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
