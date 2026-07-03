"use client";

import Link from "next/link";
import { RankingBadgeResult } from "@/lib/ranking";

/**
 * The dashboard identity badge — always labeled "Estimate," since it's
 * derived from a hand-picked approximate reference (lib/ranking/standards.ts),
 * not a live, verified global performance database. Falls back to a
 * specific "add X to see this" prompt rather than a fabricated neutral
 * badge when the athlete is missing the data it needs.
 */
export default function RankingBadge({ result }: { result: RankingBadgeResult }) {
  if (!result.available || !result.tier) {
    return (
      <p className="text-sm text-slate-500">
        {result.reason}{" "}
        <Link href="/dashboard/settings" className="text-cyan-400">
          Go to Settings →
        </Link>
      </p>
    );
  }

  const { tier, percentileLabel, ageCategoryLabel, sportLabel } = result;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
      <span className="text-xl">{tier.emoji}</span>
      <div className="leading-tight">
        <p className={`font-semibold ${tier.colorClass}`}>
          {tier.label} {sportLabel}
        </p>
        <p className="text-xs text-slate-400">
          {percentileLabel} for ages {ageCategoryLabel} · Estimate
        </p>
      </div>
    </div>
  );
}
