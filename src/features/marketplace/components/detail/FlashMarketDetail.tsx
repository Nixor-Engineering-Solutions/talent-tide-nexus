import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Zap, AlertTriangle } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
import ProposalModal from "../ProposalModal";
import LoginPrompt from "@/components/shared/LoginPrompt";
import DetailSellerCard from "./DetailSellerCard";
import DetailInteractionBar from "./DetailInteractionBar";
import DetailStatsGrid from "./DetailStatsGrid";
import DetailReviews from "./DetailReviews";
import DetailTags from "./DetailTags";
import DetailFAQ from "./DetailFAQ";
import DetailRequirements from "./DetailRequirements";
import DetailTimeline from "./DetailTimeline";

interface Props { listing: any; sellerProfile: any; reviews: any[]; gigId: string }

export default function FlashMarketDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const flashConfig = listing.flash_config as any;
  const spMultiplier = flashConfig?.sp_multiplier || 2.5;
  const multipliedValue = Math.round((listing.points || 0) * spMultiplier);

  useEffect(() => {
    if (!listing.ends_at) return;
    const update = () => setTimeLeft(Math.max(0, Math.floor((new Date(listing.ends_at).getTime() - Date.now()) / 1000)));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [listing.ends_at]);

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 3600 && timeLeft > 0;

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/flash-market" className="hover:text-foreground">Flash Market</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-badge-gold bg-badge-gold/10 px-2.5 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5" />Flash Market
                </span>
                <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xs font-mono font-bold text-badge-gold bg-badge-gold/10 px-2 py-1 rounded-lg">
                  {spMultiplier}× SP
                </motion.span>
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Flash Deal</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Flash Deal Panel */}
            <div className="rounded-2xl border-2 border-badge-gold/30 bg-gradient-to-r from-badge-gold/5 to-alert-red/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-badge-gold" />
                <h3 className="text-lg font-heading font-bold text-foreground">Flash Deal — {spMultiplier}× SP Multiplier</h3>
              </div>

              {/* Countdown */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[{ label: "Hours", value: String(hrs).padStart(2, "0") }, { label: "Minutes", value: String(mins).padStart(2, "0") }, { label: "Seconds", value: String(secs).padStart(2, "0") }].map(t => (
                  <div key={t.label} className={`text-center rounded-xl border p-4 ${urgent ? "border-alert-red/30 bg-alert-red/5" : "border-badge-gold/10 bg-background/50"}`}>
                    <motion.p animate={urgent ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }} className={`text-4xl font-mono font-black tabular-nums ${urgent ? "text-alert-red" : "text-badge-gold"}`}>
                      {t.value}
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">{t.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-badge-gold/10 p-4 text-center">
                  <p className="text-3xl font-mono font-black text-badge-gold">{multipliedValue} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Multiplied Value</p>
                </div>
                <div className="rounded-xl bg-surface-1 p-4 text-center">
                  <p className="text-lg font-mono text-muted-foreground line-through">{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Original Value</p>
                </div>
              </div>

              {urgent && (
                <div className="mt-4 flex items-center gap-1.5 text-sm text-alert-red font-heading font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Expires soon — act fast!
                </div>
              )}
            </div>

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailTimeline />
            <DetailReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000} verified={sellerProfile?.id_verified || false} university={sellerProfile?.university} completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5} />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              <div className="rounded-xl bg-badge-gold/10 border border-badge-gold/20 p-4 text-center">
                <motion.p animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-3xl font-mono font-black text-badge-gold">
                  {multipliedValue} SP
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">{spMultiplier}× multiplied</p>
              </div>
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Grab Flash Deal" ctaIcon={<Zap className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-gradient-to-r from-badge-gold to-alert-red text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
