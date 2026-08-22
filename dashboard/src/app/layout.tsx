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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f8fafc] text-slate-900 min-h-screen flex selection:bg-indigo-100 selection:text-indigo-900">
        {/* Background ambient lighting */}
        <div className="ambient-glow" />

        {/* Persistent App Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative z-10 bg-[#f8fafc]">
          {children}
        </main>
      </body>
    </html>
  );
}
