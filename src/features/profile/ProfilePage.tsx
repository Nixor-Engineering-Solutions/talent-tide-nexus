import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, GraduationCap, Clock, MessageSquare, Share2, Edit2,
  CheckCircle2, Globe, Github, Linkedin, Twitter, Camera, X, Save,
  Scale, Award, Zap, Users, Flame, Trophy, Shield, Target,
  Star, FileText, Activity, ChevronDown, ChevronUp, Plus, Trash2,
  Eye, EyeOff, GripVertical, Hash, BarChart3, ListChecks, Code,
  ExternalLink, Bookmark, Newspaper, MessageCircle, ArrowUpRight,
  Palette, Type, Image as ImageIcon, LinkIcon, Vote, Minus,
  Briefcase, Send, Heart
} from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import PageTransition from "@/components/shared/PageTransition";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type ProfileData = {
  user_id: string; full_name: string; display_name: string | null;
  bio: string | null; slogan: string | null; avatar_url: string | null;
  location: string | null; university: string | null; timezone: string | null;
  languages: string[] | null; skills: string[] | null;
  skill_levels: Record<string, any> | null; elo: number; sp: number;
  tier: string; total_gigs_completed: number | null; streak_days: number | null;
  availability: string | null; response_time: string | null;
  work_history: any[] | null; education_history: any[] | null;
  certificates: any[] | null; portfolio_items: any[] | null;
  github_url: string | null; linkedin_url: string | null;
  twitter_url: string | null; personal_website: string | null;
  id_verified: boolean | null; profile_sections: ProfileSection[] | null;
  hero_color: string | null; banner_url: string | null;
  referral_code: string | null;
};

type ProfileSection = {
  id: string; type: string; title: string; content_markdown: string;
  order: number; visible: boolean; widget_config?: any; accent_color?: string;
};

/* ─── Constants ─── */
const PREMADE_SECTIONS = [
  { type: "faq", title: "FAQ", icon: ListChecks },
  { type: "services", title: "Services", icon: Briefcase },
  { type: "testimonials", title: "Testimonials", icon: Star },
  { type: "contact", title: "Contact Info", icon: Send },
  { type: "needs", title: "What I'm Looking For", icon: Target },
  { type: "interests", title: "Interests & Hobbies", icon: Heart },
  { type: "availability", title: "Availability & Rates", icon: Clock },
  { type: "languages", title: "Languages", icon: Globe },
  { type: "custom", title: "Custom Section", icon: Type },
];

const WIDGET_TYPES = [
  { type: "stats_bar", label: "Stats Bar", icon: BarChart3 },
  { type: "poll", label: "Poll", icon: Vote },
  { type: "dropdown", label: "Dropdown", icon: ChevronDown },
  { type: "embed", label: "Embed", icon: Code },
];

const getBadgeIcon = (category: string) => {
  const map: Record<string, any> = {
    general: Award, skill: Zap, social: Users, streak: Flame,
    competition: Trophy, quality: Shield, milestone: Target,
  };
  return map[category?.toLowerCase()] || Award;
};

const SKILL_LEVEL_MAP: Record<string, { label: string; width: string }> = {
  beginner: { label: "Beginner", width: "25%" },
  intermediate: { label: "Intermediate", width: "50%" },
  advanced: { label: "Advanced", width: "75%" },
  master: { label: "Master", width: "100%" },
};

const CORE_SECTIONS = ["about", "skills", "badges", "achievements", "experience", "education", "portfolio", "listings", "disputes", "activity", "blog-activity", "saved"];

