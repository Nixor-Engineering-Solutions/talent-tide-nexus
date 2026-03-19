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
import Navbar from "@/components/shared/Navbar";
import CustomCursor from "@/components/shared/CustomCursor";
import CursorGlow from "@/components/shared/CursorGlow";
import PageTransition from "@/components/shared/PageTransition";
import Footer from "@/components/shared/Footer";

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
  title: "SkillSwappr World Cup 2026",
  subtitle: "The ultimate cross-discipline tournament",
  date: new Date("2026-06-15T18:00:00Z"),
  location: "Global — Online + London HQ Watch Party",
  description: "128 teams. 8 disciplines. 1 champion. The biggest skill-swapping tournament in SkillSwappr history returns with a $50K SP prize pool, live commentary, and exclusive NFT badges.",
  spots: 512,
  spotsFilled: 389,
  tags: ["Tournament", "Global", "Prize Pool"],
};

const upcomingEvents = [
  { id: 1, title: "Design Sprint Showdown", date: "Mar 22, 2026", time: "3:00 PM UTC", type: "Tournament", category: "Design", spots: 64, icon: Target, color: "text-court-blue", description: "48-hour design challenge. Teams of 4 compete to redesign a real product.", prize: "5,000 SP" },
  { id: 2, title: "Code & Coffee — NYC Meetup", date: "Mar 28, 2026", time: "10:00 AM EST", type: "In-Person", category: "Networking", spots: 40, icon: MapPin, color: "text-skill-green", description: "Casual Saturday morning meetup at Brooklyn Roasting. Bring your laptop.", prize: null },
  { id: 3, title: "Guild Wars: Season 5 Kickoff", date: "Apr 1, 2026", time: "6:00 PM UTC", type: "Tournament", category: "Competition", spots: 32, icon: Swords, color: "text-court-blue", description: "Guild vs Guild. 5 rounds. Strategy, skill, and teamwork determine the champion.", prize: "15,000 SP" },
  { id: 4, title: "API Workshop: Building Integrations", date: "Apr 5, 2026", time: "2:00 PM UTC", type: "Workshop", category: "Dev", spots: 100, icon: BookOpen, color: "text-foreground", description: "Hands-on workshop with the SkillSwappr API team. Build your first integration live.", prize: null },
  { id: 5, title: "Marketplace AMA with Founders", date: "Apr 8, 2026", time: "5:00 PM UTC", type: "Live Stream", category: "Community", spots: null, icon: Mic, color: "text-foreground", description: "Ask anything about the roadmap, upcoming features, and marketplace economics.", prize: null },
  { id: 6, title: "London Skill Swap Social", date: "Apr 12, 2026", time: "7:00 PM BST", type: "In-Person", category: "Social", spots: 80, icon: PartyPopper, color: "text-skill-green", description: "Drinks, demos, and skill swapping IRL at Shoreditch Works.", prize: null },
  { id: 7, title: "ELO Blitz: Weekend Warrior", date: "Apr 15, 2026", time: "12:00 PM UTC", type: "Tournament", category: "Competition", spots: 256, icon: Flame, color: "text-destructive", description: "48-hour ELO sprint. Complete as many gigs as possible. Top 10 get Diamond badges.", prize: "8,000 SP" },
  { id: 8, title: "University Challenge: Spring", date: "Apr 20, 2026", time: "4:00 PM UTC", type: "Tournament", category: "Academic", spots: 52, icon: Award, color: "text-court-blue", description: "University teams compete across design, dev, and marketing challenges.", prize: "20,000 SP" },
  { id: 9, title: "Creative Jam: Album Art Edition", date: "Apr 25, 2026", time: "1:00 PM UTC", type: "Workshop", category: "Design", spots: 120, icon: Palette, color: "text-court-blue", description: "Design album covers for indie artists in 4 hours. Best designs get featured on Spotify.", prize: "3,000 SP" },
  { id: 10, title: "Podcast Recording: Swap Stories", date: "Apr 28, 2026", time: "6:00 PM UTC", type: "Live Stream", category: "Community", spots: null, icon: Podcast, color: "text-court-blue", description: "Live recording of our community podcast. Share your craziest skill swap stories.", prize: null },
  { id: 11, title: "Berlin Dev Meetup", date: "May 2, 2026", time: "6:30 PM CET", type: "In-Person", category: "Dev", spots: 60, icon: MapPin, color: "text-skill-green", description: "Monthly Berlin developer meetup at Factory Berlin. Lightning talks + networking.", prize: null },
  { id: 12, title: "Game Jam: 72 Hour Challenge", date: "May 5, 2026", time: "12:00 AM UTC", type: "Tournament", category: "Game Dev", spots: 200, icon: Gamepad2, color: "text-destructive", description: "Build a complete game in 72 hours. Solo or team. Theme revealed at start.", prize: "10,000 SP" },
];

