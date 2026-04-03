import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Upload, Repeat } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import { supabase } from "@/integrations/supabase/client";
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

export default function ContestDetail({ listing, sellerProfile, reviews, gigId }: Props) {
  const { user } = useAuth();
  const { counts, userState, toggle, share, report } = useGigInteractions(gigId);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDesc, setEntryDesc] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const sellerName = sellerProfile?.display_name || sellerProfile?.full_name || "User";
  const tags: string[] = listing.tags || [];
  const faq = Array.isArray(listing.gig_faq) ? listing.gig_faq as any : [];
  const requirements: string[] = listing.requirements || [];
  const contestConfig = listing.contest_config as any;
  const maxEntries = contestConfig?.max_entries || 0;
  const prize1 = contestConfig?.prize_1st || 0;
  const prize2 = contestConfig?.prize_2nd || 0;
  const prize3 = contestConfig?.prize_3rd || 0;
  const participationSP = contestConfig?.participation_sp || 0;

  useEffect(() => {
    (supabase as any).from("contest_entries")
      .select("*")
      .eq("listing_id", gigId)
      .order("created_at", { ascending: false })
      .then(({ data }: any) => setEntries(data || []));

    const channel = supabase
      .channel(`contest-${gigId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contest_entries", filter: `listing_id=eq.${gigId}` },
        (payload) => setEntries(prev => [payload.new as any, ...prev])
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

  const handleSubmitEntry = async () => {
    if (!user) { setLoginOpen(true); return; }
    if (!entryTitle.trim()) return;
    await (supabase as any).from("contest_entries").insert({
      listing_id: gigId, entrant_id: user.id, title: entryTitle.trim(), description: entryDesc.trim() || null,
    });
    setEntryTitle(""); setEntryDesc("");
  };

  const handlePropose = () => { if (!user) { setLoginOpen(true); return; } setProposalOpen(true); };
  const days = Math.floor(timeLeft / 86400);
  const hrs = Math.floor((timeLeft % 86400) / 3600);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/marketplace/contests" className="hover:text-foreground">Contests</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs font-mono text-badge-gold bg-badge-gold/10 px-2.5 py-1 rounded-lg">
                  <Trophy className="w-3.5 h-3.5" />Contest
                </span>
                {listing.hot && <span className="text-xs font-mono text-alert-red bg-alert-red/10 px-2 py-1 rounded-lg">🔥</span>}
              </div>
              <h1 className="font-heading font-black text-3xl text-foreground">{listing.title}</h1>
              <DetailTags tags={tags} />
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">About This Contest</h3>
              <p className="text-foreground/90 leading-relaxed">{listing.description}</p>
            </div>

            {/* Prize Podium */}
            <div className="rounded-2xl border border-badge-gold/20 bg-badge-gold/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-badge-gold" />
                <h3 className="text-lg font-heading font-bold text-foreground">Prizes</h3>
              </div>
              <div className="flex items-end justify-center gap-4">
                {/* 2nd place */}
                <div className="text-center">
                  <div className="w-24 rounded-t-xl bg-surface-1 border border-border p-4" style={{ height: "100px" }}>
                    <span className="text-2xl">🥈</span>
                    <p className="text-lg font-mono font-bold text-foreground mt-1">{prize2} SP</p>
                    <p className="text-[10px] text-muted-foreground">2nd Place</p>
                  </div>
                </div>
                {/* 1st place */}
                <div className="text-center">
                  <div className="w-28 rounded-t-xl bg-badge-gold/10 border-2 border-badge-gold/30 p-4" style={{ height: "130px" }}>
                    <span className="text-3xl">🥇</span>
                    <p className="text-2xl font-mono font-black text-badge-gold mt-1">{prize1} SP</p>
                    <p className="text-[10px] text-muted-foreground">1st Place</p>
                  </div>
                </div>
                {/* 3rd place */}
                <div className="text-center">
                  <div className="w-24 rounded-t-xl bg-surface-1 border border-border p-4" style={{ height: "80px" }}>
                    <span className="text-xl">🥉</span>
                    <p className="text-lg font-mono font-bold text-foreground mt-1">{prize3} SP</p>
                    <p className="text-[10px] text-muted-foreground">3rd Place</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                {maxEntries > 0 && <span>{entries.length}/{maxEntries} entries</span>}
                {participationSP > 0 && <span className="text-skill-green font-mono font-bold">+{participationSP} SP participation</span>}
                {timeLeft > 0 && <span>{days}d {hrs}h remaining</span>}
              </div>
            </div>

            {/* Entry progress */}
            {maxEntries > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Entry progress</span>
                  <span className="font-mono">{entries.length}/{maxEntries}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-badge-gold transition-all" style={{ width: `${Math.min((entries.length / maxEntries) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Submit Entry Form */}
            <div className="rounded-2xl border border-border bg-surface-1 p-6">
              <h3 className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4" />Submit Your Entry
              </h3>
              <div className="space-y-3">
                <input
                  value={entryTitle} onChange={e => setEntryTitle(e.target.value)}
                  placeholder="Entry title"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-badge-gold/30"
                />
                <textarea
                  value={entryDesc} onChange={e => setEntryDesc(e.target.value)}
                  placeholder="Describe your entry..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-badge-gold/30 resize-none"
                />
                <button onClick={handleSubmitEntry} className="w-full rounded-xl bg-badge-gold text-background py-3 font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />Submit Entry
                </button>
              </div>
            </div>

            {/* Entry Gallery */}
            {entries.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Entries ({entries.length})</h3>
                <div className="grid grid-cols-2 gap-3">
                  {entries.map((entry, i) => (
                    <div key={entry.id || i} className="rounded-xl border border-border bg-surface-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-heading font-semibold text-foreground">{entry.title}</span>
                        {entry.rank && (
                          <span className="text-xs font-mono text-badge-gold bg-badge-gold/10 px-2 py-0.5 rounded-md">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                      {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(entry.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
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
              {listing.points > 0 && (
                <div className="rounded-xl bg-badge-gold/5 border border-badge-gold/20 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-badge-gold">{listing.points} SP</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Prize Pool</p>
                </div>
              )}
              <DetailInteractionBar counts={counts} userState={userState} toggle={toggle} share={share} report={report} onMessage={() => {}} onPropose={handlePropose} ctaLabel="Submit Entry" ctaIcon={<Trophy className="w-4 h-4" />} ctaClassName="w-full h-12 rounded-xl bg-badge-gold text-background font-heading font-bold text-sm hover:bg-badge-gold/90 transition-colors flex items-center justify-center gap-2" />
            </div>
          </div>
        </div>
      </motion.div>
      {proposalOpen && <ProposalModal listing={{ id: String(listing.id), title: listing.title, user_id: listing.user_id, points: listing.points || 0, price: `${listing.points} SP` }} onClose={() => setProposalOpen(false)} />}
      <LoginPrompt open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
