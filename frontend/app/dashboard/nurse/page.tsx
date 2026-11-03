"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Activity,
  Heart,
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileHeart
} from "lucide-react";

interface PatientCare {
  id: string;
  bedNumber: string;
  patientName: string;
  patientCode: string;
  age: number;
  condition: string;
  bp: string;
  pulse: number;
  temp: string;
  spo2: number;
  medicationDue: string;
  status: "STABLE" | "CRITICAL" | "RECOVERING";
}

const initialCareList: PatientCare[] = [
  {
    id: "care-01",
    bedNumber: "BED-A101",
    patientName: "Alice Johnson",
    patientCode: "PAT-10021",
    age: 34,
    condition: "Post-consultation cardiac observation",
    bp: "135/85",
    pulse: 78,
    temp: "98.6°F",
    spo2: 99,
    medicationDue: "Aspirin 100mg at 02:00 PM",
    status: "STABLE",
  },
  {
    id: "care-02",
    bedNumber: "ICU-B01",
    patientName: "David Miller",
    patientCode: "PAT-10025",
    age: 58,
    condition: "Acute post-op ICU telemetry",
    bp: "148/94",
    pulse: 88,
    temp: "99.2°F",
    spo2: 95,
    medicationDue: "IV Antibiotics at 01:30 PM",
    status: "CRITICAL",
  },
  {
    id: "care-03",
    bedNumber: "STE-402",
    patientName: "Eleanor Vance",
    patientCode: "PAT-10018",
    age: 42,
    condition: "Neurological observation",
    bp: "124/80",
    pulse: 70,
    temp: "98.4°F",
    spo2: 98,
    medicationDue: "Oral hydration & analgesics",
    status: "RECOVERING",
  },
];

export default function NurseStationPage() {
  const [patients, setPatients] = useState<PatientCare[]>(initialCareList);
  const [selectedPatient, setSelectedPatient] = useState<PatientCare | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Vitals entry form
  const [bp, setBp] = useState("120/80");
  const [pulse, setPulse] = useState("72");
  const [temp, setTemp] = useState("98.6");
  const [spo2, setSpo2] = useState("98");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setPatients(
      patients.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              bp,
              pulse: parseInt(pulse) || 72,
              temp: `${temp}°F`,
              spo2: parseInt(spo2) || 98,
            }
          : p
      )
    );

    setShowVitalsModal(false);
    triggerToast(`Vitals logged for ${selectedPatient.patientName} (${selectedPatient.bedNumber}).`);
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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nurse Station & Inpatient Care</h1>
            <Badge variant="success">Station Live</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Continuous patient telemetry, scheduled medication administration, and vital signs monitoring</p>
        </div>
      </div>

      {/* Admitted Patient Care Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {patients.map((p) => {
          const isCritical = p.status === "CRITICAL";

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                isCritical ? "border-rose-200 ring-1 ring-rose-500/20" : "border-slate-100 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {p.bedNumber}
                    </span>
                    <Badge variant={isCritical ? "destructive" : p.status === "STABLE" ? "default" : "success"}>
                      {p.status}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-bold">{p.patientCode}</span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900">{p.patientName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.age} yrs • Condition: <span className="font-semibold text-slate-700">{p.condition}</span></p>
                </div>

                {/* Vitals Telemetry Box */}
                <div className="grid grid-cols-4 gap-2 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">BP</span>
                    <span className="font-extrabold text-slate-800">{p.bp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">PULSE</span>
                    <span className="font-extrabold text-slate-800">{p.pulse}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">TEMP</span>
                    <span className="font-extrabold text-slate-800">{p.temp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">SpO2</span>
                    <span className={`font-extrabold ${isCritical ? "text-rose-600" : "text-emerald-600"}`}>{p.spo2}%</span>
                  </div>
                </div>

                {/* Scheduled Medication Note */}
                <div className="mt-4 p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center space-x-2.5 text-xs">
                  <Pill className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Medication Due</span>
                    <span className="text-slate-500">{p.medicationDue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(p);
                    setBp(p.bp);
                    setPulse(String(p.pulse));
                    setTemp(p.temp.replace("°F", ""));
                    setSpo2(String(p.spo2));
                    setShowVitalsModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <Activity className="w-3.5 h-3.5 mr-1" /> Record New Vitals
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Record Vitals */}
      <Dialog
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        title={selectedPatient ? `Record Vital Signs: ${selectedPatient.patientName}` : "Vitals"}
        description={selectedPatient?.bedNumber}
      >
        <form onSubmit={handleSaveVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Blood Pressure (mmHg)</label>
              <Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Heart Rate (bpm)</label>
              <Input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Body Temperature (°F)</label>
              <Input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="98.6" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Blood Oxygen SpO2 (%)</label>
              <Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="99" required />
            </div>
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowVitalsModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Log to EMR</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
