import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface InteractionCounts {
  likes: number;
  saves: number;
  shares: number;
  views: number;
  liveViewers: number;
}

interface UserInteractions {
  liked: boolean;
  saved: boolean;
}

export function useGigInteractions(listingId: string | undefined) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<InteractionCounts>({ likes: 0, saves: 0, shares: 0, views: 0, liveViewers: 0 });
  const [userState, setUserState] = useState<UserInteractions>({ liked: false, saved: false });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (!listingId) return;
    const { data } = await (supabase as any)
      .from("listing_interactions")
      .select("interaction_type")
      .eq("listing_id", listingId);

    if (data) {
      const likes = data.filter((d: any) => d.interaction_type === "like").length;
      const saves = data.filter((d: any) => d.interaction_type === "save").length;
      const shares = data.filter((d: any) => d.interaction_type === "share").length;
      const views = data.filter((d: any) => d.interaction_type === "view").length;
      setCounts(prev => ({ ...prev, likes, saves, shares, views }));
    }

    // Check user's own interactions
    if (user) {
      const { data: userInts } = await (supabase as any)
        .from("listing_interactions")
        .select("interaction_type")
        .eq("listing_id", listingId)
        .eq("user_id", user.id);
      if (userInts) {
        setUserState({
          liked: userInts.some((d: any) => d.interaction_type === "like"),
          saved: userInts.some((d: any) => d.interaction_type === "save"),
        });
      }
    }

    // Live viewers = page_sessions on this gig in last 5 min
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("page_sessions")
      .select("id", { count: "exact", head: true })
      .eq("page_path", `/marketplace/${listingId}`)
      .gte("entered_at", fiveMinAgo);
    setCounts(prev => ({ ...prev, liveViewers: count || 0 }));

    setLoading(false);
  }, [listingId, user]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Record view on mount
  useEffect(() => {
    if (!listingId || !user) return;
    (supabase as any).from("listing_interactions").upsert({
      listing_id: listingId,
      user_id: user.id,
      interaction_type: "view",
    }, { onConflict: "listing_id,user_id,interaction_type" }).then(() => {});
    // Also increment views on listing itself
    supabase.from("listings").select("views").eq("id", listingId).single().then(({ data }) => {
      if (data) {
        supabase.from("listings").update({ views: (data.views || 0) + 1 }).eq("id", listingId).then(() => {});
      }
    });
  }, [listingId, user]);

  const toggle = useCallback(async (type: "like" | "save") => {
    if (!user) { toast.error("Sign in to " + type); return; }
    if (!listingId) return;

    const isActive = type === "like" ? userState.liked : userState.saved;

    if (isActive) {
      await (supabase as any).from("listing_interactions").delete()
        .eq("listing_id", listingId).eq("user_id", user.id).eq("interaction_type", type);
      setUserState(prev => ({ ...prev, [type === "like" ? "liked" : "saved"]: false }));
      setCounts(prev => ({ ...prev, [type + "s"]: Math.max(0, prev[type + "s" as keyof InteractionCounts] as number - 1) }));
    } else {
      await (supabase as any).from("listing_interactions").insert({
        listing_id: listingId, user_id: user.id, interaction_type: type,
      });
      setUserState(prev => ({ ...prev, [type === "like" ? "liked" : "saved"]: true }));
      setCounts(prev => ({ ...prev, [type + "s"]: (prev[type + "s" as keyof InteractionCounts] as number) + 1 }));
      toast.success(type === "like" ? "Liked!" : "Saved to collection!");
    }
  }, [user, listingId, userState]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/marketplace/${listingId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      if (user && listingId) {
        await (supabase as any).from("listing_interactions").upsert({
          listing_id: listingId, user_id: user.id, interaction_type: "share",
        }, { onConflict: "listing_id,user_id,interaction_type" });
        setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
      }
    } catch { toast.error("Failed to copy link"); }
  }, [user, listingId]);

  const report = useCallback(async (reason?: string) => {
    if (!user) { toast.error("Sign in to report"); return; }
    if (!listingId) return;
    await (supabase as any).from("listing_interactions").upsert({
      listing_id: listingId, user_id: user.id, interaction_type: "report",
      metadata: { reason: reason || "inappropriate" },
    }, { onConflict: "listing_id,user_id,interaction_type" });
    toast.success("Report submitted. We'll review it shortly.");
  }, [user, listingId]);

  return { counts, userState, loading, toggle, share, report };
}
