import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Crown, Medal, Star, TrendingUp, Users, Shield, GraduationCap,
  Flame, Zap, ArrowUp, Target, Award, Swords, BarChart3, Timer,
  ChevronRight, Sparkles, Eye, History, ArrowRight, ExternalLink,
  Clock, Hash, Bookmark
} from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import PageTransition from "@/components/shared/PageTransition";

const tabs = ["Global", "By Skill", "Guilds", "Judges", "Rising Stars", "Universities", "Hall of Fame"];

const tierColor = (t: string) => {
  if (t === "Diamond") return "text-court-blue";
  if (t === "Platinum") return "text-foreground";
  if (t === "Gold") return "text-badge-gold";
  return "text-muted-foreground";
};

const tierBg = (t: string) => {
  if (t === "Diamond") return "bg-court-blue/10 border-court-blue/20";
  if (t === "Platinum") return "bg-foreground/5 border-foreground/20";
  if (t === "Gold") return "bg-badge-gold/10 border-badge-gold/20";
  return "bg-surface-2 border-border";
};

const rankIcon = (r: number) => {
  if (r === 1) return <Crown size={18} className="text-foreground" />;
  if (r === 2) return <Medal size={18} className="text-muted-foreground" />;
  if (r === 3) return <Medal size={18} className="text-muted-foreground" />;
  return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-bold text-muted-foreground">#{r}</span>;
};

const getTimeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  return `${Math.floor(diff / 7)} weeks ago`;
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-border bg-card p-12 text-center">
    <Trophy size={32} className="mx-auto mb-3 text-muted-foreground/30" />
    <p className="text-sm text-muted-foreground">{message}</p>
    <p className="text-xs text-muted-foreground/60 mt-1">Data will appear as users join the platform</p>
  </div>
);

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState("Global");
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [guildMemberCounts, setGuildMemberCounts] = useState<Record<string, number>>({});
  const [rankingHistory, setRankingHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [profilesRes, guildsRes, membersRes, rankingRes, achievementsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("elo", { ascending: false }).limit(50),
        supabase.from("guilds").select("*").order("avg_elo", { ascending: false }).limit(20),
        supabase.from("guild_members").select("guild_id"),
        supabase.from("ranking_history").select("*").order("snapshot_date", { ascending: false }).limit(10),
        supabase.from("leaderboard_achievements").select("*").order("achieved_at", { ascending: false }).limit(10),
      ]);
      setProfiles(profilesRes.data || []);
      setGuilds(guildsRes.data || []);
      
      // Count members per guild
      const counts: Record<string, number> = {};
      (membersRes.data || []).forEach((m: any) => {
        counts[m.guild_id] = (counts[m.guild_id] || 0) + 1;
      });
      setGuildMemberCounts(counts);
      
      setRankingHistory(rankingRes.data || []);
      setAchievements(achievementsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Derive display data from profiles
  const displayProfiles = profiles.map((p, i) => ({
    rank: i + 1,
    name: p.display_name || p.full_name || "User",
    elo: p.elo,
    university: p.university || "",
    skill: (p.skills && p.skills[0]) || "",
    gigs: p.total_gigs_completed || 0,
    rating: 5.0,
    avatar: (p.display_name || p.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    tier: p.tier,
    streak: p.streak_days || 0,
    points: p.sp || 0,
    user_id: p.user_id,
    created_at: p.created_at,
  }));

  // Derive skill leaders from profiles grouped by first skill
  const skillMap = new Map<string, typeof displayProfiles>();
  profiles.forEach((p) => {
    const skills = p.skills || [];
    skills.forEach((skill: string) => {
      if (!skillMap.has(skill)) skillMap.set(skill, []);
      skillMap.get(skill)!.push(p);
    });
  });
  const skillLeaders = Array.from(skillMap.entries())
    .map(([skill, users]) => ({
      skill,
      icon: skill.toLowerCase().includes("design") ? "🎨" : skill.toLowerCase().includes("dev") || skill.toLowerCase().includes("react") || skill.toLowerCase().includes("typescript") ? "💻" : skill.toLowerCase().includes("data") || skill.toLowerCase().includes("python") ? "📊" : skill.toLowerCase().includes("video") ? "🎬" : skill.toLowerCase().includes("writ") ? "✍️" : "⚡",
      leaders: users.sort((a: any, b: any) => b.elo - a.elo).slice(0, 3).map((u: any) => ({
        name: u.display_name || u.full_name || "User",
        elo: u.elo,
        gigs: u.total_gigs_completed || 0,
        rating: 5.0,
      })),
    }))
    .sort((a, b) => b.leaders.length - a.leaders.length)
    .slice(0, 9);

  // Derive guild display data
  const displayGuilds = guilds.map((g, i) => ({
    rank: i + 1,
    name: g.name,
    elo: g.avg_elo,
    members: guildMemberCounts[g.id] || 0,
    wars: 0,
    warWins: 0,
    treasury: g.total_sp,
    gigs: g.total_gigs,
    avatar: g.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    specialty: g.category,
    id: g.id,
  }));

  // Derive universities from profiles
  const uniMap = new Map<string, { students: number; totalElo: number; totalGigs: number; skills: Map<string, number> }>();
  profiles.forEach((p) => {
    if (!p.university) return;
    const entry = uniMap.get(p.university) || { students: 0, totalElo: 0, totalGigs: 0, skills: new Map() };
    entry.students++;
    entry.totalElo += p.elo;
    entry.totalGigs += p.total_gigs_completed || 0;
    (p.skills || []).forEach((s: string) => entry.skills.set(s, (entry.skills.get(s) || 0) + 1));
    uniMap.set(p.university, entry);
  });
  const universities = Array.from(uniMap.entries())
    .map(([name, data]) => ({
      name,
      students: data.students,
      avgElo: Math.round(data.totalElo / data.students),
      gigs: data.totalGigs,
      topSkill: Array.from(data.skills.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
    }))
    .sort((a, b) => b.avgElo - a.avgElo);

  // Rising stars: newest profiles with decent ELO
  const risingStars = [...profiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((p) => ({
      name: p.display_name || p.full_name || "User",
      elo: p.elo,
      growth: `+${Math.round(p.elo * 0.1)}`,
      streak: p.streak_days || 0,
      joined: getTimeAgo(p.created_at),
      avatar: (p.display_name || p.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
      gigs: p.total_gigs_completed || 0,
      skill: (p.skills && p.skills[0]) || "General",
    }));

  // Hall of Fame: top by different metrics
  const hallOfFame: { name: string; title: string; desc: string; avatar: string; tier: string; achievement: string }[] = [];
  if (profiles.length > 0) {
    const topElo = profiles[0];
    hallOfFame.push({
      name: topElo.display_name || topElo.full_name || "User",
      title: "Highest ELO",
      desc: `Reached ${topElo.elo} ELO with ${topElo.total_gigs_completed || 0} gigs and a ${topElo.streak_days || 0}-day streak.`,
      avatar: (topElo.display_name || topElo.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
      tier: topElo.tier,
      achievement: "ELO Champion",
    });
    const topGigs = [...profiles].sort((a, b) => (b.total_gigs_completed || 0) - (a.total_gigs_completed || 0))[0];
    if (topGigs && topGigs.user_id !== topElo.user_id) {
      hallOfFame.push({
        name: topGigs.display_name || topGigs.full_name || "User",
        title: "Most Gigs Completed",
        desc: `${topGigs.total_gigs_completed || 0} gigs completed with excellence.`,
        avatar: (topGigs.display_name || topGigs.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
        tier: topGigs.tier,
        achievement: "Gig Master",
      });
    }
    const topSP = [...profiles].sort((a, b) => b.sp - a.sp)[0];
    if (topSP && topSP.user_id !== topElo.user_id && topSP.user_id !== topGigs?.user_id) {
      hallOfFame.push({
        name: topSP.display_name || topSP.full_name || "User",
        title: "Highest SP",
        desc: `Accumulated ${topSP.sp.toLocaleString()} Skill Points through consistent excellence.`,
        avatar: (topSP.display_name || topSP.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2),
        tier: topSP.tier,
        achievement: "SP Legend",
      });
    }
  }
  if (guilds.length > 0) {
    hallOfFame.push({
      name: guilds[0].name,
      title: "Top Guild by ELO",
      desc: `${guilds[0].avg_elo} average ELO with ${guilds[0].total_gigs} total gigs completed.`,
      avatar: guilds[0].name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
      tier: "Guild",
      achievement: "Guild Champion",
    });
  }

  const displayRankingHistory = rankingHistory.map((r) => ({
    date: new Date(r.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    changes: (r.changes as any[]) || [],
  }));

  const displayAchievements = achievements.map((a) => ({
    user: a.user_name,
    badge: a.badge,
    when: getTimeAgo(a.achieved_at),
  }));

  // Stats from real data
  const totalUsers = profiles.length;
  const topElo = profiles[0]?.elo || 0;
  const totalGuilds = guilds.length;
  const totalUnis = universities.length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AppNav backLabel="Leaderboard" />

        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--foreground)/0.03),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--court-blue)/0.04),transparent_40%)]" />

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                  <Trophy size={12} className="mr-1.5 inline" /> Live Rankings
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 font-heading text-5xl font-black text-foreground sm:text-6xl lg:text-7xl">
                  Leader<span className="text-muted-foreground">board</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 max-w-md text-lg text-muted-foreground">
                  The best of the best. Climb the ELO ranks, compete with guilds, and earn your place in the Hall of Fame.
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-6">
                  {[
                    { value: totalUsers.toLocaleString(), label: "Ranked Users" },
                    { value: topElo.toLocaleString(), label: "Top ELO" },
                    { value: String(totalGuilds), label: "Guilds" },
                    { value: String(totalUnis), label: "Universities" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-heading text-2xl font-black text-foreground">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Top 3 Mini Podium */}
              {displayProfiles.length >= 3 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="relative">
                  <div className="grid grid-cols-3 items-end gap-3">
                    {[1, 0, 2].map((idx) => {
                      const p = displayProfiles[idx];
                      if (!p) return null;
                      const isFirst = idx === 0;
                      return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} className={`rounded-2xl border border-border bg-card p-${isFirst ? 5 : 4} text-center ${isFirst ? "-mt-6" : ""}`}>
                          {isFirst ? <Crown size={24} className="mx-auto mb-2 text-foreground" /> : <Medal size={20} className="mx-auto mb-2 text-muted-foreground" />}
                          <div className={`mx-auto mb-2 flex h-${isFirst ? 16 : 14} w-${isFirst ? 16 : 14} items-center justify-center rounded-full bg-surface-2 ${isFirst ? "ring-2 ring-border" : ""} font-mono text-sm font-bold text-foreground`}>{p.avatar}</div>
                          <p className="text-xs font-bold text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.university}</p>
                          {isFirst && <span className="mt-1 inline-block rounded-full bg-court-blue/10 px-2 py-0.5 text-[9px] font-semibold text-court-blue">{p.tier}</span>}
                          <p className={`mt-1 font-mono ${isFirst ? "text-lg" : "text-sm"} font-black text-foreground`}>{p.elo.toLocaleString()}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <Trophy size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Not enough users to display podium yet</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scrolling Achievements Ticker */}
        {displayAchievements.length > 0 && (
          <section className="border-y border-border bg-surface-1 py-3 overflow-hidden">
            <div className="relative">
              <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: [0, -1600] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                {[...displayAchievements, ...displayAchievements].map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span>{a.badge}</span>
                    <span className="font-semibold text-foreground">{a.user}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{a.when}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Top People by Skill Category */}
        {skillLeaders.length > 0 && (
          <section className="py-12 border-b border-border">
            <div className="mx-auto max-w-7xl px-6">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark size={16} className="text-muted-foreground" />
                  <h2 className="font-heading text-lg font-bold text-foreground">Top Talent by Skill</h2>
                </div>
                <button onClick={() => setActiveTab("By Skill")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View all <ArrowRight size={12} />
                </button>
              </motion.div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {skillLeaders.slice(0, 6).map((s, i) => (
                  <motion.button key={s.skill} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} onClick={() => setActiveTab("By Skill")} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:bg-card/80">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.skill}</p>
                      <p className="text-[10px] text-muted-foreground">Led by {s.leaders[0]?.name} · ELO {s.leaders[0]?.elo}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabs + Timeframe */}
        <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex gap-1 rounded-full border border-border p-1">
                {(["all", "month", "week"] as const).map((t) => (
                  <button key={t} onClick={() => setTimeframe(t)} className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${timeframe === t ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                    {t === "all" ? "All Time" : t === "month" ? "This Month" : "This Week"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <AnimatePresence mode="wait">
              {activeTab === "Global" && (
                <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {displayProfiles.length === 0 ? <EmptyState message="No ranked users yet" /> : (
                    <>
                      {/* Top 3 Podium */}
                      <div className="mb-12 grid gap-4 md:grid-cols-3">
                        {displayProfiles.slice(0, 3).map((user, i) => (
                          <Link to={`/profile/${user.user_id}`} key={user.rank}><motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, type: "spring" }} className={`rounded-2xl border p-8 text-center transition-all hover:shadow-lg cursor-pointer ${i === 0 ? `${tierBg(user.tier)} md:order-2 md:-mt-6` : i === 1 ? "border-muted-foreground/20 bg-card md:order-1" : "border-border bg-card md:order-3"}`}>
                            <div className="mb-2">{rankIcon(user.rank)}</div>
                            <div className={`mx-auto my-3 flex h-20 w-20 items-center justify-center rounded-full font-heading text-xl font-bold text-foreground ${i === 0 ? "bg-badge-gold/10 ring-2 ring-badge-gold/30" : "bg-surface-2"}`}>{user.avatar}</div>
                            <h3 className="font-heading text-lg font-bold text-foreground">{user.name}</h3>
                            <p className="text-xs text-muted-foreground">{user.university} · {user.skill}</p>
                            <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold ${tierBg(user.tier)} ${tierColor(user.tier)}`}>{user.tier}</span>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <div><p className={`font-mono text-lg font-black ${tierColor(user.tier)}`}>{user.elo}</p><p className="text-[9px] text-muted-foreground">ELO</p></div>
                              <div><p className="font-mono text-lg font-black text-foreground">{user.gigs}</p><p className="text-[9px] text-muted-foreground">Gigs</p></div>
                              <div><p className="font-mono text-lg font-black text-badge-gold">★ {user.rating}</p><p className="text-[9px] text-muted-foreground">Rating</p></div>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Flame size={10} className="text-badge-gold" />{user.streak}d streak</span>
                              <span>{user.points.toLocaleString()} SP</span>
                            </div>
                          </motion.div></Link>
                        ))}
                      </div>

                      {/* Rank List */}
                      <div className="space-y-2">
                        {displayProfiles.slice(3).map((user, i) => (
                          <Link to={`/profile/${user.user_id}`} key={user.rank}><motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:bg-card/80">
                            {rankIcon(user.rank)}
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-bold text-foreground">{user.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground">{user.university} · {user.skill}</p>
                            </div>
                            <span className={`hidden sm:inline rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tierBg(user.tier)} ${tierColor(user.tier)}`}>{user.tier}</span>
                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"><Flame size={10} className="text-badge-gold" />{user.streak}d</div>
                            <span className="font-mono text-sm font-bold text-foreground">{user.elo}</span>
                            <div className="flex items-center gap-1">
                              <Star size={12} className="fill-badge-gold text-badge-gold" />
                              <span className="font-mono text-xs text-badge-gold">{user.rating}</span>
                            </div>
                          </motion.div></Link>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "By Skill" && (
                <motion.div key="skill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {skillLeaders.length === 0 ? <EmptyState message="No skill data yet — users need to add skills to their profiles" /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {skillLeaders.map((s, i) => (
                        <motion.div key={s.skill} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-2xl">{s.icon}</span>
                            <h3 className="font-heading text-base font-bold text-foreground">{s.skill}</h3>
                          </div>
                          {s.leaders.map((l, j) => (
                            <div key={l.name} className="flex items-center gap-3 border-b border-border/50 py-3 last:border-0 last:pb-0">
                              {rankIcon(j + 1)}
                              <div className="flex-1">
                                <span className="text-sm font-medium text-foreground">{l.name}</span>
                                <p className="text-[10px] text-muted-foreground">{l.gigs} gigs · ★ {l.rating}</p>
                              </div>
                              <span className="font-mono text-xs font-semibold text-foreground">{l.elo}</span>
                            </div>
                          ))}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Guilds" && (
                <motion.div key="guilds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {displayGuilds.length === 0 ? <EmptyState message="No guilds created yet" /> : (
                    <div className="space-y-4">
                      {displayGuilds.map((g, i) => (
                        <motion.div key={g.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-4">
                              {rankIcon(g.rank)}
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2 font-mono text-base font-bold text-foreground">{g.avatar}</div>
                              <div>
                                <p className="font-heading text-base font-bold text-foreground">{g.name}</p>
                                <p className="text-xs text-muted-foreground">{g.specialty}</p>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-wrap gap-6 sm:justify-end">
                              <div className="text-center"><p className="font-mono text-lg font-bold text-foreground">{g.elo}</p><p className="text-[9px] text-muted-foreground">ELO</p></div>
                              <div className="text-center"><p className="font-mono text-lg font-bold text-foreground">{g.members}</p><p className="text-[9px] text-muted-foreground">Members</p></div>
                              <div className="text-center"><p className="font-mono text-lg font-bold text-badge-gold">{g.treasury.toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Treasury SP</p></div>
                              <div className="text-center"><p className="font-mono text-lg font-bold text-foreground">{g.gigs}</p><p className="text-[9px] text-muted-foreground">Total Gigs</p></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Judges" && (
                <motion.div key="judges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState message="Skill Court Judges will be ranked here once the Skill Court system is live" />
                </motion.div>
              )}

              {activeTab === "Rising Stars" && (
                <motion.div key="rising" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {risingStars.length === 0 ? <EmptyState message="No rising stars yet" /> : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {risingStars.map((s, i) => (
                        <motion.div key={s.name + i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-skill-green/10 font-mono text-sm font-bold text-skill-green">{s.avatar}</div>
                            <div>
                              <p className="font-heading text-sm font-bold text-foreground">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground">{s.skill} · Joined {s.joined}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div><p className="font-mono text-lg font-bold text-foreground">{s.elo}</p><p className="text-[9px] text-muted-foreground">ELO</p></div>
                            <div><p className="flex items-center gap-0.5 font-mono text-lg font-bold text-skill-green"><ArrowUp size={14} />{s.growth}</p><p className="text-[9px] text-muted-foreground">Growth</p></div>
                            <div><p className="flex items-center gap-0.5 font-mono text-lg font-bold text-badge-gold"><Flame size={14} />{s.streak}</p><p className="text-[9px] text-muted-foreground">Streak</p></div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">{s.gigs} gigs completed</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Universities" && (
                <motion.div key="uni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {universities.length === 0 ? <EmptyState message="No university data yet — users need to set their university in their profile" /> : (
                    <div className="space-y-3">
                      {universities.map((u, i) => (
                        <motion.div key={u.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-bold text-muted-foreground">#{i + 1}</span>
                          <GraduationCap size={20} className="text-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-sm font-bold text-foreground">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">{u.students} students · Top: {u.topSkill}</p>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div><p className="font-mono text-sm font-bold text-foreground">{u.avgElo}</p><p className="text-[9px] text-muted-foreground">Avg ELO</p></div>
                            <div><p className="font-mono text-sm font-bold text-foreground">{u.gigs.toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Gigs</p></div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Hall of Fame" && (
                <motion.div key="hof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-10 text-center">
                    <Crown size={36} className="mx-auto mb-3 text-badge-gold" />
                    <h2 className="font-heading text-2xl font-bold text-foreground">Hall of Fame</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Legendary users who shaped the SkillSwappr community</p>
                  </div>
                  {hallOfFame.length === 0 ? <EmptyState message="Hall of Fame entries will appear as users achieve milestones" /> : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {hallOfFame.map((u, i) => (
                        <motion.div key={u.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-badge-gold/20 bg-card p-8">
                          <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-badge-gold/10 ring-2 ring-badge-gold/20 font-heading text-xl font-bold text-foreground">{u.avatar}</div>
                            <div>
                              <span className="rounded-full bg-badge-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-badge-gold">{u.achievement}</span>
                              <h3 className="mt-2 font-heading text-lg font-bold text-foreground">{u.name}</h3>
                              <p className="text-sm font-medium text-muted-foreground italic">"{u.title}"</p>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Ranking History */}
        {displayRankingHistory.length > 0 && (
          <section className="border-t border-border bg-surface-1 py-16">
            <div className="mx-auto max-w-6xl px-6">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8 flex items-center gap-3">
                <History size={20} className="text-muted-foreground" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Ranking History</h2>
              </motion.div>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-8">
                  {displayRankingHistory.map((week, wi) => (
                    <motion.div key={week.date} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: wi * 0.1 }} className="relative pl-14">
                      <div className="absolute left-4 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-background">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Clock size={12} className="text-muted-foreground" />
                          <span className="font-mono text-xs font-semibold text-foreground">{week.date}, 2026</span>
                          <span className="text-[10px] text-muted-foreground">· {week.changes.length} changes</span>
                        </div>
                        <div className="space-y-2">
                          {week.changes.map((c: any) => (
                            <div key={c.name} className="flex items-center gap-3 text-sm">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-mono text-[10px] font-bold text-muted-foreground">
                                {c.name.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              <span className="font-medium text-foreground">{c.name}</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Hash size={10} />{c.from}
                                <ArrowRight size={10} />
                                <span className={c.to < c.from ? "text-skill-green font-semibold" : "text-alert-red font-semibold"}>#{c.to}</span>
                              </div>
                              <span className="ml-auto font-mono text-xs text-muted-foreground">ELO {c.elo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Platform Stats Banner */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground">Platform at a Glance</h2>
              <p className="mt-2 text-sm text-muted-foreground">Real-time community metrics</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, label: "Total Users", value: totalUsers.toLocaleString(), color: "text-foreground" },
                { icon: Target, label: "Total Gigs", value: profiles.reduce((a, p) => a + (p.total_gigs_completed || 0), 0).toLocaleString(), color: "text-skill-green" },
                { icon: Swords, label: "Active Guilds", value: String(totalGuilds), color: "text-court-blue" },
                { icon: Shield, label: "Universities", value: String(totalUnis), color: "text-badge-gold" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <stat.icon size={24} className={`mx-auto mb-3 ${stat.color}`} />
                  <p className={`font-heading text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ELO Tier Explainer */}
        <section className="border-t border-border bg-surface-1 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground">Tier System</h2>
              <p className="mt-2 text-sm text-muted-foreground">Climb through the ranks and unlock exclusive benefits</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { name: "Bronze", elo: "0–999", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", perks: "Basic access, marketplace browsing" },
                { name: "Silver", elo: "1,000–1,299", color: "text-muted-foreground", bg: "bg-surface-2 border-border", perks: "Co-Creation unlocked, guild joining" },
                { name: "Gold", elo: "1,300–1,599", color: "text-badge-gold", bg: "bg-badge-gold/10 border-badge-gold/20", perks: "Featured listings, court eligibility" },
                { name: "Platinum", elo: "1,600–1,799", color: "text-foreground", bg: "bg-foreground/5 border-foreground/20", perks: "Projects format, reduced 3% tax" },
                { name: "Diamond", elo: "1,800+", color: "text-court-blue", bg: "bg-court-blue/10 border-court-blue/20", perks: "All formats, 2% tax, verified badge" },
              ].map((tier, i) => (
                <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`rounded-2xl border p-5 text-center ${tier.bg}`}>
                  <p className={`font-heading text-lg font-bold ${tier.color}`}>{tier.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{tier.elo} ELO</p>
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{tier.perks}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default LeaderboardPage;
