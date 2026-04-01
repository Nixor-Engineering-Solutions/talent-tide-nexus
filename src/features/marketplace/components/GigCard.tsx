import { Star, Flame, Clock, Eye, Shield, ArrowRight, GraduationCap, Trophy, Tag, Repeat, Package } from "lucide-react";
import { type Gig } from "../data/mockData";
import { eloTier, formatIcon, formatColor } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";
import GuildPreviewPopover from "./GuildPreviewPopover";
import { formatDistanceToNow } from "date-fns";

interface GigCardProps {
  gig: Gig;
  viewMode: "grid" | "list";
  onClick: () => void;
}

export default function GigCard({ gig, viewMode, onClick }: GigCardProps) {
  const tier = eloTier(gig.elo);
  const FormatIcon = formatIcon(gig.format);
  const fColor = formatColor(gig.format);

  if (viewMode === "list") {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border ${tier.border} bg-card hover:bg-surface-1 transition-all hover:-translate-y-0.5 hover:shadow-lg ${tier.glow} text-left group`}
      >
        {/* Avatar */}
        <UserPreviewPopover
          name={gig.seller} avatar={gig.avatar} elo={gig.elo} rating={gig.rating}
          verified={gig.verified} uni={gig.uni} completedSwaps={gig.completedSwaps}
          skills={gig.tags}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`w-10 h-10 rounded-xl ${tier.bg} ${tier.border} border flex items-center justify-center font-heading font-bold text-sm ${tier.color} cursor-pointer flex-shrink-0`}
          >
            {gig.avatar}
          </div>
        </UserPreviewPopover>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-foreground text-sm truncate">{gig.skill}</span>
            {gig.hot && <Flame className="w-3.5 h-3.5 text-alert-red flex-shrink-0" />}
            <span className={`flex items-center gap-1 text-[10px] font-mono ${fColor}`}>
              <FormatIcon className="w-3 h-3" />{gig.format}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span>{gig.seller}</span>
            <span className={`font-mono ${tier.color}`}>{gig.elo}</span>
            <span className="flex items-center gap-0.5 text-badge-gold"><Star className="w-3 h-3 fill-current" />{gig.rating}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{gig.views}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{gig.deliveryDays}d</span>
          </div>
        </div>

        {/* Wants */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Wants</p>
          <p className="text-sm font-heading font-semibold text-foreground">{gig.wants}</p>
          {gig.points > 0 && <p className="text-xs font-mono text-skill-green">+{gig.points} SP</p>}
        </div>

        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
      </button>
    );
  }

  // Grid card
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border ${tier.border} bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg ${tier.glow} overflow-hidden group`}
    >
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] font-mono ${fColor} bg-surface-2 px-2 py-0.5 rounded-md`}>
              <FormatIcon className="w-3 h-3" />{gig.format}
            </span>
            {gig.hot && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded-md">
                <Flame className="w-3 h-3" />HOT
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{gig.posted}</span>
        </div>

        {/* Skill title */}
        <h3 className="font-heading font-bold text-foreground text-base mt-3 leading-tight">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ArrowRight className="w-3 h-3" /> Wants: <span className="text-foreground font-medium">{gig.wants}</span>
        </p>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{gig.desc}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-4" />

      {/* Seller row */}
      <div className="px-4 py-3 flex items-center justify-between">
        <UserPreviewPopover
          name={gig.seller} avatar={gig.avatar} elo={gig.elo} rating={gig.rating}
          verified={gig.verified} uni={gig.uni} completedSwaps={gig.completedSwaps}
          skills={gig.tags}
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

        <div className="text-right">
          {gig.points > 0 && (
            <span className="text-sm font-mono font-bold text-skill-green">+{gig.points} SP</span>
          )}
          {gig.guildName && gig.guildId && (
            <GuildPreviewPopover guildName={gig.guildName} guildId={gig.guildId}>
              <span
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-0.5 text-[10px] text-badge-gold cursor-pointer hover:underline"
              >
                <Trophy className="w-2.5 h-2.5" />{gig.guildName}
              </span>
            </GuildPreviewPopover>
          )}
        </div>
      </div>

      {/* Tags */}
      {gig.tags && gig.tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {gig.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] font-mono bg-surface-2 text-muted-foreground px-1.5 py-0.5 rounded">{t}</span>
          ))}
          {gig.tags.length > 3 && <span className="text-[9px] text-muted-foreground">+{gig.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer stats */}
      <div className="px-4 pb-3 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{gig.views}</span>
        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{gig.deliveryDays}d delivery</span>
        <span className="flex items-center gap-0.5"><Repeat className="w-3 h-3" />{gig.completedSwaps} swaps</span>
        {gig.posted && (
          <span>{(() => { try { return formatDistanceToNow(new Date(gig.posted), { addSuffix: true }); } catch { return gig.posted; } })()}</span>
        )}
        {(gig as any).tiers && <span className="flex items-center gap-0.5 text-court-blue"><Package className="w-3 h-3" />3 tiers</span>}
        {(gig as any).is_subscription && <span className="text-badge-gold font-mono">SUB</span>}
      </div>
    </button>
  );
}
