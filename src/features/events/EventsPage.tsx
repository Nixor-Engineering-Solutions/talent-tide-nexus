import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, Users, Trophy, Zap, Star, ArrowRight, ChevronLeft, ChevronRight,
  Flame, Target, Ticket, Globe, Award, PartyPopper, Swords, Shield, Video, Mic,
  BookOpen, TrendingUp, Crown, Timer, ExternalLink, Heart, Share2, Bell, Filter,
  Sparkles, Gift, Medal, GraduationCap, Podcast, Gamepad2, Code, Palette,
  MessageSquare, Lightbulb, Megaphone, Headphones, Play, CheckCircle2, Mail,
  MonitorSmartphone, Radio, Camera, PenTool, Music, Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import CustomCursor from "@/components/shared/CustomCursor";
import CursorGlow from "@/components/shared/CursorGlow";
import PageTransition from "@/components/shared/PageTransition";
import Footer from "@/components/shared/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { smartStat } from "@/hooks/useSmartStats";

/* ─── helpers ─── */
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

/* ─── data ─── */
const nextBigEvent = {
  title: "SkillSwappr World Cup 2027",
  subtitle: "The ultimate cross-discipline tournament",
  date: new Date("2027-06-15T18:00:00Z"),
  location: "Global — Online + London HQ Watch Party",
  description: "128 teams. 8 disciplines. 1 champion. The biggest skill-swapping tournament in SkillSwappr history returns with a $50K SP prize pool, live commentary, and exclusive NFT badges.",
  spots: 512,
  spotsFilled: 389,
  tags: ["Tournament", "Global", "Prize Pool"],
};

const upcomingEvents = [
  { id: "ev-1", title: "Design Sprint Showdown", date: "Mar 22, 2027", time: "3:00 PM UTC", type: "Tournament", category: "Design", spots: 64, icon: Target, color: "text-court-blue", description: "48-hour design challenge. Teams of 4 compete to redesign a real product.", prize: "5,000 SP" },
  { id: "ev-2", title: "Code & Coffee — NYC Meetup", date: "Mar 28, 2027", time: "10:00 AM EST", type: "In-Person", category: "Networking", spots: 40, icon: MapPin, color: "text-skill-green", description: "Casual Saturday morning meetup at Brooklyn Roasting. Bring your laptop.", prize: null },
  { id: "ev-3", title: "Guild Wars: Season 5 Kickoff", date: "Apr 1, 2027", time: "6:00 PM UTC", type: "Tournament", category: "Competition", spots: 32, icon: Swords, color: "text-court-blue", description: "Guild vs Guild. 5 rounds. Strategy, skill, and teamwork determine the champion.", prize: "15,000 SP" },
  { id: "ev-4", title: "API Workshop: Building Integrations", date: "Apr 5, 2027", time: "2:00 PM UTC", type: "Workshop", category: "Dev", spots: 100, icon: BookOpen, color: "text-foreground", description: "Hands-on workshop with the SkillSwappr API team. Build your first integration live.", prize: null },
  { id: "ev-5", title: "Marketplace AMA with Founders", date: "Apr 8, 2027", time: "5:00 PM UTC", type: "Live Stream", category: "Community", spots: null, icon: Mic, color: "text-foreground", description: "Ask anything about the roadmap, upcoming features, and marketplace economics.", prize: null },
  { id: "ev-6", title: "London Skill Swap Social", date: "Apr 12, 2027", time: "7:00 PM BST", type: "In-Person", category: "Social", spots: 80, icon: PartyPopper, color: "text-skill-green", description: "Drinks, demos, and skill swapping IRL at Shoreditch Works.", prize: null },
  { id: "ev-7", title: "ELO Blitz: Weekend Warrior", date: "Apr 15, 2027", time: "12:00 PM UTC", type: "Tournament", category: "Competition", spots: 256, icon: Flame, color: "text-destructive", description: "48-hour ELO sprint. Complete as many gigs as possible. Top 10 get Diamond badges.", prize: "8,000 SP" },
  { id: "ev-8", title: "University Challenge: Spring", date: "Apr 20, 2027", time: "4:00 PM UTC", type: "Tournament", category: "Academic", spots: 52, icon: Award, color: "text-court-blue", description: "University teams compete across design, dev, and marketing challenges.", prize: "20,000 SP" },
  { id: "ev-9", title: "Creative Jam: Album Art Edition", date: "Apr 25, 2027", time: "1:00 PM UTC", type: "Workshop", category: "Design", spots: 120, icon: Palette, color: "text-court-blue", description: "Design album covers for indie artists in 4 hours. Best designs get featured on Spotify.", prize: "3,000 SP" },
  { id: "ev-10", title: "Podcast Recording: Swap Stories", date: "Apr 28, 2027", time: "6:00 PM UTC", type: "Live Stream", category: "Community", spots: null, icon: Podcast, color: "text-court-blue", description: "Live recording of our community podcast. Share your craziest skill swap stories.", prize: null },
  { id: "ev-11", title: "Berlin Dev Meetup", date: "May 2, 2027", time: "6:30 PM CET", type: "In-Person", category: "Dev", spots: 60, icon: MapPin, color: "text-skill-green", description: "Monthly Berlin developer meetup at Factory Berlin. Lightning talks + networking.", prize: null },
  { id: "ev-12", title: "Game Jam: 72 Hour Challenge", date: "May 5, 2027", time: "12:00 AM UTC", type: "Tournament", category: "Game Dev", spots: 200, icon: Gamepad2, color: "text-destructive", description: "Build a complete game in 72 hours. Solo or team. Theme revealed at start.", prize: "10,000 SP" },
];

