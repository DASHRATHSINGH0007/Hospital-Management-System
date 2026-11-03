"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  BedDouble,
  Activity,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  LogOut
} from "lucide-react";

interface BedItem {
  id: string;
  bedNumber: string;
  ward: string;
  type: "GENERAL" | "ICU" | "PRIVATE";
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  rate: number;
  patientName?: string;
  admissionDate?: string;
  diagnosis?: string;
}

const initialBeds: BedItem[] = [
  { id: "bed-01", bedNumber: "BED-A101", ward: "General Ward (2nd Floor)", type: "GENERAL", status: "OCCUPIED", rate: 150, patientName: "Alice Johnson (#PAT-10021)", admissionDate: "2026-11-01", diagnosis: "Cardiac Arrhythmia Monitoring" },
  { id: "bed-02", bedNumber: "BED-A102", ward: "General Ward (2nd Floor)", type: "GENERAL", status: "AVAILABLE", rate: 150 },
  { id: "bed-03", bedNumber: "BED-A103", ward: "General Ward (2nd Floor)", type: "GENERAL", status: "AVAILABLE", rate: 150 },
  { id: "bed-04", bedNumber: "BED-A104", ward: "General Ward (2nd Floor)", type: "GENERAL", status: "MAINTENANCE", rate: 150 },
  { id: "bed-05", bedNumber: "ICU-B01", ward: "Intensive Care Unit (3rd Floor)", type: "ICU", status: "OCCUPIED", rate: 650, patientName: "David Miller (#PAT-10025)", admissionDate: "2026-11-02", diagnosis: "Post-op Acute Cardiac Monitoring" },
  { id: "bed-06", bedNumber: "ICU-B02", ward: "Intensive Care Unit (3rd Floor)", type: "ICU", status: "AVAILABLE", rate: 650 },
  { id: "bed-07", bedNumber: "STE-401", ward: "Private Suites (4th Floor)", type: "PRIVATE", status: "AVAILABLE", rate: 350 },
  { id: "bed-08", bedNumber: "STE-402", ward: "Private Suites (4th Floor)", type: "PRIVATE", status: "OCCUPIED", rate: 350, patientName: "Eleanor Vance", admissionDate: "2026-10-30", diagnosis: "Neurological Observation" },
];

