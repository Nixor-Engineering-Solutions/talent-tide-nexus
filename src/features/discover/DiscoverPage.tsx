import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, Users, Shield, Briefcase, GraduationCap, Trophy, Coins,
  TrendingUp, Swords, Sparkles, Star, Eye, ChevronDown, ChevronRight,
  MapPin, Zap, Crown, Target, ArrowUpDown, X, SlidersHorizontal,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import CustomCursor from "@/components/shared/CustomCursor";
import CursorGlow from "@/components/shared/CursorGlow";
import PageTransition from "@/components/shared/PageTransition";
import Footer from "@/components/shared/Footer";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─── Types ─── */
interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
  bio: string | null;
  elo: number | null;
  skills: string[] | null;
  tier: string | null;
  university: string | null;
  total_gigs_completed: number | null;
}

interface Guild {
  id: string;
  name: string;
  slogan: string;
  category: string;
  rank: number;
  avg_elo: number;
  total_sp: number;
  total_gigs: number;
  win_rate: number;
  is_public: boolean;
  avatar_url: string | null;
  member_count?: number;
}

interface DiscoverEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  category: string;
  spots: number | null;
  spots_filled: number;
  icon: string;
  prize: string | null;
  is_featured: boolean;
  tags: string[] | null;
  status: string;
}

/* ─── Constants ─── */
const TABS = [
  { key: "people", label: "People", icon: Users },
  { key: "guilds", label: "Guilds", icon: Shield },
  { key: "events", label: "Events", icon: Calendar },
  { key: "tournaments", label: "Tournaments", icon: Trophy },
] as const;

const TIERS = ["Diamond", "Platinum", "Gold", "Silver", "Bronze"];
const SKILL_CATEGORIES = ["Development", "Design", "Marketing", "Writing", "Data", "Business", "Music", "3D", "Photo", "Video"];
const GUILD_CATEGORIES = ["Development", "Design", "Marketing", "Writing", "Data", "Business", "Other"];
const ELO_RANGES = [
  { label: "2000+", min: 2000, max: 99999 },
  { label: "1500–2000", min: 1500, max: 1999 },
  { label: "1000–1500", min: 1000, max: 1499 },
  { label: "Under 1000", min: 0, max: 999 },
];

const USER_SORTS = [
  { value: "elo", label: "Highest ELO" },
  { value: "gigs", label: "Most Gigs" },
  { value: "name", label: "A–Z" },
];
const GUILD_SORTS = [
  { value: "rank", label: "Rank" },
  { value: "avg_elo", label: "Avg ELO" },
  { value: "total_sp", label: "Total SP" },
  { value: "members", label: "Members" },
];

const tierColors: Record<string, string> = {
  Diamond: "text-court-blue",
  Platinum: "text-foreground",
  Gold: "text-badge-gold",
  Silver: "text-muted-foreground",
  Bronze: "text-muted-foreground/60",
};

const tierBg: Record<string, string> = {
  Diamond: "bg-court-blue/10 border-court-blue/20",
  Platinum: "bg-foreground/5 border-foreground/10",
  Gold: "bg-badge-gold/10 border-badge-gold/20",
  Silver: "bg-muted/50 border-border",
  Bronze: "bg-muted/30 border-border/50",
};

const eloTierColor = (elo: number) => {
  if (elo >= 1800) return "text-court-blue";
  if (elo >= 1500) return "text-badge-gold";
  if (elo >= 1000) return "text-skill-green";
  return "text-muted-foreground";
};

/* ─── Filter Section (Collapsible) ─── */
const FilterSection = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-2 group">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-muted-foreground" />
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown size={12} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Filter Checkbox ─── */
const FilterCheck = ({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) => (
  <button onClick={onClick} className={cn(
    "flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 text-[11px] transition-all",
    active ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
  )}>
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded border transition-all flex items-center justify-center",
        active ? "bg-foreground border-foreground" : "border-border"
      )}>
        {active && <div className="w-1.5 h-1.5 rounded-sm bg-background" />}
      </div>
      {label}
    </div>
    {count !== undefined && <span className="font-mono text-[9px] text-muted-foreground/60">{count}</span>}
  </button>
);

/* ─── Skeleton ─── */
const CardSkeleton = ({ count }: { count: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
    ))}
  </div>
);

