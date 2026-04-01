import {
  Compass, Flame, Coins, Gavel, Layers, GitMerge, Briefcase, Zap,
  HandHeart, Sparkles, SlidersHorizontal, Plus,
} from "lucide-react";
import { modes, categories, type MarketplaceMode } from "../data/mockData";
import type { MarketplaceFilters } from "../hooks/useMarketplaceData";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Link, useNavigate } from "react-router-dom";

const modeIcons: Record<string, React.ElementType> = {
  explore: Compass, trending: Flame, "sp-only": Coins, auctions: Gavel,
  cocreation: Layers, fusion: GitMerge, projects: Briefcase, flash: Zap,
  requests: HandHeart, recommended: Sparkles,
};

const modeRoutes: Record<string, string> = {
  auctions: "/marketplace/auctions",
  cocreation: "/marketplace/cocreation",
  fusion: "/marketplace/skill-fusion",
  "sp-only": "/marketplace/sp-only",
  flash: "/marketplace/flash-market",
  projects: "/marketplace/projects",
  requests: "/marketplace/requests",
  contests: "/marketplace/contests",
};

const eloOptions = ["Any", "Bronze", "Silver", "Gold", "Diamond"];
const deliveryOptions = [
  { label: "Any", value: null },
  { label: "≤ 3 days", value: 3 },
  { label: "≤ 7 days", value: 7 },
  { label: "≤ 14 days", value: 14 },
];

interface Props {
  mode: MarketplaceMode;
  onModeChange: (m: MarketplaceMode) => void;
  filters: MarketplaceFilters;
  onFilterChange: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export default function MarketplaceSidebar({ mode, onModeChange, filters, onFilterChange, activeFilterCount, onResetFilters }: Props) {
  const navigate = useNavigate();

  const handleModeClick = (key: MarketplaceMode) => {
    const route = modeRoutes[key];
    if (route) {
      navigate(route);
    } else {
      onModeChange(key);
    }
  };

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-sm h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Browse</p>
          {modes.map(m => {
            const Icon = modeIcons[m.key] || Compass;
            const active = mode === m.key;
            const hasRoute = !!modeRoutes[m.key];
            return (
              <button
                key={m.key}
                onClick={() => handleModeClick(m.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body transition-all ${
                  active
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{m.label}</span>
                {m.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    active ? "bg-background/20 text-background" : "bg-surface-2 text-muted-foreground"
                  }`}>
                    {m.badge}
                  </span>
                )}
                {hasRoute && !active && (
                  <span className="text-[8px] text-muted-foreground/50">→</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Filters</p>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-foreground text-background text-[9px] font-mono font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={onResetFilters} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Reset
              </button>
            )}
          </div>

          <Accordion type="multiple" defaultValue={["category"]} className="space-y-0">
            <AccordionItem value="category" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-heading font-semibold text-foreground hover:no-underline">
                Category
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-0.5">
                  {categories.map(c => (
                    <button
                      key={c.label}
                      onClick={() => onFilterChange("category", c.label)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        filters.category === c.label
                          ? "bg-foreground text-background font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                    >
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="elo" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-heading font-semibold text-foreground hover:no-underline">
                ELO Range
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-0.5">
                  {eloOptions.map(e => (
                    <button
                      key={e}
                      onClick={() => onFilterChange("eloRange", e)}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        filters.eloRange === e
                          ? "bg-foreground text-background font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="verified" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-heading font-semibold text-foreground hover:no-underline">
                Verified
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <button
                  onClick={() => onFilterChange("verifiedOnly", !filters.verifiedOnly)}
                  className={`w-full px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                    filters.verifiedOnly
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {filters.verifiedOnly ? "✓ Verified Only" : "Show All"}
                </button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-heading font-semibold text-foreground hover:no-underline">
                Delivery Time
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-0.5">
                  {deliveryOptions.map(d => (
                    <button
                      key={d.label}
                      onClick={() => onFilterChange("maxDeliveryDays", d.value)}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        filters.maxDeliveryDays === d.value
                          ? "bg-foreground text-background font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="h-px bg-border" />

        <Link to="/dashboard?tab=gigs" className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-foreground text-background font-heading font-semibold text-sm hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" />
          Post a Gig
        </Link>
      </div>
    </aside>
  );
}