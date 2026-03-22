import { useState, useEffect, forwardRef } from "react";
import {
  X, Star, Shield, Clock, Eye, ArrowRight, Heart, Share2, Bookmark, Flag,
  GraduationCap, CheckCircle2, Trophy, Gavel, Coins, Zap, Layers, GitMerge,
  Briefcase, Users, Timer, TrendingUp, ShoppingCart, Handshake, DollarSign,
  Target, AlertTriangle, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { type Gig } from "../data/mockData";
import { eloTier, formatIcon, formatColor } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";
import GuildPreviewPopover from "./GuildPreviewPopover";
import { useGigInteractions } from "../hooks/useGigInteractions";

interface Props {
  gig: Gig | null;
  open: boolean;
  onClose: () => void;
}

/* ─── Auction Preview Panel ─── */
const AuctionPanel = ({ gig }: { gig: Gig }) => {
  const [timeLeft, setTimeLeft] = useState(gig.endsIn || 0);
  useEffect(() => {
    if (!timeLeft) return;
    const iv = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 3600;

  return (
    <div className="space-y-3">
      {/* Live countdown */}
      <div className={`rounded-xl border p-4 ${urgent ? "border-alert-red/30 bg-alert-red/5" : "border-border bg-surface-1"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <Timer className="w-3 h-3 inline mr-1" />Time Remaining
          </span>
          {urgent && <span className="text-[10px] text-alert-red font-bold animate-pulse">ENDING SOON</span>}
        </div>
        <div className="flex gap-2 justify-center">
          {[
            { val: String(hrs).padStart(2, "0"), label: "HRS" },
            { val: String(mins).padStart(2, "0"), label: "MIN" },
            { val: String(secs).padStart(2, "0"), label: "SEC" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center">
              <span className={`text-2xl font-mono font-bold ${urgent ? "text-alert-red" : "text-foreground"}`}>{t.val}</span>
              <span className="text-[9px] font-mono text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current bid */}
      <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Current Bid</p>
            <p className="text-2xl font-mono font-bold text-alert-red">{gig.currentBid || 0} SP</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Bids</p>
            <p className="text-lg font-mono font-bold text-foreground">{gig.bidCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Bid input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="number"
            placeholder={`Min ${(gig.currentBid || 0) + 5} SP`}
            className="w-full h-11 rounded-xl border border-border bg-surface-1 pl-10 pr-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-alert-red/50 focus:outline-none"
          />
        </div>
        <button className="h-11 px-5 rounded-xl bg-alert-red text-background font-heading font-bold text-sm hover:bg-alert-red/90 transition-colors flex items-center gap-1.5">
          <Gavel className="w-4 h-4" />Place Bid
        </button>
      </div>

      {/* Bid history mock */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Recent Bids</h4>
        <div className="space-y-1.5">
          {[
            { user: "PixelPro", amount: gig.currentBid || 120, time: "2m ago" },
            { user: "CodeNinja", amount: (gig.currentBid || 120) - 10, time: "8m ago" },
            { user: "DesignAce", amount: (gig.currentBid || 120) - 25, time: "15m ago" },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-surface-1 border border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground">{b.user}</span>
              <span className="text-xs font-mono text-alert-red font-bold">{b.amount} SP</span>
              <span className="text-[10px] text-muted-foreground">{b.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Co-Creation Preview Panel ─── */
const CoCreationPanel = ({ gig }: { gig: Gig }) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-court-blue/20 bg-court-blue/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-court-blue" />
        <span className="text-sm font-heading font-bold text-foreground">Team Collaboration</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Join this project and contribute your skills alongside other creators.</p>

      {/* Team slots */}
      <div className="space-y-2">
        {[
          { role: "Lead Designer", filled: true, user: gig.seller },
          { role: "Frontend Dev", filled: false, user: null },
          { role: "Copywriter", filled: false, user: null },
        ].map((slot, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${slot.filled ? "border-skill-green/20 bg-skill-green/5" : "border-dashed border-border bg-surface-1"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${slot.filled ? "bg-skill-green/10 text-skill-green" : "bg-surface-2 text-muted-foreground"}`}>
                {slot.filled ? "✓" : "?"}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{slot.role}</p>
                {slot.user && <p className="text-[10px] text-muted-foreground">{slot.user}</p>}
              </div>
            </div>
            {!slot.filled && (
              <span className="text-[10px] font-mono text-court-blue bg-court-blue/10 px-2 py-0.5 rounded-md">OPEN</span>
            )}
          </div>
        ))}
      </div>
    </div>

    <button className="w-full h-11 rounded-xl bg-court-blue text-background font-heading font-bold text-sm hover:bg-court-blue/90 transition-colors flex items-center justify-center gap-1.5">
      <Users className="w-4 h-4" />Request to Join Team
    </button>
  </div>
);

/* ─── Skill Fusion Preview Panel ─── */
const SkillFusionPanel = ({ gig }: { gig: Gig }) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitMerge className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-heading font-bold text-foreground">Skill Fusion</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Multiple participants combine different skills into one deliverable.</p>

      {/* Participants */}
      <div className="space-y-2 mb-3">
        <h5 className="text-[10px] font-mono uppercase text-muted-foreground">Participants</h5>
        {[
          { name: gig.seller, skill: gig.category, elo: gig.elo },
          { name: "Waiting…", skill: "UI Design", elo: 0 },
        ].map((p, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${p.elo > 0 ? "border-purple-400/20 bg-purple-400/5" : "border-dashed border-border bg-surface-1"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.elo > 0 ? "bg-purple-400/20 text-purple-400" : "bg-surface-2 text-muted-foreground"}`}>
                {p.elo > 0 ? p.name[0] : "?"}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.skill}</p>
              </div>
            </div>
            {p.elo > 0 && <span className="text-[10px] font-mono text-purple-400">{p.elo} ELO</span>}
          </div>
        ))}
      </div>

      {/* Looking for tags */}
      <div>
        <h5 className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Looking For</h5>
        <div className="flex flex-wrap gap-1.5">
          {(gig.tags || ["UI Design", "Motion Graphics"]).slice(0, 4).map((t) => (
            <span key={t} className="px-2 py-1 rounded-md bg-purple-400/10 text-purple-400 text-[10px] font-mono border border-purple-400/20">{t}</span>
          ))}
        </div>
      </div>
    </div>

    <button className="w-full h-11 rounded-xl bg-purple-500 text-white font-heading font-bold text-sm hover:bg-purple-500/90 transition-colors flex items-center justify-center gap-1.5">
      <Sparkles className="w-4 h-4" />Apply to Fuse
    </button>
  </div>
);

/* ─── SP Only Preview Panel ─── */
const SPOnlyPanel = ({ gig }: { gig: Gig }) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-badge-gold/20 bg-badge-gold/5 p-4 text-center">
      <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Price</p>
      <p className="text-3xl font-mono font-bold text-badge-gold">{gig.points || 50} SP</p>
      <p className="text-xs text-muted-foreground mt-1">No skill swap required — pay with Skill Points</p>
    </div>

    <div className="rounded-xl border border-border bg-surface-1 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Your SP Balance</span>
        <span className="font-mono font-bold text-skill-green">1,250 SP</span>
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-muted-foreground">After Purchase</span>
        <span className="font-mono font-bold text-foreground">{1250 - (gig.points || 50)} SP</span>
      </div>
    </div>

    <button className="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
      <ShoppingCart className="w-4 h-4" />Buy Now — {gig.points || 50} SP
    </button>
  </div>
);

/* ─── Flash Market Preview Panel ─── */
const FlashMarketPanel = ({ gig }: { gig: Gig }) => {
  const [timeLeft, setTimeLeft] = useState(gig.endsIn || 7200);
  useEffect(() => {
    if (!timeLeft) return;
    const iv = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className="space-y-3">
      {/* Urgency banner */}
      <motion.div
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="rounded-xl border border-badge-gold/30 bg-gradient-to-r from-badge-gold/10 to-alert-red/10 p-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-badge-gold" />
          <span className="text-lg font-heading font-bold text-badge-gold">FLASH DEAL</span>
          <Zap className="w-5 h-5 text-badge-gold" />
        </div>
        <p className="text-xs text-muted-foreground">Expires in {hrs}h {mins}m — 2.5x SP multiplier active!</p>
      </motion.div>

      {/* Multiplier callout */}
      <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-skill-green" />
          <span className="text-xs font-medium text-foreground">SP Multiplier</span>
        </div>
        <span className="text-lg font-mono font-bold text-skill-green">2.5x</span>
      </div>

      <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">You'll earn</p>
        <p className="text-2xl font-mono font-bold text-skill-green">+{Math.round((gig.points || 30) * 2.5)} SP</p>
        <p className="text-[10px] text-muted-foreground">({gig.points || 30} base × 2.5x)</p>
      </div>

      <button className="w-full h-12 rounded-xl bg-gradient-to-r from-badge-gold to-alert-red text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" />Grab Flash Deal
      </button>
    </div>
  );
};

/* ─── Projects Preview Panel ─── */
const ProjectsPanel = ({ gig }: { gig: Gig }) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-orange-400/20 bg-orange-400/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-heading font-bold text-foreground">Project Roles</span>
      </div>

      <div className="space-y-2">
        {[
          { role: "Project Lead", filled: true, user: gig.seller },
          { role: "Backend Developer", filled: false },
          { role: "UI/UX Designer", filled: false },
          { role: "QA Tester", filled: true, user: "TestPro" },
        ].map((r, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${r.filled ? "border-skill-green/20 bg-skill-green/5" : "border-dashed border-border bg-surface-1"}`}>
            <div className="flex items-center gap-2">
              <Target className={`w-3.5 h-3.5 ${r.filled ? "text-skill-green" : "text-muted-foreground"}`} />
              <div>
                <p className="text-xs font-medium text-foreground">{r.role}</p>
                {r.filled && r.user && <p className="text-[10px] text-muted-foreground">{r.user}</p>}
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${r.filled ? "text-skill-green bg-skill-green/10" : "text-orange-400 bg-orange-400/10"}`}>
              {r.filled ? "FILLED" : "OPEN"}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Deadline & budget */}
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
        <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
        <p className="text-sm font-mono font-bold text-foreground">14 days</p>
        <p className="text-[10px] text-muted-foreground uppercase font-mono">Deadline</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
        <DollarSign className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
        <p className="text-sm font-mono font-bold text-foreground">{gig.points || 200} SP</p>
        <p className="text-[10px] text-muted-foreground uppercase font-mono">Budget</p>
      </div>
    </div>

    <button className="w-full h-11 rounded-xl bg-orange-500 text-white font-heading font-bold text-sm hover:bg-orange-500/90 transition-colors flex items-center justify-center gap-1.5">
      <Briefcase className="w-4 h-4" />Apply for a Role
    </button>
  </div>
);

/* ─── Request Preview Panel ─── */
const RequestPanel = ({ gig }: { gig: Gig }) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-skill-green" />
        <span className="text-sm font-heading font-bold text-foreground">Help Wanted</span>
      </div>
      <p className="text-xs text-muted-foreground">{gig.seller} is looking for someone with your skills. Submit an offer to help!</p>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">Budget</p>
        <p className="text-lg font-mono font-bold text-foreground">{gig.points || 50} SP</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">Responses</p>
        <p className="text-lg font-mono font-bold text-foreground">{gig.bidCount || 3}</p>
      </div>
    </div>

    <button className="w-full h-11 rounded-xl bg-skill-green text-background font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-1.5">
      <Handshake className="w-4 h-4" />Submit Your Offer
    </button>
  </div>
);

/* ─── Direct Swap (Default) CTA ─── */
const DirectSwapCTA = () => (
  <button className="w-full h-12 rounded-xl bg-foreground text-background font-heading font-bold text-sm hover:bg-foreground/90 transition-colors">
    Propose Swap
  </button>
);

/* ─── Format CTA button label ─── */
const getFormatCTA = (format: string) => {
  switch (format) {
    case "Auction": return null; // handled by AuctionPanel
    case "Co-Creation": return null;
    case "Skill Fusion": return null;
    case "SP Only": return null;
    case "Flash Market": return null;
    case "Projects": return null;
    default: return <DirectSwapCTA />;
  }
};

/* ─── Main Component ─── */
const GigQuickView = forwardRef<HTMLDivElement, Props>(({ gig, open, onClose }, ref) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const gigId = typeof gig?.id === "string" ? gig.id : undefined;
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);

  useEffect(() => {
    if (!gig?.sellerId) { setReviews([]); return; }
    const load = async () => {
      const { data } = await (supabase as any)
        .from("reviews")
        .select("*")
        .eq("reviewee_id", gig.sellerId)
        .order("created_at", { ascending: false })
        .limit(3);
      setReviews(data || []);
    };
    load();
  }, [gig?.sellerId]);

  if (!gig) return null;

  const tier = eloTier(gig.elo);
  const FormatIcon = formatIcon(gig.format);
  const fColor = formatColor(gig.format);
  const isAuction = gig.format === "Auction";
  const isCoCre = gig.format === "Co-Creation";
  const isFusion = gig.format === "Skill Fusion";
  const isSPOnly = gig.format === "SP Only";
  const isFlash = gig.format === "Flash Market";
  const isProject = gig.format === "Projects";
  const isRequest = gig.format === "Requests" || gig.wants === "Requests";

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      <div
        ref={ref}
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        {/* Header with format accent */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border z-10">
          <div className={`h-1 w-full ${
            isAuction ? "bg-alert-red" : isCoCre ? "bg-court-blue" : isFusion ? "bg-purple-400" :
            isSPOnly ? "bg-badge-gold" : isFlash ? "bg-gradient-to-r from-badge-gold to-alert-red" :
            isProject ? "bg-orange-400" : "bg-skill-green"
          }`} />
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-[10px] font-mono ${fColor} bg-surface-2 px-2 py-0.5 rounded-md`}>
                <FormatIcon className="w-3 h-3" />{gig.format}
              </span>
              {gig.hot && <span className="text-[10px] font-mono text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded-md">🔥 HOT</span>}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Title + wants */}
          <div>
            <h2 className="font-heading font-bold text-foreground text-xl leading-tight">{gig.skill}</h2>
            {!isSPOnly && !isRequest && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> Wants: <span className="text-foreground font-medium">{gig.wants}</span>
              </p>
            )}
          </div>

          {/* Seller card */}
          <div className={`rounded-xl border ${tier.border} ${tier.bg} p-4`}>
            <UserPreviewPopover
              name={gig.seller} avatar={gig.avatar} elo={gig.elo} rating={gig.rating}
              verified={gig.verified} uni={gig.uni} completedSwaps={gig.completedSwaps} skills={gig.tags}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl ${tier.bg} border ${tier.border} flex items-center justify-center font-heading font-bold text-base ${tier.color}`}>
                  {gig.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-foreground">{gig.seller}</span>
                    {gig.verified && <Shield className="w-4 h-4 text-skill-green" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-mono font-medium ${tier.color}`}>{tier.label} · {gig.elo}</span>
                    <span className="flex items-center gap-0.5 text-xs text-badge-gold">
                      <Star className="w-3 h-3 fill-current" />{gig.rating}
                    </span>
                    {gig.uni && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <GraduationCap className="w-3 h-3" />{gig.uni}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </UserPreviewPopover>
            {gig.guildName && gig.guildId && (
              <GuildPreviewPopover guildName={gig.guildName} guildId={gig.guildId}>
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-badge-gold cursor-pointer hover:underline">
                  <Trophy className="w-3 h-3" />{gig.guildName}
                </span>
              </GuildPreviewPopover>
            )}
          </div>

          {/* ═══ FORMAT-SPECIFIC PANEL ═══ */}
          {isAuction && <AuctionPanel gig={gig} />}
          {isCoCre && <CoCreationPanel gig={gig} />}
          {isFusion && <SkillFusionPanel gig={gig} />}
          {isSPOnly && <SPOnlyPanel gig={gig} />}
          {isFlash && <FlashMarketPanel gig={gig} />}
          {isProject && <ProjectsPanel gig={gig} />}
          {isRequest && <RequestPanel gig={gig} />}

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{gig.desc}</p>
          </div>

          {/* Requirements */}
          {gig.requirements && gig.requirements.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Requirements</h4>
              <div className="space-y-1.5">
                {gig.requirements.map(r => (
                  <div key={r} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-skill-green mt-0.5 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Delivery", value: `${gig.deliveryDays} days`, icon: Clock },
              { label: "Views", value: gig.views.toString(), icon: Eye },
              { label: "Swaps", value: gig.completedSwaps.toString(), icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-surface-1 border border-border p-3 text-center">
                <s.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm font-mono font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-mono">{s.label}</p>
              </div>
            ))}
          </div>

          {/* SP bonus — only for non-SP-Only formats */}
          {gig.points > 0 && !isSPOnly && (
            <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-mono">SP Bonus</p>
                <p className="text-xl font-mono font-bold text-skill-green">+{gig.points} SP</p>
              </div>
              <p className="text-xs text-muted-foreground max-w-[200px]">Additional SkillPoints included with this swap</p>
            </div>
          )}

          {/* Tags */}
          {gig.tags && (
            <div className="flex flex-wrap gap-1.5">
              {gig.tags.map(t => (
                <span key={t} className="px-2.5 py-1 bg-surface-2 text-muted-foreground text-xs font-mono rounded-lg">{t}</span>
              ))}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <div key={r.id} className="rounded-xl bg-surface-1 border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold text-foreground">{r.reviewer_name || "User"}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.overall_rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-badge-gold fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">No reviews yet</p>
              )}
            </div>
          </div>

          {/* CTA + actions */}
          <div className="space-y-3 pb-6">
            {getFormatCTA(gig.format)}

            <div className="flex gap-2">
              <button
                onClick={() => toggle("like")}
                className={`flex-1 h-10 rounded-xl border text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  userState.liked ? "border-alert-red/30 bg-alert-red/10 text-alert-red" : "border-border text-foreground hover:bg-surface-2"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${userState.liked ? "fill-current" : ""}`} />{counts.likes || "Like"}
              </button>
              <button
                onClick={() => toggle("save")}
                className={`flex-1 h-10 rounded-xl border text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  userState.saved ? "border-badge-gold/30 bg-badge-gold/10 text-badge-gold" : "border-border text-foreground hover:bg-surface-2"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${userState.saved ? "fill-current" : ""}`} />{counts.saves || "Save"}
              </button>
              <button
                onClick={share}
                className="flex-1 h-10 rounded-xl border border-border text-foreground text-xs font-heading font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />{counts.shares || "Share"}
              </button>
            </div>

            <Link
              to={`/marketplace/${gig.id}`}
              className="w-full h-10 rounded-xl border border-foreground/20 text-foreground text-xs font-heading font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
            >
              View Full Gig Page <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button onClick={() => report()} className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-alert-red transition-colors">
              <Flag className="w-3 h-3" />Report this listing
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

GigQuickView.displayName = "GigQuickView";

export default GigQuickView;
