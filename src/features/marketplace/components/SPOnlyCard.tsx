import { Coins, Star, Shield, Clock, Package, RefreshCw } from "lucide-react";
import { type SPOnlyGig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface Props { gig: SPOnlyGig; onClick: () => void; }

export default function SPOnlyCard({ gig, onClick }: Props) {
  const tier = eloTier(gig.elo);
  const hasTiers = (gig as any).tiers;
  const isSubscription = (gig as any).is_subscription;

  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl border ${tier.border} bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg ${tier.glow} overflow-hidden`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-mono text-badge-gold bg-badge-gold/10 px-2 py-0.5 rounded-md">
              <Coins className="w-3 h-3" />SP ONLY
            </span>
            {hasTiers && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-court-blue bg-court-blue/10 px-1.5 py-0.5 rounded-md">
                <Package className="w-3 h-3" />3 tiers
              </span>
            )}
            {isSubscription && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-md">
                <RefreshCw className="w-3 h-3" />SUB
              </span>
            )}
          </div>
          {gig.hot && <span className="text-[10px] font-mono text-alert-red">🔥 Popular</span>}
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.desc}</p>

        <div className="mt-3">
          <span className="text-2xl font-mono font-bold text-skill-green">{gig.spPrice}</span>
          <span className="text-xs text-muted-foreground ml-1">SP</span>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      <div className="px-4 py-3 flex items-center justify-between">
        <UserPreviewPopover
          name={gig.seller} avatar={gig.avatar} elo={gig.elo} rating={gig.rating}
          verified={gig.verified} uni={gig.uni} completedSwaps={gig.completedGigs}
        >
          <div onClick={e => e.stopPropagation()} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-7 h-7 rounded-lg ${tier.bg} ${tier.border} border flex items-center justify-center font-heading font-bold text-[10px] ${tier.color}`}>
              {gig.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-heading font-semibold text-foreground">{gig.seller}</span>
                {gig.verified && <Shield className="w-3 h-3 text-skill-green" />}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Star className="w-2.5 h-2.5 text-badge-gold fill-current" />{gig.rating}
                <span className={`font-mono ${tier.color}`}>{gig.elo}</span>
              </div>
            </div>
          </div>
        </UserPreviewPopover>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />{gig.deliveryDays}d
        </span>
      </div>
    </button>
  );
}