const pastHighlights = [
  { title: "Winter Invitational 2026", winner: "Team Nexus", participants: 1240, prize: "25,000 SP", category: "Tournament" },
  { title: "Hacktoberfest Collab", winner: "Community", participants: 3800, prize: "Open Source", category: "Hackathon" },
  { title: "Design Jam: Holiday Edition", winner: "Lena S.", participants: 420, prize: "3,000 SP", category: "Design" },
  { title: "Guild Wars Season 4", winner: "Phoenix Guild", participants: 960, prize: "12,000 SP", category: "Guild Wars" },
  { title: "Summer Code Sprint 2026", winner: "ByteForce", participants: 780, prize: "8,500 SP", category: "Hackathon" },
  { title: "Art Battle Royale", winner: "PixelPerfect", participants: 340, prize: "4,000 SP", category: "Design" },
];

const tournaments = [
  { name: "World Cup 2027", status: "Registration Open", teams: "128 teams", format: "Elimination", prize: "50,000 SP", icon: Crown },
  { name: "Guild Wars S5", status: "Coming Soon", teams: "32 guilds", format: "Round Robin", prize: "15,000 SP", icon: Swords },
  { name: "ELO Blitz Weekend", status: "Monthly", teams: "256 solo", format: "Sprint", prize: "8,000 SP", icon: Flame },
  { name: "University Challenge", status: "Quarterly", teams: "52 unis", format: "Multi-round", prize: "20,000 SP", icon: Award },
];

const eventTypes = [
  { label: "All", icon: Globe },
  { label: "Tournament", icon: Trophy },
  { label: "In-Person", icon: MapPin },
  { label: "Workshop", icon: BookOpen },
  { label: "Live Stream", icon: Video },
];

const demoStats = { events: 340, participants: 48200, sp: 1200000, countries: 72 };

const eventPerks = [
  { icon: Trophy, title: "Exclusive Badges", desc: "Earn event-specific badges that permanently display on your profile", color: "foreground" },
  { icon: Zap, title: "Bonus SP", desc: "Participants receive SP rewards — winners get the lion's share", color: "skill-green" },
  { icon: TrendingUp, title: "ELO Boost", desc: "Tournament wins give a significant ELO rating multiplier", color: "court-blue" },
  { icon: Users, title: "Networking", desc: "Connect with top swappers, guild leaders, and industry pros", color: "foreground" },
  { icon: Gift, title: "Swag & Merch", desc: "In-person attendees receive exclusive SkillSwappr merchandise", color: "muted-foreground" },
  { icon: Star, title: "Featured Profile", desc: "Top 3 winners get featured on the homepage for a week", color: "foreground" },
];

const communityHighlights = [
  { quote: "The Guild Wars changed everything for our team. We went from strangers to a top-10 guild in one season.", author: "Alex M.", role: "Guild Leader, Phoenix", eventName: "Guild Wars S4" },
  { quote: "I landed my dream freelance client through a connection I made at the NYC meetup. Can't recommend it enough.", author: "Jordan P.", role: "Freelance Designer", eventName: "NYC Meetup" },
  { quote: "Winning the Design Sprint was the highlight of my year. The SP prize funded my next three projects.", author: "Lena S.", role: "UI Designer", eventName: "Design Sprint 2026" },
];

