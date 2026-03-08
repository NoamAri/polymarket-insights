interface KPI {
  value: string;
  label: string;
  sub?: string;
}

interface KPIRowProps {
  kpis: KPI[];
}

const KPIRow = ({ kpis }: KPIRowProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="bg-[image:var(--gradient-card)] border border-border rounded-2xl p-5 text-center"
        >
          <div className="text-2xl font-bold bg-[image:var(--gradient-metric)] bg-clip-text text-transparent">
            {kpi.value}
          </div>
          <div className="text-[0.7rem] text-muted-foreground uppercase tracking-wider mt-1">
            {kpi.label}
          </div>
          {kpi.sub && (
            <div className="text-[0.65rem] text-muted-foreground/40 mt-0.5">{kpi.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KPIRow;
