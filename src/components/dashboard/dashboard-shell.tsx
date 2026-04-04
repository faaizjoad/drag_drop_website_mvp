"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          "fixed md:relative inset-y-0 left-0 z-50 h-full",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-gray-100 bg-white shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon size={18} />
          </button>
          <span className="font-semibold text-gray-900 text-sm">WebBuilder</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
