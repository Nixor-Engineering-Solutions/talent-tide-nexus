import { Trophy, Users, Clock, Coins } from "lucide-react";
import { type Gig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";

interface ContestCardProps {
  gig: Gig;
  onClick: () => void;
}

export default function ContestCard({ gig, onClick }: ContestCardProps) {
  const tier = eloTier(gig.elo);
  const contestConfig = (gig as any).contest_config;
  const prizes = contestConfig ? [contestConfig.prize_1st, contestConfig.prize_2nd, contestConfig.prize_3rd] : [gig.points, Math.round(gig.points * 0.5), Math.round(gig.points * 0.25)];

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-badge-gold/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
      <div className="bg-gradient-to-r from-badge-gold/10 to-badge-gold/5 px-4 py-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-heading font-bold text-badge-gold">
          <Trophy className="w-3.5 h-3.5" /> Contest
        </span>
        {gig.endsIn && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Clock className="w-3 h-3" /> {gig.endsIn}m left
          </span>
        )}
      </div>
      <div className="px-4 py-3">
        <h3 className="font-heading font-bold text-foreground text-base leading-tight">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.desc}</p>
      </div>
      <div className="px-4 pb-3 flex items-center gap-3">
        {["🥇", "🥈", "🥉"].map((medal, i) => (
          <div key={i} className="flex items-center gap-1 text-[10px]">
            <span>{medal}</span>
            <span className="font-mono font-bold text-foreground">{prizes[i]} SP</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border mx-4" />
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${tier.bg} flex items-center justify-center text-[10px] font-bold ${tier.color}`}>
            {gig.avatar}
          </div>
          <span className="text-xs text-muted-foreground">{gig.seller}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{gig.bidCount || 0} entries</span>
          <span className="flex items-center gap-0.5"><Coins className="w-3 h-3" />{gig.points} SP</span>
        </div>
      </div>
    </button>
  );
}
