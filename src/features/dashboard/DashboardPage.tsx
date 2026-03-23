import { useState, useEffect } from "react";
import SkillCourtTab from "./SkillCourtTab";
import CreateGigTab from "./CreateGigTab";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LogOut, Trophy, Zap, Star, Shield, Users, TrendingUp, ArrowRight,
  Calendar, MessageSquare, BookOpen, Award, Settings, Bell, ChevronRight,
  LayoutDashboard, Briefcase, Plus, Gavel, Scale, FileText, Image,
  Clock, CheckCircle2, XCircle, AlertTriangle, Eye, ThumbsUp, ThumbsDown,
  Send, Paperclip, Tag, DollarSign, Layers, GitMerge, Timer, Crown,
  ChevronLeft, User, Building2, BarChart3, Wallet, History, Heart,
  Target, Coins, GraduationCap, MapPin, Globe, Edit3, Camera, Upload,
  Palette, Code, PenTool, Video, Music, BarChart, Megaphone, Cpu, Search
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import PageTransition from "@/components/shared/PageTransition";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "my-gigs", label: "My Gigs", icon: Briefcase },
  { id: "create-gig", label: "Create Gig", icon: Plus },
  { id: "skill-court", label: "Skill Court", icon: Scale },
  { id: "guilds", label: "My Guilds", icon: Users },
  { id: "wallet", label: "SP Wallet", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

/* Mock data removed — all tabs now use Supabase queries */

/* Format/category constants moved to CreateGigTab.tsx */

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */

const statusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-skill-green/10 text-skill-green border-skill-green/20";
    case "pending": return "bg-badge-gold/10 text-badge-gold border-badge-gold/20";
    case "completed": return "bg-court-blue/10 text-court-blue border-court-blue/20";
    case "in-dispute": return "bg-alert-red/10 text-alert-red border-alert-red/20";
    default: return "bg-surface-2 text-muted-foreground border-border";
  }
};

