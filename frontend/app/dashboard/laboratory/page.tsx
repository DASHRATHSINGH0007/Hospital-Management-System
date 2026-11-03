"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  FlaskConical,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  FileCheck2,
  Sparkles
} from "lucide-react";

interface LabTestCatalog {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  normalRange: string;
  unit: string;
}

interface LabOrder {
  id: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  testName: string;
  testCode: string;
  normalRange: string;
  unit: string;
  status: "ORDERED" | "SAMPLE_COLLECTED" | "PROCESSING" | "COMPLETED";
  resultValue?: string;
  isAbnormal?: boolean;
  technician?: string;
  date: string;
}

const initialTests: LabTestCatalog[] = [
  { id: "lab-01", name: "Complete Blood Count (CBC)", code: "CBC-01", category: "Hematology", price: 35.0, normalRange: "13.5 - 17.5", unit: "g/dL" },
  { id: "lab-02", name: "Lipid Profile Panel", code: "LIPID-02", category: "Biochemistry", price: 55.0, normalRange: "< 200", unit: "mg/dL" },
  { id: "lab-03", name: "Fasting Blood Glucose", code: "GLU-03", category: "Biochemistry", price: 20.0, normalRange: "70 - 99", unit: "mg/dL" },
  { id: "lab-04", name: "Serum Electrolytes (Na/K/Cl)", code: "ELEC-04", category: "Biochemistry", price: 45.0, normalRange: "135 - 145", unit: "mEq/L" },
  { id: "lab-05", name: "Thyroid Stimulating Hormone (TSH)", code: "TSH-05", category: "Endocrinology", price: 40.0, normalRange: "0.4 - 4.0", unit: "mIU/L" },
];

const initialOrders: LabOrder[] = [
  {
    id: "rep-01",
    patientName: "Alice Johnson",
    patientCode: "PAT-10021",
    doctorName: "Dr. John Smith",
    testName: "Lipid Profile Panel",
    testCode: "LIPID-02",
    normalRange: "< 200",
    unit: "mg/dL",
    status: "PROCESSING",
    date: "2026-11-03",
  },
  {
    id: "rep-02",
    patientName: "Bob Williams",
    patientCode: "PAT-10022",
    doctorName: "Dr. Emily Jones",
    testName: "Complete Blood Count (CBC)",
    testCode: "CBC-01",
    normalRange: "13.5 - 17.5",
    unit: "g/dL",
    status: "COMPLETED",
    resultValue: "14.8",
    isAbnormal: false,
    technician: "Rosalind Franklin",
    date: "2026-11-03",
  },
  {
    id: "rep-03",
    patientName: "Charlie Brown",
    patientCode: "PAT-10023",
    doctorName: "Dr. John Smith",
    testName: "Fasting Blood Glucose",
    testCode: "GLU-03",
    normalRange: "70 - 99",
    unit: "mg/dL",
    status: "ORDERED",
    date: "2026-11-03",
  },
];

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "catalog">("orders");
  const [orders, setOrders] = useState<LabOrder[]>(initialOrders);
  const [tests, setTests] = useState<LabTestCatalog[]>(initialTests);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Result entry modal
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultVal, setResultVal] = useState("");
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [notes, setNotes] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenResultModal = (order: LabOrder) => {
    setSelectedOrder(order);
    setResultVal(order.resultValue || "");
    setIsAbnormal(order.isAbnormal || false);
    setShowResultModal(true);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "COMPLETED",
              resultValue: resultVal,
              isAbnormal,
              technician: "Rosalind Franklin",
            }
          : o
      )
    );

    setShowResultModal(false);
    triggerToast(`Results entered and signed for ${selectedOrder.patientName} (${selectedOrder.testName})`);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      o.testName.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Diagnostic Laboratory</h1>
            <Badge variant="purple">Lab Live</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Test order fulfillment, specimen analysis, reference ranges, and verified report publishing</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => triggerToast("New requisition form opened")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Order Diagnostic Test
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "orders" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🧪 Test Requisitions & Results ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "catalog" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 Diagnostic Test Catalog ({tests.length})
          </button>
        </div>

        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test orders..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Tab 1: Orders Queue */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Ordering Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Diagnostic Test</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Reference Range</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status & Findings</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const statusColors = {
                    ORDERED: "bg-blue-50 text-blue-700 border-blue-200",
                    SAMPLE_COLLECTED: "bg-amber-50 text-amber-700 border-amber-200",
                    PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
                    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">#{o.id.toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{o.patientName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{o.patientCode}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{o.doctorName}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-indigo-700">{o.testName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{o.testCode}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {o.normalRange} {o.unit}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusColors[o.status]}`}>
                            {o.status}
                          </span>
                          {o.status === "COMPLETED" && (
                            <span className={`text-xs font-extrabold ${o.isAbnormal ? "text-rose-600" : "text-slate-900"}`}>
                              {o.resultValue} {o.unit} {o.isAbnormal ? "(ABNORMAL)" : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {o.status !== "COMPLETED" ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenResultModal(o)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                          >
                            Enter Results
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerToast(`Downloading PDF Report for ${o.patientName}...`)}
                            className="text-xs font-bold text-indigo-600"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> PDF Report
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

      {/* Tab 2: Test Catalog */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => (
            <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <Badge variant="purple">{t.category}</Badge>
                  <span className="font-mono text-xs font-bold text-slate-400">{t.code}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-3">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-bold text-slate-700">Reference Range:</span> {t.normalRange} {t.unit}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-extrabold text-slate-900">{formatCurrency(t.price)}</span>
                <span className="text-xs text-emerald-600 font-bold">In-House Laboratory</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Enter Test Result */}
      <Dialog
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={selectedOrder ? `Record Test Results: ${selectedOrder.testName}` : "Lab Result"}
        description={selectedOrder ? `Patient: ${selectedOrder.patientName} (${selectedOrder.patientCode}) • Reference: ${selectedOrder.normalRange} ${selectedOrder.unit}` : ""}
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Measured Laboratory Value ({selectedOrder?.unit})
            </label>
            <Input
              value={resultVal}
              onChange={(e) => setResultVal(e.target.value)}
              placeholder={`e.g. 14.5`}
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="abnormal-check"
              checked={isAbnormal}
              onChange={(e) => setIsAbnormal(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <label htmlFor="abnormal-check" className="text-xs font-bold text-rose-700">
              Flag as Out-of-Range (Abnormal Finding)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Technician Diagnostic Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Specimen verified on automated hematology analyzer"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowResultModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Sign & Publish Report</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
