import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Gavel, ArrowRight, Repeat, Package, Tag as TagIcon } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useGigInteractions } from "../../hooks/useGigInteractions";
import { eloTier, formatColor } from "../../utils/marketplace-utils";
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

export default function AuctionDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tier = eloTier(sellerProfile?.elo || 1000);
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const postedAgo = (() => { try { return formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }); } catch { return ""; } })();
  const auctionConfig = listing.auction_config as any;
  const reservePrice = auctionConfig?.reserve_price || 0;
  const reserveMet = (listing.current_bid || 0) >= reservePrice;

  useEffect(() => {
    // Load bids
    (supabase as any).from("auction_bids")
      .select("*")
      .eq("listing_id", gigId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }: any) => setBids(data || []));

    // Subscribe to realtime bids
    const channel = supabase
      .channel(`auction-${gigId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "auction_bids", filter: `listing_id=eq.${gigId}` },
        (payload) => setBids(prev => [payload.new as any, ...prev])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gigId]);

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

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };

  const handleBid = async () => {
    if (!user) { setLoginOpen(true); return; }
    const amount = parseInt(bidAmount);
    if (!amount || amount <= (listing.current_bid || 0)) return;
    await (supabase as any).from("auction_bids").insert({
      listing_id: gigId, bidder_id: user.id, amount,
    });
    // Update listing current_bid
    await supabase.from("listings").update({
      current_bid: amount, bid_count: (listing.bid_count || 0) + 1,
    }).eq("id", gigId);
    setBidAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/auctions" className="hover:text-foreground transition-colors">Auctions</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-mono text-alert-red bg-alert-red/10 px-2.5 py-1 rounded-lg">
                  <Gavel className="w-3.5 h-3.5" />Auction
                </span>
                {listing.hot && <span className="text-xs font-mono text-alert-red bg-alert-red/10 px-2 py-1 rounded-lg">🔥 Trending</span>}
                {reservePrice > 0 && (
                  <span className={`text-xs font-mono px-2 py-1 rounded-lg ${reserveMet ? "text-skill-green bg-skill-green/10" : "text-alert-red bg-alert-red/10"}`}>
                    {reserveMet ? "Reserve Met" : "Reserve Not Met"}
                  </span>
                )}
                {postedAgo && <span className="text-[10px] text-muted-foreground ml-auto">{postedAgo}</span>}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{listing.completed_swaps || 0} swaps</span>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Auction</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Live Auction Panel */}
            <div className="rounded-2xl border-2 border-alert-red/30 bg-alert-red/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-5 h-5 text-alert-red" />
                <h3 className="text-lg font-heading font-bold text-foreground">Live Auction</h3>
                <span className="ml-auto flex items-center gap-1 text-xs text-alert-red animate-pulse">● LIVE</span>
              </div>

              {/* Countdown */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[{ label: "Hours", value: String(hrs).padStart(2, "0") }, { label: "Minutes", value: String(mins).padStart(2, "0") }, { label: "Seconds", value: String(secs).padStart(2, "0") }].map(t => (
                  <div key={t.label} className="text-center rounded-xl bg-background/50 border border-alert-red/10 p-3">
                    <p className="text-3xl font-mono font-black text-alert-red tabular-nums">{t.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">{t.label}</p>
                  </div>
                ))}
              </div>

              {/* Current bid + Bid count */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center rounded-xl bg-surface-1 p-3">
                  <motion.p animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl font-mono font-bold text-skill-green">
                    {listing.current_bid || 0} SP
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground">Current Bid</p>
                </div>
                <div className="text-center rounded-xl bg-surface-1 p-3">
                  <p className="text-2xl font-mono font-bold text-foreground">{listing.bid_count || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Total Bids</p>
                </div>
                <div className="text-center rounded-xl bg-surface-1 p-3">
                  <p className="text-2xl font-mono font-bold text-badge-gold">{reservePrice || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Reserve Price</p>
                </div>
              </div>

              {/* Place Bid */}
              <div className="flex gap-2">
                <input
                  type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                  placeholder={`Min ${(listing.current_bid || 0) + 1} SP`}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-alert-red/30"
                />
                <button onClick={handleBid} className="rounded-xl bg-alert-red text-white px-6 py-3 font-heading font-bold text-sm hover:bg-alert-red/90 transition-colors flex items-center gap-2">
                  <Gavel className="w-4 h-4" />Place Bid
                </button>
              </div>
            </div>

            {/* Bid History */}
            {bids.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Bid History</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {bids.map((bid, i) => (
                      <div key={bid.id || i} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-alert-red/10 flex items-center justify-center text-[10px] font-mono font-bold text-alert-red">
                            {i + 1}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {bid.bidder_id?.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-skill-green">{bid.amount} SP</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(bid.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tiers if present */}
            {listing.tiers?.basic && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Packages</h3>
                <TierSelector tiers={listing.tiers} selected="basic" onSelect={() => {}} revisionCostSp={listing.revision_cost_sp} />
              </div>
            )}

            <DetailRequirements requirements={requirements} />
            <DetailFAQ faq={faq} />
            <DetailTimeline />
            <DetailReviews reviews={reviews} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <DetailSellerCard
                userId={listing.user_id} name={sellerName} elo={sellerProfile?.elo || 1000}
                verified={sellerProfile?.id_verified || false} university={sellerProfile?.university}
                completedSwaps={sellerProfile?.total_gigs_completed || 0} rating={listing.rating || 4.5}
              />
              <DetailStatsGrid deliveryDays={listing.delivery_days || 7} views={counts.views || listing.views || 0} likes={counts.likes} liveViewers={counts.liveViewers} />
              <DetailInteractionBar
                counts={counts} userState={userState} toggle={toggle} share={share} report={report}
                onMessage={() => {}} onPropose={handlePropose}
                ctaLabel="Place Bid" ctaIcon={<Gavel className="w-4 h-4" />}
                ctaClassName="w-full h-12 rounded-xl bg-alert-red text-white font-heading font-bold text-sm hover:bg-alert-red/90 transition-colors flex items-center justify-center gap-2"
              />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