const eloTier = (elo: number) => {
  if (elo >= 1700) return { label: "Diamond", color: "text-court-blue", bg: "bg-court-blue/10" };
  if (elo >= 1500) return { label: "Gold", color: "text-badge-gold", bg: "bg-badge-gold/10" };
  if (elo >= 1300) return { label: "Silver", color: "text-muted-foreground", bg: "bg-surface-2" };
  return { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10" };
};

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════════════════════════ */

const OverviewTab = ({ profile }: { profile: any }) => {
  const { user } = useAuth();
  const tier = eloTier(profile?.elo || 1000);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [gigCount, setGigCount] = useState(0);
  const [activeGigs, setActiveGigs] = useState<any[]>([]);
  const [myDisputes, setMyDisputes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [actRes, gigRes, activeRes, disputeRes] = await Promise.all([
        supabase.from("activity_log").select("action, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("listings").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "active"),
        supabase.from("listings").select("id, title, status, format, points").eq("user_id", user.id).in("status", ["active", "pending"]).order("created_at", { ascending: false }).limit(3),
        supabase.from("disputes").select("id, title, status, sp_amount, created_at").or(`filed_by.eq.${user.id},filed_against.eq.${user.id}`).in("status", ["Open", "In Review"]).limit(3),
      ]);
      if (actRes.data?.length) {
        setRecentActivity(actRes.data.map((a: any) => ({
          action: a.action,
          time: new Date(a.created_at).toLocaleString(),
          icon: Award,
          color: "text-skill-green",
        })));
      } else {
        setRecentActivity([
          { action: "Welcome to SkillSwap!", time: "Just now", icon: Award, color: "text-skill-green" },
        ]);
      }
      setGigCount(gigRes.count || 0);
      setActiveGigs(activeRes.data || []);
      setMyDisputes(disputeRes.data || []);
    };
    load();
  }, [user]);

  const quickStats = [
    { label: "Skill Points", value: profile?.sp?.toLocaleString() || "100", icon: Zap, color: "text-badge-gold" },
    { label: "ELO Rating", value: profile?.elo?.toLocaleString() || "1,000", icon: TrendingUp, color: "text-skill-green" },
    { label: "Gigs Completed", value: (profile?.total_gigs_completed || gigCount).toString(), icon: Trophy, color: "text-court-blue" },
    { label: "Current Streak", value: `${profile?.streak_days || 0}d`, icon: Calendar, color: "text-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-1 via-card to-surface-2 p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tier.bg} border border-border font-mono text-2xl font-bold ${tier.color}`}>
            {profile?.avatar_emoji || profile?.display_name?.[0] || "?"}
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-black text-foreground">{profile?.display_name || profile?.full_name || "Swapper"}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={`${tier.bg} ${tier.color} border-none`}>{tier.label}</Badge>
              <span className="text-xs text-muted-foreground">ELO {profile?.elo || 1000}</span>
              {profile?.university && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap size={12} /> {profile.university}
                </span>
              )}
            </div>
          </div>
          <Link to={`/profile/${profile?.user_id}`} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View Profile
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border bg-card p-5 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
            <p className={`font-heading text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Gigs + Court Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Gigs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Active Gigs</h3>
            <span className="text-xs text-muted-foreground">{activeGigs.length} active</span>
          </div>
          <div className="space-y-3">
            {activeGigs.length > 0 ? activeGigs.map((gig) => (
              <Link key={gig.id} to={`/workspace/${gig.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 p-3 hover:border-foreground/20 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{gig.title}</p>
                  <p className="text-xs text-muted-foreground">{gig.format}</p>
                </div>
                <div className="text-right">
                  <Badge className={`text-[10px] ${statusColor(gig.status)}`}>{gig.status}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{gig.points} SP</p>
                </div>
              </Link>
            )) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No active gigs. <Link to="/dashboard?tab=create-gig" className="text-foreground hover:underline">Create one!</Link></p>
              </div>
            )}
          </div>
        </div>

        {/* Court Alerts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Scale size={16} className="text-court-blue" /> Skill Court
            </h3>
            {myDisputes.length > 0 && (
              <Badge className="bg-alert-red/10 text-alert-red border-none">{myDisputes.length} pending</Badge>
            )}
          </div>
          <div className="space-y-3">
            {myDisputes.length > 0 ? myDisputes.map((d) => (
              <div key={d.id} className="rounded-lg border border-alert-red/20 bg-alert-red/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-alert-red">Dispute</span>
                  <span className="text-xs text-muted-foreground">{d.sp_amount} SP</span>
                </div>
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="text-xs text-muted-foreground">Status: {d.status}</p>
              </div>
            )) : (
              <div className="py-6 text-center">
                <Shield size={24} className="mx-auto mb-2 text-skill-green/50" />
                <p className="text-sm text-muted-foreground">No disputes — all clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-surface-1 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                <item.icon size={14} className={item.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.action}</p>
                <p className="text-[10px] text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MY GIGS TAB — with proposal management
═══════════════════════════════════════════════════════════════════════════ */

const MyGigsTab = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [realGigs, setRealGigs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [gigsRes, proposalsRes] = await Promise.all([
        supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("proposals").select("*, listings(title, format, points)").eq("receiver_id", user.id).eq("status", "pending").order("created_at", { ascending: false }),
      ]);
      setRealGigs((gigsRes.data || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        status: l.status === "active" ? "active" : l.status === "completed" ? "completed" : "pending",
        partner: null,
        stage: 0,
        totalStages: 3,
        sp: l.points || 0,
        format: l.format || "Direct Swap",
        deadline: null,
      })));
      // Enrich proposals with sender profile
      const props = proposalsRes.data || [];
      if (props.length > 0) {
        const senderIds = [...new Set(props.map((p: any) => p.sender_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_emoji, elo").in("user_id", senderIds);
        const profileMap: Record<string, any> = {};
        profiles?.forEach((p: any) => { profileMap[p.user_id] = p; });
        setProposals(props.map((p: any) => ({ ...p, senderProfile: profileMap[p.sender_id] || null })));
      } else {
        setProposals([]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAcceptProposal = async (proposal: any) => {
    if (!user) return;
    setAcceptingId(proposal.id);
    try {
      const workspaceId = crypto.randomUUID();
      const listing = proposal.listings;
      const totalSp = proposal.offered_sp || listing?.points || 100;

      // 1. Create workspace
      await supabase.from("workspaces").insert({
        id: workspaceId,
        title: listing?.title || "Workspace",
        workspace_type: (listing?.format || "Direct Swap").toLowerCase().replace(/\s+/g, "_"),
        listing_id: proposal.listing_id,
        created_by: user.id,
      });

      // 2. Create escrow
      await supabase.from("escrow_contracts").insert({
        workspace_id: workspaceId,
        buyer_id: proposal.sender_id,
        seller_id: user.id,
        total_sp: totalSp,
        status: "active",
      });

      // 3. Create stages — use AI-suggested stages from proposal if available
      const proposalStages = proposal.stage_config;
      let stages: any[];
      if (Array.isArray(proposalStages) && proposalStages.length > 0) {
        stages = proposalStages.map((s: any, i: number) => ({
          workspace_id: workspaceId,
          name: s.name || `Stage ${i + 1}`,
          order_index: i,
          sp_allocated: s.sp || Math.round(totalSp / proposalStages.length),
          status: i === 0 ? "active" : "locked",
        }));
      } else {
        stages = [
          { workspace_id: workspaceId, name: "Requirements", order_index: 0, sp_allocated: Math.round(totalSp * 0.2), status: "active" },
          { workspace_id: workspaceId, name: "Work", order_index: 1, sp_allocated: Math.round(totalSp * 0.5), status: "locked" },
          { workspace_id: workspaceId, name: "Delivery", order_index: 2, sp_allocated: Math.round(totalSp * 0.3), status: "locked" },
        ];
      }
      await supabase.from("workspace_stages").insert(stages);

      // 4. Add both users as members with correct roles
      await supabase.from("workspace_members").insert([
        { workspace_id: workspaceId, user_id: user.id, role: "owner", status: "active" },
        { workspace_id: workspaceId, user_id: proposal.sender_id, role: "client", status: "active" },
      ]);

      // 5. Update proposal
      await supabase.from("proposals").update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        workspace_id: workspaceId,
      }).eq("id", proposal.id);

      // 6. Notify proposer
      await supabase.from("notifications").insert({
        user_id: proposal.sender_id,
        title: "Proposal Accepted! 🎉",
        message: `Your proposal for "${listing?.title}" was accepted. Workspace is ready!`,
        type: "proposal",
        link: `/workspace/${workspaceId}`,
      });

      toast.success("Proposal accepted! Workspace created.");
      navigate(`/workspace/${workspaceId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept proposal");
    }
    setAcceptingId(null);
  };

  const handleDeclineProposal = async (proposalId: string) => {
    await supabase.from("proposals").update({ status: "rejected", rejected_at: new Date().toISOString() }).eq("id", proposalId);
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    toast.success("Proposal declined");
  };

  const filteredGigs = filter === "all" ? realGigs : realGigs.filter(g => g.status === filter);

  return (
    <div className="space-y-6">
      {/* Incoming Proposals */}
      {proposals.length > 0 && (
        <div className="rounded-2xl border border-badge-gold/20 bg-badge-gold/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Send size={16} className="text-badge-gold" />
            <h3 className="font-heading text-lg font-bold text-foreground">Incoming Proposals</h3>
            <Badge className="bg-badge-gold/10 text-badge-gold border-none ml-auto">{proposals.length} pending</Badge>
          </div>
          <div className="space-y-3">
            {proposals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 font-mono text-sm font-bold text-foreground">
                      {p.senderProfile?.avatar_emoji || p.senderProfile?.display_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.senderProfile?.display_name || "User"}</p>
                      <p className="text-[10px] text-muted-foreground">ELO {p.senderProfile?.elo || "N/A"} · for "{p.listings?.title || "Gig"}"</p>
                    </div>
                  </div>
                  {p.offered_sp > 0 && (
                    <span className="rounded-full bg-skill-green/10 border border-skill-green/20 px-2.5 py-1 text-xs font-mono text-skill-green">
                      +{p.offered_sp} SP
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{p.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptProposal(p)}
                    disabled={acceptingId === p.id}
                    className="flex-1 rounded-xl bg-skill-green py-2.5 text-sm font-semibold text-background flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> {acceptingId === p.id ? "Creating Workspace..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleDeclineProposal(p.id)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">My Gigs</h2>
        <div className="flex gap-2">
          {["all", "active", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground hover:text-foreground'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredGigs.map((gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-foreground/20 transition-colors"
              onClick={() => navigate(`/workspace/${gig.id}`)}
            >
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <Badge className={`text-[10px] ${statusColor(gig.status)}`}>{gig.status}</Badge>
                <span className="text-xs text-muted-foreground">{gig.format}</span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-foreground mb-1">{gig.title}</h3>
                {gig.partner ? (
                  <p className="text-xs text-muted-foreground mb-3">with {gig.partner}</p>
                ) : (
                  <p className="text-xs text-badge-gold mb-3">Awaiting match...</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-skill-green">
                    <Coins size={12} /> {gig.sp} SP
                  </span>
                  {gig.deadline && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} /> {new Date(gig.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredGigs.length === 0 && (
        <div className="py-16 text-center">
          <Briefcase size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-foreground font-medium">No gigs found</p>
          <p className="text-sm text-muted-foreground">Try a different filter or create a new gig</p>
        </div>
      )}
    </div>
  );
};

/* CreateGigTab moved to ./CreateGigTab.tsx */

/* SkillCourtTab moved to ./SkillCourtTab.tsx */

/* ═══════════════════════════════════════════════════════════════════════════
   GUILDS TAB
═══════════════════════════════════════════════════════════════════════════ */

const GuildsTab = () => {
  const { user } = useAuth();
  const [myGuilds, setMyGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("guild_members")
        .select("role, guilds(id, name, rank, avatar_url)")
        .eq("user_id", user.id);
      if (data?.length) {
        setMyGuilds(data.map((g: any) => ({
          id: g.guilds?.id || "", name: g.guilds?.name || "Guild",
          members: 0, rank: g.guilds?.rank || 0, role: g.role, icon: "⚔️",
        })));
      } else {
        setMyGuilds([]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">My Guilds</h2>
        <button className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background">
          <Plus size={14} /> Create Guild
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myGuilds.map((guild) => (
          <Link key={guild.id} to={`/guild/${guild.id}`} className="group">
            <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-2xl">
                  {guild.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-skill-green transition-colors">{guild.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">{guild.role}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={10} /> {guild.members} members</span>
                <span className="flex items-center gap-1"><Trophy size={10} /> Rank #{guild.rank}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface-1/50 p-8 text-center">
        <Users size={32} className="mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-foreground font-medium mb-1">Discover New Guilds</p>
        <p className="text-sm text-muted-foreground mb-4">Join communities of like-minded swappers</p>
        <Link to="/discover?tab=guilds" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Browse Guilds <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   WALLET TAB
═══════════════════════════════════════════════════════════════════════════ */

const WalletTab = ({ profile }: { profile: any }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("sp_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setTransactions((data || []).map((t: any) => ({
        id: t.id,
        type: t.amount > 0 ? "earned" : t.type === "tax" ? "tax" : "spent",
        desc: t.description || t.type,
        amount: t.amount,
        date: new Date(t.created_at).toLocaleDateString(),
      })));
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl border border-badge-gold/20 bg-gradient-to-br from-badge-gold/10 via-card to-surface-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="font-heading text-4xl font-black text-badge-gold">{profile?.sp?.toLocaleString() || 100} SP</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-badge-gold/10">
            <Coins size={28} className="text-badge-gold" />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 rounded-xl bg-foreground py-3 text-sm font-semibold text-background">
            Earn More SP
          </button>
          <button className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Transfer
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">Transaction History</h3>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 rounded-lg bg-surface-1 p-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tx.amount > 0 ? 'bg-skill-green/10' : 'bg-alert-red/10'}`}>
                {tx.amount > 0 ? <TrendingUp size={14} className="text-skill-green" /> : <TrendingUp size={14} className="text-alert-red rotate-180" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{tx.desc}</p>
                <p className="text-[10px] text-muted-foreground">{tx.date}</p>
              </div>
              <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-skill-green' : 'text-alert-red'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} SP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
═══════════════════════════════════════════════════════════════════════════ */

const SettingsTab = ({ profile, updateProfile }: { profile: any; updateProfile: (data: any) => Promise<{ success: boolean; error?: string }> }) => {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ display_name: displayName, bio });
    setSaving(false);
    if (result?.success) {
      const { toast } = await import("sonner");
      toast.success("Profile updated!");
    } else {
      const { toast } = await import("sonner");
      toast.error(result?.error || "Failed to save");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">Settings</h2>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-4 py-2.5 text-foreground focus:outline-none focus:border-foreground/20"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-1 px-4 py-2.5 text-foreground focus:outline-none focus:border-foreground/20 resize-none"
            />
          </div>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground mb-4">Notifications</h3>
        <div className="space-y-3">
          {["Email notifications", "Push notifications", "Gig updates", "Court duty reminders"].map((item) => (
            <label key={item} className="flex items-center justify-between rounded-lg bg-surface-1 p-3">
              <span className="text-sm text-foreground">{item}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-5">
        <h3 className="font-medium text-alert-red mb-2">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <button className="rounded-lg border border-alert-red/30 px-4 py-2 text-sm font-medium text-alert-red hover:bg-alert-red/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS TAB (Mini Dashboard)
═══════════════════════════════════════════════════════════════════════════ */

const DashboardAnalyticsTab = ({ profile }: { profile: any }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ gigs: 0, earned: 0, spent: 0, disputes: 0 });
  const [recentGigs, setRecentGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [gigRes, txRes, disputeRes] = await Promise.all([
        supabase.from("listings").select("id, title, points, views, rating, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("sp_transactions").select("amount, type").eq("user_id", user.id),
        supabase.from("disputes").select("id").or(`filed_by.eq.${user.id},filed_against.eq.${user.id}`),
      ]);
      const gigs = gigRes.data || [];
      const txs = txRes.data || [];
      const earned = txs.filter((t: any) => t.amount > 0).reduce((a: number, t: any) => a + t.amount, 0);
      const spent = txs.filter((t: any) => t.amount < 0).reduce((a: number, t: any) => a + Math.abs(t.amount), 0);
      setStats({ gigs: gigs.length, earned, spent, disputes: (disputeRes.data || []).length });
      setRecentGigs(gigs.slice(0, 5));
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="py-16 text-center"><div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-foreground">My Analytics</h2>
        <Link to="/analytics" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Full Analytics <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Gigs", value: stats.gigs, icon: Briefcase, color: "text-court-blue" },
          { label: "SP Earned", value: stats.earned, icon: TrendingUp, color: "text-skill-green" },
          { label: "SP Spent", value: stats.spent, icon: Coins, color: "text-badge-gold" },
          { label: "Disputes", value: stats.disputes, icon: Scale, color: "text-foreground" },
        ].map((stat, i) => (
          <motion.div key={i} className="rounded-xl border border-border bg-card p-5 text-center" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <stat.icon size={18} className={`mx-auto mb-2 ${stat.color}`} />
            <p className={`font-heading text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">SP Balance</h3>
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="font-heading text-3xl font-black text-badge-gold">{(profile?.sp || 100).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="font-heading text-xl font-bold text-skill-green">+{stats.earned}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-alert-red">-{stats.spent}</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">Gig Performance</h3>
        {recentGigs.length > 0 ? (
          <div className="space-y-2">
            {recentGigs.map((gig) => (
              <div key={gig.id} className="flex items-center justify-between rounded-lg bg-surface-1 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{gig.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Eye size={10} /> {gig.views || 0}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Star size={10} /> {gig.rating || 0}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Coins size={10} /> {gig.points} SP</span>
                  </div>
                </div>
                <Badge className={`text-[10px] ${gig.status === "active" ? "bg-skill-green/10 text-skill-green border-skill-green/20" : "bg-surface-2 text-muted-foreground border-border"}`}>
                  {gig.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">No gigs yet. Create your first gig to see analytics!</div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGES TAB
═══════════════════════════════════════════════════════════════════════════ */

const MessagesTab = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newConvoUserId, setNewConvoUserId] = useState("");
  const [showNewConvo, setShowNewConvo] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (data) {
        const otherIds = data.map(c => c.participant_one === user.id ? c.participant_two : c.participant_one);
        const uniqueIds = [...new Set(otherIds)];
        let profileMap: Record<string, any> = {};
        if (uniqueIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, full_name, avatar_emoji, elo")
            .in("user_id", uniqueIds);
          profiles?.forEach(p => { profileMap[p.user_id] = p; });
        }
        setConversations(data.map(c => ({
          ...c,
          otherUser: profileMap[c.participant_one === user.id ? c.participant_two : c.participant_one] || { display_name: "Unknown User", avatar_emoji: "?" },
        })));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!selectedConvo) return;
    const load = async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", selectedConvo.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      await supabase.from("direct_messages").update({ is_read: true }).eq("conversation_id", selectedConvo.id).neq("sender_id", user!.id);
    };
    load();
    const channel = supabase
      .channel(`dm-${selectedConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${selectedConvo.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConvo || !user) return;
    const content = newMessage.trim();
    setNewMessage("");
    await supabase.from("direct_messages").insert({ conversation_id: selectedConvo.id, sender_id: user.id, content });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString(), last_message_preview: content.slice(0, 100) }).eq("id", selectedConvo.id);
  };

  const startNewConversation = async () => {
    if (!newConvoUserId.trim() || !user) return;
    const { data: targetProfile } = await supabase.from("profiles").select("user_id, display_name").or(`user_id.eq.${newConvoUserId},display_name.ilike.%${newConvoUserId}%`).limit(1).single();
    if (!targetProfile) { toast.error("User not found"); return; }
    const { data: existing } = await supabase.from("conversations").select("*").or(`and(participant_one.eq.${user.id},participant_two.eq.${targetProfile.user_id}),and(participant_one.eq.${targetProfile.user_id},participant_two.eq.${user.id})`).limit(1);
    if (existing && existing.length > 0) { setSelectedConvo(existing[0]); setShowNewConvo(false); return; }
    const { data: newConvo } = await supabase.from("conversations").insert({ participant_one: user.id, participant_two: targetProfile.user_id }).select().single();
    if (newConvo) { setSelectedConvo(newConvo); setShowNewConvo(false); setNewConvoUserId(""); }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] rounded-2xl border border-border bg-card overflow-hidden">
      <div className={`w-80 border-r border-border flex flex-col shrink-0 ${selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg font-bold text-foreground">Messages</h3>
            <button onClick={() => setShowNewConvo(!showNewConvo)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
              <Plus size={16} />
            </button>
          </div>
          {showNewConvo && (
            <div className="flex gap-2 mb-3">
              <input value={newConvoUserId} onChange={(e) => setNewConvoUserId(e.target.value)} placeholder="User ID or display name" className="flex-1 px-3 py-1.5 bg-surface-1 border border-border rounded-lg text-sm" onKeyDown={(e) => e.key === "Enter" && startNewConversation()} />
              <button onClick={startNewConversation} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"><Send size={14} /></button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-3 py-2 bg-surface-1 border border-border rounded-lg text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center"><div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" /></div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center px-4">
              <MessageSquare size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start a conversation from a user's profile</p>
            </div>
          ) : conversations.map(convo => (
            <button key={convo.id} onClick={() => setSelectedConvo(convo)} className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-1 transition-colors ${selectedConvo?.id === convo.id ? 'bg-surface-1' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-sm font-bold shrink-0">{convo.otherUser?.avatar_emoji || "?"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{convo.otherUser?.display_name || "User"}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.last_message_preview || "Start chatting..."}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConvo ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button onClick={() => setSelectedConvo(null)} className="lg:hidden text-muted-foreground hover:text-foreground"><ChevronLeft size={20} /></button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-sm font-bold">{selectedConvo.otherUser?.avatar_emoji || "?"}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConvo.otherUser?.display_name || "User"}</p>
                <p className="text-[10px] text-muted-foreground">ELO {selectedConvo.otherUser?.elo || "N/A"}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="py-12 text-center">
                  <MessageSquare size={32} className="mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-surface-1 text-foreground rounded-bl-md'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-surface-1 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"><Send size={16} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">Choose a chat from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD SIDEBAR COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const DashboardSidebar = ({ activeTab, setActiveTab, profile }: { activeTab: string; setActiveTab: (tab: string) => void; profile: any }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const tier = eloTier(profile?.elo || 1000);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card">
        {/* Profile Summary */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tier.bg} font-mono text-sm font-bold ${tier.color}`}>
                {profile?.avatar_emoji || profile?.display_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || "Swapper"}</p>
                <p className="text-xs text-muted-foreground">{profile?.sp || 100} SP · {tier.label}</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Dashboard</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={activeTab === item.id ? "bg-foreground text-background" : ""}
                  >
                    <item.icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                    {/* Court badge removed - now uses real data inside the tab */}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════════════════════════════════════════ */

const DashboardPage = () => {
  const { user, profile, isAuthenticated, logout, updateProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab profile={profile} />;
      case "messages": return <MessagesTab />;
      case "my-gigs": return <MyGigsTab />;
      case "create-gig": return <CreateGigTab />;
      case "skill-court": return <SkillCourtTab />;
      case "guilds": return <GuildsTab />;
      case "wallet": return <WalletTab profile={profile} />;
      case "analytics": return <DashboardAnalyticsTab profile={profile} />;
      case "settings": return <SettingsTab profile={profile} updateProfile={updateProfile} />;
      default: return <OverviewTab profile={profile} />;
    }
  };

  return (
    <PageTransition>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="font-heading text-lg font-bold text-foreground capitalize">{activeTab.replace("-", " ")}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-alert-red text-[9px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-semibold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-foreground">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <button
                            key={n.id}
                            onClick={() => { markAsRead(n.id); if (n.link) navigate(n.link); }}
                            className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-1 transition-colors ${!n.is_read ? 'bg-surface-1/50' : ''}`}
                          >
                            <p className={`text-xs ${!n.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <Link to={`/profile/${user.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors">
                  <User size={18} />
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </PageTransition>
  );
};

export default DashboardPage;