/* ─── Markdown Preview (simple) ─── */
const MarkdownPreview = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="prose-sm max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-xs font-bold text-foreground mt-3 mb-1 font-heading">{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-sm font-bold text-foreground mt-4 mb-1 font-heading">{line.slice(3)}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} className="text-base font-bold text-foreground mt-4 mb-2 font-heading">{line.slice(2)}</h2>;
        if (line.startsWith("- ")) return <li key={i} className="text-xs text-muted-foreground ml-4 font-body list-disc">{line.slice(2)}</li>;
        if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-border pl-3 text-xs text-muted-foreground italic font-body my-1">{line.slice(2)}</blockquote>;
        if (line.startsWith("```")) return <div key={i} className="bg-surface-2 rounded px-2 py-1 font-mono text-[10px] text-foreground my-1">{line.slice(3)}</div>;
        if (line.trim() === "") return <br key={i} />;
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-surface-2 px-1 rounded font-mono text-[10px]">$1</code>');
        return <p key={i} className="text-xs text-muted-foreground font-body leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
};

/* ─── Section Editor ─── */
const SectionEditor = ({ section, onChange, onDelete, onMove, isFirst, isLast }: {
  section: ProfileSection; onChange: (s: ProfileSection) => void;
  onDelete: () => void; onMove: (dir: "up" | "down") => void;
  isFirst: boolean; isLast: boolean;
}) => {
  const [preview, setPreview] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-muted-foreground/40 cursor-grab" />
        <input value={section.title} onChange={e => onChange({ ...section, title: e.target.value })}
          className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none font-heading" />
        <div className="flex items-center gap-1">
          <button onClick={() => onMove("up")} disabled={isFirst} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp size={12} /></button>
          <button onClick={() => onMove("down")} disabled={isLast} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown size={12} /></button>
          <button onClick={() => onChange({ ...section, visible: !section.visible })} className="p-1 text-muted-foreground hover:text-foreground">
            {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button onClick={onDelete} className="p-1 text-alert-red/60 hover:text-alert-red"><Trash2 size={12} /></button>
        </div>
      </div>
      <div className="flex gap-1 mb-2">
        <button onClick={() => setPreview(false)} className={cn("text-[10px] px-2 py-0.5 rounded", !preview ? "bg-foreground text-background" : "text-muted-foreground")}>Edit</button>
        <button onClick={() => setPreview(true)} className={cn("text-[10px] px-2 py-0.5 rounded", preview ? "bg-foreground text-background" : "text-muted-foreground")}>Preview</button>
      </div>
      {preview ? (
        <MarkdownPreview content={section.content_markdown} />
      ) : (
        <textarea
          value={section.content_markdown}
          onChange={e => onChange({ ...section, content_markdown: e.target.value })}
          rows={6}
          className="w-full bg-surface-1 border border-border rounded-lg text-xs text-foreground font-mono p-3 resize-y focus:outline-none focus:border-foreground/30"
          placeholder="Write markdown content..."
        />
      )}
    </div>
  );
};

