"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  patientCode: string;
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  status: "PAID" | "PENDING" | "PARTIALLY_PAID";
  dueDate: string;
  items: { description: string; type: string; price: number; qty: number }[];
}

const initialInvoices: Invoice[] = [
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
  {
    id: "bill-03",
    invoiceNo: "INV-2026-0003",
    patientName: "David Miller",
    patientCode: "PAT-10025",
    subTotal: 685.00,
    tax: 34.25,
    discount: 50.00,
    total: 669.25,
    paid: 300.00,
    status: "PARTIALLY_PAID",
    dueDate: "2026-11-08",
    items: [
      { description: "ICU Monitored Bed Care (1 Day)", type: "ROOM_CHARGE", price: 650.0, qty: 1 },
      { description: "Complete Blood Count (CBC) Panel", type: "LAB_TEST", price: 35.0, qty: 1 },
    ],
  },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [registeredPatients, setRegisteredPatients] = useState<{ name: string; patientCode: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CREDIT_CARD");
  const [toastMessage, setToastMessage] = useState("");

  // Add Other Amount / Custom Charge Modal State
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [targetInvoice, setTargetInvoice] = useState<Invoice | null>(null);
  const [extraDescription, setExtraDescription] = useState("");
  const [extraType, setExtraType] = useState("SURGERY");
  const [extraAmount, setExtraAmount] = useState("");

  // Generate New Invoice Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPatientName, setGenPatientName] = useState("");
  const [genItemDesc, setGenItemDesc] = useState("Emergency & Specialized Hospital Care");
  const [genItemType, setGenItemType] = useState("CONSULTATION");
  const [genAmount, setGenAmount] = useState("");
  const [genDueDate, setGenDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );

  // Load invoices and patients from localStorage
  const reloadInvoicesFromStorage = () => {
    try {
      const stored = localStorage.getItem("medicore_invoices");
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        localStorage.setItem("medicore_invoices", JSON.stringify(initialInvoices));
      }

      const storedPatients = localStorage.getItem("medicore_patients");
      if (storedPatients) {
        const parsed = JSON.parse(storedPatients);
        setRegisteredPatients(parsed.map((p: any) => ({ name: p.name, patientCode: p.patientCode })));
      }
    } catch (e) {
      console.error("Error reading invoices from storage:", e);
    }
  };

  useEffect(() => {
    reloadInvoicesFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "medicore_invoices") {
        reloadInvoicesFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persistInvoices = (updated: Invoice[]) => {
    setInvoices(updated);
    try {
      localStorage.setItem("medicore_invoices", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving invoices to storage:", e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleOpenPayModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount((inv.total - inv.paid).toFixed(2));
    setShowPayModal(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const paymentAmount = parseFloat(payAmount) || 0;
    const newPaid = selectedInvoice.paid + paymentAmount;
    const newStatus: Invoice["status"] = newPaid >= selectedInvoice.total ? "PAID" : "PARTIALLY_PAID";

    const updated = invoices.map((inv) =>
      inv.id === selectedInvoice.id ? { ...inv, paid: newPaid, status: newStatus } : inv
    );

    persistInvoices(updated);
    setShowPayModal(false);
    triggerToast(`Payment of ${formatCurrency(paymentAmount)} received via ${payMethod.replace("_", " ")}.`);
  };

  const handleOpenAddChargeModal = (inv: Invoice) => {
    setTargetInvoice(inv);
    setExtraDescription("");
    setExtraType("SURGERY");
    setExtraAmount("");
    setShowAddChargeModal(true);
  };

  const handleSaveExtraCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoice) return;

    const addedAmount = parseFloat(extraAmount) || 0;
    if (addedAmount <= 0) return;

    const newItem = {
      description: extraDescription.trim() || "Additional Medical Fee",
      type: extraType,
      price: addedAmount,
      qty: 1,
    };

    const updated = invoices.map((inv) => {
      if (inv.id === targetInvoice.id) {
        const newItems = [...inv.items, newItem];
        const newSubTotal = Number((inv.subTotal + addedAmount).toFixed(2));
        const newTax = Number((newSubTotal * 0.05).toFixed(2));
        const newTotal = Number((newSubTotal + newTax - (inv.discount || 0)).toFixed(2));
        const newStatus: Invoice["status"] = inv.paid >= newTotal ? "PAID" : (inv.paid > 0 ? "PARTIALLY_PAID" : "PENDING");
        return {
          ...inv,
          items: newItems,
          subTotal: newSubTotal,
          tax: newTax,
          total: newTotal,
          status: newStatus,
        };
      }
      return inv;
    });

    persistInvoices(updated);
    setShowAddChargeModal(false);
    triggerToast(`Added ${formatCurrency(addedAmount)} (${extraDescription || "Extra Charge"}) to ${targetInvoice.invoiceNo}!`);
  };

  const handleCreateNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(genAmount) || 0;
    if (amt <= 0) return;

    const subTotal = amt;
    const tax = Number((subTotal * 0.05).toFixed(2));
    const total = Number((subTotal + tax).toFixed(2));

    const cleanName = genPatientName.includes(" (") ? genPatientName.split(" (")[0].trim() : genPatientName.trim();
    const pCode = genPatientName.includes("#")
      ? genPatientName.split("#")[1].replace(")", "").trim()
      : `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInv: Invoice = {
      id: `bill-${Date.now()}`,
      invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: cleanName || "General Inpatient",
      patientCode: pCode,
      subTotal,
      tax,
      discount: 0,
      total,
      paid: 0,
      status: "PENDING",
      dueDate: genDueDate,
      items: [
        {
          description: genItemDesc.trim() || "Specialized Clinical Fee",
          type: genItemType,
          price: amt,
          qty: 1,
        },
      ],
    };

    persistInvoices([newInv, ...invoices]);
    setShowGenerateModal(false);
    triggerToast(`New Invoice ${newInv.invoiceNo} generated for ${newInv.patientName} (${formatCurrency(total)})!`);
    setGenPatientName("");
    setGenAmount("");
  };

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      i.patientName.toLowerCase().includes(search.toLowerCase()) ||
      i.patientCode.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Revenue Operations</h1>
            <Badge variant="success">Settlement Live</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Automated invoice compilation, insurance verification, and payment processing</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Generate Invoice / Bill
          </Button>
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Billed</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            🧾
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Collected</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            💵
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Outstanding Receivables</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(totalOutstanding)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Settlement Ratio</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">
              {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            📈
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Invoices & Ledger</h3>
            <p className="text-xs text-slate-500">Live multi-department billing: Bed admissions, consultations, pharmacy, lab, and custom charges</p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, patient..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Services & Charges</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Paid Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Payment Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === "PAID";
                const isPartial = inv.status === "PARTIALLY_PAID";

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{inv.invoiceNo}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{inv.patientName}</p>
                      <p className="text-xs text-slate-400 font-mono">{inv.patientCode}</p>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="space-y-1">
                        {inv.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-800 truncate mr-2">
                              {item.type === "ROOM_CHARGE" ? "🛏️ " : item.type === "SURGERY" ? "💉 " : "• "}
                              {item.description}
                            </span>
                            <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                              {formatCurrency(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-slate-900">
                      <div>{formatCurrency(inv.total)}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Tax (5%): {formatCurrency(inv.tax)}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">{formatCurrency(inv.paid)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={isPaid ? "success" : isPartial ? "warning" : "destructive"}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end flex-wrap gap-2">
                        {/* Add Other Amount Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAddChargeModal(inv)}
                          className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> + Add Other Amount
                        </Button>

                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPayModal(inv)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Collect Payment
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerToast(`Downloading PDF Receipt for ${inv.invoiceNo}...`)}
                          className="text-xs font-bold text-slate-700"
                        >
                          <Receipt className="w-3.5 h-3.5 mr-1" /> PDF Bill
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add Other Amount / Extra Charge to Existing Invoice */}
      <Dialog
        isOpen={showAddChargeModal}
        onClose={() => setShowAddChargeModal(false)}
        title={targetInvoice ? `Add Extra Charge: ${targetInvoice.invoiceNo}` : "Add Charge"}
        description={targetInvoice ? `Patient: ${targetInvoice.patientName} (${targetInvoice.patientCode})` : ""}
      >
        <form onSubmit={handleSaveExtraCharge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service / Charge Description</label>
            <Input
              value={extraDescription}
              onChange={(e) => setExtraDescription(e.target.value)}
              placeholder="e.g. ICU Oxygen Monitoring / Surgery Fee / Nursing Care"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Charge Category</label>
              <select
                value={extraType}
                onChange={(e) => setExtraType(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="SURGERY">Surgery & Operation</option>
                <option value="ROOM_CHARGE">Room / Bed Extra Charge</option>
                <option value="NURSING">Nursing & Care</option>
                <option value="EQUIPMENT">Equipment & Oxygen</option>
                <option value="MEDICINE">Pharmacy & IV Fluids</option>
                <option value="LAB_TEST">Diagnostic Lab Test</option>
                <option value="CONSULTATION">Specialist Consultation</option>
                <option value="OTHER">Other Custom Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                placeholder="e.g. 250.00"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-semibold">💡 Automatic Calculation Notice:</p>
            <p className="text-[11px] text-blue-700">Subtotal and 5% tax will automatically recompute, updating the total bill balance.</p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowAddChargeModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">+ Add Amount to Invoice</Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 2: Generate New Invoice */}
      <Dialog
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Hospital Invoice"
        description="Create a unified invoice for any patient with custom service charges"
      >
        <form onSubmit={handleCreateNewInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Patient Name</label>
            <Input
              list="billing-patients-list"
              value={genPatientName}
              onChange={(e) => setGenPatientName(e.target.value)}
              placeholder="Select registered patient or enter name"
              required
            />
            <datalist id="billing-patients-list">
              {registeredPatients.map((p, idx) => (
                <option key={idx} value={`${p.name} (#${p.patientCode})`} />
              ))}
            </datalist>
            {registeredPatients.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">Quick Select:</span>
                {registeredPatients.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGenPatientName(`${p.name} (#${p.patientCode})`)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold border border-slate-200 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service / Procedure Description</label>
            <Input
              value={genItemDesc}
              onChange={(e) => setGenItemDesc(e.target.value)}
              placeholder="e.g. Inpatient Admission / Full Health Checkup"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Category</label>
              <select
                value={genItemType}
                onChange={(e) => setGenItemType(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="CONSULTATION">Specialist Consultation</option>
                <option value="ROOM_CHARGE">Bed / Room Rate</option>
                <option value="SURGERY">Surgery & Operation</option>
                <option value="MEDICINE">Pharmacy & Drugs</option>
                <option value="LAB_TEST">Laboratory Testing</option>
                <option value="OTHER">Other Hospital Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Amount (₹)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={genAmount}
                onChange={(e) => setGenAmount(e.target.value)}
                placeholder="e.g. 350.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Due Date</label>
            <Input
              type="date"
              value={genDueDate}
              onChange={(e) => setGenDueDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Create Invoice</Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 3: Process Payment */}
      <Dialog
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={selectedInvoice ? `Collect Payment: ${selectedInvoice.invoiceNo}` : "Process Payment"}
        description={selectedInvoice ? `Patient: ${selectedInvoice.patientName} • Remaining Due: ${formatCurrency(selectedInvoice.total - selectedInvoice.paid)}` : ""}
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="CASH">Cash Settlement</option>
              <option value="INSURANCE">Health Insurance Claim</option>
              <option value="ONLINE_TRANSFER">Online Bank Transfer</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowPayModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Confirm & Settle</Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
