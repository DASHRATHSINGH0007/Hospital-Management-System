import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediCore | Smart Healthcare Management Platform",
  description: "Enterprise SaaS hospital operations, patient records, electronic prescriptions, billing, and AI predictive analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
