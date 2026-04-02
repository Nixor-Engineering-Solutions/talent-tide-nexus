import { Layers, Users, Shield } from "lucide-react";
import { type Gig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface Props { gig: Gig; onClick: () => void; }

export default function CoCreationCard({ gig, onClick }: Props) {
  const tier = eloTier(gig.elo);
  const totalSlots = 4;
  const filledSlots = 2;
  const openSlots = totalSlots - filledSlots;

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-court-blue/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-mono text-court-blue bg-court-blue/10 px-2 py-0.5 rounded-md">
            <Layers className="w-3 h-3" />CO-CREATION
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-court-blue">
            <Users className="w-3 h-3" />{openSlots} open
          </span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.desc}</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Looking for:</span>
          <span className="text-xs font-heading font-semibold text-foreground">{gig.wants}</span>
        </div>

        {/* Team avatar stack */}
        <div className="mt-2.5 flex items-center gap-1">
          <div className="flex -space-x-2">
            {[gig.avatar, "C"].map((a, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-court-blue/10 border-2 border-card flex items-center justify-center text-[9px] font-bold text-court-blue">
                {a}
              </div>
            ))}
            {Array.from({ length: openSlots }).map((_, i) => (
              <div key={`open-${i}`} className="w-6 h-6 rounded-full bg-surface-2 border-2 border-card border-dashed flex items-center justify-center text-[9px] text-muted-foreground">
                ?
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">{filledSlots}/{totalSlots} members</span>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      <div className="px-4 py-3 flex items-center justify-between">
        <UserPreviewPopover
          name={gig.seller} avatar={gig.avatar} elo={gig.elo} rating={gig.rating}
          verified={gig.verified} uni={gig.uni} completedSwaps={gig.completedSwaps}
        >
          <div onClick={e => e.stopPropagation()} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-7 h-7 rounded-lg ${tier.bg} ${tier.border} border flex items-center justify-center font-heading font-bold text-[10px] ${tier.color}`}>
              {gig.avatar}
            </div>
            <span className="text-xs font-heading font-semibold text-foreground">{gig.seller}</span>
            {gig.verified && <Shield className="w-3 h-3 text-skill-green" />}
          </div>
        </UserPreviewPopover>
        {gig.points > 0 && <span className="text-sm font-mono font-bold text-skill-green">+{gig.points} SP</span>}
      </div>
    </button>
  );
}
