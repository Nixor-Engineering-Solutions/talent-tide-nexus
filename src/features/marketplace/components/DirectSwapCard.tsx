import { Handshake, ArrowRight, Star, Shield, Clock, Eye, GraduationCap, Trophy } from "lucide-react";
import { type Gig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";
import GuildPreviewPopover from "./GuildPreviewPopover";

interface Props { gig: Gig; onClick: () => void; }

export default function DirectSwapCard({ gig, onClick }: Props) {
  const tier = eloTier(gig.elo);

  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl border ${tier.border} bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg ${tier.glow} overflow-hidden group`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-mono text-skill-green bg-skill-green/10 px-2 py-0.5 rounded-md">
            <Handshake className="w-3 h-3" />DIRECT SWAP
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">{gig.posted}</span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3 leading-tight">{gig.skill}</h3>

        {/* Exchange visual */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-surface-1 border border-border px-3 py-2">
          <div className="flex-1">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Offering</p>
            <p className="text-xs font-heading font-semibold text-skill-green">{gig.skill}</p>
          </div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-2 border border-border">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Wants</p>
            <p className="text-xs font-heading font-semibold text-foreground">{gig.wants}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{gig.desc}</p>
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
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-heading font-semibold text-foreground">{gig.seller}</span>
                {gig.verified && <Shield className="w-3 h-3 text-skill-green" />}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`font-mono ${tier.color}`}>{tier.label}</span>
                <Star className="w-2.5 h-2.5 text-badge-gold fill-current" />
                <span>{gig.rating}</span>
                {gig.uni && <><GraduationCap className="w-2.5 h-2.5" />{gig.uni}</>}
              </div>
            </div>
          </div>
        </UserPreviewPopover>

        <div className="flex items-center gap-3">
          {gig.points > 0 && <span className="text-sm font-mono font-bold text-skill-green">+{gig.points} SP</span>}
          {gig.guildName && gig.guildId && (
            <GuildPreviewPopover guildName={gig.guildName} guildId={gig.guildId}>
              <span onClick={e => e.stopPropagation()} className="flex items-center gap-0.5 text-[10px] text-badge-gold cursor-pointer hover:underline">
                <Trophy className="w-2.5 h-2.5" />{gig.guildName}
              </span>
            </GuildPreviewPopover>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-4 pb-3 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{gig.views}</span>
        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{gig.deliveryDays}d delivery</span>
      </div>
    </button>
  );
}
