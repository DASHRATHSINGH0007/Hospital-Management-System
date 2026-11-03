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
  X
} from "lucide-react";

interface Patient {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  allergies: string;
  registeredDate: string;
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
  { id: "pat-01", patientCode: "PAT-10021", name: "Alice Johnson", age: 34, gender: "Female", bloodGroup: "A+", phone: "+1 555-0601", allergies: "Penicillin, Latex", registeredDate: "2026-10-15" },
  { id: "pat-02", patientCode: "PAT-10022", name: "Bob Williams", age: 45, gender: "Male", bloodGroup: "O+", phone: "+1 555-0602", allergies: "None", registeredDate: "2026-11-01" },
  { id: "pat-03", patientCode: "PAT-10023", name: "Charlie Brown", age: 28, gender: "Male", bloodGroup: "B-", phone: "+1 555-0603", allergies: "Peanuts", registeredDate: "2026-10-28" },
  { id: "pat-04", patientCode: "PAT-10024", name: "Diana Prince", age: 39, gender: "Female", bloodGroup: "AB+", phone: "+1 555-0604", allergies: "Sulfa drugs", registeredDate: "2026-11-03" },
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
  const [conflictError, setConflictError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // New Patient Form State
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("Female");
  const [newBlood, setNewBlood] = useState("O+");
  const [newPhone, setNewPhone] = useState("");
  const [newAllergies, setNewAllergies] = useState("");

  // New Appointment Form State
  const [appPatientCode, setAppPatientCode] = useState("PAT-10021");
  const [appDoctorName, setAppDoctorName] = useState("Dr. John Smith");
  const [appDate, setAppDate] = useState("2026-11-03");
  const [appTime, setAppTime] = useState("03:30 PM");
  const [appReason, setAppReason] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      patientCode: `PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: `${newFirstName} ${newLastName}`,
      age: parseInt(newAge) || 30,
      gender: newGender,
      bloodGroup: newBlood,
      phone: newPhone,
      allergies: newAllergies || "None",
      registeredDate: new Date().toISOString().split("T")[0],
    };

    savePatientsToStorage([newPat, ...patients]);
    setShowAddPatient(false);
    triggerToast(`Patient ${newPat.name} registered with code ${newPat.patientCode}`);
    setNewFirstName("");
    setNewLastName("");
    setNewPhone("");
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

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

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
          <Button onClick={() => setShowAddPatient(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Register Patient
          </Button>
          <Button onClick={() => setShowBookAppointment(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
            <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "patients" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🧑‍🤝‍🧑 Patient Directory ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "appointments" ? "bg-white text-purple-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📅 Appointments & Queue ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "doctors" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👨‍⚕️ Available Doctors (4)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Tab 1: Patient Directory */}
      {activeTab === "patients" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name & Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Age / Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Allergies</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date Registered</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600">{p.patientCode}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{p.age} yrs • {p.gender}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.allergies !== "None" ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {p.allergies}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{p.registeredDate}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAppPatientCode(p.patientCode);
                          setShowBookAppointment(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        Book Appt
                      </Button>
                    </td>
                  </tr>
                ))}
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

      {/* Modal: Register Patient */}
      <Dialog
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        title="Register New Patient Profile"
        description="Creates an official hospital patient code and digital health profile."
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name</label>
              <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Jane" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name</label>
              <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Doe" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Age</label>
              <Input type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="32" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gender</label>
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
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
            <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 555-0188" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Allergies / Critical Notes</label>
            <Input value={newAllergies} onChange={(e) => setNewAllergies(e.target.value)} placeholder="e.g. Penicillin, Asthma" />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowAddPatient(false)}>Cancel</Button>
            <Button type="submit" variant="default">Complete Registration</Button>
          </div>
        </form>
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
