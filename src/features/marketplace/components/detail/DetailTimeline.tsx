interface Stage { stage: string; days: number }

const defaultStages: Stage[] = [
  { stage: "Requirements Review", days: 1 },
  { stage: "Initial Draft", days: 2 },
  { stage: "Revision Round", days: 1 },
  { stage: "Final Delivery", days: 1 },
];

interface Props { stages?: Stage[] }

export default function DetailTimeline({ stages }: Props) {
  const items = stages && stages.length > 0 ? stages : defaultStages;
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Delivery Timeline</h3>
      <div className="space-y-2">
        {items.map((s, i) => (
          <div key={s.stage} className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border">
            <span className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold">
              {i + 1}
            </span>
            <span className="flex-1 text-sm text-foreground">{s.stage}</span>
            <span className="text-xs font-mono text-muted-foreground">{s.days} day{s.days > 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
