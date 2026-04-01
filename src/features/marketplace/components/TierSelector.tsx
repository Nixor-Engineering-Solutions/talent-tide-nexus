import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tier {
  name: string;
  description: string;
  price_sp: number;
  delivery_days: number;
  revisions: number;
  features: string[];
}

interface TierSelectorProps {
  tiers: { basic: Tier; standard: Tier; premium: Tier };
  selected: string;
  onSelect: (tier: string) => void;
  revisionCostSp?: number;
}

const TIER_KEYS = ["basic", "standard", "premium"] as const;
const TIER_COLORS: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  basic: { ring: "ring-border", bg: "bg-surface-1", text: "text-foreground", badge: "bg-surface-2 text-muted-foreground" },
  standard: { ring: "ring-court-blue/40", bg: "bg-court-blue/5", text: "text-court-blue", badge: "bg-court-blue/10 text-court-blue" },
  premium: { ring: "ring-badge-gold/40", bg: "bg-badge-gold/5", text: "text-badge-gold", badge: "bg-badge-gold/10 text-badge-gold" },
};

export default function TierSelector({ tiers, selected, onSelect, revisionCostSp }: TierSelectorProps) {
  const allFeatures = Array.from(new Set([
    ...tiers.basic.features, ...tiers.standard.features, ...tiers.premium.features,
  ].filter(Boolean)));

  return (
    <div className="grid grid-cols-3 gap-3">
      {TIER_KEYS.map((key) => {
        const tier = tiers[key];
        const c = TIER_COLORS[key];
        const active = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "relative rounded-xl border p-4 text-left transition-all",
              active ? `ring-2 ${c.ring} ${c.bg} border-transparent` : "border-border hover:border-foreground/20 bg-card"
            )}
          >
            {key === "standard" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-court-blue text-white px-2.5 py-0.5 rounded-full uppercase">
                Popular
              </span>
            )}
            <p className={cn("text-xs font-heading font-bold uppercase tracking-wider", c.text)}>{tier.name}</p>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 min-h-[28px]">{tier.description}</p>
            <p className={cn("text-2xl font-mono font-black mt-3", c.text)}>
              {tier.price_sp} <span className="text-xs font-normal">SP</span>
            </p>
            <div className="mt-3 space-y-1.5 text-[10px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-foreground font-mono">{tier.delivery_days}d</span>
              </div>
              <div className="flex justify-between">
                <span>Revisions</span>
                <span className="text-foreground font-mono">{tier.revisions}</span>
              </div>
            </div>
            {allFeatures.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                {allFeatures.map((f) => {
                  const has = tier.features.includes(f);
                  return (
                    <div key={f} className={cn("flex items-center gap-1.5 text-[10px]", has ? "text-foreground" : "text-muted-foreground/40 line-through")}>
                      <Check className={cn("w-3 h-3 flex-shrink-0", has ? "text-skill-green" : "text-muted-foreground/20")} />
                      {f}
                    </div>
                  );
                })}
              </div>
            )}
            {revisionCostSp && revisionCostSp > 0 && (
              <p className="mt-2 text-[9px] text-muted-foreground flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Extra revision: {revisionCostSp} SP
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
