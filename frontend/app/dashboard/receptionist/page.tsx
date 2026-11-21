"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Stethoscope,
  Phone,
  Calendar,
  X,
  HeartPulse,
  BedDouble,
  ShieldAlert,
  Activity,
  Filter,
  Eye,
  Sparkles,
  Accessibility,
  CreditCard,
  Building2,
  Check
} from "lucide-react";

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  allergies: string;
  registeredDate: string;
  careNeed?: string;
  department?: string;
  preferredDoctor?: string;
  priority?: "Routine" | "Urgent" | "Emergency";
  bedPreference?: string;
  specialAssistance?: string[];
  paymentMethod?: string;
  chiefComplaint?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  reason: string;
}

const initialPatients: Patient[] = [
  {
    id: "pat-01",
    patientCode: "PAT-10021",
    name: "Alice Johnson",
    age: 34,
    gender: "Female",
    bloodGroup: "A+",
    phone: "+1 555-0601",
    allergies: "Penicillin, Latex",
    registeredDate: "2026-10-15",
    careNeed: "OPD Consultation",
    department: "Cardiology",
    preferredDoctor: "Dr. John Smith",
    priority: "Routine",
    bedPreference: "None (Outpatient)",
    specialAssistance: ["Diabetic Care"],
    paymentMethod: "Health Insurance (TPA)",
    chiefComplaint: "Cardiac checkup & hypertension follow-up"
  },
  {
    id: "pat-02",
    patientCode: "PAT-10022",
    name: "Bob Williams",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+1 555-0602",
    allergies: "None",
    registeredDate: "2026-11-01",
    careNeed: "Emergency Care",
    department: "Neurology",
    preferredDoctor: "Dr. Emily Jones",
    priority: "Urgent",
    bedPreference: "Semi-Private Room",
    specialAssistance: ["Wheelchair"],
    paymentMethod: "Self-Pay / Cash",
    chiefComplaint: "Severe migraine flare-up with visual aura"
  },
  {
    id: "pat-03",
    patientCode: "PAT-10023",
    name: "Charlie Brown",
    age: 28,
    gender: "Male",
    bloodGroup: "B-",
    phone: "+1 555-0603",
    allergies: "Peanuts",
    registeredDate: "2026-10-28",
    careNeed: "Diagnostic / Lab",
    department: "General Medicine",
    preferredDoctor: "Any Available Doctor",
    priority: "Routine",
    bedPreference: "None (Outpatient)",
    specialAssistance: [],
    paymentMethod: "Govt Health Scheme (Ayushman)",
    chiefComplaint: "Routine lipid profile & blood glucose screen"
  },
  {
    id: "pat-04",
    patientCode: "PAT-10024",
    name: "Diana Prince",
    age: 39,
    gender: "Female",
    bloodGroup: "AB+",
    phone: "+1 555-0604",
    allergies: "Sulfa drugs",
    registeredDate: "2026-11-03",
    careNeed: "Inpatient Admission",
    department: "Pediatrics",
    preferredDoctor: "Dr. Sarah Davis",
    priority: "Urgent",
    bedPreference: "Private AC Suite",
    specialAssistance: ["Oxygen Support"],
    paymentMethod: "Health Insurance (TPA)",
    chiefComplaint: "High fever observation and pediatric care"
  },
];

const initialAppointments: Appointment[] = [
  { id: "apt-01", patientName: "Alice Johnson", patientCode: "PAT-10021", doctorName: "Dr. John Smith", specialization: "Cardiology", date: "2026-11-03", timeSlot: "10:00 AM", status: "CONFIRMED", reason: "Cardiac checkup & hypertension" },
  { id: "apt-02", patientName: "Bob Williams", patientCode: "PAT-10022", doctorName: "Dr. Emily Jones", specialization: "Neurology", date: "2026-11-03", timeSlot: "11:30 AM", status: "SCHEDULED", reason: "Migraine follow-up consultation" },
  { id: "apt-03", patientName: "Charlie Brown", patientCode: "PAT-10023", doctorName: "Dr. John Smith", specialization: "Cardiology", date: "2026-11-03", timeSlot: "02:00 PM", status: "COMPLETED", reason: "High BP follow-up" },
  { id: "apt-04", patientName: "Diana Prince", patientCode: "PAT-10024", doctorName: "Dr. Sarah Davis", specialization: "Pediatrics", date: "2026-11-04", timeSlot: "09:30 AM", status: "SCHEDULED", reason: "Immunization review" },
];

