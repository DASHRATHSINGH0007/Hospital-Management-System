"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, Stethoscope, Users, Activity, Pill, FlaskConical, User, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@medicore.com");
  const [password, setPassword] = useState("admin123");
  const [selectedRole, setSelectedRole] = useState("HOSPITAL_ADMIN");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const demoAccounts = [
    { role: "HOSPITAL_ADMIN", title: "Hospital Admin", email: "admin@medicore.com", pass: "admin123", path: "/dashboard/admin", icon: ShieldCheck, color: "bg-blue-600" },
    { role: "DOCTOR", title: "Dr. John Smith", email: "dr.smith@medicore.com", pass: "doctor123", path: "/dashboard/doctor", icon: Stethoscope, color: "bg-emerald-600" },
    { role: "RECEPTIONIST", title: "Receptionist Clara", email: "receptionist@medicore.com", pass: "rec123", path: "/dashboard/receptionist", icon: Users, color: "bg-purple-600" },
    { role: "NURSE", title: "Nurse Rory", email: "nurse@medicore.com", pass: "nurse123", path: "/dashboard/nurse", icon: Activity, color: "bg-teal-600" },
    { role: "PHARMACIST", title: "Pharmacist Grace", email: "pharmacist@medicore.com", pass: "pharma123", path: "/dashboard/pharmacy", icon: Pill, color: "bg-amber-600" },
    { role: "LAB_TECHNICIAN", title: "Lab Tech Rosalind", email: "labtech@medicore.com", pass: "lab123", path: "/dashboard/laboratory", icon: FlaskConical, color: "bg-indigo-600" },
    { role: "PATIENT", title: "Patient Alice", email: "alice@medicore.com", pass: "patient123", path: "/dashboard/patient", icon: User, color: "bg-rose-600" },
    { role: "SUPER_ADMIN", title: "Super Admin", email: "superadmin@medicore.com", pass: "admin123", path: "/dashboard/admin", icon: ShieldCheck, color: "bg-slate-800" },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    setErrorMessage("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const matched = demoAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.pass === password
    );

    setTimeout(() => {
      if (matched || (email && password)) {
        const targetPath = matched ? matched.path : "/dashboard/admin";
        router.push(targetPath);
      } else {
        setErrorMessage("Invalid email or password.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
        {/* Left Form Area */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-md">
                🏥
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MediCore</h2>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Smart Healthcare Platform</p>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Sign in to your portal</h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials or select a quick demo role on the right.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medicore.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium">
                    Forgot password?
                  </span>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-md"
              >
                {loading ? "Authenticating session..." : `Sign in as ${selectedRole.replace("_", " ")}`}
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Enterprise Security • 256-bit TLS</span>
            <span>Version 2.0</span>
          </div>
        </div>

        {/* Right Demo Role Switcher Panel */}
        <div className="lg:col-span-5 bg-slate-50 p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                1-Click Demo Portals
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Click any role below to pre-fill credentials and test specific workflows:
            </p>

            <div className="space-y-2">
              {demoAccounts.slice(0, 6).map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.role;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center space-x-3 group ${
                      isSelected
                        ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600"
                        : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${acc.color} text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {acc.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">→</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-slate-400">
            For academic evaluation, portfolios & technical interviews
          </div>
        </div>
      </div>
    </div>
  );
}
