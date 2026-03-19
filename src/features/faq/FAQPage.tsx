import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, ChevronDown, Search, Coins, ArrowLeftRight, Users, Shield,
  Trophy, Scale, Bot, Building2, Zap, MessageSquare, GraduationCap,
  Star, Target, Flame, FolderKanban, Lock, FileText, ChevronLeft, ChevronRight,
  Video
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import CustomCursor from "@/components/shared/CustomCursor";
import CursorGlow from "@/components/shared/CursorGlow";
import PageTransition from "@/components/shared/PageTransition";
import Footer from "@/components/shared/Footer";

const faqSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    color: "text-skill-green",
    bg: "bg-skill-green/10",
    layout: "grid" as const,
    faqs: [
      { q: "What is SkillSwappr?", a: "SkillSwappr is a peer-to-peer skill exchange marketplace where students and professionals trade skills using an internal currency called Skill Points (SP). Instead of paying cash, you exchange value through your expertise." },
      { q: "How do I create an account?", a: "Click 'Get Started' on the homepage. You'll enter your name, email, university (optional), and password. You'll receive 100 SP on signup to get started immediately." },
      { q: "Is it free to use?", a: "Yes! The Free tier gives you 5 gigs per month, 100 signup points, and full access to the marketplace. Premium tiers unlock more gigs, reduced taxes, and additional features." },
      { q: "Do I need to be a university student?", a: "No. While university verification gives you a trust badge and campus-specific features, anyone 16+ can join and use the platform." },
      { q: "What happens after I sign up?", a: "You'll complete your profile with skills you offer and skills you want, browse the marketplace, and start your first gig. Our AI will recommend matches based on your profile." },
      { q: "Can I use it on mobile?", a: "Yes, SkillSwappr is fully responsive and works on all devices. A dedicated mobile app is on our roadmap for Q3 2026." },
    ],
  },
  {
    id: "skill-points",
    title: "Skill Points & Economy",
    icon: Coins,
    color: "text-badge-gold",
    bg: "bg-badge-gold/10",
    layout: "accordion" as const,
    faqs: [
      { q: "What are Skill Points (SP)?", a: "Skill Points are the internal currency of SkillSwappr. They balance the value difference in skill exchanges and reward platform participation. They have no cash value and cannot be withdrawn." },
      { q: "How do I earn Skill Points?", a: "Complete gigs, get positive reviews, maintain daily streaks, participate in Skill Court, win achievements, refer friends, complete challenges, and participate in Guild Wars. Each activity earns different amounts." },
      { q: "What is the 5% tax?", a: "Both parties in a gig are taxed 5% of the transaction value upon completion. This prevents inflation, funds platform operations, and maintains a healthy economy. Premium tiers get reduced tax rates." },
      { q: "Can I buy Skill Points with real money?", a: "No. Skill Points are earned through platform activity only. This ensures the economy reflects real skill value, not purchasing power." },
      { q: "What happens to my points if I'm inactive?", a: "Points don't expire. However, your ELO rating may decay slightly after 60 days of inactivity. Logging in and completing any activity resets the decay timer." },
      { q: "How is pricing determined for gigs?", a: "Our AI analyzes market demand, skill complexity, seller ELO rating, and historical pricing to suggest fair point values. Both parties can negotiate the final amount." },
    ],
  },
  {
    id: "gig-formats",
    title: "Gig Formats & Marketplace",
    icon: ArrowLeftRight,
    color: "text-court-blue",
    bg: "bg-court-blue/10",
    layout: "two-column" as const,
    faqs: [
      { q: "What is a Direct Swap?", a: "A 1-on-1 skill exchange where both parties trade skills simultaneously. Points balance any value difference. Both sides are taxed 5% on completion." },
      { q: "How do Auctions work?", a: "Post a task and receive multiple submissions from creators. Review all entries, pick the best one — they get the most points. It's competitive and produces high-quality results." },
      { q: "What is Co-Creation Studio?", a: "A multi-person collaborative workspace with real-time whiteboard, video calls, and file sharing. Points are split by role contribution. Great for complex projects needing diverse skills." },
      { q: "What is Skill Fusion?", a: "Multi-skill gigs where one person fills multiple roles or several specialists collaborate. A single person with UX + coding skills might handle an entire app prototype." },
      { q: "How does Flash Market work?", a: "Time-limited gigs with bonus point multipliers (1.5x–3x). They expire within hours, creating urgency and rewarding fast, quality work." },
      { q: "Can I create recurring gigs?", a: "Yes! Subscription Gigs let you set up recurring exchanges — like weekly content creation for weekly graphic design. Both parties commit to a schedule." },
    ],
  },
  {
    id: "workspace",
    title: "Workspace & Collaboration",
    icon: MessageSquare,
    color: "text-foreground",
    bg: "bg-surface-2",
    layout: "cards" as const,
    faqs: [
      { q: "What tools are in the workspace?", a: "Real-time messenger with auto-translation, tldraw whiteboard, peer-to-peer video calls with screen sharing, file library with version history, stage tracker, and AI quality panel." },
      { q: "Are video calls recorded?", a: "Yes, all video calls are automatically recorded and saved in the workspace file library. Both parties can access recordings for reference. Recordings are deleted 90 days after gig completion." },
      { q: "How does the stage tracker work?", a: "Break your gig into stages with point allocations per stage. As each stage is completed and approved, points are released. If someone abandons, you keep points for completed stages (insurance)." },
      { q: "Can I share files in the workspace?", a: "Yes. The file library supports all common formats, organizes files chronologically with version history, and includes search. Files are encrypted at rest and in transit." },
      { q: "What does the AI Quality Panel do?", a: "It runs plagiarism checks, provides quality scoring, predicts buyer satisfaction, compares versions, and checks delivery compliance against the original gig requirements." },
    ],
  },
  {
    id: "trust-safety",
    title: "Trust & Safety",
    icon: Shield,
    color: "text-skill-green",
    bg: "bg-skill-green/10",
    layout: "highlight" as const,
    faqs: [
      { q: "How does SkillSwappr prevent scams?", a: "Multiple layers: AI scam pattern detection, digital fingerprinting of all deliverables, progressive work reveal (staged delivery), transaction codes for public verification, and the Skill Court dispute system." },
      { q: "What are Transaction Codes?", a: "Every completed gig gets a unique transaction code that anyone can look up to verify the exchange happened, view quality scores, and confirm authenticity. It's like a blockchain receipt." },
      { q: "How does the review system work?", a: "Both parties rate each other only after gig completion and deliverable verification. Reviews include a 1–5 star rating and written feedback. Coordinated manipulation is detected by AI and punished." },
      { q: "What is Digital Fingerprinting?", a: "All deliverables submitted through the platform contain invisible digital fingerprints for authenticity verification. This protects creators against unauthorized redistribution and proves ownership." },
      { q: "How do I report someone?", a: "Use the report button on any profile, gig, or message. Provide evidence if possible. Reports are reviewed within 24 hours. False reports are tracked and reduce your credibility score." },
      { q: "Is my data secure?", a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We conduct regular security audits, run a bug bounty program, and comply with GDPR, CCPA, and SOC 2 standards." },
    ],
  },
  {
    id: "gamification",
    title: "ELO, Ranks & Achievements",
    icon: Trophy,
    color: "text-badge-gold",
    bg: "bg-badge-gold/10",
    layout: "timeline" as const,
    faqs: [
      { q: "What is the ELO rating?", a: "A chess-like rating system that reflects your skill level and reliability. It affects search ranking, court eligibility, feature unlocks, and matchmaking. Higher ELO = more visibility and trust." },
      { q: "How are tiers determined?", a: "Based on lifetime activity: Bronze (0–499 ELO) → Silver (500–999) → Gold (1000–1499) → Platinum (1500–1799) → Diamond (1800+). Each tier unlocks progressive benefits like reduced taxes and priority support." },
      { q: "What are Skill Mastery levels?", a: "Per-skill progression separate from ELO: Beginner → Intermediate → Advanced → Expert → Master. You advance by completing gigs and receiving positive reviews in that specific skill category." },
      { q: "How do achievements work?", a: "50+ badges for milestones like 'First Gig,' '100 Swaps,' 'Perfect Rating Streak,' etc. Each achievement grants real benefits — reduced tax rates, bonus points, exclusive features, or cosmetic upgrades." },
      { q: "What are streaks?", a: "Complete at least one gig activity daily to maintain your streak. Streaks multiply bonus point earnings: 7-day = 1.5x, 14-day = 2x, 30-day = 3x. Breaking a streak resets the multiplier." },
      { q: "What is Quarterly Wrap?", a: "Every 3 months, you get a visual summary of your activity — like Spotify Wrapped but for skills. It shows gigs completed, points earned, skill growth, top collaborators, and fun stats." },
    ],
  },
  {
    id: "guilds",
    title: "Guilds & Teams",
    icon: Users,
    color: "text-court-blue",
    bg: "bg-court-blue/10",
    layout: "grid" as const,
    faqs: [
      { q: "What are Guilds?", a: "Teams of users who pool resources, share a treasury, compete in Guild Wars, and collaborate on projects. Guilds have shared portfolios, quality control processes, and collective ELO ratings." },
      { q: "How do I create or join a Guild?", a: "Create a guild from your dashboard (requires Gold tier+) or request to join existing guilds. Guild leaders approve new members based on skill fit and ELO requirements." },
      { q: "What is the Guild Treasury?", a: "A shared pool of Skill Points that members contribute to. The treasury funds member gigs, covers taxes, and grows through Guild War winnings. Leaders manage allocation." },
      { q: "How do Guild Wars work?", a: "Weekly competitions between guilds based on metrics like gig completion rate, average quality scores, and member growth. Winners receive treasury bonuses and exclusive badges." },
      { q: "Can guilds take on projects together?", a: "Yes! Guilds can accept multi-role projects and delegate tasks to the right specialists. The guild leader manages assignment, and points are distributed per role contribution." },
    ],
  },
  {
    id: "skill-court",
    title: "Skill Court & Disputes",
    icon: Scale,
    color: "text-alert-red",
    bg: "bg-alert-red/10",
    layout: "accordion" as const,
    faqs: [
      { q: "What is Skill Court?", a: "Our dispute resolution system. When parties disagree on gig outcomes, Skill Court assembles a panel of judges to review evidence and make a fair ruling." },
      { q: "Who are the judges?", a: "A mix: 25% community users (randomly selected), 25% AI analysis, and 50% high-ELO experts in the relevant skill field. This ensures balanced, knowledgeable decisions." },
      { q: "How long do cases take?", a: "Most cases are resolved within 48–72 hours. Complex cases with multiple evidence submissions may take up to 5 business days. Both parties are notified at every stage." },
      { q: "Can I appeal a decision?", a: "Yes, each party gets one appeal per case. Appeals go to a higher-ELO panel for re-review. The appeal panel's decision is final." },
      { q: "Do I have to serve as a judge?", a: "Free tier users must serve as judges periodically to maintain gig privileges. It's a community responsibility. You earn points and ELO for fair judging." },
      { q: "How do verdicts affect ELO?", a: "The losing party's ELO decreases proportionally to the severity of the ruling. The winning party may receive an ELO boost. Judges who rule fairly earn bonus ELO." },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise & Business",
    icon: Building2,
    color: "text-foreground",
    bg: "bg-surface-2",
    layout: "two-column" as const,
    faqs: [
      { q: "What is Enterprise mode?", a: "A premium tier for businesses to access vetted, high-ELO student talent. Includes AI matching, project management dashboards, NDA/IP protection, and dedicated account managers." },
      { q: "How is talent vetted?", a: "Enterprise talent pool requires minimum Gold tier (1000+ ELO), 4.5+ star rating, 50+ completed gigs, and passes our AI quality assessment. Additional background checks for sensitive projects." },
      { q: "Can I hire students full-time?", a: "Yes! Our Direct Hire Pipeline lets you transition from gig work to full-time offers seamlessly. We track performance across gigs to build comprehensive candidate profiles." },
      { q: "What about IP and NDAs?", a: "Enterprise gigs include automatic NDA coverage. Full IP transfer agreements are available through our legal team. All work is digitally fingerprinted for ownership verification." },
      { q: "What integrations are available?", a: "Slack, Jira, Notion, GitHub, Figma, and custom API integrations. Enterprise plans include dedicated integration support and custom webhook configurations." },
    ],
  },
  {
    id: "messaging",
    title: "Messaging & Communication",
    icon: MessageSquare,
    color: "text-court-blue",
    bg: "bg-court-blue/10",
    layout: "cards" as const,
    faqs: [
      { q: "How do direct messages work?", a: "Click any user's profile and hit 'Message' to start a private conversation. DMs support text, files, and reactions. Conversations are encrypted end-to-end." },
      { q: "Can I message someone before starting a gig?", a: "Yes! We encourage pre-gig conversations to discuss requirements, timelines, and expectations. It's the best way to ensure a successful exchange." },
      { q: "How do workspace chat and DMs differ?", a: "DMs are private conversations between two users. Workspace chat is tied to a specific gig and includes all collaborators, file sharing, and AI quality tools." },
      { q: "Do I get notifications for messages?", a: "Yes, real-time push notifications for DMs, workspace messages, gig updates, and system alerts. Customize notification preferences in Settings." },
      { q: "Can I block or mute someone?", a: "Yes. Block a user from their profile to prevent all communication. Mute a conversation to stop notifications without blocking. Both are reversible." },
    ],
  },
  {
    id: "events-tournaments",
    title: "Events & Tournaments",
    icon: Trophy,
    color: "text-badge-gold",
    bg: "bg-badge-gold/10",
    layout: "two-column" as const,
    faqs: [
      { q: "What types of events does SkillSwappr host?", a: "Tournaments (competitive skill challenges), Workshops (hands-on learning), Live Streams (AMAs, podcasts), In-Person Meetups (networking), and Guild Wars (team competitions)." },
      { q: "How do I register for an event?", a: "Visit the Events page and click 'Register' on any event. Some events have limited spots — register early. You'll receive reminders as the event approaches." },
      { q: "Are events free?", a: "Most events are completely free. Some premium tournaments may require a small SP entry fee, which is always clearly stated in the event listing." },
      { q: "How are tournament prizes distributed?", a: "Typically: 1st place gets 50%, 2nd gets 25%, 3rd gets 15%, and the remaining 10% is split among top 10 finishers." },
      { q: "Can I host my own event?", a: "Gold tier+ users can submit event proposals through the Community Events portal. We provide promotion tools, SP sponsorship, and organizational support." },
    ],
  },
  {
    id: "clips",
    title: "Clips & Content",
    icon: Video,
    color: "text-foreground",
    bg: "bg-surface-2",
    layout: "grid" as const,
    faqs: [
      { q: "What are Clips?", a: "Short-form video/image content (15–60 seconds) showcasing your work, process, or skill tips. Think of it as a creative portfolio feed." },
      { q: "How do Clips help my profile?", a: "Clips increase your visibility in search, showcase your skills visually, and can earn you SP through engagement (likes, shares, saves)." },
      { q: "What content can I post as a Clip?", a: "Timelapse of your work, before/after comparisons, quick tutorials, tool demos, portfolio pieces, or behind-the-scenes of a swap. Keep it professional and relevant." },
      { q: "Can Clips be used as portfolio items?", a: "Yes! You can pin up to 6 Clips to your profile's portfolio section. They appear alongside your traditional portfolio items." },
    ],
  },
  {
    id: "account",
    title: "Account & Billing",
    icon: FileText,
    color: "text-muted-foreground",
    bg: "bg-surface-2",
    layout: "cards" as const,
    faqs: [
      { q: "How do I upgrade my plan?", a: "Go to Settings > Subscription. Choose your plan and billing cycle (monthly or yearly — yearly saves 20%). Changes take effect immediately with prorated billing." },
      { q: "Can I downgrade my plan?", a: "Yes, you can downgrade at any time. Your current plan benefits continue until the end of your billing cycle. Unused premium features will be restricted after downgrade." },
      { q: "How do I delete my account?", a: "Go to Settings > Account > Delete Account. All data is purged within 30 days. Active gigs must be completed or cancelled first. Skill Points are forfeited upon deletion." },
      { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee on all paid plans. After 14 days, refunds are handled on a case-by-case basis. Contact support for assistance." },
      { q: "How do I verify my university?", a: "Sign up with your .edu email or upload proof of enrollment (student ID, enrollment letter). Verification is processed within 24 hours and grants a verified badge." },
      { q: "Is there a student discount?", a: "All verified university students get 15% off Pro and Team plans. Use your .edu email at signup or verify your enrollment for the discount to apply automatically." },
    ],
  },
];

const FaqCategoryNav = ({ sections, activeSection, onSelect }: { sections: typeof faqSections; activeSection: string; onSelect: (id: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => { el?.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-3 relative">
        {canScrollLeft && (
          <>
            <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-12 bg-gradient-to-r from-background/80 to-transparent z-10" />
            <button onClick={() => scroll(-1)} className="absolute left-7 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-surface-2 transition-colors">
              <ChevronLeft size={14} className="text-foreground" />
            </button>
          </>
        )}
        {canScrollRight && (
          <>
            <div className="pointer-events-none absolute right-6 top-0 bottom-0 w-12 bg-gradient-to-l from-background/80 to-transparent z-10" />
            <button onClick={() => scroll(1)} className="absolute right-7 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-surface-2 transition-colors">
              <ChevronRight size={14} className="text-foreground" />
            </button>
          </>
        )}
        <div ref={scrollRef} className="faq-nav-scroll flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <style>{`.faq-nav-scroll::-webkit-scrollbar { display: none !important; }`}</style>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                activeSection === s.id ? "bg-foreground text-background" : "bg-surface-1 text-muted-foreground hover:text-foreground hover:bg-surface-2"
              }`}
            >
              <s.icon size={13} />
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentSection = faqSections.find((s) => s.id === activeSection)!;

  const allFilteredFaqs = searchQuery
    ? faqSections.flatMap((s) =>
        s.faqs
          .filter((f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((f) => ({ ...f, section: s.title, sectionIcon: s.icon, sectionColor: s.color }))
      )
    : [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <CursorGlow />
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--silver)/0.05),transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
              <HelpCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 font-heading text-5xl font-black text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
              Frequently Asked <span className="text-muted-foreground">Questions</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Everything you need to know about SkillSwappr — from getting started to advanced features.
            </motion.p>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-auto max-w-lg relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search all questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none"
              />
            </motion.div>
          </div>
        </section>

        {/* Search Results */}
        {searchQuery && (
          <section className="pb-12">
            <div className="mx-auto max-w-4xl px-6">
              <p className="mb-4 text-sm text-muted-foreground">{allFilteredFaqs.length} results for "{searchQuery}"</p>
              <div className="space-y-3">
                {allFilteredFaqs.map((f, i) => {
                  const hl = (text: string) => {
                    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
                    if (idx === -1) return text;
                    return <>{text.slice(0, idx)}<mark className="bg-badge-gold/20 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + searchQuery.length)}</mark>{text.slice(idx + searchQuery.length)}</>;
                  };
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-xl border border-border bg-card p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <f.sectionIcon size={12} className={f.sectionColor} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.section}</span>
                      </div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">{hl(f.q)}</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{hl(f.a)}</p>
                    </motion.div>
                  );
                })}
                {allFilteredFaqs.length === 0 && (
                  <div className="py-12 text-center">
                    <Search size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-foreground font-medium">No questions match your search</p>
                    <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse categories below</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section Nav + Content */}
        {!searchQuery && (
          <>
            {/* Category Nav */}
            <FaqCategoryNav sections={faqSections} activeSection={activeSection} onSelect={setActiveSection} />

            {/* Section Content */}
            <section className="py-16">
              <div className="mx-auto max-w-5xl px-6">
                <AnimatePresence mode="wait">
                  <motion.div key={activeSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    {/* Section Header */}
                    <div className="mb-10 flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentSection.bg}`}>
                        <currentSection.icon size={24} className={currentSection.color} />
                      </div>
                      <div>
                        <h2 className="font-heading text-2xl font-bold text-foreground">{currentSection.title}</h2>
                        <p className="text-sm text-muted-foreground">{currentSection.faqs.length} questions</p>
                      </div>
                    </div>

                    {/* Layout: accordion */}
                    {(currentSection.layout === "accordion" || currentSection.layout === "timeline") && (
                      <div className="space-y-3">
                        {currentSection.faqs.map((faq, i) => {
                          const key = `${activeSection}-${i}`;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card overflow-hidden">
                              <button onClick={() => toggleItem(key)} className="flex w-full items-center justify-between p-5 text-left">
                                <div className="flex items-center gap-3">
                                  {currentSection.layout === "timeline" && (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-bold text-muted-foreground">{i + 1}</div>
                                  )}
                                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                                </div>
                                <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${openItems[key] ? "rotate-180" : ""}`} />
                              </button>
                              <AnimatePresence>
                                {openItems[key] && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Layout: grid */}
                    {currentSection.layout === "grid" && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {currentSection.faqs.map((faq, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20">
                            <h4 className="mb-3 font-heading text-sm font-bold text-foreground">{faq.q}</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Layout: two-column */}
                    {currentSection.layout === "two-column" && (
                      <div className="grid gap-6 md:grid-cols-2">
                        {currentSection.faqs.map((faq, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 font-mono text-xs font-bold text-foreground">{i + 1}</div>
                            <h4 className="mb-2 font-heading text-sm font-bold text-foreground">{faq.q}</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Layout: cards */}
                    {currentSection.layout === "cards" && (
                      <div className="space-y-4">
                        {currentSection.faqs.map((faq, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentSection.bg}`}>
                              <currentSection.icon size={18} className={currentSection.color} />
                            </div>
                            <div>
                              <h4 className="mb-2 font-heading text-sm font-bold text-foreground">{faq.q}</h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Layout: highlight */}
                    {currentSection.layout === "highlight" && (
                      <div className="space-y-4">
                        {currentSection.faqs.map((faq, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border p-6 transition-all ${i === 0 ? "border-skill-green/20 bg-skill-green/5" : "border-border bg-card hover:border-foreground/20"}`}>
                            <div className="flex items-start gap-4">
                              <Shield size={18} className={i === 0 ? "text-skill-green mt-0.5" : "text-muted-foreground mt-0.5"} />
                              <div>
                                <h4 className="mb-2 font-heading text-sm font-bold text-foreground">{faq.q}</h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </>
        )}

        {/* Quick Stats */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "Questions Answered", value: faqSections.reduce((a, s) => a + s.faqs.length, 0).toString(), sub: "across all categories" },
                { label: "Avg Response Time", value: "< 24h", sub: "for support tickets" },
                { label: "Satisfaction Rate", value: "98.5%", sub: "from user feedback" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <p className="font-heading text-3xl font-black text-foreground">{s.value}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Still need help CTA */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <HelpCircle size={32} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">Still have questions?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background">Contact Support</a>
              <a href="/help" className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-surface-2">Visit Help Center</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default FAQPage;
