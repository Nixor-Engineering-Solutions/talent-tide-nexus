import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Gig, type MarketplaceMode } from "../data/mockData";
import { ITEMS_PER_PAGE_GRID, ITEMS_PER_PAGE_LIST } from "../utils/marketplace-utils";

export interface MarketplaceFilters {
  search: string;
  category: string;
  eloRange: string;
  verifiedOnly: boolean;
  maxDeliveryDays: number | null;
  minSP: number | null;
  maxSP: number | null;
  sort: string;
}

const defaultFilters: MarketplaceFilters = {
  search: "",
  category: "All",
  eloRange: "Any",
  verifiedOnly: false,
  maxDeliveryDays: null,
  minSP: null,
  maxSP: null,
  sort: "Trending",
};

type ListingRow = {
  id: string;
  title: string;
  description: string;
  wants: string | null;
  category: string;
  format: string;
  points: number;
  delivery_days: number;
  views: number;
  hot: boolean;
  rating: number;
  status: string;
  created_at: string;
  current_bid: number | null;
  bid_count: number;
  ends_at: string | null;
  user_id: string;
  profiles?: {
    display_name: string | null;
    full_name: string;
    elo: number;
    id_verified: boolean | null;
    university: string | null;
    total_gigs_completed: number | null;
    avatar_url: string | null;
  } | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function listingToGig(l: ListingRow, index: number): Gig {
  const name = l.profiles?.display_name || l.profiles?.full_name || "User";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return {
    id: l.id || index + 1,
    skill: l.title,
    wants: l.wants || "Open to offers",
    points: l.points || 0,
    seller: name,
    sellerId: l.user_id,
    elo: l.profiles?.elo || 1000,
    rating: l.rating || 4.5,
    avatar: initials,
    category: l.category || "Design",
    hot: l.hot || false,
    format: l.format || "Direct Swap",
    posted: timeAgo(l.created_at),
    views: l.views || 0,
    uni: l.profiles?.university || "",
    verified: l.profiles?.id_verified || false,
    desc: l.description || "",
    deliveryDays: l.delivery_days || 7,
    completedSwaps: l.profiles?.total_gigs_completed || 0,
    currentBid: l.current_bid || undefined,
    bidCount: l.bid_count || undefined,
    endsIn: l.ends_at ? Math.max(0, Math.floor((new Date(l.ends_at).getTime() - Date.now()) / 60000)) : undefined,
    tags: [],
  };
}

export function useMarketplaceData() {
  const [mode, setMode] = useState<MarketplaceMode>("explore");
  const [filters, setFilters] = useState<MarketplaceFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dbGigs, setDbGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*, profiles!listings_user_id_profiles_fkey(display_name, full_name, elo, id_verified, university, total_gigs_completed, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200);

    setDbGigs((data || []).map((l: any, i: number) => listingToGig(l, i)));
    setLoading(false);
  };

  const updateFilter = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.eloRange !== "Any") count++;
    if (filters.verifiedOnly) count++;
    if (filters.maxDeliveryDays) count++;
    if (filters.minSP !== null || filters.maxSP !== null) count++;
    return count;
  }, [filters]);

  const filteredGigs = useMemo(() => {
    let result = [...dbGigs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(g =>
        g.skill.toLowerCase().includes(q) ||
        g.wants.toLowerCase().includes(q) ||
        g.seller.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.tags?.some(t => t.includes(q))
      );
    }

    if (filters.category !== "All") {
      result = result.filter(g => g.category === filters.category);
    }

    if (filters.eloRange !== "Any") {
      const ranges: Record<string, [number, number]> = {
        "Bronze": [0, 1299], "Silver": [1300, 1499],
        "Gold": [1500, 1699], "Diamond": [1700, 9999],
      };
      const r = ranges[filters.eloRange];
      if (r) result = result.filter(g => g.elo >= r[0] && g.elo <= r[1]);
    }

    if (filters.verifiedOnly) result = result.filter(g => g.verified);
    if (filters.maxDeliveryDays) result = result.filter(g => g.deliveryDays <= filters.maxDeliveryDays!);

    if (mode === "trending") result = result.filter(g => g.hot || g.views > 100).sort((a, b) => b.views - a.views);
    else if (mode === "auctions") result = result.filter(g => g.format === "Auction");
    else if (mode === "cocreation") result = result.filter(g => g.format === "Co-Creation");
    else if (mode === "fusion") result = result.filter(g => g.format === "Skill Fusion");
    else if (mode === "flash") result = result.filter(g => g.format === "Flash Market");
    else if (mode === "sp-only") result = result.filter(g => g.format === "SP Only");
    else if (mode === "projects") result = result.filter(g => g.format === "Projects");
    else if (mode === "requests") result = result.filter(g => g.format === "Request");
    else if (mode === "contests") result = result.filter(g => g.format === "Contest");
    else if (mode === "recommended") result = result.sort((a, b) => b.elo - a.elo);

    if (filters.sort === "Newest") result.sort((a, b) => 0);
    else if (filters.sort === "Highest ELO") result.sort((a, b) => b.elo - a.elo);
    else if (filters.sort === "Most Points") result.sort((a, b) => b.points - a.points);
    else if (filters.sort === "Most Views") result.sort((a, b) => b.views - a.views);

    return result;
  }, [filters, mode, dbGigs]);

  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;
  const totalPages = Math.max(1, Math.ceil(filteredGigs.length / itemsPerPage));
  const pagedGigs = filteredGigs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return {
    mode, setMode,
    filters, updateFilter, resetFilters, activeFilterCount,
    page, setPage, totalPages,
    viewMode, setViewMode,
    filteredGigs, pagedGigs,
    totalResults: filteredGigs.length,
    loading, refresh: loadListings,
  };
}
