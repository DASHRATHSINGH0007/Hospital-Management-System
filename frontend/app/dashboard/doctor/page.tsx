"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  CalendarDays,
  UserCheck,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Activity,
  Heart,
  Pill,
  Sparkles,
  Search
} from "lucide-react";

interface QueueItem {
  id: string;
  patientName: string;
  patientCode: string;
  age: number;
  gender: string;
  bloodGroup: string;
  timeSlot: string;
  reason: string;
  status: "WAITING" | "IN_CONSULTATION" | "COMPLETED";
  vitals: { bp: string; pulse: number; temp: string; spo2: number };
}

const initialQueue: QueueItem[] = [
  {
    id: "apt-01",
    patientName: "Alice Johnson",
    patientCode: "PAT-10021",
    age: 34,
    gender: "Female",
    bloodGroup: "A+",
    timeSlot: "10:00 AM",
    reason: "Cardiac checkup & hypertension review",
    status: "IN_CONSULTATION",
    vitals: { bp: "135/85", pulse: 78, temp: "98.6°F", spo2: 99 },
  },
  {
    id: "apt-03",
    patientName: "Charlie Brown",
    patientCode: "PAT-10023",
    age: 28,
    gender: "Male",
    bloodGroup: "B-",
    timeSlot: "02:00 PM",
    reason: "High BP follow-up consultation",
    status: "WAITING",
    vitals: { bp: "128/82", pulse: 72, temp: "98.4°F", spo2: 98 },
  },
  {
    id: "apt-05",
    patientName: "Michael Evans",
    patientCode: "PAT-10025",
    age: 52,
    gender: "Male",
    bloodGroup: "O+",
    timeSlot: "03:30 PM",
    reason: "Arrhythmia and shortness of breath",
    status: "WAITING",
    vitals: { bp: "145/92", pulse: 88, temp: "99.1°F", spo2: 96 },
  },
];

