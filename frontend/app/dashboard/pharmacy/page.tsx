"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Pill,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  Sparkles
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: string;
  batch: string;
  stock: number;
  min: number;
  price: number;
  expiry: string;
}

interface PendingPrescription {
  id: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  date: string;
  medicine: string;
  dosage: string;
  status: "PENDING" | "DISPENSED";
}

const initialMedicines: Medicine[] = [
  { id: "med-01", name: "Aspirin (100mg)", generic: "Acetylsalicylic acid", category: "Analgesics / Cardiac", batch: "ASP-2026-B1", stock: 150, min: 30, price: 5.50, expiry: "2027-12-31" },
  { id: "med-02", name: "Paracetamol (500mg)", generic: "Acetaminophen", category: "Antipyretics", batch: "PCM-2026-B9", stock: 24, min: 50, price: 3.00, expiry: "2026-08-15" },
  { id: "med-03", name: "Amoxicillin (250mg)", generic: "Amoxicillin Trihydrate", category: "Antibiotics", batch: "AMX-2025-C4", stock: 18, min: 40, price: 12.00, expiry: "2026-06-30" },
  { id: "med-04", name: "Metformin (500mg)", generic: "Metformin HCl", category: "Antidiabetic", batch: "MET-2026-A2", stock: 210, min: 50, price: 8.50, expiry: "2027-09-20" },
  { id: "med-05", name: "Atorvastatin (20mg)", generic: "Atorvastatin Calcium", category: "Statin / Cardiac", batch: "ATV-2026-E1", stock: 95, min: 35, price: 16.00, expiry: "2027-11-10" },
  { id: "med-06", name: "Cetirizine (10mg)", generic: "Cetirizine HCl", category: "Antihistamine", batch: "CET-2026-D1", stock: 120, min: 30, price: 4.50, expiry: "2027-05-15" },
];

const initialQueue: PendingPrescription[] = [
  { id: "rx-402", patientName: "Bob Williams", patientCode: "PAT-10022", doctorName: "Dr. Emily Jones", date: "2026-11-03", medicine: "Paracetamol (500mg)", dosage: "1-2 tablets twice daily", status: "PENDING" },
  { id: "rx-403", patientName: "Charlie Brown", patientCode: "PAT-10023", doctorName: "Dr. John Smith", date: "2026-11-03", medicine: "Aspirin (100mg)", dosage: "1 tablet once daily after meal", status: "PENDING" },
];

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [dispenseQueue, setDispenseQueue] = useState<PendingPrescription[]>(initialQueue);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Add Med Form
  const [name, setName] = useState("");
  const [generic, setGeneric] = useState("");
  const [category, setCategory] = useState("Antibiotics");
  const [batch, setBatch] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [expiry, setExpiry] = useState("2027-12-31");

  // Restock Form
  const [restockQty, setRestockQty] = useState("50");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name,
      generic: generic || name,
      category,
      batch: batch || `BCH-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: parseInt(qty) || 100,
      min: 30,
      price: parseFloat(price) || 5.0,
      expiry,
    };

    setMedicines([newMed, ...medicines]);
    setShowAddModal(false);
    triggerToast(`Added ${newMed.name} to pharmacy inventory.`);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const added = parseInt(restockQty) || 50;
    setMedicines(
      medicines.map((m) =>
        m.id === selectedMed.id ? { ...m, stock: m.stock + added } : m
      )
    );
    setShowRestockModal(false);
    triggerToast(`Restocked ${added} units for ${selectedMed.name}. New total: ${selectedMed.stock + added}`);
  };

  const handleDispense = (rxId: string, medicineName: string) => {
    // 1. Deduct 1 unit from medicine inventory
    setMedicines((prev) =>
      prev.map((m) =>
        m.name.toLowerCase().includes(medicineName.toLowerCase().slice(0, 5))
          ? { ...m, stock: Math.max(0, m.stock - 1) }
          : m
      )
    );

    // 2. Mark queue item dispensed
    setDispenseQueue((prev) =>
      prev.map((q) => (q.id === rxId ? { ...q, status: "DISPENSED" } : q))
    );

    triggerToast(`Prescription #${rxId} dispensed! Stock deducted automatically.`);
  };

  const lowStockCount = medicines.filter((m) => m.stock <= m.min).length;

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.batch.toLowerCase().includes(search.toLowerCase())
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
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pharmacy & Dispensary</h1>
            <Badge variant="purple">Dispensary Live</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Medicine stock tracking, expiry management, automated dispensary & supplier orders</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Add New Medicine
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Medicines</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{medicines.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            💊
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Low Stock Alerts</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{lowStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Dispensary Queue</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">
              {dispenseQueue.filter((q) => q.status === "PENDING").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            📝
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Inventory Value</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(medicines.reduce((acc, m) => acc + m.stock * m.price, 0))}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            💵
          </div>
        </div>
      </div>

      {/* Dispensary Queue (Action Required) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Physician Prescription Dispensary Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fulfill digital prescriptions issued by attending doctors</p>
          </div>
          <Badge variant="warning">{dispenseQueue.filter((q) => q.status === "PENDING").length} Pending Orders</Badge>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {dispenseQueue.map((rx) => (
            <div key={rx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{rx.id.toUpperCase()}</span>
                  <span className="text-sm font-bold text-slate-900">{rx.patientName}</span>
                  <span className="text-xs text-slate-400 font-mono">({rx.patientCode})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Prescribed by <span className="font-semibold text-blue-600">{rx.doctorName}</span> • Medicine: <span className="font-bold text-slate-800">{rx.medicine}</span> ({rx.dosage})
                </p>
              </div>

              <div>
                {rx.status === "PENDING" ? (
                  <Button
                    size="sm"
                    onClick={() => handleDispense(rx.id, rx.medicine)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    ✓ Dispense & Deduct Stock
                  </Button>
                ) : (
                  <Badge variant="success">✓ Dispensed</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Pharmacy Stock Catalog</h3>
            <p className="text-xs text-slate-500">Monitored safety thresholds and batch expirations</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, generic, batch..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Medicine & Generic</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Batch Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Stock Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((m) => {
                const isLow = m.stock <= m.min;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.generic}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{m.category}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{m.batch}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-black ${isLow ? "text-amber-600" : "text-slate-900"}`}>
                          {m.stock} units
                        </span>
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            Low (≤{m.min})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Adequate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{formatCurrency(m.price)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{m.expiry}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMed(m);
                          setShowRestockModal(true);
                        }}
                        className="text-xs font-bold text-amber-700 hover:bg-amber-50"
                      >
                        + Restock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Medicine */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Medicine to Pharmacy"
        description="Enter drug details, safety threshold, and batch expiration."
      >
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Brand Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ciprofloxacin (500mg)" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Generic Compound</label>
              <Input value={generic} onChange={(e) => setGeneric(e.target.value)} placeholder="e.g. Ciprofloxacin HCl" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="Antibiotics">Antibiotics</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Antihistamine">Antihistamine</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Initial Stock</label>
              <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="100" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unit Price (₹)</label>
              <Input type="number" step="0.1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8.50" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Batch Code</label>
              <Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="BCH-2026" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Expiration Date</label>
            <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Save Medicine</Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Restock */}
      <Dialog
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        title={selectedMed ? `Restock Batch: ${selectedMed.name}` : "Restock"}
        description={`Current stock: ${selectedMed?.stock} units`}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Quantity to Receive into Inventory</label>
            <Input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="50" required />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowRestockModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Confirm Restock</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
