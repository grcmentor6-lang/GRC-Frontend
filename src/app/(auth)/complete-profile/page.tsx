"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileForm } from "@/components/auth/profile-form";

/**
 * Profile-completion gate. Reached when a signed-in user hasn't finished their profile.
 * Unauthenticated → /signin; already-complete → /app.
 */
export default function CompleteProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/signin");
    else if (user.isProfileComplete) router.replace("/app");
  }, [loading, user, router]);

  if (loading || !user || user.isProfileComplete) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] p-7">
      <div className="mb-4 text-[12px] text-slate-500 bg-slate-50 ring-1 ring-slate-200/70 rounded-lg px-3 py-2">
        Finish setting up your profile to continue to your dashboard.
      </div>
      <ProfileForm />
      <button
        onClick={async () => {
          await signOut();
          router.replace("/signin");
        }}
        className="mt-5 w-full text-center text-[12.5px] text-slate-400 hover:text-slate-600"
      >
        Sign out
      </button>
    </div>
  );
}
