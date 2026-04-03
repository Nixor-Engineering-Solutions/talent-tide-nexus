import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Layers, Users, Repeat } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
import { formatDistanceToNow } from "date-fns";
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

export default function CoCreationDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const rolesNeeded = listing.roles_needed as any[] || [];
  const wantsList = listing.wants ? listing.wants.split(",").map((w: string) => w.trim()) : [];

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/cocreation" className="hover:text-foreground">Co-Creation</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-court-blue bg-court-blue/10 px-2.5 py-1 rounded-lg">
                  <Layers className="w-3.5 h-3.5" />Co-Creation
                </span>
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Collaboration</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Team Roster */}
            <div className="rounded-2xl border border-court-blue/20 bg-court-blue/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-court-blue" />
                <h3 className="text-lg font-heading font-bold text-foreground">Team Roster</h3>
              </div>

              {rolesNeeded.length > 0 ? (
                <div className="space-y-2">
                  {rolesNeeded.map((role: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${role.filled ? "border-skill-green/20 bg-skill-green/5" : "border-border bg-surface-1"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${role.filled ? "bg-skill-green/10 text-skill-green" : "bg-court-blue/10 text-court-blue"}`}>
                          {role.filled ? "✓" : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-heading font-semibold text-foreground">{role.name || role.role}</p>
                          {role.skill && <p className="text-[10px] text-muted-foreground">{role.skill}</p>}
                        </div>
                      </div>
                      {!role.filled && (
                        <button onClick={handlePropose} className="text-xs font-heading font-semibold text-court-blue bg-court-blue/10 px-3 py-1.5 rounded-lg hover:bg-court-blue/20 transition-colors">
                          Apply
                        </button>
                      )}
                      {role.filled && role.filler && <span className="text-xs text-skill-green">{role.filler}</span>}
                    </div>
                  ))}
                </div>
              ) : wantsList.length > 0 ? (
                <div className="space-y-2">
                  {wantsList.map((w: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-court-blue/10 flex items-center justify-center text-xs font-bold text-court-blue">?</div>
                        <span className="text-sm font-heading font-semibold text-foreground">{w}</span>
                      </div>
                      <button onClick={handlePropose} className="text-xs font-heading font-semibold text-court-blue bg-court-blue/10 px-3 py-1.5 rounded-lg hover:bg-court-blue/20 transition-colors">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Open to collaborators — reach out to join.</p>
              )}
            </div>

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000} verified={sellerProfile?.id_verified || false} university={sellerProfile?.university} completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5} />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              {listing.points > 0 && (
                <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-skill-green">+{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">SP per collaborator</p>
                </div>
              )}
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Request to Join" ctaIcon={<Users className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-court-blue text-white font-heading font-bold text-sm hover:bg-court-blue/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
