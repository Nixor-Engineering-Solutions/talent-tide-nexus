import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Clock, Users, Coins, Star } from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import PageTransition from "@/components/shared/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { eloTier } from "../utils/marketplace-utils";
import ContestCard from "../components/ContestCard";

export default function ContestsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, profiles!listings_user_id_profiles_fkey(display_name, full_name, elo, avatar_url)")
        .eq("format", "Contest")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-black text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-badge-gold" /> Contests
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Submit your work and compete for prizes</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active contests right now</p>
              <Link to="/dashboard?tab=create-gig" className="text-xs text-foreground hover:underline mt-2 inline-block">
                Create one →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l, i) => {
                const profile = l.profiles;
                const seller = profile?.display_name || profile?.full_name || "User";
                const elo = profile?.elo || 1000;
                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ContestCard
                      gig={{
                        id: l.id, skill: l.title, wants: l.wants || "",
                        points: l.points, seller, elo, rating: l.rating || 4.5,
                        avatar: seller[0]?.toUpperCase() || "?",
                        category: l.category, hot: l.hot, format: "Contest",
                        posted: l.created_at, views: l.views, uni: "",
                        verified: false, desc: l.description,
                        deliveryDays: l.delivery_days, completedSwaps: l.completed_swaps || 0,
                        bidCount: l.bid_count, endsIn: l.ends_at ? Math.max(0, Math.floor((new Date(l.ends_at).getTime() - Date.now()) / 60000)) : undefined,
                      }}
                      onClick={() => navigate(`/marketplace/${l.id}`)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
