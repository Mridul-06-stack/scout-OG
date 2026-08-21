import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Scout — Self-Learning Opportunity & Workflow Radar",
  description:
    "A generalized engine that turns recurring browser workflows into learned, reusable, autonomous commands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090a10] text-slate-100 min-h-screen flex">
        {/* Background ambient lighting */}
        <div className="ambient-glow" />

        {/* Persistent App Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
