import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, GitMerge, Zap, Users } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
import { eloTier } from "../../utils/marketplace-utils";
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

export default function SkillFusionDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const fusionSkills = listing.fusion_skills as any[] || [];
  const wantsList = listing.wants ? listing.wants.split(",").map((w: string) => w.trim()) : [];
  const complexity = (listing as any).complexity || "Intermediate";
  const complexityColor = complexity === "Advanced" || complexity === "Expert"
    ? "text-alert-red bg-alert-red/10"
    : complexity === "Intermediate" ? "text-badge-gold bg-badge-gold/10"
    : "text-skill-green bg-skill-green/10";

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/skill-fusion" className="hover:text-foreground">Skill Fusion</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-lg">
                  <GitMerge className="w-3.5 h-3.5" />Skill Fusion
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded-lg ${complexityColor}`}>{complexity}</span>
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Fusion</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Skills Needed - Node Visualization */}
            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-heading font-bold text-foreground">Skills Required</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(fusionSkills.length > 0 ? fusionSkills : wantsList).map((skill: any, i: number) => {
                  const skillName = typeof skill === "string" ? skill : skill.name || skill.skill;
                  const skillElo = typeof skill === "object" ? skill.elo : null;
                  const t = skillElo ? eloTier(skillElo) : null;
                  return (
                    <div key={i} className="relative">
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${t ? `${t.border} ${t.bg}` : "border-purple-400/20 bg-purple-400/10"}`}>
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-heading font-semibold text-foreground">{skillName}</span>
                        {t && <span className={`text-[10px] font-mono ${t.color}`}>{skillElo}</span>}
                      </div>
                      {i < (fusionSkills.length > 0 ? fusionSkills : wantsList).length - 1 && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-px bg-purple-400/30" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Complexity Meter */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Complexity</span>
                  <span className={`font-mono font-bold ${complexityColor.split(" ")[0]}`}>{complexity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: complexity === "Expert" ? "100%" : complexity === "Advanced" ? "75%" : complexity === "Intermediate" ? "50%" : "25%" }} />
                </div>
              </div>
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
                <div className="rounded-xl bg-purple-400/5 border border-purple-400/20 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-purple-400">+{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Fusion Reward</p>
                </div>
              )}
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Apply to Fuse" ctaIcon={<GitMerge className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-purple-500 text-white font-heading font-bold text-sm hover:bg-purple-500/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
