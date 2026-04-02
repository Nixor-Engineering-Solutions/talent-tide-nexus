import { useState, useEffect } from "react";
import { Zap, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { type Gig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface Props { gig: Gig; onClick: () => void; }

export default function FlashMarketCard({ gig, onClick }: Props) {
  const tier = eloTier(gig.elo);
  const [timeLeft, setTimeLeft] = useState((gig.endsIn || 120) * 60); // convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-badge-gold/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-mono text-badge-gold bg-badge-gold/10 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3" />FLASH
            </span>
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-[10px] font-mono text-badge-gold bg-badge-gold/10 px-1.5 py-0.5 rounded-md font-bold"
            >
              2.5× SP
            </motion.span>
          </div>
          {/* Live countdown */}
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {String(hrs).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.desc}</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-badge-gold">{Math.round(gig.points * 2.5)} SP</span>
          <span className="text-xs text-muted-foreground line-through">{gig.points} SP</span>
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
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />{gig.deliveryDays}d
        </span>
      </div>
    </button>
  );
}
