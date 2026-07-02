type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