const eventFaqs = [
  { q: "Are events free to join?", a: "Most events are completely free. Some premium tournaments may require a small SP entry fee, which is always clearly stated in the event listing." },
  { q: "Can I participate from any country?", a: "Yes! All online events are open globally. In-person events are location-specific but we're always expanding to new cities." },
  { q: "How are tournament prizes distributed?", a: "Prizes are awarded based on final standings. Typically: 1st place gets 50%, 2nd gets 25%, 3rd gets 15%, and remaining is split among top 10." },
  { q: "Can I host my own community event?", a: "Absolutely! Once you reach Gold tier, you can submit event proposals through the Community Events portal. We provide tools, promotion, and SP sponsorship." },
  { q: "What happens if I register but can't attend?", a: "You can cancel up to 24 hours before the event without penalty. No-shows may affect your event participation score for future registrations." },
  { q: "How do team tournaments work?", a: "Team events allow you to form or join a team during registration. If you don't have a team, our matchmaking system can pair you with compatible players." },
];

const tickerItems = [
  "🏆 Team Nexus wins Winter Invitational",
  "🎯 Design Sprint Showdown registrations open",
  "⚔️ Guild Wars S5 announced",
  "📍 NYC Meetup — 12 spots left",
  "🔥 ELO Blitz: 256 competitors registered",
  "🎓 University Challenge returns April 20",
  "🎤 Founder AMA scheduled April 8",
  "🌍 Singapore meetup launching May 10",
  "🎮 Game Jam announced — 72 hours!",
  "🎨 Creative Jam: Album Art registrations open",
];

const featuredSpeakers = [
  { name: "Sarah Chen", role: "Head of Design, SkillSwappr", topic: "Future of Collaborative Design", avatar: "SC", color: "court-blue" },
  { name: "Marcus Rivera", role: "Staff Engineer, Vercel", topic: "Building at Scale with Edge Functions", avatar: "MR", color: "skill-green" },
  { name: "Amira Okafor", role: "Community Lead", topic: "Growing Guild Culture from Zero", avatar: "AO", color: "foreground" },
  { name: "Leo Park", role: "Founder, DesignCraft", topic: "From Side Project to 10K Users", avatar: "LP", color: "destructive" },
  { name: "Nina Petrov", role: "AI Researcher, DeepMind", topic: "AI-Assisted Skill Matching", avatar: "NP", color: "court-blue" },
  { name: "Jake Williams", role: "Pro Gamer & Streamer", topic: "Competitive Mindset in Skill Swapping", avatar: "JW", color: "skill-green" },
];

const inPersonLocations = [
  { city: "London", country: "UK", nextEvent: "Apr 12", venue: "Shoreditch Works", attendees: 80, flag: "🇬🇧" },
  { city: "New York", country: "US", nextEvent: "Mar 28", venue: "Brooklyn Roasting Co.", attendees: 40, flag: "🇺🇸" },
  { city: "Berlin", country: "DE", nextEvent: "May 2", venue: "Factory Berlin", attendees: 60, flag: "🇩🇪" },
  { city: "Toronto", country: "CA", nextEvent: "May 3", venue: "MaRS Discovery", attendees: 50, flag: "🇨🇦" },
  { city: "Singapore", country: "SG", nextEvent: "May 10", venue: "Block71", attendees: 45, flag: "🇸🇬" },
  { city: "Tokyo", country: "JP", nextEvent: "May 18", venue: "WeWork Roppongi", attendees: 35, flag: "🇯🇵" },
];

/* ─── countdown hook ─── */
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
};

