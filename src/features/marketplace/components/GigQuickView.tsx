import { useState, useEffect, forwardRef } from "react";
import {
  X, Star, Shield, Clock, Eye, ArrowRight, Heart, Share2, Bookmark, Flag,
  GraduationCap, CheckCircle2, Trophy, Gavel, Coins, Zap, Layers, GitMerge,
  Briefcase, Users, Timer, TrendingUp, ShoppingCart, Handshake, DollarSign,
  Target, AlertTriangle, Sparkles, Upload, RefreshCw, HandHeart, MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { type Gig } from "../data/mockData";
import { eloTier, formatIcon, formatColor } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";
import GuildPreviewPopover from "./GuildPreviewPopover";
import { useGigInteractions } from "../hooks/useGigInteractions";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  gig: Gig | null;
  open: boolean;
  onClose: () => void;
}

/* ─── Shared: Seller Card ─── */
const PopupSellerCard = ({ gig }: { gig: Gig }) => {
  const tier = eloTier(gig.elo);
  return (
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
  );
};

/* ─── Shared: Stats Grid ─── */
const PopupStatsGrid = ({ gig }: { gig: Gig }) => (
  <div className="grid grid-cols-3 gap-3">
    {[
      { label: "Delivery", value: `${gig.deliveryDays}d`, icon: Clock },
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
);

/* ─── Shared: Tags ─── */
const PopupTags = ({ tags }: { tags?: string[] }) => {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t} className="px-2.5 py-1 bg-surface-2 text-muted-foreground text-xs font-mono rounded-lg">{t}</span>
      ))}
    </div>
  );
};

