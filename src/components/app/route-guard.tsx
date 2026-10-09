"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { isEntitled } from "@/lib/entitlement";

/** Client-side guard: waits for the auth probe, then bounces users who are unauthenticated,
 *  haven't finished their profile, or don't hold a seat on the course. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const entitled = isEntitled(user);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (!user.isProfileComplete) {
      router.replace("/complete-profile");
    } else if (!entitled) {
      router.replace("/checkout");
    }
  }, [loading, user, entitled, router]);

  if (loading || !user || !user.isProfileComplete || !entitled) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          <span className="text-[12.5px]">Loading…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
