import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, Handshake, MessageSquare, CheckCircle2, Star, TrendingUp, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartStat, smartStatStr } from "@/hooks/useSmartStats";

const steps = [
  { icon: UserPlus, title: "Sign Up & Get Rewarded", desc: "Create your account, take the guided tour, and earn your first 100 Skill Points for completing it.", color: "text-skill-green", accent: "bg-skill-green/10 border-skill-green/20" },
  { icon: Search, title: "Browse or Post a Gig", desc: "Find a skill you need on the marketplace, or post your own service. AI recommends perfect matches based on your profile.", color: "text-court-blue", accent: "bg-court-blue/10 border-court-blue/20" },
  { icon: Handshake, title: "Match & Agree", desc: "Found your swap partner? Agree on deliverables, set stages, and stake Skill Points as insurance on each milestone.", color: "text-foreground", accent: "bg-surface-2 border-border" },
  { icon: MessageSquare, title: "Collaborate in the Workspace", desc: "Every gig gets a private workspace with real-time chat, video calls, whiteboard, file sharing — all built in.", color: "text-court-blue", accent: "bg-court-blue/10 border-court-blue/20" },
  { icon: CheckCircle2, title: "Deliver & Approve", desc: "Submit deliverables stage by stage. Work is AI quality-checked, and both parties must approve before points are released.", color: "text-skill-green", accent: "bg-skill-green/10 border-skill-green/20" },
  { icon: Star, title: "Rate, Review & Level Up", desc: "Leave verified reviews, earn ELO rating boosts, unlock achievements, and climb the leaderboard.", color: "text-foreground", accent: "bg-surface-2 border-border" },
];

const fallbackBarStats = { totalSwaps: 10000, totalUsers: 24500, avgCompletion: "2.4h" };

const HowSwappingWorksSection = () => {
  const [barStats, setBarStats] = useState(fallbackBarStats);

  useEffect(() => {
    const load = async () => {
      const [listingsRes, profilesRes, sessionsRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("page_sessions").select("duration_seconds").not("duration_seconds", "is", null).limit(200),
      ]);
      const swaps = listingsRes.count || 0;
      const users = profilesRes.count || 0;
      const sessions = sessionsRes.data || [];
      const avgSec = sessions.length ? sessions.reduce((a: number, s: any) => a + (s.duration_seconds || 0), 0) / sessions.length : 0;
      const avgH = avgSec > 0 ? `${(avgSec / 3600).toFixed(1)}h` : fallbackBarStats.avgCompletion;

      setBarStats({
        totalSwaps: smartStat(swaps, fallbackBarStats.totalSwaps),
        totalUsers: smartStat(users, fallbackBarStats.totalUsers),
        avgCompletion: smartStatStr(avgH, fallbackBarStats.avgCompletion),
      });
    };
    load();
  }, []);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+` : `${n}+`;

  return (
    <section className="py-28 px-6 bg-surface-1 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
            How a <span className="text-court-blue">Swap</span> works
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg leading-relaxed">
            From signup to 5-star review in 6 simple steps. No payments, no middlemen — just pure skill exchange.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-muted-foreground/20 transition-all duration-300 hover:shadow-lg"
            >
              <span className="absolute top-5 right-5 font-mono text-xs text-muted-foreground/40 font-bold">
                0{i + 1}
              </span>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${s.accent}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 ${s.color.replace('text-', 'bg-')} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 rounded-2xl border border-border bg-card p-6 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp size={14} className="text-skill-green" />
              <span className="font-heading text-2xl font-bold text-foreground">{formatNum(barStats.totalSwaps)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Swaps</p>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users size={14} className="text-court-blue" />
              <span className="font-heading text-2xl font-bold text-foreground">{formatNum(barStats.totalUsers)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap size={14} className="text-badge-gold" />
              <span className="font-heading text-2xl font-bold text-foreground">{barStats.avgCompletion}</span>
            </div>
            <p className="text-xs text-muted-foreground">Avg Completion</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowSwappingWorksSection;