/* ─── Shared: Description ─── */
const PopupDescription = ({ text, reqs }: { text: string; reqs?: string[] }) => (
  <>
    <div>
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
      <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
    </div>
    {reqs && reqs.length > 0 && (
      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Requirements</h4>
        <div className="space-y-1.5">
          {reqs.map(r => (
            <div key={r} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-skill-green mt-0.5 flex-shrink-0" />{r}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

/* ═══════════════════════════════════════════════
   FORMAT-SPECIFIC POPUP LAYOUTS
   ═══════════════════════════════════════════════ */

/* ─── 1. Direct Swap Popup ─── */
const DirectSwapPopup = ({ gig }: { gig: Gig }) => (
  <div className="space-y-5">
    {/* Exchange visual */}
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-4 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Offering</p>
        <p className="text-lg font-heading font-bold text-skill-green">{gig.skill}</p>
        <p className="text-xs text-muted-foreground mt-1">{gig.category}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Wants</p>
        <p className="text-lg font-heading font-bold text-foreground">{gig.wants}</p>
      </div>
    </div>

    {/* Delivery timeline */}
    <div>
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Delivery Timeline</h4>
      <div className="flex items-center gap-1">
        {["Proposal", "In Progress", "Review", "Complete"].map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`w-full h-1.5 rounded-full ${i === 0 ? "bg-skill-green" : "bg-border"}`} />
            <span className="text-[9px] font-mono text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>
    </div>

    <PopupSellerCard gig={gig} />
    <PopupDescription text={gig.desc} reqs={gig.requirements} />
    <PopupStatsGrid gig={gig} />

    {gig.points > 0 && (
      <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-mono">SP Bonus</p>
          <p className="text-xl font-mono font-bold text-skill-green">+{gig.points} SP</p>
        </div>
        <p className="text-xs text-muted-foreground max-w-[200px]">Additional SkillPoints included with this swap</p>
      </div>
    )}

    <PopupTags tags={gig.tags} />

    <button className="w-full h-12 rounded-xl bg-skill-green text-background font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-2">
      <Handshake className="w-4 h-4" />Propose Swap
    </button>
  </div>
);

/* ─── 2. Auction Popup ─── */
const AuctionPopup = ({ gig }: { gig: Gig }) => {
  const [timeLeft, setTimeLeft] = useState(gig.endsIn || 0);
  const [bidAmount, setBidAmount] = useState("");
  useEffect(() => {
    if (!timeLeft) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 3600;
  const minBid = (gig.currentBid || 0) + 5;

  return (
    <div className="space-y-5">
      {/* Countdown */}
      <div className={`rounded-xl border p-5 text-center ${urgent ? "border-alert-red/30 bg-alert-red/5" : "border-border bg-surface-1"}`}>
        <div className="flex items-center justify-center gap-1 mb-2">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Time Remaining</span>
          {urgent && <span className="text-[10px] text-alert-red font-bold animate-pulse ml-2">ENDING SOON</span>}
        </div>
        <div className="flex gap-3 justify-center">
          {[
            { val: String(hrs).padStart(2, "0"), label: "HRS" },
            { val: String(mins).padStart(2, "0"), label: "MIN" },
            { val: String(secs).padStart(2, "0"), label: "SEC" },
          ].map(t => (
            <div key={t.label} className="flex flex-col items-center">
              <span className={`text-3xl font-mono font-bold ${urgent ? "text-alert-red" : "text-foreground"}`}>{t.val}</span>
              <span className="text-[9px] font-mono text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current bid + bids */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-4 text-center">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Current Bid</p>
          <p className="text-2xl font-mono font-bold text-alert-red">{gig.currentBid || 0} SP</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Bids</p>
          <p className="text-2xl font-mono font-bold text-foreground">{gig.bidCount || 0}</p>
        </div>
      </div>

      {/* Reserve indicator */}
      <div className="flex items-center gap-2 rounded-lg bg-surface-1 border border-border px-3 py-2">
        <div className="w-2 h-2 rounded-full bg-skill-green animate-pulse" />
        <span className="text-xs text-muted-foreground">Reserve price met</span>
      </div>

      {/* Bid input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            placeholder={`Min ${minBid} SP`}
            className="w-full h-12 rounded-xl border border-border bg-surface-1 pl-10 pr-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-alert-red/50 focus:outline-none"
          />
        </div>
        <button className="h-12 px-6 rounded-xl bg-alert-red text-background font-heading font-bold text-sm hover:bg-alert-red/90 transition-colors flex items-center gap-1.5">
          <Gavel className="w-4 h-4" />Place Bid
        </button>
      </div>

      {/* Bid history */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Bid History</h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {[
            { user: "PixelPro", amount: gig.currentBid || 120, time: "2m ago" },
            { user: "CodeNinja", amount: (gig.currentBid || 120) - 10, time: "8m ago" },
            { user: "DesignAce", amount: (gig.currentBid || 120) - 25, time: "15m ago" },
            { user: "DataWiz", amount: (gig.currentBid || 120) - 40, time: "22m ago" },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-surface-1 border border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground">{b.user}</span>
              <span className="text-xs font-mono text-alert-red font-bold">{b.amount} SP</span>
              <span className="text-[10px] text-muted-foreground">{b.time}</span>
            </div>
          ))}
        </div>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupStatsGrid gig={gig} />
      <PopupTags tags={gig.tags} />
    </div>
  );
};

/* ─── 3. SP Only Popup ─── */
const SPOnlyPopup = ({ gig }: { gig: Gig }) => (
  <div className="space-y-5">
    {/* Price display */}
    <div className="rounded-xl border border-badge-gold/20 bg-badge-gold/5 p-6 text-center">
      <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Price</p>
      <p className="text-4xl font-mono font-bold text-badge-gold">{gig.points || 50} SP</p>
      <p className="text-xs text-muted-foreground mt-2">No skill swap required — pay with Skill Points</p>
    </div>

    {/* Balance */}
    <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your SP Balance</span>
        <span className="font-mono font-bold text-skill-green">1,250 SP</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">After Purchase</span>
        <span className="font-mono font-bold text-foreground">{1250 - (gig.points || 50)} SP</span>
      </div>
    </div>

    <PopupSellerCard gig={gig} />
    <PopupDescription text={gig.desc} reqs={gig.requirements} />
    <PopupStatsGrid gig={gig} />
    <PopupTags tags={gig.tags} />

    <button className="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
      <ShoppingCart className="w-4 h-4" />Buy Now — {gig.points || 50} SP
    </button>
  </div>
);

/* ─── 4. Co-Creation Popup ─── */
const CoCreationPopup = ({ gig }: { gig: Gig }) => {
  const slots = [
    { role: "Lead Designer", filled: true, user: gig.seller },
    { role: "Frontend Dev", filled: false, user: null },
    { role: "Copywriter", filled: false, user: null },
    { role: "Backend Dev", filled: true, user: "CodeNinja" },
  ];
  const filledCount = slots.filter(s => s.filled).length;

  return (
    <div className="space-y-5">
      {/* Team roster */}
      <div className="rounded-xl border border-court-blue/20 bg-court-blue/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-court-blue" />
            <span className="text-sm font-heading font-bold text-foreground">Team Roster</span>
          </div>
          <span className="text-xs font-mono text-court-blue">{filledCount}/{slots.length} filled</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-2 mb-3">
          <div className="h-full rounded-full bg-court-blue transition-all" style={{ width: `${(filledCount / slots.length) * 100}%` }} />
        </div>

        <div className="space-y-2">
          {slots.map((slot, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${slot.filled ? "border-skill-green/20 bg-skill-green/5" : "border-dashed border-court-blue/30 bg-court-blue/5"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${slot.filled ? "bg-skill-green/10 text-skill-green" : "bg-court-blue/10 text-court-blue"}`}>
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

      {/* Chat preview */}
      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Team Chat</h4>
        <div className="space-y-2 rounded-xl border border-border bg-surface-1 p-3">
          {[
            { user: gig.seller, msg: "Let's finalize the wireframes by Friday", time: "2h ago" },
            { user: "CodeNinja", msg: "I'll have the API endpoints ready by then", time: "1h ago" },
            { user: gig.seller, msg: "Perfect, looking good team! 🚀", time: "45m ago" },
          ].map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-[8px] font-bold text-muted-foreground">{m.user[0]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-foreground">{m.user}</span>
                  <span className="text-[9px] text-muted-foreground">{m.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupStatsGrid gig={gig} />
      <PopupTags tags={gig.tags} />

      <button className="w-full h-12 rounded-xl bg-court-blue text-background font-heading font-bold text-sm hover:bg-court-blue/90 transition-colors flex items-center justify-center gap-2">
        <Users className="w-4 h-4" />Request to Join Team
      </button>
    </div>
  );
};

/* ─── 5. Skill Fusion Popup ─── */
const SkillFusionPopup = ({ gig }: { gig: Gig }) => {
  const participants = [
    { name: gig.seller, skill: gig.category, elo: gig.elo, filled: true },
    { name: "Waiting…", skill: "UI Design", elo: 0, filled: false },
    { name: "Waiting…", skill: "Motion Graphics", elo: 0, filled: false },
  ];
  const complexityLevels = ["Easy", "Medium", "Intermediate", "Advanced", "Expert"];
  const complexityIndex = 2;

  return (
    <div className="space-y-5">
      {/* Node visualization */}
      <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-heading font-bold text-foreground">Skill Fusion Network</span>
        </div>

        {/* Connected nodes */}
        <div className="relative flex items-center justify-center py-4">
          <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-purple-400/20" />
          {participants.map((p, i) => {
            const angle = (i * 120 - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            return (
              <div key={i} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${p.filled ? "border-purple-400 bg-purple-400/20 text-purple-400" : "border-dashed border-border bg-surface-2 text-muted-foreground"}`}>
                  {p.filled ? p.name[0] : "?"}
                </div>
              </div>
            );
          })}
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>

        {/* Participant list */}
        <div className="space-y-2 mt-4">
          {participants.map((p, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${p.filled ? "border-purple-400/20 bg-purple-400/5" : "border-dashed border-border bg-surface-1"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.filled ? "bg-purple-400/20 text-purple-400" : "bg-surface-2 text-muted-foreground"}`}>
                  {p.filled ? p.name[0] : "?"}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.skill}</p>
                </div>
              </div>
              {p.elo > 0 && <span className="text-[10px] font-mono text-purple-400">{p.elo} ELO</span>}
              {!p.filled && <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">OPEN</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Complexity meter */}
      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Complexity</h4>
        <div className="flex items-center gap-1">
          {complexityLevels.map((lvl, i) => (
            <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${i <= complexityIndex ? "bg-purple-400" : "bg-surface-2"}`} />
              <span className={`text-[8px] font-mono ${i === complexityIndex ? "text-purple-400 font-bold" : "text-muted-foreground"}`}>{lvl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Looking for tags */}
      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Skills Needed</h4>
        <div className="flex flex-wrap gap-1.5">
          {(gig.tags || ["UI Design", "Motion Graphics"]).slice(0, 5).map(t => (
            <span key={t} className="px-2.5 py-1 rounded-lg bg-purple-400/10 text-purple-400 text-xs font-mono border border-purple-400/20">{t}</span>
          ))}
        </div>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupStatsGrid gig={gig} />

      <button className="w-full h-12 rounded-xl bg-purple-500 text-background font-heading font-bold text-sm hover:bg-purple-500/90 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />Apply to Fuse
      </button>
    </div>
  );
};

/* ─── 6. Projects Popup ─── */
const ProjectsPopup = ({ gig }: { gig: Gig }) => {
  const roles = [
    { name: "Project Lead", status: "Filled", user: gig.seller, applicants: 0 },
    { name: "Backend Dev", status: "Open", user: null, applicants: 5 },
    { name: "UI/UX Designer", status: "Open", user: null, applicants: 8 },
    { name: "QA Tester", status: "Filled", user: "TestPro", applicants: 0 },
    { name: "DevOps", status: "Open", user: null, applicants: 2 },
  ];
  const filledCount = roles.filter(r => r.status === "Filled").length;

  return (
    <div className="space-y-5">
      {/* Role board */}
      <div className="rounded-xl border border-orange-400/20 bg-orange-400/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-heading font-bold text-foreground">Project Roles</span>
          </div>
          <span className="text-xs font-mono text-orange-400">{filledCount}/{roles.length} filled</span>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {["Open", "Applied", "Filled"].map(col => (
            <div key={col} className="text-center">
              <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1">{col}</p>
              <p className="text-lg font-mono font-bold text-foreground">
                {col === "Open" ? roles.filter(r => r.status === "Open").length :
                 col === "Filled" ? filledCount : roles.reduce((s, r) => s + r.applicants, 0)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {roles.map((r, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${r.status === "Filled" ? "border-skill-green/20 bg-skill-green/5" : "border-dashed border-orange-400/20 bg-orange-400/5"}`}>
              <div className="flex items-center gap-2">
                <Target className={`w-3.5 h-3.5 ${r.status === "Filled" ? "text-skill-green" : "text-orange-400"}`} />
                <div>
                  <p className="text-xs font-medium text-foreground">{r.name}</p>
                  {r.user && <p className="text-[10px] text-muted-foreground">{r.user}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.applicants > 0 && <span className="text-[10px] text-muted-foreground">{r.applicants} applied</span>}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${r.status === "Filled" ? "text-skill-green bg-skill-green/10" : "text-orange-400 bg-orange-400/10"}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline + Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-mono font-bold text-foreground">14 days</p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Deadline</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
          <DollarSign className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-mono font-bold text-skill-green">{gig.points || 200} SP</p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Total Budget</p>
        </div>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupStatsGrid gig={gig} />
      <PopupTags tags={gig.tags} />

      <button className="w-full h-12 rounded-xl bg-orange-500 text-background font-heading font-bold text-sm hover:bg-orange-500/90 transition-colors flex items-center justify-center gap-2">
        <Briefcase className="w-4 h-4" />Apply for a Role
      </button>
    </div>
  );
};

/* ─── 7. Flash Market Popup ─── */
const FlashMarketPopup = ({ gig }: { gig: Gig }) => {
  const [timeLeft, setTimeLeft] = useState(gig.endsIn || 7200);
  useEffect(() => {
    if (!timeLeft) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="space-y-5">
      {/* Urgency banner */}
      <motion.div
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="rounded-xl border border-badge-gold/30 bg-badge-gold/5 p-5 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-badge-gold" />
          <span className="text-xl font-heading font-bold text-badge-gold">FLASH DEAL</span>
          <Zap className="w-6 h-6 text-badge-gold" />
        </div>
        <div className="flex gap-3 justify-center mt-3">
          {[
            { val: String(hrs).padStart(2, "0"), label: "HRS" },
            { val: String(mins).padStart(2, "0"), label: "MIN" },
            { val: String(secs).padStart(2, "0"), label: "SEC" },
          ].map(t => (
            <div key={t.label} className="flex flex-col items-center bg-background/50 rounded-lg px-3 py-2 border border-border">
              <span className="text-2xl font-mono font-bold text-badge-gold">{t.val}</span>
              <span className="text-[9px] font-mono text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Multiplier */}
      <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-skill-green" />
          <span className="text-sm font-medium text-foreground">SP Multiplier Active</span>
        </div>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-mono font-bold text-skill-green"
        >
          2.5×
        </motion.span>
      </div>

      {/* Earnings */}
      <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">You'll Earn</p>
        <p className="text-3xl font-mono font-bold text-skill-green">+{Math.round((gig.points || 30) * 2.5)} SP</p>
        <p className="text-xs text-muted-foreground mt-1">({gig.points || 30} base × 2.5x multiplier)</p>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupStatsGrid gig={gig} />
      <PopupTags tags={gig.tags} />

      <button className="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" />Grab Flash Deal
      </button>
    </div>
  );
};

/* ─── 8. Contest Popup ─── */
const ContestPopup = ({ gig }: { gig: Gig }) => {
  const contestConfig = (gig as any).contest_config;
  const prizes = contestConfig
    ? [contestConfig.prize_1st, contestConfig.prize_2nd, contestConfig.prize_3rd]
    : [gig.points, Math.round(gig.points * 0.5), Math.round(gig.points * 0.25)];

  return (
    <div className="space-y-5">
      {/* Prize podium */}
      <div className="rounded-xl border border-badge-gold/20 bg-badge-gold/5 p-5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-badge-gold" />
          <span className="text-lg font-heading font-bold text-foreground">Prize Pool</span>
        </div>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🥈</span>
            <div className="w-20 h-16 rounded-t-lg bg-surface-2 border border-border flex items-center justify-center">
              <span className="font-mono font-bold text-foreground">{prizes[1]} SP</span>
            </div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🥇</span>
            <div className="w-24 h-24 rounded-t-lg bg-badge-gold/10 border border-badge-gold/30 flex items-center justify-center">
              <span className="font-mono font-bold text-badge-gold text-lg">{prizes[0]} SP</span>
            </div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">🥉</span>
            <div className="w-16 h-12 rounded-t-lg bg-surface-2 border border-border flex items-center justify-center">
              <span className="font-mono font-bold text-foreground text-sm">{prizes[2]} SP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Entry stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
          <p className="text-lg font-mono font-bold text-foreground">{gig.bidCount || 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Entries</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
          <p className="text-lg font-mono font-bold text-foreground">{gig.endsIn ? `${Math.floor(gig.endsIn / 60)}h` : "—"}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Remaining</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-3 text-center">
          <p className="text-lg font-mono font-bold text-skill-green">+10 SP</p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Participation</p>
        </div>
      </div>

      {/* Submit entry form */}
      <div className="rounded-xl border border-border bg-surface-1 p-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Submit Entry</h4>
        <Textarea placeholder="Describe your entry..." className="min-h-[80px] bg-background mb-3" />
        <button className="w-full h-10 rounded-lg border border-dashed border-border text-muted-foreground text-xs flex items-center justify-center gap-1.5 hover:bg-surface-2 transition-colors">
          <Upload className="w-3.5 h-3.5" />Attach files
        </button>
      </div>

      <PopupSellerCard gig={gig} />
      <PopupDescription text={gig.desc} reqs={gig.requirements} />
      <PopupTags tags={gig.tags} />

      <button className="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
        <Trophy className="w-4 h-4" />Submit Entry
      </button>
    </div>
  );
};

/* ─── 9. Request Popup ─── */
const RequestPopup = ({ gig }: { gig: Gig }) => (
  <div className="space-y-5">
    {/* What I Need */}
    <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <HandHeart className="w-5 h-5 text-skill-green" />
        <span className="text-sm font-heading font-bold text-foreground">What I Need</span>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{gig.desc}</p>
    </div>

    {/* Budget + Responses */}
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Budget</p>
        <p className="text-2xl font-mono font-bold text-skill-green">{gig.points || 50} SP</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Responses</p>
        <p className="text-2xl font-mono font-bold text-foreground">{gig.bidCount || 3}</p>
      </div>
    </div>

    {/* Exchange */}
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3">
      <div className="flex-1">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">Offering</p>
        <p className="text-xs font-heading font-semibold text-skill-green">{gig.category}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
      <div className="flex-1 text-right">
        <p className="text-[10px] font-mono uppercase text-muted-foreground">Seeking</p>
        <p className="text-xs font-heading font-semibold text-foreground">{gig.wants}</p>
      </div>
    </div>

    <PopupSellerCard gig={gig} />

    {/* Submit offer form */}
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Your Proposal</h4>
      <Textarea placeholder="Describe how you can help..." className="min-h-[100px] bg-background mb-3" />
    </div>

    <PopupTags tags={gig.tags} />

    <button className="w-full h-12 rounded-xl bg-skill-green text-background font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-2">
      <Handshake className="w-4 h-4" />Submit Your Offer
    </button>
  </div>
);

/* ─── 10. Subscription Popup ─── */
const SubscriptionPopup = ({ gig }: { gig: Gig }) => (
  <div className="space-y-5">
    {/* Billing cycle */}
    <div className="rounded-xl border border-teal-400/20 bg-teal-400/5 p-5 text-center">
      <RefreshCw className="w-6 h-6 text-teal-400 mx-auto mb-2" />
      <p className="text-[10px] font-mono uppercase text-muted-foreground">Subscription</p>
      <p className="text-3xl font-mono font-bold text-teal-400 mt-1">{gig.points || 50} SP</p>
      <p className="text-xs text-muted-foreground mt-1">per month · cancel anytime</p>
    </div>

    {/* Billing options */}
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Weekly", price: Math.round((gig.points || 50) * 0.3), active: false },
        { label: "Monthly", price: gig.points || 50, active: true },
        { label: "Quarterly", price: Math.round((gig.points || 50) * 2.5), active: false },
      ].map(opt => (
        <button key={opt.label} className={`rounded-xl border p-3 text-center transition-all ${opt.active ? "border-teal-400/30 bg-teal-400/5" : "border-border bg-surface-1 hover:bg-surface-2"}`}>
          <p className="text-xs font-heading font-semibold text-foreground">{opt.label}</p>
          <p className={`text-sm font-mono font-bold mt-0.5 ${opt.active ? "text-teal-400" : "text-muted-foreground"}`}>{opt.price} SP</p>
        </button>
      ))}
    </div>

    {/* What's included */}
    <div>
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">What's Included</h4>
      <div className="space-y-1.5">
        {["Unlimited revisions", "Priority support", "Weekly deliverables", "Direct messaging"].map(item => (
          <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />{item}
          </div>
        ))}
      </div>
    </div>

    {/* Cancel badge */}
    <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-1 border border-border px-3 py-2">
      <Shield className="w-3.5 h-3.5 text-skill-green" />
      <span className="text-xs text-muted-foreground">Cancel anytime · No lock-in · Prorated refunds</span>
    </div>

    <PopupSellerCard gig={gig} />
    <PopupDescription text={gig.desc} reqs={gig.requirements} />
    <PopupStatsGrid gig={gig} />
    <PopupTags tags={gig.tags} />

    <button className="w-full h-12 rounded-xl bg-teal-500 text-background font-heading font-bold text-sm hover:bg-teal-500/90 transition-colors flex items-center justify-center gap-2">
      <RefreshCw className="w-4 h-4" />Subscribe — {gig.points || 50} SP/mo
    </button>
  </div>
);

/* ─── Format accent color ─── */
const getAccentBorder = (format: string) => {
  switch (format) {
    case "Auction": return "border-alert-red/30";
    case "Co-Creation": return "border-court-blue/30";
    case "Skill Fusion": return "border-purple-400/30";
    case "SP Only": return "border-badge-gold/30";
    case "Flash Market": return "border-badge-gold/30";
    case "Projects": return "border-orange-400/30";
    case "Requests": return "border-skill-green/30";
    case "Contest": return "border-badge-gold/30";
    case "Subscription": return "border-teal-400/30";
    default: return "border-skill-green/30";
  }
};

const getAccentBar = (format: string) => {
  switch (format) {
    case "Auction": return "bg-alert-red";
    case "Co-Creation": return "bg-court-blue";
    case "Skill Fusion": return "bg-purple-400";
    case "SP Only": return "bg-badge-gold";
    case "Flash Market": return "bg-badge-gold";
    case "Projects": return "bg-orange-400";
    case "Requests": return "bg-skill-green";
    case "Contest": return "bg-badge-gold";
    case "Subscription": return "bg-teal-400";
    default: return "bg-skill-green";
  }
};

/* ─── Format-specific popup router ─── */
const FormatPopup = ({ gig }: { gig: Gig }) => {
  switch (gig.format) {
    case "Auction": return <AuctionPopup gig={gig} />;
    case "Co-Creation": return <CoCreationPopup gig={gig} />;
    case "Skill Fusion": return <SkillFusionPopup gig={gig} />;
    case "SP Only": return <SPOnlyPopup gig={gig} />;
    case "Flash Market": return <FlashMarketPopup gig={gig} />;
    case "Projects": return <ProjectsPopup gig={gig} />;
    case "Requests": return <RequestPopup gig={gig} />;
    case "Contest": return <ContestPopup gig={gig} />;
    case "Subscription": return <SubscriptionPopup gig={gig} />;
    default: return <DirectSwapPopup gig={gig} />;
  }
};

/* ═══════════════════════════════════════════════
   MAIN CENTERED MODAL
   ═══════════════════════════════════════════════ */
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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!gig) return null;

  const FormatIcon = formatIcon(gig.format);
  const fColor = formatColor(gig.format);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Centered Modal */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`pointer-events-auto w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl border ${getAccentBorder(gig.format)} shadow-2xl overflow-hidden flex flex-col`}
              onClick={e => e.stopPropagation()}
            >
              {/* Accent bar */}
              <div className={`h-1 w-full ${getAccentBar(gig.format)}`} />

              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-xl flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[10px] font-mono ${fColor} bg-surface-2 px-2.5 py-1 rounded-md`}>
                    <FormatIcon className="w-3.5 h-3.5" />{gig.format}
                  </span>
                  {gig.hot && <span className="text-[10px] font-mono text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded-md">🔥 HOT</span>}
                  <h2 className="font-heading font-bold text-foreground text-lg leading-tight truncate">{gig.skill}</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Format-specific popup */}
                <FormatPopup gig={gig} />

                {/* Reviews */}
                <div className="mt-6">
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
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">No reviews yet</p>
                    )}
                  </div>
                </div>

                {/* Interaction bar */}
                <div className="mt-6 space-y-3">
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

                  <button onClick={() => report()} className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-alert-red transition-colors pb-2">
                    <Flag className="w-3 h-3" />Report this listing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

GigQuickView.displayName = "GigQuickView";

export default GigQuickView;