const pastHighlights = [
  { title: "Winter Invitational 2025", winner: "Team Nexus", participants: 1240, prize: "25,000 SP", category: "Tournament" },
  { title: "Hacktoberfest Collab", winner: "Community", participants: 3800, prize: "Open Source", category: "Hackathon" },
  { title: "Design Jam: Holiday Edition", winner: "Lena S.", participants: 420, prize: "3,000 SP", category: "Design" },
  { title: "Guild Wars Season 4", winner: "Phoenix Guild", participants: 960, prize: "12,000 SP", category: "Guild Wars" },
  { title: "Summer Code Sprint 2025", winner: "ByteForce", participants: 780, prize: "8,500 SP", category: "Hackathon" },
  { title: "Art Battle Royale", winner: "PixelPerfect", participants: 340, prize: "4,000 SP", category: "Design" },
];

const tournaments = [
  { name: "World Cup 2026", status: "Registration Open", teams: "128 teams", format: "Elimination", prize: "50,000 SP", icon: Crown },
  { name: "Guild Wars S5", status: "Coming Soon", teams: "32 guilds", format: "Round Robin", prize: "15,000 SP", icon: Swords },
  { name: "ELO Blitz Weekend", status: "Monthly", teams: "256 solo", format: "Sprint", prize: "8,000 SP", icon: Flame },
  { name: "University Challenge", status: "Quarterly", teams: "52 unis", format: "Multi-round", prize: "20,000 SP", icon: Award },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => {
  const eventDays = [3, 7, 12, 15, 18, 22, 25, 28];
  return { day: i + 1, hasEvent: eventDays.includes(i + 1) };
});

const eventTypes = [
  { label: "All", icon: Globe },
  { label: "Tournament", icon: Trophy },
  { label: "In-Person", icon: MapPin },
  { label: "Workshop", icon: BookOpen },
  { label: "Live Stream", icon: Video },
];

const platformStats = [
  { label: "Events Hosted", value: 340, icon: Calendar },
  { label: "Total Participants", value: 48200, icon: Users },
  { label: "SP Awarded", value: 1200000, icon: TrendingUp },
  { label: "Countries Reached", value: 72, icon: Globe },
];

const inPersonLocations = [
  { city: "London", country: "UK", nextEvent: "Apr 12", venue: "Shoreditch Works", attendees: 80, flag: "🇬🇧" },
  { city: "New York", country: "US", nextEvent: "Mar 28", venue: "Brooklyn Roasting Co.", attendees: 40, flag: "🇺🇸" },
  { city: "Berlin", country: "DE", nextEvent: "May 2", venue: "Factory Berlin", attendees: 60, flag: "🇩🇪" },
  { city: "Toronto", country: "CA", nextEvent: "May 3", venue: "MaRS Discovery", attendees: 50, flag: "🇨🇦" },
  { city: "Singapore", country: "SG", nextEvent: "May 10", venue: "Block71", attendees: 45, flag: "🇸🇬" },
  { city: "Tokyo", country: "JP", nextEvent: "May 18", venue: "WeWork Roppongi", attendees: 35, flag: "🇯🇵" },
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
  { quote: "Winning the Design Sprint was the highlight of my year. The SP prize funded my next three projects.", author: "Lena S.", role: "UI Designer", eventName: "Design Sprint 2025" },
];

