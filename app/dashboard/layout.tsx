"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/services/auth.service";
import { fetchProfile } from "@/services/profile.service";
import { hasCompletedOnboarding } from "@/lib/athlete/domain";

/**
 * Every route under /dashboard is gated here, once, rather than in each
 * page's own hook: no session -> /login, a session with no completed
 * onboarding -> /onboarding. Pages under this layout can assume both are
 * already true.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    async function guard() {
      const { data: sessionData } = await getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const profile = await fetchProfile();
      if (!active) return;

      if (!profile || !hasCompletedOnboarding(profile)) {
        router.push("/onboarding");
        return;
      }

      setChecked(true);
    }

    guard();
    return () => {
      active = false;
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-slate-950 text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
