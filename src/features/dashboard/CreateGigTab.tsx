import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Gavel, Layers, GitMerge, Timer, Crown, Trophy,
  Coins, Plus, X, ChevronLeft, ChevronRight, Send, Upload, Sparkles,
  Clock, Users, Zap, FileText, Image, Tag, Star, Shield, Target,
  AlertTriangle, Check, Trash2, GripVertical, HelpCircle, Repeat,
  Flame, Package, Eye, Award
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

const FORMATS = [
  { id: "direct_swap", label: "Direct Swap", desc: "Trade your skill for another skill 1:1", icon: ArrowRight, color: "text-skill-green" },
  { id: "auction", label: "Auction", desc: "Let people bid lower to win your gig", icon: Gavel, color: "text-badge-gold" },
  { id: "cocreation", label: "Co-Creation", desc: "Build something together as a team", icon: Layers, color: "text-court-blue" },
  { id: "skill_fusion", label: "Skill Fusion", desc: "Combine multiple skills for a complex project", icon: GitMerge, color: "text-purple-400" },
  { id: "sp_only", label: "SP Only", desc: "Offer services for Skill Points only", icon: Coins, color: "text-badge-gold" },
  { id: "projects", label: "Projects", desc: "Multi-role project with team positions", icon: Users, color: "text-court-blue" },
  { id: "flash_market", label: "Flash Market", desc: "Time-limited gig with SP multiplier", icon: Timer, color: "text-alert-red" },
  { id: "requests", label: "Requests", desc: "Post what you need and get offers", icon: FileText, color: "text-muted-foreground" },
  { id: "contest", label: "Contest", desc: "Get submissions and reward top entries", icon: Trophy, color: "text-badge-gold" },
];

const POPULAR_TAGS = [
  "Design", "Development", "Writing", "Video", "Marketing", "Music",
  "Photography", "Data", "AI/ML", "SEO", "Branding", "UI/UX",
  "Mobile", "Security", "DevOps", "Consulting", "Translation", "Tutoring",
  "Animation", "3D Modeling",
];

const STEP_LABELS = [
  "Format", "Basics", "Pricing", "Details", "Conditions", "Gallery", "Review"
];

const DRAFT_KEY = "skillswap-gig-draft";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */

interface TierData {
  name: string;
  description: string;
  price_sp: number;
  delivery_days: number;
  revisions: number;
  features: string[];
}

