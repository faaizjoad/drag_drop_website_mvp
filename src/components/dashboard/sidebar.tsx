"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GlobeIcon, SettingsIcon, LogOutIcon, LayoutDashboardIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onClose?: () => void;
}

const NAV = [
  { href: "/dashboard", label: "Sites", icon: GlobeIcon, exact: true },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon, exact: false },
];

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-gray-900 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <LayoutDashboardIcon size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">WebBuilder</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            {user.name && (
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
            )}
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOutIcon size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