/* ─── page ─── */
const EventsPage = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(null);
  const countdown = useCountdown(nextBigEvent.date);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [remindedEvents, setRemindedEvents] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState(demoStats);

  // Load user registrations + platform stats
  useEffect(() => {
    const loadRegistrations = async () => {
      if (user) {
        const { data } = await supabase.from("event_registrations").select("event_id, status").eq("user_id", user.id);
        if (data) {
          const registered = new Set<string>();
          const reminded = new Set<string>();
          data.forEach((r: any) => {
            registered.add(r.event_id);
            if (r.status === "reminded") reminded.add(r.event_id);
          });
          setRegisteredEvents(registered);
          setRemindedEvents(reminded);
        }
      }
      // Load platform stats
      const [eventsRes, profilesRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setPlatformStats({
        events: smartStat(eventsRes.count || 0, demoStats.events),
        participants: smartStat((profilesRes.count || 0) * 4, demoStats.participants),
        sp: demoStats.sp,
        countries: demoStats.countries,
      });
    };
    loadRegistrations();
  }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user) { toast.error("Please log in to register"); return; }
    setRegisteringId(eventId);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: user.id,
      status: "going",
    });
    if (error) {
      if (error.code === "23505") toast.info("Already registered!");
      else toast.error("Registration failed");
    } else {
      setRegisteredEvents(prev => new Set(prev).add(eventId));
      toast.success("Registered successfully! 🎉");
    }
    setRegisteringId(null);
  };

  const handleRemind = async (eventId: string) => {
    if (!user) { toast.error("Please log in to set reminders"); return; }
    if (registeredEvents.has(eventId)) {
      // Update existing registration to reminded
      await supabase.from("event_registrations").update({ status: "reminded" }).eq("event_id", eventId).eq("user_id", user.id);
      setRemindedEvents(prev => new Set(prev).add(eventId));
      toast.success("Reminder set! We'll notify you before the event.");
    } else {
      // Create registration with reminded status
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        status: "reminded",
      });
      if (!error) {
        setRegisteredEvents(prev => new Set(prev).add(eventId));
        setRemindedEvents(prev => new Set(prev).add(eventId));
        toast.success("Reminder set! We'll notify you before the event.");
      }
    }
  };

  const filteredEvents = selectedType === "All" ? upcomingEvents : upcomingEvents.filter(e => e.type === selectedType);

  const statsArr = [
    { label: "Events Hosted", value: platformStats.events, icon: Calendar },
    { label: "Total Participants", value: platformStats.participants, icon: Users },
    { label: "SP Awarded", value: platformStats.sp, icon: TrendingUp },
    { label: "Countries Reached", value: platformStats.countries, icon: Globe },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <CursorGlow />
        <Navbar />

        {/* ────── 1. HERO + COUNTDOWN ────── */}
        <section className="relative pt-28 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-court-blue/5 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-skill-green/5 blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            {/* Left: Content */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <span className="mb-4 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <Calendar size={12} className="inline mr-1.5 -mt-0.5" /> Platform Events
              </span>
              <h1 className="font-heading text-5xl sm:text-7xl font-black text-foreground mt-4">
                Events &<br /><span className="text-court-blue">Tournaments</span>
              </h1>
              <p className="text-muted-foreground mt-4 max-w-xl text-lg">
                Compete, connect, and level up. From global tournaments to local meetups — there's always something happening.
              </p>

              {/* Countdown inline */}
              <div className="grid grid-cols-4 gap-3 mt-8 max-w-md">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Mins", value: countdown.minutes },
                  { label: "Secs", value: countdown.seconds },
                ].map(t => (
                  <div key={t.label} className="rounded-xl bg-surface-2 border border-border p-3 text-center">
                    <p className="font-heading text-2xl sm:text-3xl font-black text-foreground">{String(t.value).padStart(2, "0")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{t.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Trophy size={12} className="text-foreground" /> {nextBigEvent.title}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {nextBigEvent.location}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {nextBigEvent.spotsFilled}/{nextBigEvent.spots} filled</span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleRegister("world-cup-2027")}
                  disabled={registeredEvents.has("world-cup-2027") || registeringId === "world-cup-2027"}
                  className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-60"
                >
                  {registeredEvents.has("world-cup-2027") ? (
                    <><CheckCircle2 size={14} className="inline mr-1" /> Registered</>
                  ) : (
                    <>Register Now <ArrowRight size={14} className="inline ml-1" /></>
                  )}
                </button>
                <button
                  onClick={() => handleRemind("world-cup-2027")}
                  disabled={remindedEvents.has("world-cup-2027")}
                  className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
                >
                  {remindedEvents.has("world-cup-2027") ? (
                    <><CheckCircle2 size={14} className="inline mr-1" /> Reminded</>
                  ) : (
                    <><Bell size={14} className="inline mr-1" /> Remind Me</>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Right: Spline 3D Embed */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-border bg-surface-1"
            >
              <iframe
                src="https://my.spline.design/nexbotrobotcharacterconcept-1d5c831dc4fdd14e0f11e1217b1b5843/"
                title="Events 3D Scene"
                className="w-full h-full border-0"
                style={{ pointerEvents: "auto" }}
                loading="lazy"
                allow="autoplay"
              />
            </motion.div>
          </div>
        </section>

        {/* ────── 2. TICKER ────── */}
        <section className="border-y border-border bg-surface-1 py-3 overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="text-sm text-muted-foreground font-mono">{item}</span>
            ))}
          </motion.div>
        </section>

        {/* ────── NEXT BIG EVENT SPOTLIGHT ────── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-destructive" />
                <span className="font-mono text-xs text-destructive uppercase tracking-wider font-bold">Next Big Event</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{nextBigEvent.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{nextBigEvent.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{nextBigEvent.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {nextBigEvent.tags.map(t => (
                  <span key={t} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="mt-5 w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(nextBigEvent.spotsFilled / nextBigEvent.spots) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 1 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{nextBigEvent.spotsFilled} / {nextBigEvent.spots} spots filled</p>
            </motion.div>
          </div>
        </section>

        {/* ────── 3. PLATFORM STATS ────── */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsArr.map((stat, i) => {
              const { count, ref } = useCountUp(stat.value);
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <stat.icon size={18} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="font-heading text-2xl sm:text-3xl font-black text-foreground">{count.toLocaleString()}+</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ────── 4. EVENT PERKS & REWARDS ────── */}
        <section className="py-16 px-6 bg-surface-1">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <Gift size={12} className="inline mr-1.5 -mt-0.5" /> Rewards
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Why Participate?</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">Every event is an opportunity to grow your skills, reputation, and SP balance</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventPerks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 transition-colors">
                    <perk.icon size={22} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground mb-1">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 5. FILTER + UPCOMING EVENTS ────── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Upcoming Events</h2>
              <p className="text-muted-foreground mt-2">Filter by type and find your next challenge</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {eventTypes.map(t => (
                <button
                  key={t.label}
                  onClick={() => setSelectedType(t.label)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedType === t.label
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {filteredEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    className="rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:border-muted-foreground/30"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border">
                          <event.icon size={18} className={event.color} />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-foreground">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.category}</p>
                        </div>
                      </div>
                      {event.prize && (
                        <span className="rounded-full bg-skill-green/10 border border-skill-green/30 px-2.5 py-1 text-xs font-mono text-skill-green">{event.prize}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {event.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {event.time}</span>
                      {event.spots && <span className="flex items-center gap-1"><Users size={11} /> {event.spots} spots</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.type === "Tournament" ? "bg-court-blue/10 text-court-blue border border-court-blue/20" :
                        event.type === "In-Person" ? "bg-skill-green/10 text-skill-green border border-skill-green/20" :
                        event.type === "Workshop" ? "bg-foreground/10 text-foreground border border-border" :
                        "bg-surface-2 text-muted-foreground border border-border"
                      }`}>{event.type}</span>
                      <div className="flex gap-2">
                        {registeredEvents.has(event.id) ? (
                          <span className="flex items-center gap-1 text-[10px] text-skill-green"><CheckCircle2 size={12} /> Registered</span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRegister(event.id); }}
                            className="text-[10px] font-medium text-foreground hover:underline"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Globe size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No events found for this filter. Try another category.</p>
              </div>
            )}
          </div>
        </section>

        {/* ────── EVENT DETAIL MODAL ────── */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
              <motion.div
                className="relative max-w-lg w-full rounded-2xl border border-border bg-card p-6 sm:p-8 max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 border border-border">
                    <selectedEvent.icon size={22} className={selectedEvent.color} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">{selectedEvent.title}</h3>
                    <p className="text-xs text-muted-foreground">{selectedEvent.category} · {selectedEvent.type}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="rounded-lg bg-surface-2 p-3 text-center">
                    <Calendar size={14} className="mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-foreground font-medium">{selectedEvent.date}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedEvent.time}</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-3 text-center">
                    {selectedEvent.prize ? (
                      <>
                        <Trophy size={14} className="mx-auto mb-1 text-skill-green" />
                        <p className="text-xs text-foreground font-medium">{selectedEvent.prize}</p>
                        <p className="text-[10px] text-muted-foreground">Prize Pool</p>
                      </>
                    ) : (
                      <>
                        <Users size={14} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-foreground font-medium">{selectedEvent.spots || "Unlimited"}</p>
                        <p className="text-[10px] text-muted-foreground">Spots</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleRegister(selectedEvent.id)}
                    disabled={registeredEvents.has(selectedEvent.id)}
                    className="flex-1 rounded-xl bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-60"
                  >
                    {registeredEvents.has(selectedEvent.id) ? "✓ Registered" : "Register Now"}
                  </button>
                  <button
                    onClick={() => handleRemind(selectedEvent.id)}
                    disabled={remindedEvents.has(selectedEvent.id)}
                    className="flex-1 rounded-xl border border-border py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
                  >
                    {remindedEvents.has(selectedEvent.id) ? "✓ Reminder Set" : "Remind Me"}
                  </button>
                </div>
                <Link to={`/events/${selectedEvent.id}`} className="block mt-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View Full Event Page →
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────── 6. TOURNAMENTS ────── */}
        <section className="py-16 px-6 bg-surface-1">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <Swords size={12} className="inline mr-1.5 -mt-0.5" /> Competitive
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Active Tournaments</h2>
              <p className="text-muted-foreground mt-2">Test your skills against the best swappers on the platform</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tournaments.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-5 text-center transition-all hover:border-foreground/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 mx-auto mb-3">
                    <t.icon size={24} className="text-foreground" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{t.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.status}</p>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>{t.teams} · {t.format}</p>
                    <p className="font-mono font-bold text-skill-green">{t.prize}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 7. FEATURED SPEAKERS ────── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Featured Speakers</h2>
              <p className="text-muted-foreground mt-2">Industry leaders and community champions</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSpeakers.map((speaker, i) => (
                <motion.div
                  key={speaker.name}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/20"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 font-mono text-sm font-bold text-foreground">
                      {speaker.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{speaker.name}</p>
                      <p className="text-[10px] text-muted-foreground">{speaker.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{speaker.topic}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 8. IN-PERSON LOCATIONS ────── */}
        <section className="py-16 px-6 bg-surface-1">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <MapPin size={12} className="inline mr-1.5 -mt-0.5" /> IRL
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Meet In Person</h2>
              <p className="text-muted-foreground mt-2">SkillSwappr events happening in cities worldwide</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inPersonLocations.map((loc, i) => (
                <motion.div
                  key={loc.city}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/20"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{loc.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{loc.city}</p>
                        <p className="text-[10px] text-muted-foreground">{loc.country}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-skill-green/10 border border-skill-green/20 px-2 py-0.5 text-[10px] text-skill-green">
                      Next: {loc.nextEvent}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{loc.venue}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{loc.attendees} expected attendees</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 9. PAST HIGHLIGHTS ────── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Past Highlights</h2>
              <p className="text-muted-foreground mt-2">Looking back at our biggest moments</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastHighlights.map((event, i) => (
                <motion.div
                  key={event.title}
                  className="rounded-xl border border-border bg-card p-5"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{event.category}</span>
                  <h3 className="font-heading text-base font-bold text-foreground mt-1">{event.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Trophy size={10} className="text-skill-green" /> {event.winner}</span>
                    <span>{event.participants.toLocaleString()} participants</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-badge-gold mt-2">{event.prize}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 10. COMMUNITY TESTIMONIALS ────── */}
        <section className="py-16 px-6 bg-surface-1">
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">What Participants Say</h2>
            </motion.div>
            <div className="space-y-4">
              {communityHighlights.map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <p className="text-sm text-foreground italic">"{item.quote}"</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-foreground">
                      {item.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.author}</p>
                      <p className="text-[10px] text-muted-foreground">{item.role} · {item.eventName}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 11. FAQ ────── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Event FAQ</h2>
            </motion.div>
            <div className="space-y-3">
              {eventFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <ChevronRight size={14} className={`text-muted-foreground transition-transform ${expandedFaq === i ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 12. NOTIFY CTA ────── */}
        <section className="py-16 px-6 bg-surface-1">
          <div className="max-w-xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Bell size={32} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-heading text-2xl font-bold text-foreground">Never Miss an Event</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Get notified when new events are announced</p>
              {notifySubmitted ? (
                <div className="rounded-xl bg-skill-green/10 border border-skill-green/20 p-4">
                  <CheckCircle2 size={20} className="mx-auto mb-2 text-skill-green" />
                  <p className="text-sm text-foreground">You're on the list!</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20"
                  />
                  <button
                    onClick={async () => {
                      if (!notifyEmail.includes("@")) { toast.error("Enter a valid email"); return; }
                      await supabase.from("newsletter_subscriptions").insert({ email: notifyEmail });
                      setNotifySubmitted(true);
                      toast.success("Subscribed!");
                    }}
                    className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background"
                  >
                    Notify Me
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default EventsPage;
