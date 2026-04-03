import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Handshake, ArrowRight, Repeat } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
import { formatDistanceToNow } from "date-fns";
import ProposalModal from "../ProposalModal";
import LoginPrompt from "@/components/shared/LoginPrompt";
import TierSelector from "../TierSelector";
import DetailSellerCard from "./DetailSellerCard";
import DetailInteractionBar from "./DetailInteractionBar";
import DetailStatsGrid from "./DetailStatsGrid";
import DetailReviews from "./DetailReviews";
import DetailTags from "./DetailTags";
import DetailFAQ from "./DetailFAQ";
import DetailRequirements from "./DetailRequirements";
import DetailTimeline from "./DetailTimeline";

interface Props { listing: any; sellerProfile: any; reviews: any[]; gigId: string }

export default function DirectSwapDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("basic");

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const hasTiers = listing.tiers?.basic;
  const postedAgo = (() => { try { return formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }); } catch { return ""; } })();

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-mono text-skill-green bg-skill-green/10 px-2.5 py-1 rounded-lg">
                  <Handshake className="w-3.5 h-3.5" />Direct Swap
                </span>
                {listing.hot && <span className="text-xs font-mono text-alert-red bg-alert-red/10 px-2 py-1 rounded-lg">🔥 Trending</span>}
                {postedAgo && <span className="text-[10px] text-muted-foreground ml-auto">{postedAgo}</span>}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{listing.completed_swaps || 0} swaps completed</span>
              </div>
            </div>

            {/* Exchange Visual */}
            <div className="rounded-2xl border border-skill-green/20 bg-skill-green/5 p-6">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="text-center p-4 rounded-xl bg-surface-1 border border-border">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Offering</p>
                  <p className="text-lg font-heading font-bold text-skill-green">{listing.title}</p>
                </div>
                <div className="relative text-center p-4 rounded-xl bg-surface-1 border border-border">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center z-10">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Wants</p>
                  <p className="text-lg font-heading font-bold text-foreground">{listing.wants || "Open to offers"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Gig</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {hasTiers && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Packages</h3>
                <TierSelector tiers={listing.tiers} selected={selectedTier} onSelect={setSelectedTier} revisionCostSp={listing.revision_cost_sp} />
              </div>
            )}

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailTimeline />
            <DetailReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000} verified={sellerProfile?.id_verified || false} university={sellerProfile?.university} completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5} />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              {listing.points > 0 && (
                <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-skill-green">+{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Bonus SkillPoints</p>
                </div>
              )}
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Propose Swap" ctaIcon={<Handshake className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-foreground text-background font-heading font-bold text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