export default function ReceptionistPage() {
  const [activeTab, setActiveTab] = useState<"patients" | "appointments" | "doctors">("patients");
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");

  // Need Filters
  const [filterCareNeed, setFilterCareNeed] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // Sync with localStorage so doctor & other portals see newly added patients & appointments
  useEffect(() => {
    try {
      const storedPatients = localStorage.getItem("medicore_patients");
      const storedApps = localStorage.getItem("medicore_appointments");
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        localStorage.setItem("medicore_patients", JSON.stringify(initialPatients));
      }
      if (storedApps) {
        setAppointments(JSON.parse(storedApps));
      } else {
        localStorage.setItem("medicore_appointments", JSON.stringify(initialAppointments));
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  const savePatientsToStorage = (updated: Patient[]) => {
    setPatients(updated);
    try {
      localStorage.setItem("medicore_patients", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving patients:", e);
    }
  };

  const saveAppointmentsToStorage = (updated: Appointment[]) => {
    setAppointments(updated);
    try {
      localStorage.setItem("medicore_appointments", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving appointments:", e);
    }
  };
  
  // Modals
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [selectedPatientForNeeds, setSelectedPatientForNeeds] = useState<Patient | null>(null);
  const [conflictError, setConflictError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // New Patient Demographics
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("Female");
  const [newBlood, setNewBlood] = useState("O+");
  const [newPhone, setNewPhone] = useState("");
  const [newAllergies, setNewAllergies] = useState("");

  // New Patient Needs (Choose According to Need)
  const [newCareNeed, setNewCareNeed] = useState<string>("OPD Consultation");
  const [newDepartment, setNewDepartment] = useState<string>("Cardiology");
  const [newPreferredDoctor, setNewPreferredDoctor] = useState<string>("Dr. John Smith");
  const [newPriority, setNewPriority] = useState<"Routine" | "Urgent" | "Emergency">("Routine");
  const [newBedPreference, setNewBedPreference] = useState<string>("None (Outpatient)");
  const [newSpecialAssistance, setNewSpecialAssistance] = useState<string[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("Self-Pay / Cash");
  const [newChiefComplaint, setNewChiefComplaint] = useState<string>("");
  const [autoScheduleService, setAutoScheduleService] = useState<boolean>(true);

  // New Appointment Form State
  const [appPatientCode, setAppPatientCode] = useState("PAT-10021");
  const [appDoctorName, setAppDoctorName] = useState("Dr. John Smith");
  const [appDate, setAppDate] = useState("2026-11-03");
  const [appTime, setAppTime] = useState("03:30 PM");
  const [appReason, setAppReason] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const toggleSpecialAssistance = (item: string) => {
    if (newSpecialAssistance.includes(item)) {
      setNewSpecialAssistance(newSpecialAssistance.filter((x) => x !== item));
    } else {
      setNewSpecialAssistance([...newSpecialAssistance, item]);
    }
  };

  // Helper when user selects a need
  const handleCareNeedSelect = (need: string) => {
    setNewCareNeed(need);
    if (need === "Emergency Care") {
      setNewPriority("Emergency");
      setNewDepartment("Emergency Medicine");
      setNewBedPreference("Intensive Care Unit (ICU)");
    } else if (need === "Inpatient Admission") {
      setNewPriority((prev) => (prev === "Emergency" ? "Emergency" : "Urgent"));
      setNewBedPreference("General Ward");
    } else {
      if (newPriority === "Emergency") setNewPriority("Routine");
      setNewBedPreference("None (Outpatient)");
    }
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const patientCode = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      patientCode,
      name: `${newFirstName} ${newLastName}`,
      age: parseInt(newAge) || 30,
      gender: newGender,
      bloodGroup: newBlood,
      phone: newPhone,
      allergies: newAllergies || "None",
      registeredDate: new Date().toISOString().split("T")[0],
      careNeed: newCareNeed,
      department: newDepartment,
      preferredDoctor: newPreferredDoctor,
      priority: newPriority,
      bedPreference: newCareNeed === "Inpatient Admission" && newBedPreference === "None (Outpatient)" ? "General Ward" : newBedPreference,
      specialAssistance: newSpecialAssistance,
      paymentMethod: newPaymentMethod,
      chiefComplaint: newChiefComplaint || `${newCareNeed} intake for ${newDepartment}`,
    };

    savePatientsToStorage([newPat, ...patients]);

    // Auto-schedule immediate clinical appointment / queue ticket if selected
    if (autoScheduleService) {
      const assignedDoc = newPreferredDoctor.includes("Any")
        ? (newDepartment === "Cardiology" ? "Dr. John Smith" : (newDepartment === "Neurology" ? "Dr. Emily Jones" : (newDepartment === "Pediatrics" ? "Dr. Sarah Davis" : "Dr. Michael Chen")))
        : newPreferredDoctor.split(" (")[0];

      const newApp: Appointment = {
        id: `apt-${Date.now()}`,
        patientName: newPat.name,
        patientCode: newPat.patientCode,
        doctorName: assignedDoc,
        specialization: newDepartment,
        date: new Date().toISOString().split("T")[0],
        timeSlot: newPriority === "Emergency" ? "IMMEDIATE TRIAGE" : (newPriority === "Urgent" ? "PRIORITY QUEUE" : "11:30 AM"),
        status: newPriority === "Emergency" ? "IN_PROGRESS" : "CONFIRMED",
        reason: `[${newCareNeed.toUpperCase()}] ${newPat.chiefComplaint || 'Consultation & intake according to chosen need'}`,
      };

      saveAppointmentsToStorage([newApp, ...appointments]);
    }

    setShowAddPatient(false);
    triggerToast(
      `Patient ${newPat.name} registered for ${newPat.careNeed} (${newPat.department})! Priority: ${newPat.priority}.`
    );

    // Reset Form
    setNewFirstName("");
    setNewLastName("");
    setNewAge("");
    setNewPhone("");
    setNewAllergies("");
    setNewChiefComplaint("");
    setNewSpecialAssistance([]);
    setNewCareNeed("OPD Consultation");
    setNewPriority("Routine");
    setNewBedPreference("None (Outpatient)");
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError("");

    // Conflict prevention logic
    const conflict = appointments.some(
      (a) =>
        a.doctorName === appDoctorName &&
        a.date === appDate &&
        a.timeSlot.toLowerCase() === appTime.toLowerCase() &&
        a.status !== "CANCELLED"
    );

    if (conflict) {
      setConflictError(`Scheduling Conflict! ${appDoctorName} is already booked on ${appDate} at ${appTime}.`);
      return;
    }

    const patient = patients.find((p) => p.patientCode === appPatientCode) || patients[0];
    const newApp: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: patient.name,
      patientCode: patient.patientCode,
      doctorName: appDoctorName,
      specialization: appDoctorName.includes("Smith") ? "Cardiology" : (appDoctorName.includes("Jones") ? "Neurology" : "Pediatrics"),
      date: appDate,
      timeSlot: appTime,
      status: "CONFIRMED",
      reason: appReason || "Routine checkup",
    };

    saveAppointmentsToStorage([newApp, ...appointments]);
    setShowBookAppointment(false);
    triggerToast(`Appointment confirmed with ${appDoctorName} for ${patient.name}`);
  };

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    saveAppointmentsToStorage(updated);
    triggerToast(`Appointment #${id} marked as ${newStatus}`);
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.careNeed && p.careNeed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.chiefComplaint && p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesNeed = filterCareNeed === "ALL" || p.careNeed === filterCareNeed;
    const matchesPriority = filterPriority === "ALL" || p.priority === filterPriority;

    return matchesSearch && matchesNeed && matchesPriority;
  });

  const filteredAppointments = appointments.filter(
    (a) =>
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receptionist & Patient Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">Patient intake, scheduling calendar, check-in queue, and doctor directory</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowAddPatient(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-1.5" /> Register Patient (Choose Need)
          </Button>
          <Button onClick={() => setShowBookAppointment(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
            <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "patients" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🧑‍🤝‍🧑 Patient Directory ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "appointments" ? "bg-white text-purple-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📅 Appointments & Queue ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "doctors" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👨‍⚕️ Available Doctors (4)
          </button>
        </div>

        {/* Search & Need Filters */}
        <div className="flex items-center space-x-2.5">
          {activeTab === "patients" && (
            <>
              {/* Filter by Care Need */}
              <select
                value={filterCareNeed}
                onChange={(e) => setFilterCareNeed(e.target.value)}
                className="h-9 px-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Care Needs</option>
                <option value="OPD Consultation">🩺 OPD Consultation</option>
                <option value="Emergency Care">🚨 Emergency Care</option>
                <option value="Inpatient Admission">🛏️ Inpatient Admission</option>
                <option value="Diagnostic / Lab">🧪 Diagnostic / Lab</option>
                <option value="Health Checkup">🛡️ Health Checkup</option>
                <option value="Daycare Procedure">💉 Daycare Procedure</option>
              </select>

              {/* Filter by Priority */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-9 px-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Priorities</option>
                <option value="Routine">🟢 Routine</option>
                <option value="Urgent">🟡 Urgent</option>
                <option value="Emergency">🔴 Emergency</option>
              </select>
            </>
          )}

          <div className="relative w-56 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, needs..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Patient Directory */}
      {activeTab === "patients" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Age / Gender / Blood</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Chosen Healthcare Need</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Triage Priority</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Bed & Assistance</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Payment</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-xs text-slate-400">
                      No patients match your search or selected care need filter.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const priorityBadge =
                      p.priority === "Emergency"
                        ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                        : p.priority === "Urgent"
                        ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                        : "bg-slate-100 text-slate-700 border-slate-200";

                    const needBadge =
                      p.careNeed === "Emergency Care"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : p.careNeed === "Inpatient Admission"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : p.careNeed === "Diagnostic / Lab"
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : "bg-blue-50 text-blue-700 border-blue-200";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                            <span className="font-mono font-semibold text-slate-500">{p.patientCode}</span>
                            <span>•</span>
                            <span>{p.phone}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          <div>{p.age} yrs • {p.gender}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-100">
                            {p.bloodGroup}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${needBadge}`}>
                            {p.careNeed || "OPD Consultation"}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Dept: <span className="text-slate-800 font-bold">{p.department || "General"}</span>
                            {p.preferredDoctor && !p.preferredDoctor.includes("Any") && (
                              <span> • {p.preferredDoctor.split(" (")[0]}</span>
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md border ${priorityBadge}`}>
                            {p.priority === "Emergency" && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse" />}
                            {p.priority === "Urgent" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                            {p.priority === "Routine" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                            {p.priority || "Routine"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          <p className="font-semibold text-slate-800">{p.bedPreference || "Outpatient"}</p>
                          {p.specialAssistance && p.specialAssistance.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.specialAssistance.map((item, idx) => (
                                <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Standard Intake</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {p.paymentMethod || "Self-Pay"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPatientForNeeds(p)}
                            className="text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> View Needs
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAppPatientCode(p.patientCode);
                              if (p.preferredDoctor && !p.preferredDoctor.includes("Any")) {
                                setAppDoctorName(p.preferredDoctor.split(" (")[0]);
                              }
                              setShowBookAppointment(true);
                            }}
                            className="text-xs font-bold text-blue-600 hover:bg-blue-50"
                          >
                            Book Appt
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments Schedule */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Appt ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Doctor & Specialty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date & Slot</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Reason</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Intake Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((a) => {
                  const statusColors = {
                    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
                    SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
                    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
                    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
                  };

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">#{a.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{a.patientName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{a.patientCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{a.doctorName}</p>
                        <p className="text-[11px] text-slate-500">{a.specialization}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700">{a.date}</span>
                        <span className="block text-[11px] font-bold text-blue-600">{a.timeSlot}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColors[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{a.reason}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {a.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusChange(a.id, "COMPLETED")}
                            className="text-xs font-bold"
                          >
                            Check-In
                          </Button>
                        )}
                        {a.status !== "CANCELLED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(a.id, "CANCELLED")}
                            className="text-xs font-bold"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Doctor Directory */}
      {activeTab === "doctors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Dr. John Smith", spec: "Cardiology", room: "OPD-101", fee: 120, phone: "+1 555-0101", days: "Mon, Wed, Fri" },
            { name: "Dr. Emily Jones", spec: "Neurology", room: "OPD-102", fee: 150, phone: "+1 555-0102", days: "Tue, Thu" },
            { name: "Dr. Sarah Davis", spec: "Pediatrics", room: "OPD-201", fee: 100, phone: "+1 555-0103", days: "Mon, Tue, Thu, Sat" },
            { name: "Dr. Michael Chen", spec: "Orthopedics", room: "OPD-202", fee: 130, phone: "+1 555-0104", days: "Wed, Fri, Sat" },
          ].map((doc) => (
            <div key={doc.name} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    🩺
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <Badge variant="default">{doc.spec}</Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p><span className="font-bold text-slate-800">Clinic Room:</span> {doc.room}</p>
                  <p><span className="font-bold text-slate-800">Consultation Fee:</span> {formatCurrency(doc.fee)}</p>
                  <p><span className="font-bold text-slate-800">Available Days:</span> {doc.days}</p>
                  <p><span className="font-bold text-slate-800">Phone:</span> {doc.phone}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  onClick={() => {
                    setAppDoctorName(doc.name);
                    setShowBookAppointment(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Register Patient (Choose According to Need) */}
      <Dialog
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        title="Register Patient & Select Care According to Need"
        description="Input demographic details and customize clinical services, urgency triage, accommodation, and accessibility based on the patient's exact medical needs."
        maxWidth="xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Patient Personal & Contact Details</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name *</label>
                <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="e.g. Jane" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name *</label>
                <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="e.g. Doe" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Age *</label>
                <Input type="number" min="0" max="120" value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="32" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gender *</label>
                <select value={newGender} onChange={(e) => setNewGender(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Blood Group</label>
                <select value={newBlood} onChange={(e) => setNewBlood(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number *</label>
                <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 555-0188" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Known Allergies / Medical Alerts</label>
                <Input value={newAllergies} onChange={(e) => setNewAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts, Latex (or None)" />
              </div>
            </div>
          </div>

          {/* Section 2: Choose Care According to Need */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Choose Primary Healthcare Need</h4>
              </div>
              <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Customizes immediate routing
              </span>
            </div>

            {/* Care Need Grid Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: "OPD Consultation", label: "OPD Consultation", icon: "🩺", desc: "Outpatient Doctor Visit" },
                { id: "Emergency Care", label: "Emergency Care", icon: "🚨", desc: "Acute Immediate Triage" },
                { id: "Inpatient Admission", label: "Inpatient Bed Admission", icon: "🛏️", desc: "Ward / Bed Hospitalization" },
                { id: "Diagnostic / Lab", label: "Diagnostic & Lab", icon: "🧪", desc: "Pathology & Radiology" },
                { id: "Health Checkup", label: "Health Checkup", icon: "🛡️", desc: "Preventive Wellness Panel" },
                { id: "Daycare Procedure", label: "Daycare Procedure", icon: "💉", desc: "Short-Stay / Infusion" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCareNeedSelect(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    newCareNeed === item.id
                      ? "border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Department & Doctor Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Department *</label>
                <select
                  value={newDepartment}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setNewDepartment(dept);
                    if (dept === "Cardiology") setNewPreferredDoctor("Dr. John Smith");
                    else if (dept === "Neurology") setNewPreferredDoctor("Dr. Emily Jones");
                    else if (dept === "Pediatrics") setNewPreferredDoctor("Dr. Sarah Davis");
                    else if (dept === "Orthopedics") setNewPreferredDoctor("Dr. Michael Chen");
                    else setNewPreferredDoctor("Any Available Doctor");
                  }}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Cardiology">Cardiology (Heart & Blood Pressure)</option>
                  <option value="Neurology">Neurology (Brain & Nervous System)</option>
                  <option value="Pediatrics">Pediatrics (Children & Infant Care)</option>
                  <option value="Orthopedics">Orthopedics (Bones & Joints)</option>
                  <option value="General Medicine">General Medicine (Internal Health)</option>
                  <option value="Emergency Medicine">Emergency Medicine (Trauma & Acute)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Physician / Doctor</label>
                <select
                  value={newPreferredDoctor}
                  onChange={(e) => setNewPreferredDoctor(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Any Available Doctor">Any Available Specialist (Fastest Service)</option>
                  <option value="Dr. John Smith">Dr. John Smith (Cardiology • OPD-101)</option>
                  <option value="Dr. Emily Jones">Dr. Emily Jones (Neurology • OPD-102)</option>
                  <option value="Dr. Sarah Davis">Dr. Sarah Davis (Pediatrics • OPD-201)</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen (Orthopedics • OPD-202)</option>
                </select>
              </div>
            </div>

            {/* Urgency Priority Level */}
            <div className="mt-3">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Triage & Urgency Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Routine", label: "Routine (Standard)", desc: "Normal consultation queue", color: "border-slate-200 text-slate-700 hover:border-slate-300" },
                  { id: "Urgent", label: "Urgent (Priority)", desc: "Shortened wait, severe pain", color: "border-amber-300 bg-amber-50/50 text-amber-800" },
                  { id: "Emergency", label: "Emergency (Critical)", desc: "Immediate bedside triage", color: "border-rose-400 bg-rose-50/60 text-rose-800" },
                ].map((prio) => (
                  <button
                    key={prio.id}
                    type="button"
                    onClick={() => setNewPriority(prio.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPriority === prio.id
                        ? "ring-2 ring-blue-600 bg-blue-50/40 border-blue-600 font-bold"
                        : prio.color
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${prio.id === 'Emergency' ? 'bg-rose-600' : (prio.id === 'Urgent' ? 'bg-amber-500' : 'bg-emerald-500')}`} />
                      <span className="text-xs font-bold">{prio.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{prio.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Accommodation / Bed Preference */}
          <div>
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Accommodation & Bed Preference</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ward / Room Category Needed</label>
                <select
                  value={newBedPreference}
                  onChange={(e) => setNewBedPreference(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="None (Outpatient)">None (Outpatient / Same-Day Visit)</option>
                  <option value="General Ward">General Ward (Shared • ₹150/day)</option>
                  <option value="Semi-Private Room">Semi-Private Room (Dual Sharing • ₹250/day)</option>
                  <option value="Private AC Suite">Private AC Suite (Single Deluxe • ₹350/day)</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit - ICU (Critical Monitoring • ₹650/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Billing & Payment Scheme</label>
                <select
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Self-Pay / Cash">Self-Pay (Cash / UPI / Debit / Credit)</option>
                  <option value="Health Insurance (TPA)">Health Insurance (Cashless TPA Claim)</option>
                  <option value="Govt Health Scheme (Ayushman)">Government Health Scheme (Ayushman Bharat / CGHS)</option>
                  <option value="Corporate Panel">Corporate / Employer Sponsored</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Special Accessibility & Assistance Needs */}
          <div>
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Special Accessibility & Assistance Required</h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "Wheelchair", label: "🦽 Wheelchair Needed" },
                { id: "Stretcher", label: "🛏️ Stretcher Required" },
                { id: "Oxygen Support", label: "💨 Oxygen Support" },
                { id: "Language Interpreter", label: "🗣️ Language Interpreter" },
                { id: "Diabetic Care", label: "🩺 Diabetic / Special Diet" },
                { id: "Elderly Fall Risk", label: "⚠️ Elderly / Fall Risk" },
              ].map((item) => {
                const isSelected = newSpecialAssistance.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSpecialAssistance(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Specific Chief Complaint / Reason */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specific Need / Chief Complaint / Clinical Notes</label>
            <Input
              value={newChiefComplaint}
              onChange={(e) => setNewChiefComplaint(e.target.value)}
              placeholder="e.g. Sharp chest pain radiating to arm, fever for 3 days, routine cardiology follow-up..."
            />
          </div>

          {/* Automated Queue Dispatch Checkbox */}
          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoScheduleCheck"
                checked={autoScheduleService}
                onChange={(e) => setAutoScheduleService(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="autoScheduleCheck" className="text-xs font-bold text-blue-900 cursor-pointer">
                Automatically schedule consultation & queue ticket immediately
                <span className="block text-[11px] font-normal text-blue-700">
                  Adds patient directly to today&apos;s queue and physician roster upon completion
                </span>
              </label>
            </div>
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
          </div>

          {/* Live Summary Preview */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800">Intake Summary:</span>{" "}
              <span>{newCareNeed}</span> • <span>{newDepartment}</span> •{" "}
              <span className="font-semibold text-blue-700">{newPreferredDoctor}</span> •{" "}
              <span>Priority: <b>{newPriority}</b></span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Bed: {newBedPreference} • Payment: {newPaymentMethod}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setShowAddPatient(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-lg shadow-blue-500/20">
              Complete Registration & Route Need
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: View Patient Care Needs Profile */}
      <Dialog
        isOpen={!!selectedPatientForNeeds}
        onClose={() => setSelectedPatientForNeeds(null)}
        title={`Patient Intake & Care Needs: ${selectedPatientForNeeds?.name || ""}`}
        description="Detailed record of healthcare requirements, urgency priority, and accommodation preferences chosen by the patient."
        maxWidth="lg"
      >
        {selectedPatientForNeeds && (
          <div className="space-y-4">
            {/* Top Identity Pill */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{selectedPatientForNeeds.name}</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedPatientForNeeds.patientCode} • {selectedPatientForNeeds.age} yrs • {selectedPatientForNeeds.gender} • Blood Group: <span className="font-bold text-rose-300">{selectedPatientForNeeds.bloodGroup}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Phone: {selectedPatientForNeeds.phone}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedPatientForNeeds.priority === "Emergency"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : selectedPatientForNeeds.priority === "Urgent"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}>
                  {selectedPatientForNeeds.priority || "Routine"} Priority
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Reg: {selectedPatientForNeeds.registeredDate}</p>
              </div>
            </div>

            {/* Need Specification Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Chosen Primary Need</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">{selectedPatientForNeeds.careNeed || "OPD Consultation"}</p>
                <p className="text-xs text-slate-500 mt-1">Department: <span className="font-semibold text-slate-800">{selectedPatientForNeeds.department || "General Medicine"}</span></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Attending Physician</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedPatientForNeeds.preferredDoctor || "Any Available Specialist"}</p>
                <p className="text-xs text-slate-500 mt-1">Queue: <span className="font-semibold text-slate-800">Confirmed</span></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Accommodation / Bed Choice</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedPatientForNeeds.bedPreference || "Outpatient"}</p>
                <p className="text-xs text-slate-500 mt-1">Billing Scheme: <span className="font-semibold text-slate-800">{selectedPatientForNeeds.paymentMethod || "Self-Pay"}</span></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Allergies & Critical Warnings</p>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{selectedPatientForNeeds.allergies || "None"}</p>
                <p className="text-xs text-slate-500 mt-1">Status: Verified at intake</p>
              </div>
            </div>

            {/* Special Accessibility Needs */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
              <p className="text-xs font-bold uppercase text-amber-800 mb-1.5">Special Assistance & Accessibility</p>
              {selectedPatientForNeeds.specialAssistance && selectedPatientForNeeds.specialAssistance.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatientForNeeds.specialAssistance.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No special assistance required. Patient is fully ambulatory.</p>
              )}
            </div>

            {/* Registered Chief Complaint */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase text-slate-400 mb-1">Chief Complaint & Clinical Request</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedPatientForNeeds.chiefComplaint || "Routine consultation & general clinical evaluation."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAppPatientCode(selectedPatientForNeeds.patientCode);
                  if (selectedPatientForNeeds.preferredDoctor && !selectedPatientForNeeds.preferredDoctor.includes("Any")) {
                    setAppDoctorName(selectedPatientForNeeds.preferredDoctor.split(" (")[0]);
                  }
                  setSelectedPatientForNeeds(null);
                  setShowBookAppointment(true);
                }}
                className="text-xs font-bold text-blue-600"
              >
                Schedule Follow-up Appointment
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedPatientForNeeds(null)}
                className="text-xs font-bold"
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Book Appointment */}
      <Dialog
        isOpen={showBookAppointment}
        onClose={() => setShowBookAppointment(false)}
        title="Schedule Clinical Appointment"
        description="Book with conflict prevention to prevent double-booking the physician."
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          {conflictError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{conflictError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Patient</label>
            <select
              value={appPatientCode}
              onChange={(e) => setAppPatientCode(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {patients.map((p) => (
                <option key={p.patientCode} value={p.patientCode}>
                  {p.name} ({p.patientCode} • {p.bloodGroup})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Attending Doctor</label>
            <select
              value={appDoctorName}
              onChange={(e) => setAppDoctorName(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="Dr. John Smith">Dr. John Smith (Cardiology)</option>
              <option value="Dr. Emily Jones">Dr. Emily Jones (Neurology)</option>
              <option value="Dr. Sarah Davis">Dr. Sarah Davis (Pediatrics)</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen (Orthopedics)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Consultation Date</label>
              <Input type="date" value={appDate} onChange={(e) => setAppDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Time Slot</label>
              <select
                value={appTime}
                onChange={(e) => setAppTime(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Consultation Reason / Chief Complaint</label>
            <Input value={appReason} onChange={(e) => setAppReason(e.target.value)} placeholder="e.g. Chest pain, High fever, Migraine" />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowBookAppointment(false)}>Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">Confirm & Schedule</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