export default function DoctorWorkspacePage() {
  const [activeDoctor, setActiveDoctor] = useState("Dr. John Smith");
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [selectedPatient, setSelectedPatient] = useState<QueueItem | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Prescription Form State
  const [rxMedicine, setRxMedicine] = useState("Aspirin (100mg)");
  const [rxDosage, setRxDosage] = useState("100mg");
  const [rxFreq, setRxFreq] = useState("Once daily after breakfast");
  const [rxDays, setRxDays] = useState("30");
  const [rxNotes, setRxNotes] = useState("Take with water. Review in 1 month.");

  // Synchronize queue from localStorage so appointments added at Receptionist desk appear immediately
  const reloadQueueFromStorage = (selectedDoc = activeDoctor) => {
    try {
      const storedAppsRaw = localStorage.getItem("medicore_appointments");
      const storedPatsRaw = localStorage.getItem("medicore_patients");

      if (storedAppsRaw) {
        const storedApps = JSON.parse(storedAppsRaw);
        const storedPats = storedPatsRaw ? JSON.parse(storedPatsRaw) : [];

        // Filter appointments for the active doctor (or show all if "All Doctors" selected)
        const relevantApps = storedApps.filter((a: any) => 
          selectedDoc === "ALL" ? true : a.doctorName.toLowerCase().includes(selectedDoc.toLowerCase().replace("dr. ", ""))
        );

        const mappedQueue: QueueItem[] = relevantApps.map((a: any, idx: number) => {
          const pat = storedPats.find((p: any) => p.patientCode === a.patientCode || p.name === a.patientName);
          const initialMatch = initialQueue.find((iq) => iq.id === a.id);

          return {
            id: a.id,
            patientName: a.patientName,
            patientCode: a.patientCode,
            age: pat?.age || initialMatch?.age || 35,
            gender: pat?.gender || initialMatch?.gender || "Other",
            bloodGroup: pat?.bloodGroup || initialMatch?.bloodGroup || "O+",
            timeSlot: a.timeSlot || "10:00 AM",
            reason: a.reason || "General Consultation",
            status: a.status === "COMPLETED" ? "COMPLETED" : (a.status === "IN_PROGRESS" ? "IN_CONSULTATION" : "WAITING"),
            vitals: initialMatch?.vitals || {
              bp: "120/80",
              pulse: 75,
              temp: "98.6°F",
              spo2: 98
            }
          };
        });

        if (mappedQueue.length > 0) {
          setQueue(mappedQueue);
          return;
        }
      }
    } catch (e) {
      console.error("Error loading appointments from localStorage in Doctor page:", e);
    }
  };

  useEffect(() => {
    reloadQueueFromStorage(activeDoctor);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "medicore_appointments" || e.key === "medicore_patients") {
        reloadQueueFromStorage(activeDoctor);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [activeDoctor]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleUpdateStatus = (id: string, newStatus: QueueItem["status"]) => {
    const updated = queue.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
    setQueue(updated);

    // Sync status change back to localStorage so Receptionist desk also sees updated status
    try {
      const storedAppsRaw = localStorage.getItem("medicore_appointments");
      if (storedAppsRaw) {
        const storedApps = JSON.parse(storedAppsRaw);
        const mappedStatus = newStatus === "COMPLETED" ? "COMPLETED" : (newStatus === "IN_CONSULTATION" ? "IN_PROGRESS" : "CONFIRMED");
        const updatedStored = storedApps.map((a: any) => a.id === id ? { ...a, status: mappedStatus } : a);
        localStorage.setItem("medicore_appointments", JSON.stringify(updatedStored));
      }
    } catch (e) {
      console.error("Error syncing status to storage:", e);
    }

    triggerToast(`Appointment #${id} updated to ${newStatus.replace("_", " ")}`);
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

      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
            👨‍⚕️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {activeDoctor === "ALL" ? "All Hospital Consultations" : `${activeDoctor}, MD`}
              </h1>
              <Badge variant="success">On Duty</Badge>
            </div>
            <p className="text-xs font-medium text-teal-200 mt-1">
              {activeDoctor.includes("Smith") ? "Senior Consultant • Department of Cardiology" : (activeDoctor.includes("Jones") ? "Attending Physician • Department of Neurology" : (activeDoctor.includes("Davis") ? "Pediatric Specialist" : "Hospital Medical Staff"))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor Switcher Dropdown */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-1.5 flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-teal-200 px-2">Doctor:</span>
            <select
              value={activeDoctor}
              onChange={(e) => {
                setActiveDoctor(e.target.value);
                reloadQueueFromStorage(e.target.value);
              }}
              className="bg-teal-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none"
            >
              <option value="Dr. John Smith">Dr. John Smith (Cardio)</option>
              <option value="Dr. Emily Jones">Dr. Emily Jones (Neuro)</option>
              <option value="Dr. Sarah Davis">Dr. Sarah Davis (Pediatrics)</option>
              <option value="ALL">Show All Doctors</option>
            </select>
          </div>

          <Link href="/dashboard/pharmacy">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold">
              <Pill className="w-4 h-4 mr-1.5" /> Pharmacy Stock
            </Button>
          </Link>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-right">
            <p className="text-[10px] text-teal-200 uppercase font-bold">Queue Total</p>
            <p className="text-lg font-black">{queue.length} Patients</p>
          </div>
        </div>
      </div>

      {/* Today's Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Today's Patient Queue</h2>
            <p className="text-xs text-slate-500">Live clinical queue with triage vital signs and consultation controls</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {queue.filter((q) => q.status === "COMPLETED").length} of {queue.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {queue.map((item) => {
            const isCompleted = item.status === "COMPLETED";
            const isConsulting = item.status === "IN_CONSULTATION";

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                  isConsulting
                    ? "bg-blue-50/50 border-blue-200 shadow-blue-500/5 ring-1 ring-blue-500/20"
                    : isCompleted
                    ? "bg-slate-50 border-slate-200/80 opacity-75"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Patient Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700 flex-shrink-0">
                    {item.patientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{item.patientName}</h3>
                      <span className="font-mono text-xs font-bold text-slate-400">{item.patientCode}</span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                        {item.bloodGroup}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.age} yrs • {item.gender} • Chief Complaint: <span className="font-semibold text-slate-700">{item.reason}</span>
                    </p>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Slot: {item.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Vitals Badge preview */}
                <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-inner text-xs">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-400 font-bold block">BP</span>
                    <span className="font-extrabold text-slate-800">{item.vitals.bp}</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">PULSE</span>
                    <span className="font-extrabold text-slate-800">{item.vitals.pulse} bpm</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">TEMP</span>
                    <span className="font-extrabold text-slate-800">{item.vitals.temp}</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">SpO2</span>
                    <span className="font-extrabold text-emerald-600">{item.vitals.spo2}%</span>
                  </div>
                </div>

                {/* Consultation Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPatient(item);
                      setShowVitalsModal(true);
                    }}
                    className="text-xs font-bold"
                  >
                    View EMR
                  </Button>

                  {!isCompleted && !isConsulting && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, "IN_CONSULTATION")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Start Consult
                    </Button>
                  )}

                  {isConsulting && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      ✓ Mark Completed
                    </Button>
                  )}

                  {isCompleted && (
                    <Badge variant="success">Completed</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Patient EMR Details */}
      <Dialog
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        title={selectedPatient ? `Clinical Health Record: ${selectedPatient.patientName}` : "EMR"}
        description={selectedPatient?.patientCode}
        maxWidth="lg"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</p>
                <p className="text-base font-extrabold text-rose-700">{selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</p>
                <p className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.bp}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</p>
                <p className="text-base font-extrabold text-slate-900">{selectedPatient.vitals.pulse} bpm</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Oxygen</p>
                <p className="text-base font-extrabold text-emerald-600">{selectedPatient.vitals.spo2}%</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chief Complaint</h4>
              <p className="text-sm font-semibold text-slate-800">{selectedPatient.reason}</p>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Clinical Action</h4>
              <p className="text-xs text-slate-600 mb-3">
                Issue a digital prescription, order laboratory diagnostics, or schedule a post-medication follow-up.
              </p>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowVitalsModal(false);
                    setShowPrescriptionModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  + Issue E-Prescription
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerToast("Lab test ordered successfully!")} className="text-xs font-bold">
                  Order Lab Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Write Digital E-Prescription */}
      <Dialog
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title={selectedPatient ? `Issue E-Prescription for ${selectedPatient.patientName}` : "New E-Prescription"}
        description={selectedPatient?.patientCode}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowPrescriptionModal(false);
            triggerToast(`E-Prescription transmitted to Hospital Pharmacy for ${selectedPatient?.patientName}`);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Medication from Pharmacy Stock</label>
            <select
              value={rxMedicine}
              onChange={(e) => setRxMedicine(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Aspirin (100mg)">Aspirin (100mg) - In Stock (150 units)</option>
              <option value="Paracetamol (500mg)">Paracetamol (500mg) - Low Stock (24 units)</option>
              <option value="Amoxicillin (250mg)">Amoxicillin (250mg) - Low Stock (18 units)</option>
              <option value="Metformin (500mg)">Metformin (500mg) - In Stock (210 units)</option>
              <option value="Atorvastatin (20mg)">Atorvastatin (20mg) - In Stock (95 units)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dosage</label>
              <Input value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} placeholder="e.g. 500mg" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Duration (Days)</label>
              <Input type="number" value={rxDays} onChange={(e) => setRxDays(e.target.value)} placeholder="30" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dosage Frequency</label>
            <select
              value={rxFreq}
              onChange={(e) => setRxFreq(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Once daily after breakfast">Once daily after breakfast</option>
              <option value="Twice daily after meals">Twice daily after meals</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Once at bedtime">Once at bedtime</option>
              <option value="As needed for acute symptoms">As needed for acute symptoms</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Special Physician Instructions</label>
            <Input value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} placeholder="e.g. Take with full glass of water. Avoid alcohol." />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowPrescriptionModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Transmit to Pharmacy</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