interface StageData {
  name: string;
  sp: number;
  duration_days: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface RoleItem {
  role_name: string;
  skill_required: string;
  filled: boolean;
}

interface GigFormData {
  format: string;
  title: string;
  tags: string[];
  customTag: string;
  offering: string;
  seeking: string;
  summary: string;
  is_subscription: boolean;
  subscription_interval: string;
  use_tiers: boolean;
  tiers: { basic: TierData; standard: TierData; premium: TierData };
  flat_sp: number;
  flat_delivery_days: number;
  flat_revisions: number;
  revision_cost_sp: number;
  // Auction
  starting_bid: number;
  min_decrement: number;
  reserve_price: number;
  auction_duration_hours: number;
  // Flash
  flash_duration_hours: number;
  flash_sp_multiplier: number;
  // Contest
  prize_1st: number;
  prize_2nd: number;
  prize_3rd: number;
  participation_sp: number;
  max_entries: number;
  entry_deadline: string;
  // Projects
  project_budget: number;
  project_deadline: string;
  roles_needed: RoleItem[];
  // Fusion
  fusion_skills: string[];
  complexity: string;
  estimated_duration: string;
  // Step 4
  description: string;
  stages: StageData[];
  faq: FAQItem[];
  requirements: string[];
  escrow_auto_release: boolean;
  escrow_hold_days: number;
  escrow_insurance: boolean;
  // Step 5
  time_bonus_pct: number;
  time_bonus_days: number;
  review_bonus_sp: number;
  streak_multiplier: boolean;
  nda_required: boolean;
  late_penalty_pct: number;
  cancellation_policy: string;
  // Step 6
  images: string[];
  video_url: string;
}

const defaultTier = (name: string): TierData => ({
  name, description: "", price_sp: 0, delivery_days: 7, revisions: 1, features: [""],
});

const DEFAULT_FORM: GigFormData = {
  format: "",
  title: "",
  tags: [],
  customTag: "",
  offering: "",
  seeking: "",
  summary: "",
  is_subscription: false,
  subscription_interval: "monthly",
  use_tiers: false,
  tiers: { basic: defaultTier("Basic"), standard: defaultTier("Standard"), premium: defaultTier("Premium") },
  flat_sp: 50,
  flat_delivery_days: 7,
  flat_revisions: 2,
  revision_cost_sp: 10,
  starting_bid: 100,
  min_decrement: 5,
  reserve_price: 50,
  auction_duration_hours: 48,
  flash_duration_hours: 24,
  flash_sp_multiplier: 2.5,
  prize_1st: 200,
  prize_2nd: 100,
  prize_3rd: 50,
  participation_sp: 5,
  max_entries: 50,
  entry_deadline: "",
  project_budget: 500,
  project_deadline: "",
  roles_needed: [{ role_name: "", skill_required: "", filled: false }],
  fusion_skills: [],
  complexity: "medium",
  estimated_duration: "1 week",
  description: "",
  stages: [{ name: "Requirements", sp: 20, duration_days: 2 }, { name: "Work", sp: 50, duration_days: 5 }, { name: "Delivery", sp: 30, duration_days: 2 }],
  faq: [],
  requirements: [],
  escrow_auto_release: false,
  escrow_hold_days: 3,
  escrow_insurance: true,
  time_bonus_pct: 0,
  time_bonus_days: 0,
  review_bonus_sp: 0,
  streak_multiplier: false,
  nda_required: false,
  late_penalty_pct: 0,
  cancellation_policy: "moderate",
  images: [],
  video_url: "",
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const CreateGigTab = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<{ id: string; title: string; format: string; updated_at: string }[]>([]);
  const [form, setForm] = useState<GigFormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...DEFAULT_FORM, ...JSON.parse(saved) } : DEFAULT_FORM;
    } catch { return DEFAULT_FORM; }
  });

  // Tag limit based on tier
  const maxTags = (profile?.tier === "Diamond" || (profile?.elo && profile.elo >= 1700)) ? 8
    : (profile?.tier === "Gold" || (profile?.elo && profile.elo >= 1500)) ? 5 : 3;

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 2000);
    return () => clearTimeout(timer);
  }, [form]);

  // Load DB drafts
  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("id, title, format, updated_at")
      .eq("user_id", user.id).eq("status", "draft")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setDrafts(data || []));
  }, [user]);

  const update = <K extends keyof GigFormData>(key: K, val: GigFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || form.tags.includes(t) || form.tags.length >= maxTags) return;
    if (t.length > 25) { toast.error("Tag max 25 characters"); return; }
    update("tags", [...form.tags, t]);
    update("customTag", "");
  };

  const removeTag = (tag: string) => update("tags", form.tags.filter(t => t !== tag));

  const addStage = () => update("stages", [...form.stages, { name: "", sp: 0, duration_days: 1 }]);
  const removeStage = (i: number) => update("stages", form.stages.filter((_, idx) => idx !== i));
  const updateStage = (i: number, key: keyof StageData, val: any) => {
    const s = [...form.stages];
    (s[i] as any)[key] = val;
    update("stages", s);
  };

  const addFAQ = () => update("faq", [...form.faq, { question: "", answer: "" }]);
  const removeFAQ = (i: number) => update("faq", form.faq.filter((_, idx) => idx !== i));
  const updateFAQ = (i: number, key: keyof FAQItem, val: string) => {
    const f = [...form.faq];
    f[i][key] = val;
    update("faq", f);
  };

  const addRequirement = () => update("requirements", [...form.requirements, ""]);
  const removeRequirement = (i: number) => update("requirements", form.requirements.filter((_, idx) => idx !== i));

  const addRole = () => update("roles_needed", [...form.roles_needed, { role_name: "", skill_required: "", filled: false }]);
  const removeRole = (i: number) => update("roles_needed", form.roles_needed.filter((_, idx) => idx !== i));

  const suggestStages = async () => {
    if (!form.title || !form.description) { toast.error("Add title & description first"); return; }
    try {
      const res = await supabase.functions.invoke("workspace-ai", {
        body: { action: "suggest_stages", title: form.title, description: form.description, format: form.format, total_sp: form.flat_sp }
      });
      if (res.data?.stages) {
        update("stages", res.data.stages.map((s: any) => ({ name: s.name, sp: s.sp || 0, duration_days: s.duration_days || 3 })));
        toast.success("AI suggested stages!");
      }
    } catch { toast.error("AI unavailable"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, 5 - form.images.length)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("gig-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("gig-images").getPublicUrl(path);
        uploaded.push(urlData.publicUrl);
      }
    }
    update("images", [...form.images, ...uploaded]);
    toast.success(`${uploaded.length} image(s) uploaded`);
  };

  const saveDraft = async () => {
    if (!user || !form.title) { toast.error("Add a title first"); return; }
    setSaving(true);
    const payload = buildPayload("draft");
    const { error } = await supabase.from("listings").insert(payload as any);
    setSaving(false);
    if (!error) {
      toast.success("Draft saved!");
      supabase.from("listings").select("id, title, format, updated_at")
        .eq("user_id", user.id).eq("status", "draft")
        .order("updated_at", { ascending: false })
        .then(({ data }) => setDrafts(data || []));
    } else toast.error("Failed to save draft");
  };

  const buildPayload = (status: string) => {
    const fmt = FORMATS.find(f => f.id === form.format);
    return {
      title: form.title,
      description: form.description,
      wants: form.seeking || null,
      category: form.tags[0] || "General",
      format: fmt?.label || "Direct Swap",
      points: form.use_tiers ? form.tiers.basic.price_sp : form.flat_sp,
      delivery_days: form.use_tiers ? form.tiers.basic.delivery_days : form.flat_delivery_days,
      user_id: user!.id,
      status,
      tags: form.tags,
      tiers: form.use_tiers ? form.tiers : null,
      images: form.images,
      gig_faq: form.faq.filter(f => f.question && f.answer),
      is_subscription: form.is_subscription,
      subscription_interval: form.is_subscription ? form.subscription_interval : null,
      revision_cost_sp: form.revision_cost_sp,
      max_revisions: form.use_tiers ? form.tiers.basic.revisions : form.flat_revisions,
      contest_config: form.format === "contest" ? {
        prize_1st: form.prize_1st, prize_2nd: form.prize_2nd, prize_3rd: form.prize_3rd,
        participation_sp: form.participation_sp, max_entries: form.max_entries,
        entry_deadline: form.entry_deadline,
      } : null,
      conditions: {
        time_bonus_pct: form.time_bonus_pct, time_bonus_days: form.time_bonus_days,
        review_bonus_sp: form.review_bonus_sp, streak_multiplier: form.streak_multiplier,
        nda_required: form.nda_required, late_penalty_pct: form.late_penalty_pct,
        cancellation_policy: form.cancellation_policy,
        escrow_auto_release: form.escrow_auto_release, escrow_hold_days: form.escrow_hold_days,
        escrow_insurance: form.escrow_insurance,
      },
      roles_needed: (form.format === "projects" || form.format === "cocreation") ? form.roles_needed.filter(r => r.role_name) : null,
      auction_config: form.format === "auction" ? {
        starting_bid: form.starting_bid, min_decrement: form.min_decrement,
        reserve_price: form.reserve_price, duration_hours: form.auction_duration_hours,
      } : null,
      flash_config: form.format === "flash_market" ? {
        duration_hours: form.flash_duration_hours, sp_multiplier: form.flash_sp_multiplier,
      } : null,
      fusion_skills: form.format === "skill_fusion" ? form.fusion_skills : [],
      requirements: form.requirements.filter(Boolean),
    };
  };

  const publish = async () => {
    if (!user) return;
    setSaving(true);
    const payload = buildPayload("active");
    const { error } = await supabase.from("listings").insert(payload as any);
    setSaving(false);
    if (!error) {
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Gig published! 🎉");
      navigate("/dashboard?tab=my-gigs");
    } else {
      toast.error("Failed to publish: " + error.message);
    }
  };

  const canAdvance = () => {
    switch (step) {
      case 1: return !!form.format;
      case 2: return !!form.title && form.tags.length > 0;
      case 3: return form.use_tiers ? form.tiers.basic.price_sp > 0 : form.flat_sp > 0;
      case 4: return form.description.length >= 50;
      default: return true;
    }
  };

  const formatLabel = FORMATS.find(f => f.id === form.format)?.label || "";
  const totalStageSP = form.stages.reduce((a, s) => a + s.sp, 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Drafts */}
      {drafts.length > 0 && step === 1 && !form.format && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText size={14} /> Saved Drafts
          </h4>
          <div className="space-y-2">
            {drafts.map(d => (
              <button key={d.id} className="w-full flex items-center justify-between rounded-lg bg-surface-1 p-3 hover:bg-surface-2 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-[10px] text-muted-foreground">{d.format} · {new Date(d.updated_at).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-muted-foreground">Step {step} of 7</span>
          <span className="text-xs text-muted-foreground">{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={(step / 7) * 100} className="h-1" />
        <div className="flex justify-between mt-2">
          {STEP_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => { if (i + 1 < step) setStep(i + 1); }}
              className={`text-[9px] transition-colors ${step === i + 1 ? 'text-foreground font-semibold' : step > i + 1 ? 'text-skill-green cursor-pointer' : 'text-muted-foreground/50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          
          {/* ═══ STEP 1: FORMAT ═══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="font-heading text-2xl font-black text-foreground">Choose your gig format</h2>
                <p className="text-sm text-muted-foreground mt-1">Each format creates a different type of marketplace listing</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => update("format", fmt.id)}
                    className={`group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all ${form.format === fmt.id ? 'border-foreground bg-foreground/5 ring-1 ring-foreground/10' : 'border-border hover:border-foreground/20'}`}
                  >
                    <fmt.icon size={22} className={`mb-3 ${form.format === fmt.id ? fmt.color : 'text-muted-foreground'}`} />
                    <p className={`text-sm font-bold ${form.format === fmt.id ? 'text-foreground' : 'text-foreground/80'}`}>{fmt.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{fmt.desc}</p>
                    {form.format === fmt.id && (
                      <div className="absolute top-3 right-3">
                        <Check size={16} className="text-skill-green" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: BASICS ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Gig basics</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell people what you're offering</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title <span className="text-alert-red">*</span></label>
                <input type="text" value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g., Professional Logo Design for Startups" maxLength={120}
                  className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.title.length}/120</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags <span className="text-alert-red">*</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{form.tags.length}/{maxTags} tags</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_TAGS.map(tag => (
                    <button key={tag} onClick={() => form.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs transition-all ${form.tags.includes(tag) ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground hover:text-foreground border border-border'}`}
                      disabled={!form.tags.includes(tag) && form.tags.length >= maxTags}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={form.customTag} onChange={e => update("customTag", e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(form.customTag); } }}
                    placeholder="Add custom tag..." maxLength={25}
                    className="flex-1 rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/20" />
                  <button onClick={() => addTag(form.customTag)} disabled={!form.customTag.trim() || form.tags.length >= maxTags}
                    className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-foreground disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.tags.map(tag => (
                      <Badge key={tag} className="bg-foreground/10 text-foreground border-none gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-alert-red"><X size={10} /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {!["sp_only", "contest", "requests"].includes(form.format) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">What you're offering</label>
                    <input type="text" value={form.offering} onChange={e => update("offering", e.target.value)} placeholder="e.g., Logo Design"
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">What you're seeking</label>
                    <input type="text" value={form.seeking} onChange={e => update("seeking", e.target.value)} placeholder="e.g., React Development"
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Professional summary</label>
                <input type="text" value={form.summary} onChange={e => update("summary", e.target.value)} placeholder="One-line tagline for your gig" maxLength={160}
                  className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
              </div>

              {["sp_only", "direct_swap"].includes(form.format) && (
                <div className="rounded-xl border border-border bg-surface-1 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Subscription gig?</p>
                    <p className="text-[10px] text-muted-foreground">Recurring service at a set interval</p>
                  </div>
                  <button onClick={() => update("is_subscription", !form.is_subscription)}
                    className={`w-12 h-6 rounded-full transition-colors ${form.is_subscription ? 'bg-skill-green' : 'bg-surface-2'} relative`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_subscription ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              )}
              {form.is_subscription && (
                <div className="flex gap-2">
                  {["weekly", "biweekly", "monthly"].map(int => (
                    <button key={int} onClick={() => update("subscription_interval", int)}
                      className={`rounded-lg px-4 py-2 text-xs capitalize ${form.subscription_interval === int ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground border border-border'}`}>
                      {int}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 3: PRICING / TIERS ═══ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Scope & Pricing</h2>
                <p className="text-sm text-muted-foreground mt-1">Set your pricing structure</p>
              </div>

              {/* Format-specific pricing */}
              {form.format === "auction" && (
                <div className="space-y-4 rounded-xl border border-badge-gold/20 bg-badge-gold/5 p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Gavel size={14} className="text-badge-gold" /> Auction Settings</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Starting Bid (SP)" type="number" value={form.starting_bid} onChange={v => update("starting_bid", +v)} />
                    <InputField label="Min Bid Decrement" type="number" value={form.min_decrement} onChange={v => update("min_decrement", +v)} />
                    <InputField label="Reserve Price (SP)" type="number" value={form.reserve_price} onChange={v => update("reserve_price", +v)} />
                    <InputField label="Duration (hours)" type="number" value={form.auction_duration_hours} onChange={v => update("auction_duration_hours", +v)} />
                  </div>
                </div>
              )}

              {form.format === "flash_market" && (
                <div className="space-y-4 rounded-xl border border-alert-red/20 bg-alert-red/5 p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Timer size={14} className="text-alert-red" /> Flash Market</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Duration before removal (hrs)" type="number" value={form.flash_duration_hours} onChange={v => update("flash_duration_hours", +v)} />
                    <InputField label="SP Multiplier" type="number" value={form.flash_sp_multiplier} onChange={v => update("flash_sp_multiplier", +v)} step="0.1" />
                  </div>
                </div>
              )}

              {form.format === "contest" && (
                <div className="space-y-4 rounded-xl border border-badge-gold/20 bg-badge-gold/5 p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Trophy size={14} className="text-badge-gold" /> Prize Pool</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <InputField label="🥇 1st Place SP" type="number" value={form.prize_1st} onChange={v => update("prize_1st", +v)} />
                    <InputField label="🥈 2nd Place SP" type="number" value={form.prize_2nd} onChange={v => update("prize_2nd", +v)} />
                    <InputField label="🥉 3rd Place SP" type="number" value={form.prize_3rd} onChange={v => update("prize_3rd", +v)} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <InputField label="Participation SP" type="number" value={form.participation_sp} onChange={v => update("participation_sp", +v)} />
                    <InputField label="Max entries" type="number" value={form.max_entries} onChange={v => update("max_entries", +v)} />
                    <InputField label="Entry deadline" type="date" value={form.entry_deadline} onChange={v => update("entry_deadline", v)} />
                  </div>
                </div>
              )}

              {(form.format === "projects" || form.format === "cocreation") && (
                <div className="space-y-4 rounded-xl border border-court-blue/20 bg-court-blue/5 p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Users size={14} className="text-court-blue" /> Team & Budget</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Total SP Budget" type="number" value={form.project_budget} onChange={v => update("project_budget", +v)} />
                    <InputField label="Deadline" type="date" value={form.project_deadline} onChange={v => update("project_deadline", v)} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Roles Needed</label>
                      <button onClick={addRole} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Plus size={12} /> Add Role</button>
                    </div>
                    {form.roles_needed.map((role, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={role.role_name} onChange={e => { const r = [...form.roles_needed]; r[i].role_name = e.target.value; update("roles_needed", r); }}
                          placeholder="Role name" className="flex-1 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none" />
                        <input type="text" value={role.skill_required} onChange={e => { const r = [...form.roles_needed]; r[i].skill_required = e.target.value; update("roles_needed", r); }}
                          placeholder="Skill required" className="flex-1 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none" />
                        <button onClick={() => removeRole(i)} className="text-muted-foreground hover:text-alert-red"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.format === "skill_fusion" && (
                <div className="space-y-4 rounded-xl border border-purple-400/20 bg-purple-400/5 p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><GitMerge size={14} className="text-purple-400" /> Skill Fusion</h4>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Required Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {POPULAR_TAGS.slice(0, 12).map(s => (
                        <button key={s} onClick={() => form.fusion_skills.includes(s) ? update("fusion_skills", form.fusion_skills.filter(x => x !== s)) : update("fusion_skills", [...form.fusion_skills, s])}
                          className={`rounded-full px-3 py-1 text-xs ${form.fusion_skills.includes(s) ? 'bg-purple-400 text-white' : 'bg-surface-1 text-muted-foreground border border-border'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Complexity</label>
                      <div className="flex gap-2">
                        {["easy", "medium", "hard", "expert"].map(c => (
                          <button key={c} onClick={() => update("complexity", c)}
                            className={`rounded-lg px-3 py-1.5 text-xs capitalize ${form.complexity === c ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground border border-border'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <InputField label="Estimated Duration" type="text" value={form.estimated_duration} onChange={v => update("estimated_duration", v)} />
                  </div>
                </div>
              )}

              {/* Tiers toggle - for applicable formats */}
              {!["auction", "contest", "flash_market", "requests"].includes(form.format) && (
                <>
                  <div className="rounded-xl border border-border bg-surface-1 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2"><Package size={14} /> Offer packages?</p>
                      <p className="text-[10px] text-muted-foreground">Create Basic, Standard, and Premium tiers</p>
                    </div>
                    <button onClick={() => update("use_tiers", !form.use_tiers)}
                      className={`w-12 h-6 rounded-full transition-colors ${form.use_tiers ? 'bg-skill-green' : 'bg-surface-2'} relative`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.use_tiers ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {form.use_tiers ? (
                    <div className="grid sm:grid-cols-3 gap-4">
                      {(["basic", "standard", "premium"] as const).map(tier => (
                        <div key={tier} className={`rounded-xl border p-4 space-y-3 ${tier === "premium" ? 'border-badge-gold/30 bg-badge-gold/5' : 'border-border bg-card'}`}>
                          <div className="flex items-center justify-between">
                            <input type="text" value={form.tiers[tier].name} onChange={e => { const t = { ...form.tiers }; t[tier].name = e.target.value; update("tiers", t); }}
                              className="font-bold text-sm text-foreground bg-transparent border-none outline-none w-full" />
                            {tier === "premium" && <Crown size={14} className="text-badge-gold shrink-0" />}
                          </div>
                          <textarea value={form.tiers[tier].description} onChange={e => { const t = { ...form.tiers }; t[tier].description = e.target.value; update("tiers", t); }}
                            placeholder="What's included..." rows={2}
                            className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs text-foreground resize-none focus:outline-none" />
                          <InputField label="SP Price" type="number" value={form.tiers[tier].price_sp} onChange={v => { const t = { ...form.tiers }; t[tier].price_sp = +v; update("tiers", t); }} />
                          <InputField label="Delivery (days)" type="number" value={form.tiers[tier].delivery_days} onChange={v => { const t = { ...form.tiers }; t[tier].delivery_days = +v; update("tiers", t); }} />
                          <InputField label="Revisions" type="number" value={form.tiers[tier].revisions} onChange={v => { const t = { ...form.tiers }; t[tier].revisions = +v; update("tiers", t); }} />
                          <div>
                            <label className="text-[10px] text-muted-foreground">Features</label>
                            {form.tiers[tier].features.map((feat, fi) => (
                              <div key={fi} className="flex gap-1 mt-1">
                                <input type="text" value={feat} onChange={e => { const t = { ...form.tiers }; t[tier].features[fi] = e.target.value; update("tiers", t); }}
                                  placeholder="Feature..." className="flex-1 rounded-md border border-border bg-surface-1 px-2 py-1 text-xs text-foreground focus:outline-none" />
                                <button onClick={() => { const t = { ...form.tiers }; t[tier].features = t[tier].features.filter((_, i) => i !== fi); update("tiers", t); }} className="text-muted-foreground hover:text-alert-red"><X size={10} /></button>
                              </div>
                            ))}
                            <button onClick={() => { const t = { ...form.tiers }; t[tier].features.push(""); update("tiers", t); }}
                              className="text-[10px] text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"><Plus size={10} /> Feature</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <InputField label="SP Price" type="number" value={form.flat_sp} onChange={v => update("flat_sp", +v)} icon={<Coins size={14} />} />
                      <InputField label="Delivery (days)" type="number" value={form.flat_delivery_days} onChange={v => update("flat_delivery_days", +v)} icon={<Clock size={14} />} />
                      <InputField label="Revisions included" type="number" value={form.flat_revisions} onChange={v => update("flat_revisions", +v)} />
                    </div>
                  )}

                  <InputField label="Extra revision cost (SP)" type="number" value={form.revision_cost_sp} onChange={v => update("revision_cost_sp", +v)} />
                </>
              )}
            </div>
          )}

          {/* ═══ STEP 4: DESCRIPTION, FAQ, REQUIREMENTS ═══ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Details & Requirements</h2>
                <p className="text-sm text-muted-foreground mt-1">Help buyers understand exactly what you offer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description <span className="text-alert-red">*</span></label>
                <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe what you'll deliver, your process, qualifications, and what makes your service unique..."
                  rows={8} className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20 resize-none" />
                <p className={`text-[10px] mt-1 ${form.description.length >= 50 ? 'text-skill-green' : 'text-alert-red'}`}>{form.description.length}/2000 (min 50)</p>
              </div>

              {/* Stages */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-foreground">Milestones / Stages</h4>
                  <div className="flex gap-2">
                    <button onClick={suggestStages} className="flex items-center gap-1 rounded-lg bg-purple-400/10 px-3 py-1.5 text-[10px] text-purple-400 hover:bg-purple-400/20 transition-colors">
                      <Sparkles size={12} /> AI Suggest
                    </button>
                    <button onClick={addStage} className="flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
                      <Plus size={12} /> Stage
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {form.stages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-1 p-3">
                      <GripVertical size={12} className="text-muted-foreground/30" />
                      <input type="text" value={stage.name} onChange={e => updateStage(i, "name", e.target.value)} placeholder="Stage name"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none" />
                      <div className="flex items-center gap-1">
                        <input type="number" value={stage.sp} onChange={e => updateStage(i, "sp", +e.target.value)} className="w-16 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground text-center" />
                        <span className="text-[10px] text-muted-foreground">SP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" value={stage.duration_days} onChange={e => updateStage(i, "duration_days", +e.target.value)} className="w-12 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground text-center" />
                        <span className="text-[10px] text-muted-foreground">d</span>
                      </div>
                      <button onClick={() => removeStage(i)} className="text-muted-foreground hover:text-alert-red"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 px-2">
                  <span className="text-[10px] text-muted-foreground">Total: {totalStageSP} SP across {form.stages.length} stages</span>
                  {totalStageSP !== form.flat_sp && !form.use_tiers && (
                    <span className="text-[10px] text-badge-gold">⚠ Doesn't match flat price ({form.flat_sp} SP)</span>
                  )}
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><HelpCircle size={14} /> FAQ</h4>
                  <button onClick={addFAQ} disabled={form.faq.length >= 10} className="flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <Plus size={12} /> Add Q&A
                  </button>
                </div>
                {form.faq.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Add questions buyers frequently ask</p>}
                {form.faq.map((item, i) => (
                  <div key={i} className="space-y-2 mb-4 rounded-lg bg-surface-1 p-3">
                    <div className="flex gap-2">
                      <input type="text" value={item.question} onChange={e => updateFAQ(i, "question", e.target.value)} placeholder="Question"
                        className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none" />
                      <button onClick={() => removeFAQ(i)} className="text-muted-foreground hover:text-alert-red"><X size={12} /></button>
                    </div>
                    <textarea value={item.answer} onChange={e => updateFAQ(i, "answer", e.target.value)} placeholder="Answer" rows={2}
                      className="w-full bg-transparent text-xs text-muted-foreground outline-none resize-none" />
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Buyer Requirements</h4>
                    <p className="text-[10px] text-muted-foreground">Questions for the buyer before the order starts</p>
                  </div>
                  <button onClick={addRequirement} className="flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={req} onChange={e => { const r = [...form.requirements]; r[i] = e.target.value; update("requirements", r); }}
                      placeholder="e.g., What's your brand name?" className="flex-1 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none" />
                    <button onClick={() => removeRequirement(i)} className="text-muted-foreground hover:text-alert-red"><X size={12} /></button>
                  </div>
                ))}
              </div>

              {/* Escrow */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield size={14} /> Escrow Terms</h4>
                <ToggleRow label="Auto-release on completion" desc="SP released automatically when all stages complete" checked={form.escrow_auto_release} onChange={v => update("escrow_auto_release", v)} />
                <ToggleRow label="Insurance coverage" desc="Protect both parties with platform insurance" checked={form.escrow_insurance} onChange={v => update("escrow_insurance", v)} />
                <InputField label="Hold duration (days)" type="number" value={form.escrow_hold_days} onChange={v => update("escrow_hold_days", +v)} />
              </div>
            </div>
          )}

          {/* ═══ STEP 5: CONDITIONS & BONUSES ═══ */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Conditions & Bonuses</h2>
                <p className="text-sm text-muted-foreground mt-1">Set incentives and penalties</p>
              </div>

              <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Zap size={14} className="text-skill-green" /> Bonuses</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField label="Time bonus (%)" type="number" value={form.time_bonus_pct} onChange={v => update("time_bonus_pct", +v)} />
                  <InputField label="Complete within (days)" type="number" value={form.time_bonus_days} onChange={v => update("time_bonus_days", +v)} />
                </div>
                <InputField label="5-star review bonus (SP)" type="number" value={form.review_bonus_sp} onChange={v => update("review_bonus_sp", +v)} />
                <ToggleRow label="Streak multiplier" desc="Apply multiplier if both parties have active streaks" checked={form.streak_multiplier} onChange={v => update("streak_multiplier", v)} />
              </div>

              <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><AlertTriangle size={14} className="text-alert-red" /> Penalties & Policies</h4>
                <InputField label="Late delivery penalty (% per day)" type="number" value={form.late_penalty_pct} onChange={v => update("late_penalty_pct", +v)} />
                <ToggleRow label="NDA Required" desc="Both parties agree to non-disclosure" checked={form.nda_required} onChange={v => update("nda_required", v)} />
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cancellation Policy</label>
                  <div className="flex gap-2">
                    {["flexible", "moderate", "strict"].map(p => (
                      <button key={p} onClick={() => update("cancellation_policy", p)}
                        className={`flex-1 rounded-lg py-2.5 text-xs capitalize ${form.cancellation_policy === p ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground border border-border'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {form.cancellation_policy === "flexible" && "Full refund up to 24h after order starts"}
                    {form.cancellation_policy === "moderate" && "50% refund up to 48h, no refund after work begins"}
                    {form.cancellation_policy === "strict" && "No refund once order is accepted"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 6: GALLERY ═══ */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Gallery</h2>
                <p className="text-sm text-muted-foreground mt-1">Show off your work — listings with images get 3x more views</p>
              </div>

              <div className="rounded-xl border border-dashed border-border bg-surface-1/50 p-8 text-center">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="gig-images" />
                <label htmlFor="gig-images" className="cursor-pointer">
                  <Image size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-foreground font-medium">Click to upload images</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Up to 5 images · JPG, PNG, WebP</p>
                </label>
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => update("images", form.images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded-full">Thumbnail</span>}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Video URL (optional)</label>
                <input type="url" value={form.video_url} onChange={e => update("video_url", e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
              </div>
            </div>
          )}

          {/* ═══ STEP 7: REVIEW ═══ */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-black text-foreground">Review & Publish</h2>
                <p className="text-sm text-muted-foreground mt-1">Make sure everything looks good</p>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {form.images.length > 0 && (
                  <div className="h-40 overflow-hidden">
                    <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-foreground/10 text-foreground border-none text-[10px]">{formatLabel}</Badge>
                        {form.is_subscription && <Badge className="bg-purple-400/10 text-purple-400 border-none text-[10px]">Subscription</Badge>}
                      </div>
                      <h3 className="font-heading text-xl font-black text-foreground">{form.title || "Untitled Gig"}</h3>
                      {form.summary && <p className="text-sm text-muted-foreground mt-1">{form.summary}</p>}
                    </div>
                    <span className="font-mono text-lg font-bold text-skill-green">
                      {form.use_tiers ? `${form.tiers.basic.price_sp}–${form.tiers.premium.price_sp}` : form.flat_sp} SP
                    </span>
                  </div>

                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                    </div>
                  )}

                  {form.offering && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-skill-green/5 border border-skill-green/15 p-3">
                        <span className="text-[9px] uppercase tracking-widest text-skill-green/70">Offering</span>
                        <p className="text-sm font-bold text-foreground">{form.offering}</p>
                      </div>
                      <div className="rounded-lg bg-court-blue/5 border border-court-blue/15 p-3">
                        <span className="text-[9px] uppercase tracking-widest text-court-blue/70">Seeking</span>
                        <p className="text-sm font-bold text-foreground">{form.seeking || "Open"}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3">{form.description || "No description."}</p>

                  <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={10} /> {form.use_tiers ? form.tiers.basic.delivery_days : form.flat_delivery_days}d delivery</span>
                    <span className="flex items-center gap-1"><Repeat size={10} /> {form.use_tiers ? form.tiers.basic.revisions : form.flat_revisions} revisions</span>
                    <span className="flex items-center gap-1"><Layers size={10} /> {form.stages.length} stages</span>
                    {form.nda_required && <span className="flex items-center gap-1"><Shield size={10} /> NDA</span>}
                    {form.time_bonus_pct > 0 && <span className="flex items-center gap-1"><Zap size={10} /> +{form.time_bonus_pct}% early bonus</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveDraft} disabled={saving} className="flex-1 rounded-xl border border-border py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                  Save as Draft
                </button>
                <button onClick={publish} disabled={saving || !form.title}
                  className="flex-1 rounded-xl bg-skill-green py-3.5 text-sm font-bold text-background flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={16} /> {saving ? "Publishing..." : "Publish Gig"}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 rounded-xl border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < 7 && (
            <button onClick={() => setStep(step + 1)} disabled={!canAdvance()}
              className="ml-auto flex items-center gap-1 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background disabled:opacity-30">
              Continue <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

const InputField = ({ label, type, value, onChange, icon, step, placeholder }: {
  label: string; type: string; value: string | number; onChange: (v: string) => void;
  icon?: React.ReactNode; step?: string; placeholder?: string;
}) => (
  <div>
    <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} step={step} placeholder={placeholder}
        className={`w-full rounded-lg border border-border bg-surface-1 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/20 ${icon ? 'pl-9 pr-3' : 'px-3'}`} />
    </div>
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <button onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-skill-green' : 'bg-surface-2'} relative`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

export default CreateGigTab;