/* ─── Widget Renderer ─── */
const WidgetRenderer = ({ section }: { section: ProfileSection }) => {
  if (section.type === "stats_bar" && section.widget_config?.items) {
    return (
      <div className="flex flex-wrap gap-0">
        {section.widget_config.items.map((item: any, i: number) => (
          <div key={i} className={cn("flex-1 min-w-[80px]", i > 0 && "border-l border-border pl-4 ml-4")}>
            <p className="font-mono text-lg font-bold text-foreground leading-none">{item.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 font-body">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "poll" && section.widget_config?.options) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground font-body">{section.widget_config.question || "Poll"}</p>
        {section.widget_config.options.map((opt: string, i: number) => (
          <button key={i} className="w-full text-left rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all font-body">
            {opt}
          </button>
        ))}
      </div>
    );
  }
  if (section.type === "dropdown") {
    return <DropdownWidget section={section} />;
  }
  if (section.type === "embed" && section.widget_config?.url) {
    return (
      <div className="rounded-lg overflow-hidden border border-border aspect-video">
        <iframe src={section.widget_config.url} className="w-full h-full" title={section.title} />
      </div>
    );
  }
  return <MarkdownPreview content={section.content_markdown} />;
};

const DropdownWidget = ({ section }: { section: ProfileSection }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3 text-xs font-medium text-foreground font-body">
        {section.title}
        <ChevronDown size={12} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3">
              <MarkdownPreview content={section.content_markdown} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Profile Page ─── */
const ProfilePage = () => {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<{ name: string; icon: string; category: string; awarded_at: string }[]>([]);
  const [achievements, setAchievements] = useState<{ name: string; icon: string; category: string; description: string; progress: number; completed: boolean; threshold: number }[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<{ id: string; name: string; role: string }[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});
  const [customSections, setCustomSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("about");
  const [showAddSection, setShowAddSection] = useState(false);

  const targetUserId = userId === "me" || !userId ? user?.id : userId;

  useEffect(() => { setIsOwner(targetUserId === user?.id); }, [targetUserId, user]);

  useEffect(() => {
    if (!targetUserId) { setLoading(false); return; }
    loadProfile(targetUserId);
  }, [targetUserId]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    const allSections = [...CORE_SECTIONS, ...customSections.map(s => `custom-${s.id}`)];
    allSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [profileData, customSections]);

  const loadProfile = async (uid: string) => {
    setLoading(true);
    const [profileRes, badgesRes, achievementsRes, listingsRes, disputesRes, guildsRes, activityRes, blogRes, forumRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).single(),
      supabase.from("user_badges").select("badge_id, awarded_at, badges(name, icon, category)").eq("user_id", uid),
      supabase.from("user_achievements").select("progress, completed, achievements(name, icon, category, description, threshold)").eq("user_id", uid),
      supabase.from("listings").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("disputes").select("*").or(`filed_by.eq.${uid},filed_against.eq.${uid}`).order("created_at", { ascending: false }),
      supabase.from("guild_members").select("role, guilds(id, name)").eq("user_id", uid),
      supabase.from("activity_log").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_posts").select("id, title, slug, category, created_at, view_count, like_count").eq("author_id", uid).order("created_at", { ascending: false }).limit(5),
      supabase.from("forum_threads").select("id, title, created_at, upvotes, comment_count").eq("author_id", uid).order("created_at", { ascending: false }).limit(5),
    ]);

    if (profileRes.data) {
      setProfileData(profileRes.data as any);
      const sections = (profileRes.data as any).profile_sections;
      setCustomSections(Array.isArray(sections) ? sections : []);
    }
    if (badgesRes.data) setBadges(badgesRes.data.map((b: any) => ({
      name: b.badges?.name || "", icon: b.badges?.icon || "⭐",
      category: b.badges?.category || "general", awarded_at: b.awarded_at,
    })));
    if (achievementsRes.data) setAchievements(achievementsRes.data.map((a: any) => ({
      name: a.achievements?.name || "", icon: a.achievements?.icon || "🏆",
      category: a.achievements?.category || "general",
      description: a.achievements?.description || "", progress: a.progress,
      completed: a.completed, threshold: a.achievements?.threshold || 0,
    })));
    if (listingsRes.data) setListings(listingsRes.data);
    if (disputesRes.data) setDisputes(disputesRes.data);
    if (guildsRes.data) setGuilds(guildsRes.data.map((g: any) => ({
      id: (g.guilds as any)?.id || "", name: (g.guilds as any)?.name || "", role: g.role,
    })));
    if (activityRes.data) setActivityLog(activityRes.data);
    if (blogRes.data) setBlogPosts(blogRes.data);
    if (forumRes.data) setForumThreads(forumRes.data);
    setLoading(false);
  };

  const startEditing = () => {
    if (!profileData) return;
    setEditForm({
      full_name: profileData.full_name, display_name: profileData.display_name,
      bio: profileData.bio, slogan: profileData.slogan, location: profileData.location,
      university: profileData.university, availability: profileData.availability,
      response_time: profileData.response_time, github_url: profileData.github_url,
      linkedin_url: profileData.linkedin_url, twitter_url: profileData.twitter_url,
      personal_website: profileData.personal_website, hero_color: profileData.hero_color,
    });
    setIsEditing(true);
  };

  const saveEditing = async () => {
    const result = await updateProfile({ ...editForm, profile_sections: customSections } as any);
    if (result.success && targetUserId) {
      await loadProfile(targetUserId);
      setIsEditing(false);
    }
  };

  const addSection = (type: string, title: string) => {
    const newSection: ProfileSection = {
      id: crypto.randomUUID(), type, title, content_markdown: "",
      order: customSections.length, visible: true,
    };
    setCustomSections([...customSections, newSection]);
    setShowAddSection(false);
  };

  const updateSection = (id: string, updated: ProfileSection) => {
    setCustomSections(prev => prev.map(s => s.id === id ? updated : s));
  };

  const deleteSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (id: string, dir: "up" | "down") => {
    setCustomSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const newArr = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newArr.length) return prev;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr.map((s, i) => ({ ...s, order: i }));
    });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id);
  };

  if (loading) {
    return (
      <PageTransition><div className="min-h-screen bg-background"><AppNav />
        <div className="flex items-center justify-center pt-40">
          <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div></PageTransition>
    );
  }

  if (!profileData) {
    return (
      <PageTransition><div className="min-h-screen bg-background"><AppNav />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <p className="text-sm text-muted-foreground font-body">Profile not found.</p>
          <Link to="/" className="text-xs text-foreground hover:underline font-body">Go Home</Link>
        </div>
      </div></PageTransition>
    );
  }

  const p = profileData;
  const skills = p.skills || [];
  const skillLevels = (p.skill_levels || {}) as Record<string, string>;
  const workHistory = Array.isArray(p.work_history) ? p.work_history : [];
  const educationHistory = Array.isArray(p.education_history) ? p.education_history : [];
  const certificates = Array.isArray(p.certificates) ? p.certificates : [];
  const portfolioItems = Array.isArray(p.portfolio_items) ? p.portfolio_items : [];

  const allNavItems = [
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "badges", label: "Badges" },
    { id: "achievements", label: "Achievements" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "portfolio", label: "Portfolio" },
    { id: "listings", label: "Listings" },
    ...customSections.filter(s => s.visible).map(s => ({ id: `custom-${s.id}`, label: s.title })),
    { id: "blog-activity", label: "Blog & Forums" },
    { id: "disputes", label: "Disputes" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AppNav />

        {/* ═══ HEADER ═══ */}
        <section className="pt-24 pb-0 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="relative group">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name}
                      className="w-36 h-36 md:w-40 md:h-40 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border border-border" />
                  ) : (
                    <div className="w-36 h-36 md:w-40 md:h-40 rounded-2xl border border-border bg-card flex items-center justify-center">
                      <span className="font-heading text-5xl font-black text-muted-foreground/40">{p.full_name?.charAt(0) || "?"}</span>
                    </div>
                  )}
                  {p.id_verified && (
                    <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center border-2 border-background">
                      <CheckCircle2 size={13} />
                    </div>
                  )}
                </div>
                {isOwner && !isEditing && (
                  <button className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-body">
                    <Camera size={10} /> Change photo
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="space-y-3 max-w-lg">
                        <input value={editForm.full_name || ""} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full bg-transparent border-b border-border font-heading text-3xl font-black text-foreground focus:outline-none focus:border-foreground pb-1" placeholder="Full Name" />
                        <input value={editForm.display_name || ""} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })}
                          className="w-full bg-transparent border-b border-border text-sm text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="Headline" />
                        <input value={editForm.slogan || ""} onChange={e => setEditForm({ ...editForm, slogan: e.target.value })}
                          className="w-full bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="Slogan" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editForm.location || ""} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="Location" />
                          <input value={editForm.university || ""} onChange={e => setEditForm({ ...editForm, university: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="University" />
                        </div>
                        <textarea value={editForm.bio || ""} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={3}
                          className="w-full bg-surface-1 border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:border-foreground/30 p-3 resize-none" placeholder="Bio (supports markdown)" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editForm.github_url || ""} onChange={e => setEditForm({ ...editForm, github_url: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="GitHub URL" />
                          <input value={editForm.linkedin_url || ""} onChange={e => setEditForm({ ...editForm, linkedin_url: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="LinkedIn URL" />
                          <input value={editForm.twitter_url || ""} onChange={e => setEditForm({ ...editForm, twitter_url: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="Twitter URL" />
                          <input value={editForm.personal_website || ""} onChange={e => setEditForm({ ...editForm, personal_website: e.target.value })} className="bg-transparent border-b border-border text-xs text-muted-foreground focus:outline-none focus:border-foreground pb-1 font-body" placeholder="Website URL" />
                        </div>
                        {/* Hero color picker */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-body">Accent:</span>
                          {["#0A0A0A", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"].map(c => (
                            <button key={c} onClick={() => setEditForm({ ...editForm, hero_color: c })}
                              className={cn("w-5 h-5 rounded-full border-2 transition-all", editForm.hero_color === c ? "border-foreground scale-125" : "border-border")}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="font-heading text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-none">{p.full_name || "Unnamed"}</h1>
                        {p.slogan && <p className="text-base text-muted-foreground mt-2 font-body">{p.slogan}</p>}
                        {p.display_name && <p className="text-sm text-muted-foreground/60 font-body mt-0.5">{p.display_name}</p>}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground font-body">
                          {p.location && <span className="flex items-center gap-1.5"><MapPin size={11} /> {p.location}</span>}
                          {p.university && <span className="flex items-center gap-1.5"><GraduationCap size={11} /> {p.university}</span>}
                          {p.response_time && <span className="flex items-center gap-1.5"><Clock size={11} /> {p.response_time}</span>}
                          {p.availability === "Available" && (
                            <span className="flex items-center gap-1.5 text-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" /> Open to work
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 mt-4">
                          {[
                            { icon: Globe, href: p.personal_website },
                            { icon: Github, href: p.github_url },
                            { icon: Linkedin, href: p.linkedin_url },
                            { icon: Twitter, href: p.twitter_url },
                          ].filter(s => s.href).map((s, i) => (
                            <a key={i} href={s.href!} target="_blank" rel="noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                              <s.icon size={13} />
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner ? (
                      isEditing ? (
                        <div className="flex gap-2">
                          <button onClick={saveEditing} className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background font-body">
                            <Save size={12} /> Save
                          </button>
                          <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={startEditing} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-card transition-colors font-body">
                          <Edit2 size={12} /> Edit Profile
                        </button>
                      )
                    ) : (
                      <>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background font-body">
                          <MessageSquare size={12} /> Request Swap
                        </motion.button>
                        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
                          <Send size={12} /> Message
                        </button>
                      </>
                    )}
                    <button className="rounded-lg border border-border p-2.5 text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-0">
                  {[
                    { label: "ELO", value: p.elo },
                    { label: "SP", value: p.sp.toLocaleString() },
                    { label: "Gigs", value: p.total_gigs_completed || 0 },
                    { label: "Badges", value: badges.length },
                    { label: "Streak", value: `${p.streak_days || 0}d` },
                    { label: "Tier", value: p.tier },
                  ].map((s, i) => (
                    <div key={s.label} className={cn("flex-1 min-w-[80px]", i > 0 && "border-l border-border pl-4 ml-4")}>
                      <p className="font-mono text-xl md:text-2xl font-bold text-foreground leading-none">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-body">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3-COLUMN LAYOUT ═══ */}
        <section className="px-6 pt-10 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-8">

              {/* ─── LEFT SIDEBAR NAV ─── */}
              <aside className="hidden lg:block w-48 shrink-0">
                <div className="sticky top-24 space-y-0.5">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3 font-body">Sections</p>
                  {allNavItems.map(item => (
                    <button key={item.id} onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 rounded-md text-[11px] font-body transition-all",
                        activeNav === item.id
                          ? "text-foreground bg-surface-1 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-1/50"
                      )}>
                      {item.label}
                    </button>
                  ))}
                  {p.referral_code && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 font-body">Referral</p>
                      <p className="text-[10px] font-mono text-foreground bg-surface-1 rounded px-2 py-1 select-all">{p.referral_code}</p>
                    </div>
                  )}
                </div>
              </aside>

              {/* ─── MAIN CONTENT ─── */}
              <div className="flex-1 min-w-0 space-y-14">

                {/* ABOUT */}
                <section id="about">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-4">About</h2>
                  {p.bio ? <MarkdownPreview content={p.bio} /> : <p className="text-xs text-muted-foreground font-body">No bio yet.</p>}
                  {p.languages && p.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.languages.map(l => (
                        <span key={l} className="rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground font-body">{l}</span>
                      ))}
                    </div>
                  )}
                </section>

                {/* SKILLS */}
                <section id="skills">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Skills</h2>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => {
                        const rawLevel = skillLevels[skill];
                        const level = (typeof rawLevel === "string" ? rawLevel : String(rawLevel || "")).toLowerCase();
                        const levelInfo = SKILL_LEVEL_MAP[level];
                        return (
                          <div key={skill} className="group relative">
                            <div className="rounded-full border border-border px-4 py-2 text-xs text-foreground font-body hover:border-foreground/30 transition-colors">{skill}</div>
                            {levelInfo && (
                              <div className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-border overflow-hidden">
                                <div className="h-full bg-foreground rounded-full transition-all" style={{ width: levelInfo.width }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No skills added yet.</p>}
                </section>

                {/* BADGES */}
                <section id="badges">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Badges</h2>
                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((b, i) => {
                        const Icon = getBadgeIcon(b.category);
                        return (
                          <div key={i} className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:border-foreground/30 transition-all cursor-default" title={b.name}>
                            <Icon size={16} className="text-foreground" />
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="bg-foreground text-background text-[9px] font-mono px-2 py-1 rounded whitespace-nowrap">{b.name}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No badges earned yet.</p>}
                </section>

                {/* ACHIEVEMENTS */}
                <section id="achievements">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Achievements</h2>
                  {achievements.length > 0 ? (
                    <div className="divide-y divide-border">
                      {achievements.map((a, i) => {
                        const Icon = getBadgeIcon(a.category);
                        return (
                          <div key={i} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-start gap-3">
                              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", a.completed ? "border border-foreground/20" : "border border-border")}>
                                <Icon size={14} className={a.completed ? "text-foreground" : "text-muted-foreground/40"} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground font-body">{a.name}</p>
                                  {a.completed && <CheckCircle2 size={12} className="text-foreground shrink-0" />}
                                </div>
                                <p className="text-[11px] text-muted-foreground font-body mt-0.5">{a.description}</p>
                                {!a.completed && a.threshold > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-[2px] rounded-full bg-border overflow-hidden">
                                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${Math.min((a.progress / a.threshold) * 100, 100)}%` }} />
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground">{a.progress}/{a.threshold}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No achievements yet.</p>}
                </section>

                {/* EXPERIENCE */}
                <section id="experience">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Experience</h2>
                  {workHistory.length > 0 ? (
                    <div className="space-y-0">
                      {workHistory.map((job: any, i: number) => (
                        <div key={i} className="relative pl-6 pb-8 last:pb-0 border-l border-border">
                          <div className="absolute left-0 top-1.5 -translate-x-1/2 h-2 w-2 rounded-full bg-foreground" />
                          <h3 className="text-sm font-semibold text-foreground font-body leading-tight">{job.role || job.title}</h3>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">{job.company} · {job.period}</p>
                          {job.description && <p className="text-xs text-muted-foreground font-body mt-2 leading-relaxed max-w-xl">{job.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No work history added yet.</p>}
                </section>

                {/* EDUCATION */}
                <section id="education">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Education</h2>
                  {educationHistory.length > 0 ? (
                    <div className="space-y-0">
                      {educationHistory.map((edu: any, i: number) => (
                        <div key={i} className="relative pl-6 pb-6 last:pb-0 border-l border-border/60">
                          <div className="absolute left-0 top-1.5 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          <h3 className="text-sm font-semibold text-foreground font-body">{edu.school}</h3>
                          <p className="text-xs text-muted-foreground font-body">{edu.degree} · {edu.period}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No education history added yet.</p>}
                  {certificates.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 font-body">Certifications</h3>
                      <div className="divide-y divide-border">
                        {certificates.map((cert: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-3 first:pt-0">
                            <div>
                              <p className="text-sm font-medium text-foreground font-body">{cert.name}</p>
                              <p className="text-[10px] text-muted-foreground font-body">{cert.issuer} · {cert.date}</p>
                            </div>
                            {cert.verified && <CheckCircle2 size={13} className="text-foreground shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* PORTFOLIO */}
                <section id="portfolio">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Portfolio</h2>
                  {portfolioItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {portfolioItems.map((item: any, i: number) => (
                        <div key={i} className={cn("group relative overflow-hidden rounded-xl border border-border", i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square")}>
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                          ) : (
                            <div className="w-full h-full bg-card flex items-center justify-center"><FileText size={24} className="text-muted-foreground/30" /></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <p className="text-sm font-semibold text-background font-body">{item.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No portfolio items yet.</p>}
                </section>

                {/* LISTINGS */}
                <section id="listings">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Offered Listings</h2>
                  {listings.length > 0 ? (
                    <div className="divide-y divide-border">
                      {listings.map((listing: any) => (
                        <div key={listing.id} className="flex items-center gap-4 py-3.5 first:pt-0">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", listing.status === "Active" ? "bg-foreground" : "bg-border")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground font-body truncate">{listing.title}</p>
                            <p className="text-[10px] text-muted-foreground font-body">{listing.category} · {listing.views || 0} views</p>
                          </div>
                          <span className="font-mono text-xs text-foreground shrink-0">{listing.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No active listings.</p>}
                </section>

                {/* CUSTOM SECTIONS */}
                {customSections.filter(s => s.visible || isEditing).map((section, i) => (
                  <section key={section.id} id={`custom-${section.id}`}>
                    {isEditing ? (
                      <SectionEditor
                        section={section}
                        onChange={s => updateSection(section.id, s)}
                        onDelete={() => deleteSection(section.id)}
                        onMove={dir => moveSection(section.id, dir)}
                        isFirst={i === 0}
                        isLast={i === customSections.length - 1}
                      />
                    ) : (
                      <>
                        <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-4">{section.title}</h2>
                        <WidgetRenderer section={section} />
                      </>
                    )}
                  </section>
                ))}

                {/* Add Section Button (editing mode) */}
                {isEditing && (
                  <div className="relative">
                    <button onClick={() => setShowAddSection(!showAddSection)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all w-full justify-center font-body">
                      <Plus size={14} /> Add Section
                    </button>
                    <AnimatePresence>
                      {showAddSection && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-border bg-card p-3 z-10 shadow-lg">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-body">Premade Sections</p>
                          <div className="space-y-1">
                            {PREMADE_SECTIONS.map(ps => (
                              <button key={ps.type} onClick={() => addSection(ps.type, ps.title)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-all font-body">
                                <ps.icon size={13} /> {ps.title}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-border mt-2 pt-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-body">Widgets</p>
                            <div className="space-y-1">
                              {WIDGET_TYPES.map(w => (
                                <button key={w.type} onClick={() => addSection(w.type, w.label)}
                                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-all font-body">
                                  <w.icon size={13} /> {w.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* BLOG & FORUM ACTIVITY */}
                <section id="blog-activity">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Blog & Forum Activity</h2>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-body flex items-center gap-1.5">
                        <Newspaper size={10} /> Blog Posts
                      </h3>
                      {blogPosts.length > 0 ? (
                        <div className="divide-y divide-border">
                          {blogPosts.map((post: any) => (
                            <Link key={post.id} to={`/blog`} className="block py-2.5 first:pt-0 hover:opacity-80 transition-opacity">
                              <p className="text-xs font-medium text-foreground font-body truncate">{post.title}</p>
                              <p className="text-[10px] text-muted-foreground font-body">{post.category} · {post.view_count || 0} views · {post.like_count || 0} likes</p>
                            </Link>
                          ))}
                        </div>
                      ) : <p className="text-xs text-muted-foreground font-body">No blog posts.</p>}
                    </div>
                    <div>
                      <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-body flex items-center gap-1.5">
                        <MessageCircle size={10} /> Forum Threads
                      </h3>
                      {forumThreads.length > 0 ? (
                        <div className="divide-y divide-border">
                          {forumThreads.map((thread: any) => (
                            <Link key={thread.id} to={`/forums`} className="block py-2.5 first:pt-0 hover:opacity-80 transition-opacity">
                              <p className="text-xs font-medium text-foreground font-body truncate">{thread.title}</p>
                              <p className="text-[10px] text-muted-foreground font-body">{thread.upvotes || 0} upvotes · {thread.comment_count || 0} comments</p>
                            </Link>
                          ))}
                        </div>
                      ) : <p className="text-xs text-muted-foreground font-body">No forum threads.</p>}
                    </div>
                  </div>
                </section>

                {/* DISPUTES */}
                <section id="disputes">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Disputes</h2>
                  {disputes.length > 0 ? (
                    <div className="divide-y divide-border">
                      {disputes.map((d: any) => (
                        <div key={d.id} className="flex items-center gap-3 py-3.5 first:pt-0">
                          <Scale size={13} className="text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground font-body">{d.title}</p>
                            <p className="text-[10px] text-muted-foreground font-body">{new Date(d.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{d.sp_amount} SP</span>
                          <span className="text-[10px] text-muted-foreground font-body">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No disputes on record.</p>}
                </section>

                {/* ACTIVITY */}
                <section id="activity">
                  <h2 className="font-heading text-xs font-bold text-foreground uppercase tracking-widest mb-6">Recent Activity</h2>
                  {activityLog.length > 0 ? (
                    <div className="space-y-0">
                      {activityLog.map((entry: any) => (
                        <div key={entry.id} className="relative pl-6 pb-5 last:pb-0 border-l border-border/50">
                          <div className="absolute left-0 top-1 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          <p className="text-xs text-foreground font-body">{entry.action.replace(/_/g, " ")}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {new Date(entry.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground font-body">No recent activity.</p>}
                </section>
              </div>

              {/* ─── RIGHT SIDEBAR ─── */}
              <aside className="hidden xl:block w-56 shrink-0">
                <div className="sticky top-24 space-y-8">
                  {/* Guilds */}
                  {guilds.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-body">Guilds</p>
                      <div className="space-y-0 divide-y divide-border">
                        {guilds.map(g => (
                          <Link key={g.id} to={`/guild/${g.id}`} className="flex items-center justify-between py-2.5 first:pt-0 text-xs text-muted-foreground hover:text-foreground transition-colors font-body group">
                            <span className="truncate">{g.name}</span>
                            <span className="text-[10px] font-mono opacity-60 group-hover:opacity-100">{g.role}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badge Collection */}
                  {badges.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-body">Badge Collection</p>
                      <div className="flex flex-wrap gap-1.5">
                        {badges.slice(0, 12).map((b, i) => {
                          const Icon = getBadgeIcon(b.category);
                          return <div key={i} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border" title={b.name}><Icon size={12} className="text-foreground" /></div>;
                        })}
                        {badges.length > 12 && <div className="flex h-7 items-center px-2 rounded-lg border border-border"><span className="text-[9px] font-mono text-muted-foreground">+{badges.length - 12}</span></div>}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-body">Details</p>
                    <div className="space-y-2 text-xs font-body">
                      {p.timezone && <div className="flex justify-between"><span className="text-muted-foreground">Timezone</span><span className="text-foreground font-mono text-[10px]">{p.timezone}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Listings</span><span className="text-foreground font-mono text-[10px]">{listings.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Disputes</span><span className="text-foreground font-mono text-[10px]">{disputes.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Blog Posts</span><span className="text-foreground font-mono text-[10px]">{blogPosts.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Forum Threads</span><span className="text-foreground font-mono text-[10px]">{forumThreads.length}</span></div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
