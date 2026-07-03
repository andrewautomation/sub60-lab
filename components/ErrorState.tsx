"use client";

interface Props {
  message: string;
  onRetry: () => void;
}

/** Shown when a Supabase fetch genuinely fails, as opposed to legitimately
 * returning no data — the two must never look the same to an athlete (see
 * services/*.service.ts). Distinct from an empty-state: this says "we
 * couldn't load your data," not "you have no data." */
export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-center">
      <p className="text-red-400">{message}</p>
      <button onClick={onRetry} className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold">
        Retry
      </button>
    </div>
  );
}
