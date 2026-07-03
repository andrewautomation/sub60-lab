"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ErrorState from "@/components/ErrorState";
import { getSession } from "@/services/auth.service";
import { fetchProfile } from "@/services/profile.service";
import { hasCompletedOnboarding, getPrimaryDisciplines } from "@/lib/athlete/domain";
import { Discipline } from "@/lib/race/models";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  useEffect(() => {
    let active = true;

    async function guard() {
      const { data: sessionData } = await getSession();
      if (!active) return;
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { profile, error } = await fetchProfile();
      if (!active) return;

      // A genuine fetch failure must never be treated as "onboarding not
      // done yet" — that would boot an already-onboarded athlete back into
      // the setup wizard on a transient network blip.
      if (error) {
        setLoadError(error);
        return;
      }

      if (!profile || !hasCompletedOnboarding(profile)) {
        router.push("/onboarding");
        return;
      }

      setDisciplines(getPrimaryDisciplines(profile));
      setChecked(true);
    }

    guard().catch(() => {
      if (active) setLoadError("Something went wrong loading your account.");
    });
    return () => {
      active = false;
    };
  }, [router, reloadKey]);

  function retry() {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="w-full max-w-md">
          <ErrorState message={`Couldn't load your account: ${loadError}`} onRetry={retry} />
        </div>
      </div>
    );
  }

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-slate-950 text-white min-h-screen">
      <Sidebar disciplines={disciplines} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
