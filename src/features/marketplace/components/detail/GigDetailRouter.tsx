import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AppNav from "@/components/shared/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

import AuctionDetail from "./AuctionDetail";
import ContestDetail from "./ContestDetail";
import SPOnlyDetail from "./SPOnlyDetail";
import CoCreationDetail from "./CoCreationDetail";
import SkillFusionDetail from "./SkillFusionDetail";
import ProjectDetail from "./ProjectDetail";
import FlashMarketDetail from "./FlashMarketDetail";
import RequestDetail from "./RequestDetail";
import DirectSwapDetail from "./DirectSwapDetail";
import SubscriptionDetail from "./SubscriptionDetail";

export default function GigDetailRouter() {
  const { gigId } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: dbListing } = await supabase
        .from("listings")
        .select("*, profiles!listings_user_id_profiles_fkey(display_name, full_name, elo, id_verified, university, total_gigs_completed, avatar_url, user_id)")
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
          .limit(10);
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

  const props = { listing, sellerProfile, reviews, gigId: gigId! };
  const format = listing.format || "Direct Swap";

  // If it's a subscription with no other format, use SubscriptionDetail
  if (listing.is_subscription && format === "SP Only") {
    return <SubscriptionDetail {...props} />;
  }

  switch (format) {
    case "Auction": return <AuctionDetail {...props} />;
    case "Contest": return <ContestDetail {...props} />;
    case "SP Only": return <SPOnlyDetail {...props} />;
    case "Co-Creation": return <CoCreationDetail {...props} />;
    case "Skill Fusion": return <SkillFusionDetail {...props} />;
    case "Projects": return <ProjectDetail {...props} />;
    case "Flash Market": return <FlashMarketDetail {...props} />;
    case "Request": return <RequestDetail {...props} />;
    default: return <DirectSwapDetail {...props} />;
  }
}