const eventFaqs = [
  { q: "Are events free to join?", a: "Most events are completely free. Some premium tournaments may require a small SP entry fee, which is always clearly stated in the event listing." },
  { q: "Can I participate from any country?", a: "Yes! All online events are open globally. In-person events are location-specific but we're always expanding to new cities." },
  { q: "How are tournament prizes distributed?", a: "Prizes are awarded based on final standings. Typically: 1st place gets 50%, 2nd gets 25%, 3rd gets 15%, and remaining is split among top 10." },
  { q: "Can I host my own community event?", a: "Absolutely! Once you reach Gold tier, you can submit event proposals through the Community Events portal. We provide tools, promotion, and SP sponsorship." },
  { q: "What happens if I register but can't attend?", a: "You can cancel up to 24 hours before the event without penalty. No-shows may affect your event participation score for future registrations." },
  { q: "How do team tournaments work?", a: "Team events allow you to form or join a team during registration. If you don't have a team, our matchmaking system can pair you with compatible players." },
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
  const [selectedType, setSelectedType] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(null);
  const [calendarMonth] = useState("April 2026");
  const countdown = useCountdown(nextBigEvent.date);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const filteredEvents = selectedType === "All" ? upcomingEvents : upcomingEvents.filter(e => e.type === selectedType);

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
                <button className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:shadow-lg transition-shadow">
                  Register Now <ArrowRight size={14} className="inline ml-1" />
                </button>
                <button className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Bell size={14} className="inline mr-1" /> Remind Me
                </button>
              </div>
            </motion.div>

            {/* Right: Styled Event Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-surface-1 to-surface-2"
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
              <motion.div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-court-blue/10 blur-3xl" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity }} />
              <motion.div className="absolute bottom-1/3 left-1/4 w-40 h-40 rounded-full bg-skill-green/8 blur-3xl" animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 4, repeat: Infinity }} />
              <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-badge-gold/5 blur-3xl" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 6, repeat: Infinity }} />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="w-20 h-20 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center backdrop-blur-sm mx-auto">
                    <Trophy size={36} className="text-foreground/60" />
                  </div>
                </motion.div>
                <div>
                  <p className="font-heading text-xl font-bold text-foreground/80">Compete & Connect</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">Tournaments, meetups, and workshops — all in one place</p>
                </div>
                <div className="flex gap-2">
                  {["Tournament", "Meetup", "Workshop"].map((tag, i) => (
                    <motion.span key={tag} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className="rounded-lg bg-card/80 border border-border px-3 py-1.5 text-[10px] font-mono text-muted-foreground backdrop-blur-sm">
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
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
            {platformStats.map((stat, i) => {
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
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-${perk.color}/10 transition-colors group-hover:bg-${perk.color}/20`}>
                    <perk.icon size={22} className={`text-${perk.color}`} />
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
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.type === "Tournament" ? "bg-court-blue/10 text-court-blue border border-court-blue/20" :
                        event.type === "In-Person" ? "bg-skill-green/10 text-skill-green border border-skill-green/20" :
                        event.type === "Workshop" ? "bg-foreground/10 text-foreground border border-border" :
                        "bg-surface-2 text-muted-foreground border border-border"
                      }`}>{event.type}</span>
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
                        <p className="text-xs text-foreground font-medium">{selectedEvent.spots ?? "Unlimited"}</p>
                        <p className="text-[10px] text-muted-foreground">Spots</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 rounded-full bg-foreground text-background py-2.5 text-sm font-medium">Register</button>
                  <button className="rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"><Share2 size={14} /></button>
                  <button className="rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"><Heart size={14} /></button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────── 6. FEATURED SPEAKERS ────── */}
        <section className="py-20 px-6 bg-surface-1">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <Mic size={12} className="inline mr-1.5 -mt-0.5" /> Speakers
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Featured Speakers</h2>
              <p className="text-muted-foreground mt-2">Learn from industry leaders and community champions</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSpeakers.map((speaker, i) => (
                <motion.div
                  key={speaker.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-6 hover:border-foreground/20 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${speaker.color}/10 border border-${speaker.color}/20 font-heading text-sm font-bold text-${speaker.color}`}>
                      {speaker.avatar}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-foreground">{speaker.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{speaker.role}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface-2 border border-border/50 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">Talk Topic</p>
                    <p className="text-xs text-foreground font-medium leading-relaxed">{speaker.topic}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 7. TOURNAMENTS OVERVIEW ────── */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <Trophy size={12} className="inline mr-1.5 -mt-0.5" /> Competitive Scene
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Tournaments</h2>
              <p className="text-muted-foreground mt-2">Ranked competitions with real SP prizes</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tournaments.map((t, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3, borderColor: "hsl(var(--skill-green) / 0.3)" }}
                >
                  <t.icon size={24} className="mx-auto mb-3 text-foreground" />
                  <h3 className="font-heading text-base font-bold text-foreground">{t.name}</h3>
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    t.status === "Registration Open" ? "bg-skill-green/10 text-skill-green border border-skill-green/20" :
                    t.status === "Coming Soon" ? "bg-court-blue/10 text-court-blue border border-court-blue/20" :
                    "bg-surface-2 text-muted-foreground border border-border"
                  }`}>{t.status}</span>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p>{t.teams}</p>
                    <p>{t.format}</p>
                    <p className="font-mono text-skill-green font-bold">{t.prize}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 8. MINI CALENDAR ────── */}
        <section className="py-20 px-6 bg-surface-1">
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Event Calendar</h2>
              <p className="text-muted-foreground mt-2">{calendarMonth} — Tap highlighted dates to see events</p>
            </motion.div>

            <motion.div className="rounded-2xl border border-border bg-card p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center justify-between mb-4">
                <button className="text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
                <h3 className="font-heading font-bold text-foreground">{calendarMonth}</h3>
                <button className="text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map(d => (
                  <motion.div
                    key={d.day}
                    className={`relative flex h-9 sm:h-10 items-center justify-center rounded-lg text-sm cursor-pointer transition-colors ${
                      d.hasEvent
                        ? "bg-skill-green/10 text-skill-green font-bold border border-skill-green/20 hover:bg-skill-green/20"
                        : "text-muted-foreground hover:bg-surface-2"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {d.day}
                    {d.hasEvent && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-skill-green" />}
                  </motion.div>
                ))}
              </div>

              {/* Calendar legend */}
              <div className="mt-4 flex items-center gap-4 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-skill-green" /><span className="text-[10px] text-muted-foreground">Event Day</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-surface-2 border border-border" /><span className="text-[10px] text-muted-foreground">No Events</span></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ────── 9. IN-PERSON MEETUPS ────── */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-skill-green/30 bg-skill-green/10 px-4 py-1.5 font-mono text-xs text-skill-green">
                <MapPin size={12} className="inline mr-1.5 -mt-0.5" /> In-Person
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Meetups & Socials</h2>
              <p className="text-muted-foreground mt-2">Connect IRL at events across the globe</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inPersonLocations.map((loc, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 hover:border-foreground/15 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">{loc.city}</h3>
                      <p className="text-xs text-muted-foreground">{loc.country}</p>
                    </div>
                    <span className="text-2xl">{loc.flag}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><Calendar size={11} /> Next: {loc.nextEvent}</p>
                    <p className="flex items-center gap-1"><MapPin size={11} /> {loc.venue}</p>
                    <p className="flex items-center gap-1"><Users size={11} /> {loc.attendees} attendees</p>
                  </div>
                  <button className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    RSVP <ArrowRight size={10} className="inline ml-1" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 10. COMMUNITY HIGHLIGHTS / TESTIMONIALS ────── */}
        <section className="py-20 px-6 bg-surface-1">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                <MessageSquare size={12} className="inline mr-1.5 -mt-0.5" /> Stories
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Community Highlights</h2>
              <p className="text-muted-foreground mt-2">Real stories from event participants</p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4">
              {communityHighlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 flex flex-col"
                >
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={12} className="text-skill-green fill-skill-green" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1">"{h.quote}"</p>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs font-semibold text-foreground">{h.author}</p>
                    <p className="text-[10px] text-muted-foreground">{h.role}</p>
                    <span className="mt-2 inline-block rounded-full bg-surface-2 border border-border px-2.5 py-0.5 text-[9px] text-muted-foreground">{h.eventName}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 11. HALL OF FAME ────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Hall of Fame</h2>
              <p className="text-muted-foreground mt-2">Past event highlights and champions</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastHighlights.map((event, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-skill-green/10 border border-skill-green/20">
                      <Trophy size={18} className="text-skill-green" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold text-foreground truncate">{event.title}</h3>
                      <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{event.category}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">🏆 <span className="text-foreground font-medium">{event.winner}</span></p>
                    <p className="flex items-center gap-1.5"><Users size={11} /> {event.participants.toLocaleString()} participants</p>
                    <p className="flex items-center gap-1.5"><Zap size={11} className="text-skill-green" /> <span className="font-mono text-skill-green font-bold">{event.prize}</span></p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 12. EVENT LEADERBOARD ────── */}
        <section className="py-20 px-6 bg-surface-1">
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Event Leaderboard</h2>
              <p className="text-muted-foreground mt-2">Top performers across all events this season</p>
            </motion.div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {[
                { rank: 1, name: "Chen L.", events: 12, wins: 8, sp: "14,200", badge: "Diamond" },
                { rank: 2, name: "Alsha K.", events: 10, wins: 7, sp: "11,800", badge: "Diamond" },
                { rank: 3, name: "Marco R.", events: 11, wins: 6, sp: "10,500", badge: "Platinum" },
                { rank: 4, name: "Priya M.", events: 9, wins: 5, sp: "8,900", badge: "Platinum" },
                { rank: 5, name: "James T.", events: 8, wins: 5, sp: "7,600", badge: "Gold" },
                { rank: 6, name: "Sofia A.", events: 7, wins: 4, sp: "6,200", badge: "Gold" },
                { rank: 7, name: "Yuki T.", events: 9, wins: 4, sp: "5,800", badge: "Gold" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className={`font-heading text-lg font-black w-8 ${i < 3 ? "text-skill-green" : "text-muted-foreground"}`}>#{p.rank}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-border font-heading text-xs font-bold text-foreground ${
                    i === 0 ? "bg-skill-green/10" : i === 1 ? "bg-court-blue/10" : i === 2 ? "bg-foreground/10" : "bg-surface-2"
                  }`}>
                    {p.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.events} events · {p.wins} wins</p>
                  </div>
                  <span className={`hidden sm:inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    p.badge === "Diamond" ? "bg-court-blue/10 text-court-blue border border-court-blue/20" :
                    p.badge === "Platinum" ? "bg-foreground/10 text-foreground border border-border" :
                    "bg-skill-green/10 text-skill-green border border-skill-green/20"
                  }`}>{p.badge}</span>
                  <span className="font-mono text-sm text-skill-green font-bold">{p.sp} SP</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 13. HOW EVENTS WORK ────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">How Events Work</h2>
              <p className="text-muted-foreground mt-2">Three simple steps to get started</p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Browse & Register", desc: "Find events that match your skills and interests. One-click registration with instant confirmation.", icon: Ticket },
                { step: "02", title: "Compete or Attend", desc: "Join tournaments, workshops, or meetups. Earn XP and SP for every event you participate in.", icon: Zap },
                { step: "03", title: "Claim Rewards", desc: "Winners receive SP prizes, exclusive badges, and leaderboard positions. Everyone earns participation XP.", icon: Award },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <span className="absolute top-3 right-4 font-heading text-6xl font-black text-foreground/[0.03]">{s.step}</span>
                  <span className="font-mono text-xs text-muted-foreground">Step {s.step}</span>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border mx-auto my-4">
                    <s.icon size={24} className="text-foreground" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 14. EVENT FAQ ────── */}
        <section className="py-20 px-6 bg-surface-1">
          <div className="max-w-3xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Event FAQ</h2>
              <p className="text-muted-foreground mt-2">Common questions about participating in events</p>
            </motion.div>

            <div className="space-y-3">
              {eventFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-heading text-sm font-bold text-foreground pr-4">{faq.q}</span>
                    <ChevronRight size={14} className={`text-muted-foreground transition-transform shrink-0 ${expandedFaq === i ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── 15. CTA + NEWSLETTER ────── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <PartyPopper size={36} className="mx-auto mb-4 text-skill-green" />
              <h2 className="font-heading text-3xl sm:text-5xl font-black text-foreground">Don't Miss Out</h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                Subscribe to event notifications. Be the first to register for tournaments, meetups, and workshops.
              </p>

              {/* Email notification signup */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="mt-8 max-w-md mx-auto"
              >
                {notifySubmitted ? (
                  <div className="rounded-2xl border border-skill-green/20 bg-skill-green/5 p-5">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-skill-green" />
                    <p className="text-sm font-semibold text-foreground">You're in!</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll notify you about upcoming events. Check your inbox.</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => { if (notifyEmail.includes("@")) setNotifySubmitted(true); }}
                      className="rounded-xl bg-foreground text-background px-6 text-sm font-medium hover:shadow-lg transition-shadow"
                    >
                      Subscribe
                    </button>
                  </div>
                )}
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button className="rounded-full bg-foreground text-background px-8 py-3 text-sm font-medium hover:shadow-lg transition-shadow">
                  Browse All Events
                </button>
                <button className="rounded-full border border-border px-8 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Bell size={14} className="inline mr-1.5" /> Get Push Notifications
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground mt-4">No spam. Unsubscribe anytime. 4,200+ subscribers.</p>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default EventsPage;