export default function BedsPage() {
  const [beds, setBeds] = useState<BedItem[]>(initialBeds);
  const [patientsList, setPatientsList] = useState<{ name: string; patientCode: string }[]>([]);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState<BedItem | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Admit Form
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // Discharge Form
  const [summary, setSummary] = useState("");

  // Load beds and patients from localStorage so allotment persists across page transitions
  const reloadBedsFromStorage = () => {
    try {
      const storedBedsRaw = localStorage.getItem("medicore_beds");
      if (storedBedsRaw) {
        setBeds(JSON.parse(storedBedsRaw));
      } else {
        localStorage.setItem("medicore_beds", JSON.stringify(initialBeds));
      }

      const storedPatientsRaw = localStorage.getItem("medicore_patients");
      if (storedPatientsRaw) {
        const parsed = JSON.parse(storedPatientsRaw);
        setPatientsList(parsed.map((p: any) => ({ name: p.name, patientCode: p.patientCode })));
      }
    } catch (e) {
      console.error("Error loading beds from storage:", e);
    }
  };

  useEffect(() => {
    reloadBedsFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "medicore_beds") {
        reloadBedsFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    const admissionDate = new Date().toISOString().split("T")[0];
    const updatedBeds = beds.map((b) =>
      b.id === selectedBed.id
        ? {
            ...b,
            status: "OCCUPIED" as const,
            patientName,
            diagnosis,
            admissionDate,
          }
        : b
    );

    setBeds(updatedBeds);
    try {
      localStorage.setItem("medicore_beds", JSON.stringify(updatedBeds));
    } catch (err) {
      console.error("Failed to save beds to localStorage:", err);
    }

    // AUTO-BILLING: Automatically generate/add bed charges in Billing
    try {
      const bedDailyRate = selectedBed.rate || 150;
      const subTotal = bedDailyRate;
      const tax = Number((subTotal * 0.05).toFixed(2));
      const total = Number((subTotal + tax).toFixed(2));

      const storedInvoicesRaw = localStorage.getItem("medicore_invoices");
      let storedInvoices: any[] = [];
      if (storedInvoicesRaw) {
        storedInvoices = JSON.parse(storedInvoicesRaw);
      } else {
        storedInvoices = [
          {
            id: "bill-01",
            invoiceNo: "INV-2026-0001",
            patientName: "Alice Johnson",
            patientCode: "PAT-10021",
            subTotal: 125.50,
            tax: 6.25,
            discount: 0,
            total: 131.75,
            paid: 131.75,
            status: "PAID",
            dueDate: "2026-11-03",
            items: [
              { description: "Cardiology Specialist Consultation (Dr. Smith)", type: "CONSULTATION", price: 120.0, qty: 1 },
              { description: "Aspirin (100mg) - 30 tablets", type: "MEDICINE", price: 5.50, qty: 1 },
            ],
          },
          {
            id: "bill-02",
            invoiceNo: "INV-2026-0002",
            patientName: "Bob Williams",
            patientCode: "PAT-10022",
            subTotal: 153.00,
            tax: 7.65,
            discount: 0,
            total: 160.65,
            paid: 0,
            status: "PENDING",
            dueDate: "2026-11-10",
            items: [
              { description: "Neurology Specialist Consultation (Dr. Jones)", type: "CONSULTATION", price: 150.0, qty: 1 },
              { description: "Paracetamol (500mg) - 10 tablets", type: "MEDICINE", price: 3.00, qty: 1 },
            ],
          },
        ];
      }

      const cleanPatientName = patientName.includes(" (") ? patientName.split(" (")[0].trim() : patientName.trim();
      const patientCode = patientName.includes("#") ? patientName.split("#")[1].replace(")", "").trim() : `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

      // Check if this patient already has a pending invoice
      const existingPending = storedInvoices.find(
        (inv: any) =>
          inv.status !== "PAID" &&
          (inv.patientName.toLowerCase() === cleanPatientName.toLowerCase() || inv.patientCode === patientCode)
      );

      if (existingPending) {
        existingPending.items.push({
          description: `Bed Charge: ${selectedBed.bedNumber} (${selectedBed.ward})`,
          type: "ROOM_CHARGE",
          price: bedDailyRate,
          qty: 1,
        });
        existingPending.subTotal = Number((existingPending.subTotal + bedDailyRate).toFixed(2));
        existingPending.tax = Number((existingPending.subTotal * 0.05).toFixed(2));
        existingPending.total = Number((existingPending.subTotal + existingPending.tax - (existingPending.discount || 0)).toFixed(2));
      } else {
        const newInvoice = {
          id: `bill-${Date.now()}`,
          invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: cleanPatientName,
          patientCode: patientCode,
          subTotal: subTotal,
          tax: tax,
          discount: 0,
          total: total,
          paid: 0,
          status: "PENDING",
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          items: [
            {
              description: `Bed Charge: ${selectedBed.bedNumber} (${selectedBed.ward})`,
              type: "ROOM_CHARGE",
              price: bedDailyRate,
              qty: 1,
            },
          ],
        };
        storedInvoices = [newInvoice, ...storedInvoices];
      }

      localStorage.setItem("medicore_invoices", JSON.stringify(storedInvoices));
    } catch (billingErr) {
      console.error("Error auto-adding bed charges to billing:", billingErr);
    }

    setShowAdmitModal(false);
    triggerToast(`Patient ${patientName} admitted to ${selectedBed.bedNumber}. Bed charges (${formatCurrency(selectedBed.rate)}) auto-added to Billing!`);
    setPatientName("");
    setDiagnosis("");
  };

  const handleDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    const updatedBeds = beds.map((b) =>
      b.id === selectedBed.id
        ? {
            ...b,
            status: "AVAILABLE" as const,
            patientName: undefined,
            diagnosis: undefined,
            admissionDate: undefined,
          }
        : b
    );

    setBeds(updatedBeds);
    try {
      localStorage.setItem("medicore_beds", JSON.stringify(updatedBeds));
    } catch (err) {
      console.error("Failed to save beds to localStorage:", err);
    }

    setShowDischargeModal(false);
    triggerToast(`Patient discharged. Bed ${selectedBed.bedNumber} is now Available.`);
    setSummary("");
  };

  const total = beds.length;
  const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
  const available = beds.filter((b) => b.status === "AVAILABLE").length;
  const icuAvailable = beds.filter((b) => b.type === "ICU" && b.status === "AVAILABLE").length;

  return (
    <DashboardLayout>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xl text-emerald-800 text-sm font-semibold animate-fadeIn">
          <span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center mr-3 text-xs font-bold">✓</span>
          {toastMessage}
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inpatient Bed & Ward Management</h1>
            <Badge variant="purple">Live Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time monitored bed allocations, ICU availability, admissions, and discharges</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Monitored Beds</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
            🛏️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Occupied Beds</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{occupied}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
            🧑‍🤝‍🧑
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Available Beds</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{available}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            ✓
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">ICU Free Beds</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{icuAvailable} Free</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
            🚨
          </div>
        </div>
      </div>

      {/* Visual Bed Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Interactive Bed Floor Map</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any bed to allocate an admission or initiate discharge</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-slate-600 font-medium">Available</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-slate-600 font-medium">Occupied</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-600 font-medium">Maintenance</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {beds.map((bed) => {
            const isOcc = bed.status === "OCCUPIED";
            const isAvail = bed.status === "AVAILABLE";

            return (
              <div
                key={bed.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isOcc
                    ? "bg-blue-50/40 border-blue-200 ring-1 ring-blue-500/10"
                    : isAvail
                    ? "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono text-sm font-black text-slate-900">{bed.bedNumber}</span>
                    <Badge variant={isAvail ? "success" : isOcc ? "default" : "warning"}>
                      {bed.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="font-bold text-slate-700">{bed.ward}</p>
                    <p className="text-slate-500">Type: <span className="font-semibold text-slate-800">{bed.type}</span> • {formatCurrency(bed.rate)}/day</p>

                    {isOcc && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white border border-blue-100 text-[11px] text-slate-700">
                        <p className="font-bold text-blue-900 truncate">{bed.patientName}</p>
                        <p className="text-slate-500 mt-0.5 truncate">{bed.diagnosis}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">Admitted: {bed.admissionDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {isAvail ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBed(bed);
                        setShowAdmitModal(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      + Admit to Bed
                    </Button>
                  ) : isOcc ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBed(bed);
                        setShowDischargeModal(true);
                      }}
                      className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" /> Discharge Patient
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Under Servicing</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Admit Patient */}
      <Dialog
        isOpen={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        title={selectedBed ? `Admit Patient to ${selectedBed.bedNumber}` : "Admit"}
        description={selectedBed ? `${selectedBed.ward} • Rate: ${formatCurrency(selectedBed.rate)}/day` : ""}
      >
        <form onSubmit={handleAdmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Patient Name & Code</label>
            <Input
              list="registered-patients-list"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. David Miller (#PAT-10025) or select below"
              required
            />
            <datalist id="registered-patients-list">
              {patientsList.map((p, idx) => (
                <option key={idx} value={`${p.name} (#${p.patientCode})`} />
              ))}
            </datalist>
            {patientsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">Registered Patients:</span>
                {patientsList.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPatientName(`${p.name} (#${p.patientCode})`)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold border border-slate-200 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Admitting Clinical Diagnosis</label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute Respiratory Infection / Post-Op Care" required />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowAdmitModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Confirm Admission</Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Discharge Patient */}
      <Dialog
        isOpen={showDischargeModal}
        onClose={() => setShowDischargeModal(false)}
        title={selectedBed ? `Discharge from ${selectedBed.bedNumber}` : "Discharge"}
        description={selectedBed?.patientName}
      >
        <form onSubmit={handleDischarge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Discharge Summary & Physician Clearance</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Patient vitals stabilized, cleared for outpatient recovery." required />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowDischargeModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">Finalize Discharge</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
