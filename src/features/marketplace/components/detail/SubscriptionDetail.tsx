import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, RefreshCw, Coins, Package, Shield as ShieldIcon } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
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

interface Props { listing: any; sellerProfile: any; reviews: any[]; gigId: string }

export default function SubscriptionDetail({ listing, sellerProfile, reviews, gigId }: Props) {
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
  const interval = listing.subscription_interval || "monthly";

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/sp-only" className="hover:text-foreground">SP Only</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5" />Subscription
                </span>
                <span className="flex items-center gap-1 text-xs font-mono text-badge-gold bg-badge-gold/10 px-2 py-1 rounded-lg">
                  <Coins className="w-3 h-3" />SP Only
                </span>
                {hasTiers && <span className="flex items-center gap-1 text-xs font-mono text-court-blue bg-court-blue/10 px-2 py-1 rounded-lg"><Package className="w-3 h-3" />3 Packages</span>}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Subscription</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Billing Info */}
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-heading font-bold text-foreground">Subscription Details</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-surface-1 border border-border p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-teal-400">{listing.points} SP</p>
                  <p className="text-[10px] text-muted-foreground mt-1">per {interval}</p>
                </div>
                <div className="rounded-xl bg-surface-1 border border-border p-4 text-center">
                  <p className="text-lg font-heading font-bold text-foreground capitalize">{interval}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Billing Cycle</p>
                </div>
                <div className="rounded-xl bg-surface-1 border border-border p-4 text-center flex flex-col items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-skill-green mb-1" />
                  <p className="text-[10px] text-skill-green font-mono">Cancel Anytime</p>
                </div>
              </div>
            </div>

            {hasTiers && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Subscription Tiers</h3>
                <TierSelector tiers={listing.tiers} selected={selectedTier} onSelect={setSelectedTier} revisionCostSp={listing.revision_cost_sp} />
              </div>
            )}

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000} verified={sellerProfile?.id_verified || false} university={sellerProfile?.university} completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5} />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              <div className="rounded-xl bg-teal-400/5 border border-teal-400/20 p-4 text-center">
                <p className="text-2xl font-mono font-bold text-teal-400">{hasTiers ? listing.tiers[selectedTier]?.price_sp : listing.points} SP</p>
                <p className="text-xs text-muted-foreground mt-1">per {interval}</p>
              </div>
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Subscribe" ctaIcon={<RefreshCw className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-teal-500 text-white font-heading font-bold text-sm hover:bg-teal-500/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
