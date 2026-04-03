import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, HandHeart, Coins, Send } from "lucide-react";
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

interface Props { listing: any; sellerProfile: any; reviews: any[]; gigId: string }

export default function RequestDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [offerText, setOfferText] = useState("");

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/requests" className="hover:text-foreground">Requests</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-skill-green bg-skill-green/10 px-2.5 py-1 rounded-lg">
                  <HandHeart className="w-3.5 h-3.5" />Request
                </span>
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            {/* What I Need */}
            <div className="rounded-2xl border border-skill-green/20 bg-skill-green/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HandHeart className="w-5 h-5 text-skill-green" />
                <h3 className="text-lg font-heading font-bold text-foreground">What I Need</h3>
              </div>
              <p className="text-foreground/90 leading-relaxed mb-4">{listing.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-surface-1 border border-border p-4">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Seeking</p>
                  <p className="text-sm font-heading font-semibold text-foreground">{listing.wants || "Open to offers"}</p>
                </div>
                <div className="rounded-xl bg-surface-1 border border-border p-4">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Budget</p>
                  <p className="text-lg font-mono font-bold text-skill-green flex items-center gap-1">
                    <Coins className="w-4 h-4" />{listing.points} SP
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Offer Form */}
            <div className="rounded-2xl border border-border bg-surface-1 p-6">
              <h3 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <Send className="w-4 h-4" />Submit Your Offer
              </h3>
              <textarea
                value={offerText} onChange={e => setOfferText(e.target.value)}
                placeholder="Describe what you can offer and how you'd approach this request..."
                rows={5}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-skill-green/30 resize-none"
              />
              <button onClick={handlePropose} className="mt-3 w-full rounded-xl bg-skill-green text-background py-3 font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />Submit Offer
              </button>
            </div>

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000} verified={sellerProfile?.id_verified || false} university={sellerProfile?.university} completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5} />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 text-center">
                <p className="text-2xl font-mono font-bold text-skill-green">{listing.points} SP</p>
                <p className="text-xs text-muted-foreground mt-1">Budget</p>
              </div>
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Offer Help" ctaIcon={<HandHeart className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-skill-green text-background font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
