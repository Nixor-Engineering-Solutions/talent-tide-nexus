import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Zap, Trophy, GraduationCap, Shield, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartStat } from "@/hooks/useSmartStats";

const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
};

const fallbackStats = [
  { label: "Active Users", value: 24500, suffix: "+", icon: Users, color: "text-foreground" },
  { label: "Gigs Completed", value: 89200, suffix: "+", icon: Zap, color: "text-skill-green" },
  { label: "Points Exchanged", value: 2400000, suffix: "+", icon: TrendingUp, color: "text-badge-gold" },
  { label: "Guilds Formed", value: 1200, suffix: "+", icon: Trophy, color: "text-court-blue" },
  { label: "Disputes Resolved", value: 4800, suffix: "", icon: Shield, color: "text-foreground" },
  { label: "Universities", value: 52, suffix: "", icon: GraduationCap, color: "text-foreground" },
];

const CommunityStatsSection = () => {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, listingsRes, escrowRes, guildsRes, disputesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, university", { count: "exact" }),
        supabase.from("listings").select("id", { count: "exact" }),
        supabase.from("escrow_contracts").select("total_sp"),
        supabase.from("guilds").select("id", { count: "exact" }),
        supabase.from("disputes").select("id, status"),
      ]);

      const userCount = profilesRes.count || 0;
      const gigCount = listingsRes.count || 0;
      const totalSP = (escrowRes.data || []).reduce((a: number, e: any) => a + (e.total_sp || 0), 0);
      const guildCount = guildsRes.count || 0;
      const resolvedDisputes = (disputesRes.data || []).filter((d: any) => d.status === "Resolved").length;
      const universities = new Set((profilesRes.data || []).map((p: any) => p.university).filter(Boolean)).size;

      setStats([
        { label: "Active Users", value: smartStat(userCount, fallbackStats[0].value), suffix: "+", icon: Users, color: "text-foreground" },
        { label: "Gigs Completed", value: smartStat(gigCount, fallbackStats[1].value), suffix: "+", icon: Zap, color: "text-skill-green" },
        { label: "Points Exchanged", value: smartStat(totalSP, fallbackStats[2].value), suffix: "+", icon: TrendingUp, color: "text-badge-gold" },
        { label: "Guilds Formed", value: smartStat(guildCount, fallbackStats[3].value), suffix: "+", icon: Trophy, color: "text-court-blue" },
        { label: "Disputes Resolved", value: smartStat(resolvedDisputes, fallbackStats[4].value), suffix: "", icon: Shield, color: "text-foreground" },
        { label: "Universities", value: smartStat(universities, fallbackStats[5].value), suffix: "", icon: GraduationCap, color: "text-foreground" },
      ]);
    };
    load();
  }, []);

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="mb-4 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
            By The Numbers
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">The Community in Numbers</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value);
            return (
              <motion.div
                key={i}
                ref={ref}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-muted-foreground/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <stat.icon size={20} className={`mx-auto mb-3 ${stat.color}`} />
                <p className={`font-heading text-3xl sm:text-4xl font-black ${stat.color}`}>
                  {count.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommunityStatsSection;
