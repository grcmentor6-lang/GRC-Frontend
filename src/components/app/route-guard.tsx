"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

/** Client-side guard: waits for the auth probe, then bounces unauthenticated users to the home page. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (!user.isProfileComplete) {
      router.replace("/complete-profile");
    }
  }, [loading, user, router]);

  if (loading || !user || !user.isProfileComplete) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          <span className="text-[12.5px]">Loading…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
