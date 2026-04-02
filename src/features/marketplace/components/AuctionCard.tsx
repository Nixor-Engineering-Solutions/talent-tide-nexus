import { useState, useEffect } from "react";
import { Gavel, Shield, Eye, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { type Gig } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface AuctionCardProps {
  gig: Gig;
  onClick: () => void;
}

export default function AuctionCard({ gig, onClick }: AuctionCardProps) {
  const tier = eloTier(gig.elo);
  const [timeLeft, setTimeLeft] = useState(gig.endsIn || 0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 60000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const hours = Math.floor(timeLeft / 60);
  const mins = timeLeft % 60;
  const urgent = timeLeft < 60;

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-alert-red/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-mono text-alert-red bg-alert-red/10 px-2 py-0.5 rounded-md">
              <Gavel className="w-3 h-3" />AUCTION
            </span>
            {/* Reserve badge */}
            <span className="text-[10px] font-mono text-skill-green bg-skill-green/10 px-1.5 py-0.5 rounded-md">
              Reserve Met
            </span>
          </div>
          <span className={`text-[10px] font-mono ${urgent ? "text-alert-red animate-pulse" : "text-muted-foreground"}`}>
            {timeLeft > 0 ? `${hours}h ${mins}m left` : "Ended"}
          </span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{gig.skill}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gig.desc}</p>

        {/* Bid info with pulse */}
        <div className="mt-3 flex items-center gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Current Bid</p>
            <motion.p
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg font-mono font-bold text-skill-green"
            >
              {gig.currentBid} SP
            </motion.p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Bids</p>
            <p className="text-lg font-mono font-bold text-foreground">{gig.bidCount}</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1.5 rounded-lg bg-alert-red/10 text-alert-red text-xs font-heading font-semibold">
              Place Bid
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      {/* Seller */}
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
              <span className={`text-[10px] font-mono ${tier.color}`}>{tier.label} · {gig.elo}</span>
            </div>
          </div>
        </UserPreviewPopover>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{gig.views}</span>
        </div>
      </div>
    </button>
  );
}
