import { HelpCircle } from "lucide-react";

interface Props { requirements: string[] }

export default function DetailRequirements({ requirements }: Props) {
  if (requirements.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Requirements from Seller</h3>
      <div className="space-y-2">
        {requirements.map((r, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-surface-1 border border-border">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm text-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
