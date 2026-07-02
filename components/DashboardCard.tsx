import Link from "next/link";

type DashboardCardProps = {
  title: string;
  emoji: string;
  children: React.ReactNode;
  newHref: string;
  historyHref: string;
};

export default function DashboardCard({
  title,
  emoji,
  children,
  newHref,
  historyHref,
}: DashboardCardProps) {
  return (
    <section className="rounded-2xl bg-slate-900 p-5 min-h-[300px]">
      <h2 className="text-2xl font-bold">
        {emoji} {title}
      </h2>

      <div className="mt-6 text-slate-300">
        {children}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={newHref}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold"
        >
          ➕ New
        </Link>

        <Link
          href={historyHref}
          className="rounded-lg bg-slate-800 px-4 py-2"
        >
          📈 History
        </Link>
      </div>
    </section>
  );
}