/* ─── Enhanced User Card ─── */
const UserCard = ({ user, index }: { user: UserProfile; index: number }) => {
  const tier = user.tier || "Bronze";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
    >
      <Link to={`/profile/${user.user_id}`} className="block group">
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_-10px_hsl(var(--foreground)/0.1)]">
          {/* Tier accent bar */}
          <div className={cn("h-1 w-full", tier === "Diamond" ? "bg-court-blue" : tier === "Gold" ? "bg-badge-gold" : tier === "Platinum" ? "bg-foreground/40" : "bg-muted")} />

          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 border border-border text-lg shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span>{user.avatar_emoji || "👤"}</span>
                  )}
                </div>
                <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center text-[6px]", tierBg[tier])}>
                  <Crown size={7} className={tierColors[tier]} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-bold text-foreground truncate group-hover:text-foreground/80 transition-colors">
                  {user.display_name || "Anonymous"}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-[10px] font-bold", tierColors[tier])}>{tier}</span>
                  <span className="text-[8px] text-muted-foreground/40">•</span>
                  <span className={cn("font-mono text-[10px] font-bold", eloTierColor(user.elo || 0))}>{user.elo || 0}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-surface-2 rounded-full px-2 py-0.5">
                  <Briefcase size={9} className="text-muted-foreground" />
                  <span className="font-mono text-[10px] font-bold text-foreground">{user.total_gigs_completed || 0}</span>
                </div>
              </div>
            </div>

            {user.bio && <p className="mb-3 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{user.bio}</p>}

            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {user.skills.slice(0, 3).map(s => (
                  <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-[9px] font-medium text-muted-foreground border border-border/50">{s}</span>
                ))}
                {user.skills.length > 3 && (
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[9px] text-muted-foreground/50 border border-border/30">+{user.skills.length - 3}</span>
                )}
              </div>
            )}

            {user.university && (
              <div className="flex items-center gap-1.5 pt-3 border-t border-border/30">
                <GraduationCap size={10} className="text-muted-foreground/60" />
                <span className="text-[9px] text-muted-foreground truncate">{user.university}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── Enhanced Guild Card ─── */
const GuildCard = ({ guild, index }: { guild: Guild; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03, duration: 0.3 }}
  >
    <Link to={`/guild/${guild.id}`} className="block group">
      <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_-10px_hsl(var(--foreground)/0.1)]">
        {/* Rank bar */}
        <div className={cn("h-1 w-full", guild.rank <= 3 ? "bg-badge-gold" : guild.rank <= 10 ? "bg-foreground/30" : "bg-muted/50")} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-lg shrink-0">
                {guild.avatar_url ? (
                  <img src={guild.avatar_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <Shield size={18} className="text-badge-gold/60" />
                )}
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-foreground/80 transition-colors">{guild.name}</h3>
                <span className="text-[10px] text-muted-foreground">{guild.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-surface-2 rounded-full px-2.5 py-1 border border-border/50">
              <Crown size={9} className={guild.rank <= 3 ? "text-badge-gold" : "text-muted-foreground"} />
              <span className="font-mono text-[10px] font-bold text-foreground">#{guild.rank}</span>
            </div>
          </div>

          <p className="mb-4 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">"{guild.slogan}"</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-1 border border-border/30 p-2.5 text-center">
              <p className={cn("font-mono text-base font-black", eloTierColor(guild.avg_elo))}>{guild.avg_elo}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">Avg ELO</p>
            </div>
            <div className="rounded-lg bg-surface-1 border border-border/30 p-2.5 text-center">
              <p className="font-mono text-base font-black text-foreground">{guild.member_count || 0}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">Members</p>
            </div>
            <div className="rounded-lg bg-surface-1 border border-border/30 p-2.5 text-center">
              <p className="font-mono text-base font-black text-badge-gold">{guild.total_sp.toLocaleString()}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">Treasury</p>
            </div>
            <div className="rounded-lg bg-surface-1 border border-border/30 p-2.5 text-center">
              <p className="font-mono text-base font-black text-skill-green">{guild.win_rate}%</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">Win Rate</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <Swords size={10} className="text-muted-foreground/60" />
              <span className="text-[9px] text-muted-foreground">{guild.total_gigs} gigs completed</span>
            </div>
            <span className={cn("text-[9px] font-medium", guild.is_public ? "text-skill-green" : "text-muted-foreground")}>
              {guild.is_public ? "Open" : "Invite Only"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

/* ─── Main Page ─── */
const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as "people" | "guilds" | "events" | "tournaments") || "people";
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // People filters
  const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedEloRange, setSelectedEloRange] = useState<string | null>(null);
  const [userSort, setUserSort] = useState("elo");
  const [onlyWithGigs, setOnlyWithGigs] = useState(false);

  // Guild filters
  const [selectedGuildCategories, setSelectedGuildCategories] = useState<Set<string>>(new Set());
  const [guildSort, setGuildSort] = useState("rank");
  const [onlyPublic, setOnlyPublic] = useState(false);

  // Events state
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSearch("");
  };

  const toggleSet = (set: Set<string>, val: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const clearAllFilters = () => {
    setSelectedTiers(new Set());
    setSelectedSkills(new Set());
    setSelectedEloRange(null);
    setOnlyWithGigs(false);
    setSelectedGuildCategories(new Set());
    setOnlyPublic(false);
    setSearch("");
  };

  const hasActiveFilters = selectedTiers.size > 0 || selectedSkills.size > 0 || selectedEloRange !== null ||
    onlyWithGigs || selectedGuildCategories.size > 0 || onlyPublic || search.length > 0;

  // Fetch users
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("public_profiles").select("*").order("elo", { ascending: false }).limit(200);
      if (data) setUsers(data as UserProfile[]);
      setLoadingUsers(false);
    })();
  }, []);

  // Fetch guilds
  useEffect(() => {
    (async () => {
      const { data: guildsData } = await supabase
        .from("guilds")
        .select("id, name, slogan, category, rank, avg_elo, total_sp, total_gigs, win_rate, is_public, avatar_url")
        .order("rank");
      if (guildsData) {
        const { data: members } = await supabase.from("guild_members").select("guild_id");
        const counts: Record<string, number> = {};
        members?.forEach(m => { counts[m.guild_id] = (counts[m.guild_id] || 0) + 1; });
        setGuilds(guildsData.map(g => ({ ...g, member_count: counts[g.id] || 0 })));
      }
      setLoadingGuilds(false);
    })();
  }, []);

  // Fetch events
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, event_date, event_type, category, spots, spots_filled, icon, prize, is_featured, tags, status")
        .order("event_date", { ascending: true });
      if (data) setEvents(data as DiscoverEvent[]);
      setLoadingEvents(false);
    })();
  }, []);

  // Tier counts
  const tierCounts = useMemo(() => {
    const c: Record<string, number> = {};
    users.forEach(u => { const t = u.tier || "Bronze"; c[t] = (c[t] || 0) + 1; });
    return c;
  }, [users]);

  // Skill frequency
  const skillFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    users.forEach(u => u.skills?.forEach(s => { freq[s] = (freq[s] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [users]);

  const guildCategoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    guilds.forEach(g => { c[g.category] = (c[g.category] || 0) + 1; });
    return c;
  }, [guilds]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => selectedTiers.size === 0 || selectedTiers.has(u.tier || "Bronze"))
      .filter(u => {
        if (selectedSkills.size === 0) return true;
        return u.skills?.some(s => selectedSkills.has(s));
      })
      .filter(u => {
        if (!selectedEloRange) return true;
        const range = ELO_RANGES.find(r => r.label === selectedEloRange);
        if (!range) return true;
        const elo = u.elo || 0;
        return elo >= range.min && elo <= range.max;
      })
      .filter(u => !onlyWithGigs || (u.total_gigs_completed || 0) > 0)
      .filter(u => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (u.display_name?.toLowerCase().includes(q)) || (u.skills?.some(s => s.toLowerCase().includes(q))) || (u.university?.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (userSort === "elo") return (b.elo || 0) - (a.elo || 0);
        if (userSort === "gigs") return (b.total_gigs_completed || 0) - (a.total_gigs_completed || 0);
        return (a.display_name || "").localeCompare(b.display_name || "");
      });
  }, [users, selectedTiers, selectedSkills, selectedEloRange, onlyWithGigs, search, userSort]);

  // Filtered guilds
  const filteredGuilds = useMemo(() => {
    return guilds
      .filter(g => selectedGuildCategories.size === 0 || selectedGuildCategories.has(g.category))
      .filter(g => !onlyPublic || g.is_public)
      .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.slogan.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (guildSort === "rank") return a.rank - b.rank;
        if (guildSort === "avg_elo") return b.avg_elo - a.avg_elo;
        if (guildSort === "total_sp") return b.total_sp - a.total_sp;
        return (b.member_count || 0) - (a.member_count || 0);
      });
  }, [guilds, selectedGuildCategories, onlyPublic, search, guildSort]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    const isTournament = activeTab === "tournaments";
    return events
      .filter(e => isTournament ? e.event_type === "Tournament" : true)
      .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()) || e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())));
  }, [events, activeTab, search]);

  const isPeople = activeTab === "people";
  const isGuilds = activeTab === "guilds";
  const isEvents = activeTab === "events" || activeTab === "tournaments";
  const resultCount = isPeople ? filteredUsers.length : isGuilds ? filteredGuilds.length : filteredEvents.length;
  const loading = isPeople ? loadingUsers : isGuilds ? loadingGuilds : loadingEvents;
  const sorts = isPeople ? USER_SORTS : GUILD_SORTS;
  const activeSort = isPeople ? userSort : guildSort;
  const setSort = isPeople ? setUserSort : setGuildSort;

  /* ─── Left Sidebar Filters ─── */
  const FilterPanel = () => (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-foreground" />
          <span className="text-xs font-bold text-foreground">Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-[10px] text-alert-red hover:text-alert-red/80 font-medium transition-colors">
            Clear all
          </button>
        )}
      </div>

      {isPeople ? (
        <>
          <FilterSection title="Tier" icon={Crown}>
            <div className="space-y-0.5">
              {TIERS.map(t => (
                <FilterCheck key={t} label={t} active={selectedTiers.has(t)} onClick={() => toggleSet(selectedTiers, t, setSelectedTiers)} count={tierCounts[t] || 0} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="ELO Range" icon={Target}>
            <div className="space-y-0.5">
              {ELO_RANGES.map(r => (
                <FilterCheck key={r.label} label={r.label} active={selectedEloRange === r.label}
                  onClick={() => setSelectedEloRange(selectedEloRange === r.label ? null : r.label)} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Skills" icon={Sparkles} defaultOpen={false}>
            <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-hide">
              {skillFreq.slice(0, 20).map(([skill, count]) => (
                <FilterCheck key={skill} label={skill} active={selectedSkills.has(skill)} onClick={() => toggleSet(selectedSkills, skill, setSelectedSkills)} count={count} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Activity" icon={Zap} defaultOpen={false}>
            <FilterCheck label="Has completed gigs" active={onlyWithGigs} onClick={() => setOnlyWithGigs(!onlyWithGigs)} />
          </FilterSection>
        </>
      ) : (
        <>
          <FilterSection title="Category" icon={Briefcase}>
            <div className="space-y-0.5">
              {GUILD_CATEGORIES.map(c => (
                <FilterCheck key={c} label={c} active={selectedGuildCategories.has(c)}
                  onClick={() => toggleSet(selectedGuildCategories, c, setSelectedGuildCategories)} count={guildCategoryCounts[c] || 0} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Access" icon={Shield}>
            <FilterCheck label="Public guilds only" active={onlyPublic} onClick={() => setOnlyPublic(!onlyPublic)} />
          </FilterSection>
        </>
      )}

      {/* Sort section */}
      <FilterSection title="Sort by" icon={ArrowUpDown}>
        <div className="space-y-0.5">
          {sorts.map(s => (
            <FilterCheck key={s.value} label={s.label} active={activeSort === s.value} onClick={() => setSort(s.value)} />
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <CursorGlow />
        <Navbar />

        {/* Hero */}
        <section className="pt-24 pb-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-court-blue/[0.02] blur-3xl" />
            <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-badge-gold/[0.02] blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px flex-1 max-w-[40px] bg-foreground/20" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Explore the network</span>
                <div className="h-px flex-1 max-w-[40px] bg-foreground/20" />
              </div>
              <h1 className="font-heading text-5xl font-black text-foreground sm:text-6xl tracking-tight">
                Discover
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                Find skilled creators, join powerful guilds, and build your network across the platform.
              </p>
            </motion.div>

            {/* Search + Tabs row */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isPeople ? "Search by name, skill, or university..." : isGuilds ? "Search guilds by name or slogan..." : "Search events by name, tag, or description..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-0.5 rounded-xl bg-surface-1 border border-border/50 p-1 shrink-0">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                      activeTab === key ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={13} />
                    {label}
                    <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[9px]",
                      activeTab === key ? "bg-background/20 text-background" : "bg-surface-2 text-muted-foreground"
                    )}>
                      {key === "people" ? users.length : key === "guilds" ? guilds.length : key === "events" ? events.length : events.filter(e => e.event_type === "Tournament").length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mobile filter toggle */}
              {isMobile && (
                <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex items-center gap-2 rounded-lg bg-surface-1 border border-border/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <SlidersHorizontal size={13} />
                  Filters
                  {hasActiveFilters && <div className="w-1.5 h-1.5 rounded-full bg-skill-green" />}
                </button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Main Content: Left Filters + Grid */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex gap-6">
              {/* Left Sidebar Filters — desktop (hide for events tabs) */}
              {!isEvents && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block w-56 shrink-0 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide"
              >
                <div className="rounded-2xl border border-border bg-card p-4">
                  <FilterPanel />
                </div>

                {/* Quick stats widget */}
                <div className="rounded-2xl border border-border bg-card p-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={13} className="text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Quick Stats</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Total Users</span>
                      <span className="font-mono text-xs font-bold text-foreground">{users.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Active Guilds</span>
                      <span className="font-mono text-xs font-bold text-foreground">{guilds.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Avg ELO</span>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.elo || 0), 0) / users.length) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.aside>
              )}

              {/* Mobile Filters Drawer */}
              <AnimatePresence>
                {isMobile && mobileFiltersOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border p-5 overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-foreground">Filters</span>
                        <button onClick={() => setMobileFiltersOpen(false)} className="text-muted-foreground"><X size={18} /></button>
                      </div>
                      <FilterPanel />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Grid */}
              <div className="flex-1 min-w-0">
                {/* Results bar */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">{resultCount}</span> {isPeople ? "creator" : isGuilds ? "guild" : "event"}{resultCount !== 1 ? "s" : ""} found
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <X size={10} /> Clear filters
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <CardSkeleton count={isPeople ? 9 : 6} />
                  ) : resultCount === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                      {isPeople ? <Users size={40} className="mx-auto mb-3 text-muted-foreground/20" /> : isGuilds ? <Shield size={40} className="mx-auto mb-3 text-muted-foreground/20" /> : <Calendar size={40} className="mx-auto mb-3 text-muted-foreground/20" />}
                      <p className="text-sm text-foreground font-medium">No {isPeople ? "creators" : isGuilds ? "guilds" : "events"} found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="mt-3 text-xs text-foreground underline underline-offset-4">Clear all filters</button>
                      )}
                    </motion.div>
                  ) : isPeople ? (
                    <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredUsers.map((user, i) => <UserCard key={user.user_id} user={user} index={i} />)}
                    </motion.div>
                  ) : isGuilds ? (
                    <motion.div key="guilds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2">
                      {filteredGuilds.map((guild, i) => <GuildCard key={guild.id} guild={guild} index={i} />)}
                    </motion.div>
                  ) : (
                    <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredEvents.map((event, i) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.3 }}
                        >
                          <Link to="/events" className="block group">
                            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_-10px_hsl(var(--foreground)/0.1)]">
                              <div className={cn("h-1 w-full", event.event_type === "Tournament" ? "bg-badge-gold" : event.event_type === "Workshop" ? "bg-court-blue" : "bg-skill-green")} />
                              <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{event.icon}</span>
                                    <div>
                                      <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-foreground/80 transition-colors">{event.title}</h3>
                                      <span className="text-[10px] text-muted-foreground">{event.event_type} · {event.category}</span>
                                    </div>
                                  </div>
                                  {event.is_featured && <Star size={12} className="text-badge-gold fill-badge-gold" />}
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(event.event_date).toLocaleDateString()}</span>
                                  {event.spots && <span className="flex items-center gap-1"><Users size={10} /> {event.spots_filled}/{event.spots}</span>}
                                  {event.prize && <span className="flex items-center gap-1 text-badge-gold font-medium"><Trophy size={10} /> {event.prize}</span>}
                                </div>
                                {event.tags && event.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {event.tags.slice(0, 3).map(t => (
                                      <span key={t} className="rounded-md bg-surface-2 px-2 py-0.5 text-[9px] font-medium text-muted-foreground border border-border/50">{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default DiscoverPage;
