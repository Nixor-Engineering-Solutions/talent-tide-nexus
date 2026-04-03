import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Briefcase, Users, Calendar } from "lucide-react";
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

export default function ProjectDetail({ listing, sellerProfile, reviews, gigId }: Props) {
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
  const deadline = listing.ends_at || listing.deadline;

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  // Build roles from rolesNeeded or wants
  const roles = rolesNeeded.length > 0 ? rolesNeeded : wantsList.map((w: string) => ({ name: w, filled: false }));
  const filledCount = roles.filter((r: any) => r.filled).length;
  const totalRoles = roles.length || 1;
  const fillPercent = (filledCount / totalRoles) * 100;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/projects" className="hover:text-foreground">Projects</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5" />Project
                </span>
                {deadline && (
                  <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-surface-2 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" />Due {new Date(deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Project Overview</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Role Board */}
            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-heading font-bold text-foreground">Role Board</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{filledCount}/{totalRoles} filled</span>
              </div>

              {/* Fill progress */}
              <div className="w-full h-2 rounded-full bg-surface-2 mb-4">
                <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${fillPercent}%` }} />
              </div>

              {/* Kanban-style columns */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2 text-center">Open</p>
                  <div className="space-y-1.5">
                    {roles.filter((r: any) => !r.filled && !r.applied).map((r: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-surface-1 border border-border text-center">
                        <p className="text-xs font-heading font-semibold text-foreground">{r.name || r.role}</p>
                        <button onClick={handlePropose} className="mt-1 text-[10px] text-orange-400 hover:underline">Apply →</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2 text-center">Applied</p>
                  <div className="space-y-1.5">
                    {roles.filter((r: any) => r.applied && !r.filled).map((r: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-badge-gold/5 border border-badge-gold/20 text-center">
                        <p className="text-xs font-heading font-semibold text-foreground">{r.name || r.role}</p>
                        <p className="text-[10px] text-badge-gold">Pending</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2 text-center">Filled</p>
                  <div className="space-y-1.5">
                    {roles.filter((r: any) => r.filled).map((r: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-skill-green/5 border border-skill-green/20 text-center">
                        <p className="text-xs font-heading font-semibold text-foreground">{r.name || r.role}</p>
                        <p className="text-[10px] text-skill-green">✓ {r.filler || "Filled"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            {listing.points > 0 && (
              <div className="rounded-xl bg-surface-1 border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Project Budget</span>
                  <span className="text-lg font-mono font-bold text-skill-green">{listing.points} SP</span>
                </div>
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
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Apply for Role" ctaIcon={<Briefcase className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-orange-500 text-white font-heading font-bold text-sm hover:bg-orange-500/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
