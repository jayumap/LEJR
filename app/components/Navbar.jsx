"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, History, Settings, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border-primary">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-1 no-underline">
          <span className="text-xl font-bold text-text-primary tracking-tight">
            LEJR
          </span>
          <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1" />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] no-underline transition-colors duration-150 ${
                  isActive
                    ? "text-text-primary bg-bg-tertiary"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User + Sign Out */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-7 h-7 rounded-full border border-border-primary"
              />
            )}
            <span className="text-sm text-text-secondary truncate max-w-[160px]">
              {session.user?.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-text-tertiary hover:text-text-secondary text-sm cursor-pointer bg-transparent border-none transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
