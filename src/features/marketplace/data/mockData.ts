export interface Gig {
  id: number | string;
  skill: string;
  wants: string;
  points: number;
  seller: string;
  sellerId?: string;
  elo: number;
  rating: number;
  avatar: string;
  category: string;
  hot: boolean;
  format: string;
  posted: string;
  views: number;
  uni: string;
  verified: boolean;
  desc: string;
  deliveryDays: number;
  completedSwaps: number;
  currentBid?: number;
  bidCount?: number;
  endsIn?: number;
  guildName?: string;
  guildId?: string;
  requirements?: string[];
  tags?: string[];
}

export interface Project {
  id: number | string;
  title: string;
  description: string;
  leader: string;
  leaderElo: number;
  leaderAvatar: string;
  status: string;
  roles: { name: string; filled: boolean; filler?: string }[];
  totalSP: number;
  deadline: string;
  applicants: number;
  category: string;
}

export interface SkillFusion {
  id: number | string;
  title: string;
  description: string;
  participants: { name: string; skill: string; elo: number; avatar: string }[];
  lookingFor: string[];
  totalSP: number;
  complexity: string;
  duration: string;
}

export interface SPOnlyGig {
  id: number | string;
  skill: string;
  spPrice: number;
  seller: string;
  elo: number;
  rating: number;
  avatar: string;
  category: string;
  hot: boolean;
  posted: string;
  views: number;
  uni: string;
  verified: boolean;
  desc: string;
  deliveryDays: number;
  completedGigs: number;
}

export interface RequestItem {
  id: number | string;
  title: string;
  description: string;
  requester: string;
  requesterElo: number;
  offering: string;
  seeking: string;
  budget: number;
  responses: number;
  posted: string;
  spOnly?: boolean;
}

export interface FeaturedSeller {
  name: string;
  skill: string;
  elo: number;
  avatar: string;
  verified: boolean;
  swaps: number;
  rating: number;
  badge: string;
}

export const categories = [
  { label: "All", count: 0 },
  { label: "Design", count: 0 },
  { label: "Development", count: 0 },
  { label: "Writing", count: 0 },
  { label: "Video", count: 0 },
  { label: "Marketing", count: 0 },
  { label: "Music", count: 0 },
  { label: "Photography", count: 0 },
];

export const aiSuggestions = [
  "Design a logo for my startup",
  "Build a React dashboard",
  "Edit a YouTube video",
  "Write blog posts for SaaS",
  "Create social media ads",
  "Build a mobile app",
  "Security audit my site",
  "Make an explainer video",
];

export const modes = [
  { label: "Explore", key: "explore", badge: null },
  { label: "Trending", key: "trending", badge: "HOT" },
  { label: "SP Only", key: "sp-only", badge: "BUY" },
  { label: "Auctions", key: "auctions", badge: "LIVE" },
  { label: "Co-Creation", key: "cocreation", badge: null },
  { label: "Skill Fusion", key: "fusion", badge: "NEW" },
  { label: "Projects", key: "projects", badge: null },
  { label: "Flash Market", key: "flash", badge: "2.5x" },
  { label: "Requests", key: "requests", badge: null },
  { label: "Contests", key: "contests", badge: "🏆" },
  { label: "For You", key: "recommended", badge: "AI" },
] as const;

export type MarketplaceMode = typeof modes[number]["key"];
