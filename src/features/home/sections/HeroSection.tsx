import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartStat } from "@/hooks/useSmartStats";

const headlineWords = ["Trade", "Skills.", "Build", "Together."];

const demoStats = { swaps: 10000, universities: 50, points: 2000000 };

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);
  const [stats, setStats] = useState(demoStats);

  useEffect(() => {
    const fetchStats = async () => {
      const [listingsRes, profilesRes, escrowRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("university").not("university", "is", null),
        supabase.from("escrow_contracts").select("total_sp"),
      ]);
      const swaps = listingsRes.count || 0;
      const unis = new Set((profilesRes.data || []).map((p: any) => p.university)).size;
      const points = (escrowRes.data || []).reduce((a: number, e: any) => a + (e.total_sp || 0), 0);
      setStats({
        swaps: smartStat(swaps, demoStats.swaps),
        universities: smartStat(unis, demoStats.universities),
        points: smartStat(points, demoStats.points),
      });
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      spotlightX.set(e.clientX - rect.left);
      spotlightY.set(e.clientY - rect.top);
      setSpotlightOpacity(1);
    };

    const handleMouseLeave = () => setSpotlightOpacity(0);

    const el = containerRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (el) {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [spotlightX, spotlightY]);

  const formatNum = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
    return `${n}+`;
  };

  return (
    <section ref={containerRef} className="relative flex min-h-screen items-center overflow-hidden bg-background pt-20 lg:pt-0">
      {/* Cursor-following gradient spotlight */}
      <motion.div
        className="pointer-events-none absolute z-[1] h-[600px] w-[600px] rounded-full hidden lg:block"
        style={{
          x: spotlightX,
          y: spotlightY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, hsl(var(--silver) / 0.07) 0%, transparent 70%)",
          opacity: spotlightOpacity,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2">
        {/* Left: Styled 3D-like illustration cover */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-square w-full max-w-[500px] mx-auto lg:mx-0 hidden md:flex items-center justify-center"
        >
          {/* Decorative layered background */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-surface-1 to-surface-2 border border-border overflow-hidden">
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            {/* Floating accent orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-court-blue/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-skill-green/10 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-badge-gold/5 blur-3xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Center content */}
          <div className="relative z-10 text-center space-y-6 p-8">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={40} className="text-foreground/60" />
                </div>
                <motion.div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-skill-green/20 border border-skill-green/30 flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Zap size={14} className="text-skill-green" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 w-7 h-7 rounded-lg bg-court-blue/20 border border-court-blue/30 flex items-center justify-center"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <ArrowRight size={12} className="text-court-blue" />
                </motion.div>
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <p className="font-heading text-lg font-bold text-foreground/80">Skill Exchange</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Trade what you know for what you need — powered by community</p>
            </div>

            {/* Mini floating cards */}
            <div className="flex justify-center gap-3">
              {["Design", "Code", "Video"].map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.15 }}
                  className="rounded-lg bg-card/80 border border-border px-3 py-1.5 text-[10px] font-mono text-muted-foreground backdrop-blur-sm"
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Text content */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
              The skill exchange platform for students
            </span>
          </motion.div>

          <h1 className="mb-6 font-heading text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6 + i * 0.15,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="mr-3 inline-block sm:mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mb-10 max-w-lg text-lg text-muted-foreground sm:text-xl"
          >
            Exchange your design skills for development, writing for marketing — no money needed. Just skill points.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <motion.a
              href="/signup"
              className="rounded-full bg-foreground px-8 py-3.5 text-center text-sm font-semibold text-background shadow-[0_0_30px_hsl(var(--silver)/0.15)] transition-shadow hover:shadow-[0_0_40px_hsl(var(--silver)/0.3)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Swapping
            </motion.a>
            <motion.button
              className="rounded-full border border-border px-8 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Watch How It Works
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="mt-12 flex items-center gap-4 sm:gap-8 flex-wrap"
          >
            <div className="text-center">
              <span className="font-heading text-2xl font-bold text-foreground">{formatNum(stats.swaps)}</span>
              <p className="text-xs text-muted-foreground">Skill Swaps</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="font-heading text-2xl font-bold text-foreground">{formatNum(stats.universities)}</span>
              <p className="text-xs text-muted-foreground">Universities</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="font-heading text-2xl font-bold text-foreground">{formatNum(stats.points)}</span>
              <p className="text-xs text-muted-foreground">Points Exchanged</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
