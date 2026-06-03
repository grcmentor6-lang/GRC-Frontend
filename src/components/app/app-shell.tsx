"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/components/auth/auth-provider";
import { DASH_NAV, initialsOf } from "./nav";
import { FloatingMentor } from "./floating-mentor";

function DashSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <aside
      className={`shrink-0 h-full bg-white/60 backdrop-blur-xl border-r border-slate-200/70 flex flex-col transition-all duration-300 print:hidden ${collapsed ? "w-[68px]" : "w-[244px]"}`}
    >
      <div className="h-[68px] flex items-center px-4 gap-3 border-b border-slate-200/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" size={18} />
        </button>
        {!collapsed && (
          <div className="flex items-baseline gap-0">
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">grc</span>
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 self-center mt-1" />
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {DASH_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.soon ? `${item.label} — coming soon` : item.label}
              className={`group w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-all no-underline ${
                active ? "bg-indigo-50/80 text-indigo-700" : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              <Icon name={item.icon} size={17} strokeWidth={active ? 2 : 1.6} />
              {!collapsed && (
                <>
                  <span className={`text-[13.5px] tracking-tight ${active ? "font-medium" : ""}`}>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-auto px-1.5 h-5 rounded-md text-[11px] font-medium flex items-center ${
                        active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = initialsOf(user?.firstName, user?.lastName, user?.email);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "";

  const onSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="relative pl-3 ml-1 border-l border-slate-200/70" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 h-11 pl-1.5 pr-2 rounded-xl transition-colors ${open ? "bg-slate-100" : "hover:bg-slate-100/70"}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[12px] font-semibold ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden lg:block text-left leading-tight">
          <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{user?.firstName || "Account"}</div>
          <div className="text-[10.5px] text-slate-500 capitalize">{user?.role || "Mentee"}</div>
        </div>
        <Icon name="chevronDown" size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[284px] rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_8px_40px_-8px_rgba(15,23,42,0.22)] overflow-hidden z-50">
          <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 border-b border-slate-100">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[15px] font-semibold ring-2 ring-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-slate-900 tracking-tight truncate">{name}</div>
              <div className="text-[11.5px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="group w-full h-10 px-2.5 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors no-underline"
            >
              <Icon name="settings" size={17} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-[13px] tracking-tight">Account Settings</span>
              <Icon name="chevronRight" size={14} className="ml-auto text-slate-300 group-hover:text-slate-400" />
            </Link>
          </div>
          <div className="p-1.5 border-t border-slate-100">
            <button
              onClick={onSignOut}
              className="w-full h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Icon name="logout" size={16} />
              <span className="text-[13px] font-medium tracking-tight">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashTopBar() {
  return (
    <div className="relative z-30 h-[68px] shrink-0 flex items-center justify-between px-6 border-b border-slate-200/70 bg-white/40 backdrop-blur-xl print:hidden">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white text-[12px] font-mono font-semibold">G</span>
        <div>
          <div className="text-[13.5px] font-semibold tracking-tight text-slate-900">GRC 101</div>
          <div className="text-[11px] text-slate-500">Foundations</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-500">
          <Icon name="search" size={15} />
          <span className="text-[12.5px]">Search tasks…</span>
        </div>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative" aria-label="Notifications">
          <Icon name="bell" size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>
        <UserMenu />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#FAFAF7] print:h-auto print:w-auto print:overflow-visible print:block">
      <DashSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <DashTopBar />
        <main className="flex-1 min-h-0 overflow-y-auto print:overflow-visible print:h-auto">{children}</main>
      </div>
      <div className="print:hidden"><FloatingMentor /></div>
    </div>
  );
}
