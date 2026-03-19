import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Palette, Code, PenTool, Video, BarChart3, ArrowRight, Clock, Eye, Flame } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { smartStat } from "@/hooks/useSmartStats";

const categories = [
  { label: "Design", icon: Palette },
  { label: "Development", icon: Code },
  { label: "Writing", icon: PenTool },
  { label: "Video", icon: Video },
  { label: "Marketing", icon: BarChart3 },
];

type Gig = {
  title: string;
  wants: string;
  points: number;
  seller: string;
  elo: number;
  rating: number;
  avatar: string;
  hot: boolean;
  posted: string;
  views: number;
};

const fallbackGigs: Gig[] = [
  { title: "Full-Stack Web App", wants: "Logo & Brand Design", points: 45, seller: "DevMaster", elo: 1650, rating: 4.9, avatar: "DM", hot: true, posted: "2h", views: 124 },
  { title: "UI/UX Redesign", wants: "Backend API Development", points: 30, seller: "PixelPro", elo: 1520, rating: 4.8, avatar: "PP", hot: false, posted: "5h", views: 89 },
  { title: "Video Editing — YouTube", wants: "Thumbnail Design", points: 20, seller: "ClipKing", elo: 1380, rating: 4.7, avatar: "CK", hot: true, posted: "1h", views: 201 },
  { title: "SEO Content Writing", wants: "Social Media Graphics", points: 15, seller: "WordSmith", elo: 1440, rating: 4.6, avatar: "WS", hot: false, posted: "8h", views: 56 },
  { title: "React Native App", wants: "Marketing Strategy", points: 50, seller: "AppForge", elo: 1710, rating: 4.9, avatar: "AF", hot: true, posted: "30m", views: 312 },
  { title: "Data Analysis Report", wants: "Presentation Design", points: 25, seller: "DataWiz", elo: 1560, rating: 4.8, avatar: "DW", hot: false, posted: "3h", views: 67 },
];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const GigCard = ({ gig }: { gig: Gig }) => (
  <div className="card-3d group min-w-0 flex-[0_0_280px] sm:flex-[0_0_300px]">
    <div className="card-3d-inner h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_20px_hsl(var(--silver)/0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-semibold text-foreground">
          {gig.avatar}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{gig.seller}</p>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">ELO {gig.elo}</span>
            <span className="text-muted-foreground/40">·</span>
            <Star size={10} className="fill-badge-gold text-badge-gold" />
            <span className="font-mono text-[10px] text-badge-gold">{gig.rating}</span>
          </div>
        </div>
        {gig.hot && <Flame size={14} className="text-alert-red" />}
      </div>

      <div className="mb-3 space-y-2">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Offering</span>
          <p className="text-sm font-medium text-foreground">{gig.title}</p>
        </div>
        <div className="rounded-lg border border-dashed border-border px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Wants</span>
          <p className="text-sm font-medium text-foreground/80">{gig.wants || "Open to offers"}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Clock size={10} /> {gig.posted} ago</span>
        <span className="flex items-center gap-1"><Eye size={10} /> {gig.views}</span>
      </div>

      {gig.points > 0 ? (
        <div className="flex items-center gap-1.5 rounded-full bg-skill-green/10 px-3 py-1 text-xs font-semibold text-skill-green">
          <TrendingUp size={12} />+{gig.points} SP to balance
        </div>
      ) : (
        <div className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground">
          Equal value exchange
        </div>
      )}
    </div>
  </div>
);

const MarketplacePreviewSection = () => {
  const [gigs, setGigs] = useState<Gig[]>(fallbackGigs);
  const [liveStats, setLiveStats] = useState({ activeGigs: 0, onlineNow: 0, avgResponse: "< 5min" });

  useEffect(() => {
    const load = async () => {
      const [listingsRes, sessionsRes] = await Promise.all([
        supabase
          .from("listings")
          .select("title, wants, points, views, hot, created_at, rating, user_id, profiles!listings_user_id_profiles_fkey(display_name, full_name, elo)")
          .eq("status", "active")
          .order("views", { ascending: false })
          .limit(12),
        supabase
          .from("page_sessions")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString()),
      ]);

      const onlineCount = sessionsRes.count || 0;
      const activeCount = listingsRes.data?.length || 0;

      setLiveStats({
        activeGigs: smartStat(activeCount, 250),
        onlineNow: smartStat(onlineCount, 1200),
        avgResponse: "< 5min",
      });

      if (listingsRes.data?.length) {
        setGigs(listingsRes.data.map((l: any) => {
          const name = l.profiles?.display_name || l.profiles?.full_name || "User";
          const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          return {
            title: l.title,
            wants: l.wants || "Open to offers",
            points: l.points || 0,
            seller: name,
            elo: l.profiles?.elo || 1000,
            rating: l.rating || 4.5,
            avatar: initials,
            hot: l.hot || false,
            posted: timeAgo(l.created_at),
            views: l.views || 0,
          };
        }));
      }
    };
    load();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, align: "start", dragFree: true, containScroll: false,
  });

  const autoScroll = useCallback(() => {
    if (!emblaApi) return;
    if (!emblaApi.canScrollNext()) emblaApi.scrollTo(0);
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(autoScroll, 3000);
    emblaApi.on("pointerDown", () => clearInterval(interval));
    return () => clearInterval(interval);
  }, [emblaApi, autoScroll]);

  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
            Live Activity
          </span>
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Live Marketplace
          </h2>
          <p className="mx-auto max-w-lg text-base text-muted-foreground sm:text-lg">
            Real gigs happening right now. Find your perfect skill exchange.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-wrap justify-center gap-4 sm:gap-8"
        >
          {[
            { label: "Active Gigs", value: liveStats.activeGigs > 0 ? `${liveStats.activeGigs}+` : "250+" },
            { label: "Online Now", value: liveStats.onlineNow > 0 ? (liveStats.onlineNow >= 1000 ? `${(liveStats.onlineNow / 1000).toFixed(1)}K` : `${liveStats.onlineNow}`) : "1.2K" },
            { label: "Avg Response", value: liveStats.avgResponse },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
            >
              <cat.icon size={14} />
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {[...gigs, ...gigs].map((gig, i) => (
                <GigCard key={i} gig={gig} />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-shadow hover:shadow-[0_0_20px_hsl(var(--silver)/0.2)] sm:px-8 sm:py-3.5"
          >
            Browse Full Marketplace
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketplacePreviewSection;
