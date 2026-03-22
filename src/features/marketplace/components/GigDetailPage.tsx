import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Shield, Clock, Eye, ArrowRight, Heart, Share2, Bookmark,
  MessageSquare, Flag, GraduationCap, CheckCircle2, ChevronRight, Gavel, Coins, Layers,
  GitMerge, Zap, Briefcase, HandHeart, Users, Calendar, AlertTriangle, Radio,
} from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { eloTier, formatIcon, formatColor } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";
import ProposalModal from "./ProposalModal";
import LoginPrompt from "@/components/shared/LoginPrompt";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../hooks/useGigInteractions";

const deliveryStages = [
  { stage: "Requirements Review", days: 1 },
  { stage: "Initial Draft", days: 2 },
  { stage: "Revision Round", days: 1 },
  { stage: "Final Delivery", days: 1 },
];

export default function GigDetailPage() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: dbListing } = await supabase
        .from("listings")
        .select("*, profiles!listings_user_id_profiles_fkey(display_name, full_name, elo, id_verified, university, total_gigs_completed, avatar_url)")
        .eq("id", gigId!)
        .single();

      if (dbListing) {
        setListing(dbListing);
        setSellerProfile(dbListing.profiles);
        const { data: revs } = await (supabase as any)
          .from("reviews")
          .select("*")
          .eq("reviewee_id", dbListing.user_id)
          .order("created_at", { ascending: false })
          .limit(5);
        setReviews(revs || []);
      }
      setLoading(false);
    };
    if (gigId) load();
  }, [gigId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-foreground">Gig not found</p>
            <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const elo = sellerProfile?.elo || 1000;
  const tier = eloTier(elo);
  const FormatIcon = formatIcon(listing.format || "Direct Swap");
  const fColor = formatColor(listing.format || "Direct Swap");
  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const initials = sellerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const handlePropose = () => {
    if (!user) { setLoginOpen(true); return; }
    setProposalOpen(true);
  };

  // Format-specific panels
  const isAuction = listing.format === "Auction";
  const isSPOnly = listing.format === "SP Only";
  const isCoCreation = listing.format === "Co-Creation";
  const isFlash = listing.format === "Flash Market";
  const isFusion = listing.format === "Skill Fusion";
  const isProject = listing.format === "Projects";
  const isRequest = listing.format === "Request";

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-6 py-8"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex items-center gap-1 text-xs font-mono ${fColor} bg-surface-2 px-2.5 py-1 rounded-lg`}>
                  <FormatIcon className="w-3.5 h-3.5" />{listing.format}
                </span>
                {listing.hot && <span className="text-xs font-mono text-alert-red bg-alert-red/10 px-2 py-1 rounded-lg">🔥 Trending</span>}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              {listing.wants && (
                <p className="text-base text-muted-foreground mt-2 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" /> Looking for: <span className="text-foreground font-heading font-semibold">{listing.wants}</span>
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Gig</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Auction-specific: bid history */}
            {isAuction && (
              <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gavel className="w-4 h-4 text-alert-red" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Live Auction</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xl font-mono font-bold text-alert-red">{listing.current_bid || 0} SP</p>
                    <p className="text-[10px] text-muted-foreground">Current Bid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-mono font-bold text-foreground">{listing.bid_count || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total Bids</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-mono font-bold text-badge-gold">{listing.ends_at ? Math.max(0, Math.floor((new Date(listing.ends_at).getTime() - Date.now()) / 60000)) : "∞"}m</p>
                    <p className="text-[10px] text-muted-foreground">Time Left</p>
                  </div>
                </div>
              </div>
            )}

            {/* Co-Creation: team info */}
            {isCoCreation && (
              <div className="rounded-xl border border-court-blue/20 bg-court-blue/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-court-blue" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Co-Creation Team</h3>
                </div>
                {listing.wants && (
                  <div className="mb-3">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Open Roles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {listing.wants.split(",").map((w: string, i: number) => (
                        <span key={i} className="text-xs bg-court-blue/10 text-court-blue px-2.5 py-1 rounded-lg flex items-center gap-1"><Users className="w-3 h-3" />{w.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Join this team to collaborate on a shared deliverable.</p>
              </div>
            )}

            {/* Skill Fusion */}
            {isFusion && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Skill Fusion</h3>
                </div>
                {listing.wants && (
                  <div className="mb-3">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Skills Needed</p>
                    <div className="flex flex-wrap gap-1.5">
                      {listing.wants.split(",").map((w: string, i: number) => (
                        <span key={i} className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg flex items-center gap-1"><Zap className="w-3 h-3" />{w.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Combine multiple skills into one powerful collaboration.</p>
              </div>
            )}

            {/* Flash Market */}
            {isFlash && (
              <div className="rounded-xl border-2 border-badge-gold/30 bg-gradient-to-r from-badge-gold/5 to-alert-red/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-badge-gold" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Flash Deal — 2.5x SP Multiplier</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-badge-gold/10 p-3 text-center">
                    <p className="text-xl font-mono font-black text-badge-gold">{Math.round((listing.points || 0) * 2.5)} SP</p>
                    <p className="text-[10px] text-muted-foreground">Multiplied Value</p>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-3 text-center">
                    <p className="text-xl font-mono font-bold text-foreground">{listing.ends_at ? Math.max(0, Math.floor((new Date(listing.ends_at).getTime() - Date.now()) / 60000)) : "∞"}m</p>
                    <p className="text-[10px] text-muted-foreground">Time Remaining</p>
                  </div>
                </div>
                {listing.ends_at && new Date(listing.ends_at).getTime() - Date.now() < 3600000 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-alert-red"><AlertTriangle className="w-3.5 h-3.5" /> Expires soon — act fast!</div>
                )}
              </div>
            )}

            {/* Project */}
            {isProject && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Project Details</h3>
                </div>
                {listing.wants && (
                  <div className="mb-3">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Required Roles</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {listing.wants.split(",").map((r: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs bg-surface-1 rounded-lg px-2.5 py-1.5"><Users className="w-3 h-3 text-orange-400" />{r.trim()}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {listing.delivery_days}d deadline</span>
                  <span className="font-mono text-skill-green font-bold">{listing.points} SP budget</span>
                </div>
              </div>
            )}

            {/* Request */}
            {isRequest && (
              <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HandHeart className="w-4 h-4 text-skill-green" />
                  <h3 className="text-sm font-heading font-bold text-foreground">Help Request</h3>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="text-muted-foreground">Seeking:</span>
                  <span className="text-foreground font-heading font-semibold">{listing.wants || "Open to offers"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-mono text-skill-green font-bold">{listing.points} SP</span>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Delivery Timeline</h3>
              <div className="space-y-2">
                {deliveryStages.map((s, i) => (
                  <div key={s.stage} className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border">
                    <span className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-foreground">{s.stage}</span>
                    <span className="text-xs font-mono text-muted-foreground">{s.days} day{s.days > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-1 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-heading font-semibold text-foreground">{r.reviewer_name || "User"}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.overall_rating || 5 }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-badge-gold fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5">{r.comment}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 ${tier.glow}`}>
                <Link to={`/profile/${listing.user_id}`} className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl border ${tier.border} ${tier.bg} flex items-center justify-center font-heading font-bold text-lg ${tier.color}`}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-bold text-foreground text-lg">{sellerName}</span>
                      {sellerProfile?.id_verified && <Shield className="w-4 h-4 text-skill-green" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-mono font-medium ${tier.color}`}>{tier.label} · {elo}</span>
                      <span className="flex items-center gap-0.5 text-xs text-badge-gold">
                        <Star className="w-3 h-3 fill-current" />{listing.rating || 4.5}
                      </span>
                    </div>
                    {sellerProfile?.university && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <GraduationCap className="w-3 h-3" />{sellerProfile.university}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  {sellerProfile?.total_gigs_completed || 0} completed swaps
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Delivery", value: `${listing.delivery_days || 7}d`, icon: Clock },
                  { label: "Views", value: `${counts.views || listing.views || 0}`, icon: Eye },
                  { label: "Likes", value: `${counts.likes}`, icon: Heart },
                  { label: "Live", value: `${counts.liveViewers}`, icon: Radio },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-surface-1 border border-border p-3 text-center">
                    <s.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.label === "Live" && counts.liveViewers > 0 ? "text-skill-green animate-pulse" : "text-muted-foreground"}`} />
                    <p className="text-sm font-mono font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">{s.label}</p>
                  </div>
                ))}
              </div>

              {listing.points > 0 && (
                <div className="rounded-xl bg-skill-green/5 border border-skill-green/20 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-skill-green">+{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Bonus SkillPoints</p>
                </div>
              )}

              <div className="space-y-2">
                {isAuction ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-alert-red text-white font-heading font-bold text-sm hover:bg-alert-red/90 transition-colors flex items-center justify-center gap-2">
                    <Gavel className="w-4 h-4" /> Place Bid
                  </button>
                ) : isSPOnly ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
                    <Coins className="w-4 h-4" /> Purchase with SP
                  </button>
                ) : isFlash ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-gradient-to-r from-badge-gold to-alert-red text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Grab Flash Deal
                  </button>
                ) : isCoCreation || isFusion ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-court-blue text-white font-heading font-bold text-sm hover:bg-court-blue/90 transition-colors flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Request to Join
                  </button>
                ) : isProject ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-orange-500 text-white font-heading font-bold text-sm hover:bg-orange-500/90 transition-colors flex items-center justify-center gap-2">
                    <Briefcase className="w-4 h-4" /> Apply for Role
                  </button>
                ) : isRequest ? (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-skill-green text-background font-heading font-bold text-sm hover:bg-skill-green/90 transition-colors flex items-center justify-center gap-2">
                    <HandHeart className="w-4 h-4" /> Offer Help
                  </button>
                ) : (
                  <button onClick={handlePropose} className="w-full h-12 rounded-xl bg-foreground text-background font-heading font-bold text-sm hover:bg-foreground/90 transition-colors">
                    Propose Swap
                  </button>
                )}
                <button className="w-full h-10 rounded-xl border border-border text-foreground text-xs font-heading font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />Message Seller
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle("like")}
                    className={`flex-1 h-9 rounded-lg border text-xs flex items-center justify-center gap-1 transition-colors ${
                      userState.liked
                        ? "border-alert-red/30 bg-alert-red/10 text-alert-red"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${userState.liked ? "fill-current" : ""}`} />{counts.likes || "Like"}
                  </button>
                  <button
                    onClick={() => toggle("save")}
                    className={`flex-1 h-9 rounded-lg border text-xs flex items-center justify-center gap-1 transition-colors ${
                      userState.saved
                        ? "border-badge-gold/30 bg-badge-gold/10 text-badge-gold"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${userState.saved ? "fill-current" : ""}`} />{counts.saves || "Save"}
                  </button>
                  <button
                    onClick={share}
                    className="flex-1 h-9 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground hover:bg-surface-2 transition-colors flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />{counts.shares || "Share"}
                  </button>
                </div>
              </div>

              <button onClick={() => report()} className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-alert-red transition-colors">
                <Flag className="w-3 h-3" />Report this listing
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {proposalOpen && (
        <ProposalModal
          listing={{
            id: String(listing.id),
            title: listing.title,
            user_id: listing.user_id,
            points: listing.points || 0,
            price: listing.price || `${listing.points} SP`,
          }}
          onClose={() => setProposalOpen(false)}
        />
      )}

      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
