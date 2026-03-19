import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins, ArrowLeftRight, Gavel, Users, Layers, FolderKanban, Shield, Star,
  Target, Trophy, Flame, Medal, Swords, Scale, Bot, GraduationCap,
  Zap, MessageSquare, PenTool, Video, FolderOpen, CheckCircle2, Sparkles,
  Building2, Search, Clock, Timer, Eye, Lock, FileText, TrendingUp,
  ArrowRight, ChevronRight, BarChart3, Gauge, GitBranch, Globe, Heart,
  Lightbulb, Mic, MonitorPlay, Palette, RefreshCw, Send, Settings,
  Smartphone, Workflow, Crown, Gem, Award, Play, X, ChevronDown, ExternalLink
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import CustomCursor from "@/components/shared/CustomCursor";
import CursorGlow from "@/components/shared/CursorGlow";
import PageTransition from "@/components/shared/PageTransition";
import Footer from "@/components/shared/Footer";

const featureCategories = [
  { id: "economy", label: "Skill Points", icon: Coins, color: "text-badge-gold", bg: "bg-badge-gold/10", tagline: "The internal currency powering fair exchanges" },
  { id: "formats", label: "Gig Formats", icon: ArrowLeftRight, color: "text-court-blue", bg: "bg-court-blue/10", tagline: "7 ways to exchange skills" },
  { id: "workspace", label: "Workspace", icon: MessageSquare, color: "text-foreground", bg: "bg-surface-2", tagline: "Your collaborative command center" },
  { id: "trust", label: "Trust & Quality", icon: Shield, color: "text-skill-green", bg: "bg-skill-green/10", tagline: "Multi-layered protection for every exchange" },
  { id: "gamification", label: "Gamification", icon: Trophy, color: "text-badge-gold", bg: "bg-badge-gold/10", tagline: "Level up, earn badges, climb ranks" },
  { id: "guilds", label: "Guilds", icon: Users, color: "text-court-blue", bg: "bg-court-blue/10", tagline: "Team up and conquer together" },
  { id: "court", label: "Skill Court", icon: Scale, color: "text-alert-red", bg: "bg-alert-red/10", tagline: "Fair, transparent dispute resolution" },
  { id: "ai", label: "AI Integration", icon: Bot, color: "text-foreground", bg: "bg-surface-2", tagline: "Intelligence woven into every feature" },
  { id: "enterprise", label: "Enterprise", icon: Building2, color: "text-foreground", bg: "bg-surface-2", tagline: "Vetted talent for your business" },
  { id: "events", label: "Events", icon: Trophy, color: "text-court-blue", bg: "bg-court-blue/10", tagline: "Compete, connect, and level up" },
  { id: "clips", label: "Clips", icon: Play, color: "text-skill-green", bg: "bg-skill-green/10", tagline: "Short-form content showcase" },
  { id: "analytics-dash", label: "Analytics", icon: BarChart3, color: "text-foreground", bg: "bg-surface-2", tagline: "Track your growth in detail" },
];

interface FeatureItem {
  icon: any;
  title: string;
  desc: string;
  highlight?: boolean;
  details?: string[];
  useCases?: string[];
  metrics?: { label: string; value: string }[];
}

interface FeatureSection {
  hero: { title: string; subtitle: string; stat?: { value: string; label: string }[] };
  video?: { thumbnail: string; title: string; duration: string; url: string };
  features: FeatureItem[];
  workflow?: Array<{ step: string; desc: string }>;
  bottomCTA?: { text: string; link: string };
}

const featureMap: Record<string, FeatureSection> = {
  economy: {
    hero: {
      title: "Skill Points Economy",
      subtitle: "A self-sustaining economy where skills have real value. Earn, spend, and grow your points through platform activity — not your wallet.",
      stat: [
        { value: "100 SP", label: "Signup bonus" },
        { value: "5%", label: "Transaction tax" },
        { value: "7+", label: "Earning methods" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop", title: "How Skill Points Work", duration: "2:34", url: "#" },
    features: [
      {
        icon: Coins, title: "Instant Signup Bonus", desc: "Every new account starts with 100 Skill Points — enough to begin your first exchange immediately. No credit card, no waiting.", highlight: true,
        details: ["Credited instantly upon email verification", "Enough to post your first gig or bid on an auction", "Bonus scales with referral chain (referred users get 120 SP)"],
        useCases: ["Post your first gig listing within minutes", "Bid on beginner-friendly auctions", "Tip someone for helpful forum advice"],
        metrics: [{ label: "Avg first gig", value: "< 24h" }, { label: "Activation rate", value: "89%" }],
      },
      {
        icon: ArrowLeftRight, title: "Fair Value Balancing", desc: "When skills have different market values, points balance the gap automatically. A 2-hour logo design might equal 1 hour of coding plus 15 SP.",
        details: ["AI suggests fair point differentials based on market data", "Both parties agree on point balance before starting", "Historical pricing data visible for transparency"],
        useCases: ["Swap design for development with point top-up", "Balance time differences in skill exchanges", "Negotiate fair value for niche expertise"],
      },
      {
        icon: Shield, title: "Anti-Inflation Tax", desc: "Both parties are taxed 5% on completion. This prevents point hoarding, funds platform operations, and maintains a healthy, circulating economy.",
        details: ["Tax applies only on successful completion", "Reduced to 3% for Gold tier, 2% for Platinum, 1% for guilds", "Tax revenue funds challenges, prizes, and platform development"],
      },
      {
        icon: Zap, title: "Multiple Earning Paths", desc: "Referrals (+50 SP), court duty (+10 SP), achievements (5–100 SP), daily challenges (+15 SP), streak bonuses (1.5x–3x multiplier), and Guild War winnings.",
        details: ["7+ distinct ways to earn points without spending", "Streak multipliers compound for consistent activity", "Seasonal events offer 5x earning opportunities"],
        metrics: [{ label: "Avg monthly earn", value: "850 SP" }, { label: "Top earner", value: "12K SP/mo" }],
      },
      {
        icon: Target, title: "Stage Insurance", desc: "Points are locked in escrow per stage. If someone abandons mid-gig, you keep all points for completed stages. Zero risk of total loss.",
        details: ["Automatic escrow on gig acceptance", "Released stage-by-stage upon approval", "Dispute triggers Skill Court review of escrow"],
      },
      {
        icon: BarChart3, title: "Market Intelligence", desc: "AI analyzes demand, complexity, and historical pricing to recommend fair point values. See real-time market rates for any skill before setting your price.",
        details: ["Live supply/demand heatmap for 200+ skill categories", "Price history charts for trend analysis", "Alert system for price spikes in your skills"],
      },
      {
        icon: TrendingUp, title: "Dynamic Pricing", desc: "Gig values fluctuate based on supply and demand. High-demand skills command premium rates. AI alerts you when your skills are trending.",
        details: ["Real-time price index updated every hour", "Push notifications when your skills spike in demand", "Seasonal trend reports with earning forecasts"],
      },
      {
        icon: RefreshCw, title: "Point Circulation", desc: "Tax revenue funds platform challenges, Guild War prizes, and seasonal events — keeping points flowing back to active users.",
        details: ["Monthly prize pools funded by transaction taxes", "Quarterly redistribution events for active users", "Guild War treasury bonuses from circulation fund"],
      },
    ],
    workflow: [
      { step: "Earn", desc: "Complete gigs, maintain streaks, win challenges" },
      { step: "Spend", desc: "Hire talent, bid on auctions, fund projects" },
      { step: "Grow", desc: "Reinvest in skills, unlock premium features" },
    ],
    bottomCTA: { text: "Start earning Skill Points", link: "/signup" },
  },
  formats: {
    hero: {
      title: "7 Gig Formats",
      subtitle: "Not every exchange is the same. Choose from seven distinct formats designed for different collaboration styles, from quick swaps to full product builds.",
      stat: [
        { value: "7", label: "Unique formats" },
        { value: "3x", label: "Flash bonus" },
        { value: "∞", label: "Possibilities" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop", title: "Choosing the Right Gig Format", duration: "3:12", url: "#" },
    features: [
      {
        icon: ArrowLeftRight, title: "Direct Swap", desc: "The classic 1-on-1 skill exchange. Trade your web development for someone's graphic design. Points balance any value difference.", highlight: true,
        details: ["1-on-1 matching with intelligent skill pairing", "Point balancing for unequal skill values", "Both parties taxed 5% on completion", "Built-in milestone tracking"],
        useCases: ["Trade coding for design work", "Exchange writing for video editing", "Swap tutoring for portfolio reviews"],
        metrics: [{ label: "Avg completion", value: "4.2 days" }, { label: "Satisfaction", value: "96%" }],
      },
      {
        icon: Gavel, title: "Auction", desc: "Post a task and let creators compete. Receive multiple submissions, review quality, and award the winner the most points.",
        details: ["Set minimum bid and deadline", "Receive multiple submissions from competitors", "Runners-up earn partial rewards (10-30%)", "Quality scoring on all submissions"],
      },
      {
        icon: Users, title: "Co-Creation Studio", desc: "Multi-person collaborative workspace with real-time whiteboard, video calls, and shared file library. Points split by role contribution.",
        details: ["Real-time whiteboard collaboration", "Integrated video conferencing", "Role-based point distribution", "Shared file library with version control"],
        metrics: [{ label: "Avg team size", value: "3.4" }, { label: "Project quality", value: "+28%" }],
      },
      {
        icon: Layers, title: "Skill Fusion", desc: "Multi-skill gigs where a single polymath or team of specialists collaborate. One person with UX + coding skills handles an entire app prototype.",
        details: ["Tag multiple skills per gig", "AI matches polymaths or specialist teams", "Milestone-based delivery tracking"],
      },
      {
        icon: FolderKanban, title: "Projects", desc: "Full product builds broken into sub-gigs with individual workspaces, milestone tracking, and team management.",
        details: ["Break projects into sub-gigs automatically", "Individual workspaces per sub-task", "Gantt chart view for timeline management", "Enterprise-grade reporting"],
      },
      {
        icon: Timer, title: "Flash Market", desc: "Time-limited gigs with 1.5x–3x point multipliers. They expire within hours, creating urgency and rewarding speed.",
        details: ["Gigs expire in 1-6 hours", "Point multipliers: 1.5x (6h), 2x (3h), 3x (1h)", "Real-time countdown visible to all", "Speed badges for consistent performers"],
        metrics: [{ label: "Avg response", value: "12 min" }, { label: "Completion rate", value: "94%" }],
      },
      {
        icon: TrendingUp, title: "Subscription Gigs", desc: "Set up recurring exchanges — weekly content creation for weekly design work. Both parties commit to a cadence with auto-renewal.",
        details: ["Weekly, bi-weekly, or monthly cadence", "Auto-renewal with cancellation anytime", "Loyalty bonuses after 4+ renewals"],
      },
      {
        icon: Layers, title: "Gig Bundling", desc: "Package multiple small tasks together for efficiency. Bundle 'logo + business card + social headers' into one streamlined exchange.",
        details: ["Combine 2-5 related tasks into one gig", "Discounted total point cost vs. individual gigs", "Single workspace for all bundled items"],
      },
      {
        icon: Coins, title: "Skill Rental", desc: "Pay points for consultation time. Not a full gig — just rent someone's expertise for 30–60 minute sessions.",
        details: ["Book 30 or 60 minute sessions", "Video call with screen sharing included", "Session recordings saved automatically", "Rate and review after each session"],
      },
    ],
    bottomCTA: { text: "Explore the Marketplace", link: "/marketplace" },
  },
  workspace: {
    hero: {
      title: "Collaborative Workspace",
      subtitle: "Every gig gets a dedicated workspace with real-time communication, collaborative tools, and AI-powered quality assurance.",
      stat: [
        { value: "5+", label: "Built-in tools" },
        { value: "Real-time", label: "Collaboration" },
        { value: "AI", label: "Quality checks" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=450&fit=crop", title: "Inside the Workspace", duration: "4:08", url: "#" },
    features: [
      {
        icon: MessageSquare, title: "Smart Messenger", desc: "Real-time chat with auto-translation (50+ languages), voice notes, file sharing, threaded conversations, and reactions.", highlight: true,
        details: ["Auto-translation in 50+ languages in real-time", "Voice note recording and playback", "Threaded conversations for organized discussions", "File sharing with inline preview"],
        useCases: ["Collaborate with international students", "Share quick audio feedback on designs", "Organize complex project discussions"],
        metrics: [{ label: "Languages", value: "50+" }, { label: "Avg response", value: "8 min" }],
      },
      {
        icon: PenTool, title: "Live Whiteboard", desc: "Built-in tldraw canvas for real-time brainstorming, wireframing, and visual collaboration.",
        details: ["Infinite canvas with shape tools", "Real-time multi-user cursors", "Export to PNG, SVG, or PDF", "Template library for wireframes and flows"],
      },
      {
        icon: Video, title: "Video Conferencing", desc: "Peer-to-peer video with HD quality, screen sharing, virtual backgrounds, and automatic recording.",
        details: ["HD video with adaptive quality", "Screen sharing with annotation tools", "Virtual backgrounds and blur", "Automatic recording saved to file library"],
        metrics: [{ label: "Max participants", value: "8" }, { label: "Recording storage", value: "90 days" }],
      },
      {
        icon: FolderOpen, title: "File Library", desc: "All shared files organized chronologically with version history, search, and preview. Supports 100+ file formats.",
        details: ["Version history with diff view", "Full-text search across all files", "Inline preview for images, PDFs, code", "Automatic backup and 90-day retention"],
      },
      {
        icon: CheckCircle2, title: "Stage Tracker", desc: "Visual progress tracking with point allocation per stage. Built-in insurance ensures you keep points for completed work.",
        details: ["Kanban-style stage visualization", "Point escrow released per stage", "Automatic notifications on stage completion", "Insurance claim process for abandonment"],
      },
      {
        icon: Sparkles, title: "AI Quality Panel", desc: "Real-time plagiarism detection, quality scoring (0–100), predicted buyer satisfaction, and delivery compliance checking.",
        details: ["Plagiarism check against internet and platform database", "Quality score based on 12 factors", "Satisfaction prediction with 91% accuracy", "Compliance checking against gig requirements"],
        metrics: [{ label: "Accuracy", value: "91%" }, { label: "Check time", value: "< 30s" }],
      },
      {
        icon: FileText, title: "Deliverable Submission", desc: "Submit final work through a structured process with AI quality checks, optional guild pre-approval, and buyer acceptance.",
        details: ["Pre-submission AI quality gate", "Optional guild member review", "Buyer acceptance with revision requests", "Automatic point release on acceptance"],
      },
    ],
    bottomCTA: { text: "See it in action", link: "/how-it-works" },
  },
  trust: {
    hero: {
      title: "Trust & Quality System",
      subtitle: "Six layers of protection ensure every exchange is fair, authentic, and high-quality.",
      stat: [
        { value: "6", label: "Protection layers" },
        { value: "< 1%", label: "Fraud rate" },
        { value: "24/7", label: "AI monitoring" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&h=450&fit=crop", title: "How We Keep You Safe", duration: "2:51", url: "#" },
    features: [
      {
        icon: Eye, title: "Progressive Work Reveal", desc: "Work shown in stages so buyers see real progress. AI predicts satisfaction at each stage.", highlight: true,
        details: ["Staged reveal prevents final-delivery surprises", "AI satisfaction prediction at each checkpoint", "Early course-correction recommendations", "Visual progress timeline for both parties"],
        metrics: [{ label: "Dispute reduction", value: "-62%" }, { label: "Satisfaction boost", value: "+23%" }],
      },
      {
        icon: Lock, title: "Transaction Codes", desc: "Every completed gig gets a unique, public verification code. Anyone can look up a transaction to confirm it happened.",
        details: ["Unique alphanumeric code per transaction", "Public lookup page for verification", "Quality scores and ratings visible", "Shareable verification badges"],
        useCases: ["Prove completed work to employers", "Verify collaborator history", "Add verified projects to your portfolio"],
      },
      {
        icon: Shield, title: "Digital Fingerprinting", desc: "All deliverables contain invisible digital fingerprints for authenticity verification.",
        details: ["Invisible watermarks embedded in all files", "Ownership verification via fingerprint lookup", "Protection against unauthorized redistribution", "Court-admissible evidence in disputes"],
      },
      {
        icon: Star, title: "Verified Reviews", desc: "Both parties rate only after completion and deliverable verification. AI detects coordinated manipulation.",
        details: ["Reviews locked until both parties complete", "Star ratings + written feedback required", "AI detection for fake or coordinated reviews", "Review history visible on profiles"],
      },
      {
        icon: Target, title: "Reputation Insurance", desc: "High-ELO users get priority in disputes, reduced tax rates, and enhanced credibility badges.",
        details: ["Platinum+ users get priority dispute resolution", "Reduced tax rates for high-reputation users", "Enhanced profile badges and marketplace placement", "Reputation recovery program for unfair hits"],
      },
      {
        icon: Bot, title: "AI Scam Detection", desc: "Pattern recognition monitors for fake accounts, suspicious behavior, and rating manipulation.",
        details: ["24/7 behavioral pattern monitoring", "Fake account detection within minutes", "Suspicious transaction flagging", "Automated review within 4 hours of flag"],
        metrics: [{ label: "Detection rate", value: "99.2%" }, { label: "False positive", value: "< 0.3%" }],
      },
    ],
    bottomCTA: { text: "Verify a transaction", link: "/transaction" },
  },
  gamification: {
    hero: {
      title: "Gamification Engine",
      subtitle: "Turn skill development into a game. Earn ELO, climb tiers, unlock achievements, and compete in seasonal events.",
      stat: [
        { value: "5", label: "Lifetime tiers" },
        { value: "50+", label: "Achievements" },
        { value: "3x", label: "Max streak bonus" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop", title: "Level Up Your Skills", duration: "3:45", url: "#" },
    features: [
      {
        icon: Target, title: "ELO Rating System", desc: "Chess-inspired rating that reflects skill and reliability. Affects search ranking, court eligibility, and matchmaking.", highlight: true,
        details: ["Starting ELO: 1000 for all new users", "Win/loss adjustments based on opponent ELO", "Separate ELO per skill category", "Decay prevention through consistent activity"],
        metrics: [{ label: "Avg ELO", value: "1,247" }, { label: "Top ELO", value: "2,891" }],
      },
      {
        icon: Medal, title: "Skill Mastery Levels", desc: "Per-skill progression: Beginner → Intermediate → Advanced → Expert → Master.",
        details: ["5 mastery levels per skill", "Each level requires more gigs and higher quality", "Masters get premium marketplace placement", "Visible badges on profile and listings"],
        useCases: ["Showcase expertise to potential collaborators", "Unlock premium gig opportunities", "Access expert-only marketplace sections"],
      },
      {
        icon: Trophy, title: "50+ Achievements", desc: "Badges for milestones with real benefits. 'Century Club' reduces tax, 'Perfectionist' unlocks priority matching.",
        details: ["50+ unique achievement badges", "Each badge has tangible platform benefits", "Rare badges for exceptional accomplishments", "Achievement showcase on profile"],
      },
      {
        icon: Flame, title: "Daily Streaks", desc: "Complete at least one gig activity daily. 7-day = 1.5x points, 14-day = 2x, 30-day = 3x multiplier.",
        details: ["Activity counts: gig progress, reviews, forum posts", "Streak freeze tokens available (earned, not bought)", "Visual streak calendar on dashboard", "Monthly streak leaderboard"],
        metrics: [{ label: "Avg streak", value: "11 days" }, { label: "Record streak", value: "247 days" }],
      },
      {
        icon: Swords, title: "Guild Wars", desc: "Weekly guild competitions on completion rate, quality scores, and member growth.",
        details: ["Bracket-style tournaments", "Balanced matchmaking by collective ELO", "Treasury bonuses for winning guilds", "Seasonal championship events"],
      },
      {
        icon: Crown, title: "Lifetime Tiers", desc: "Bronze → Silver → Gold → Platinum → Diamond. Each tier unlocks exclusive features.",
        details: ["Bronze: Default starting tier", "Silver: Reduced marketplace fees", "Gold: Reduced tax to 3%, priority support", "Platinum: 2% tax, beta features, priority matching", "Diamond: 1% tax, exclusive events, direct enterprise access"],
      },
      {
        icon: Sparkles, title: "Quarterly Wraps", desc: "Beautiful visual summary of your activity every 3 months — gigs, points, skills, and rank changes.",
        details: ["Shareable social media cards", "Detailed breakdown by skill category", "Comparison with previous quarters", "Personalized improvement recommendations"],
      },
      {
        icon: Award, title: "Milestone Celebrations", desc: "Animated celebrations on key milestones: 1st gig, 10th gig, 100th gig, reaching Gold tier, and more.",
        details: ["Custom animations for each milestone", "Shareable achievement cards", "Platform-wide announcement for rare milestones", "Cumulative milestone rewards"],
      },
    ],
    bottomCTA: { text: "View the Leaderboard", link: "/leaderboard" },
  },
  guilds: {
    hero: {
      title: "Guild System",
      subtitle: "Form teams, pool resources, compete together, and build a collective reputation.",
      stat: [
        { value: "50+", label: "Active guilds" },
        { value: "Treasury", label: "Shared economy" },
        { value: "Wars", label: "Weekly events" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=450&fit=crop", title: "Building Your Guild", duration: "3:28", url: "#" },
    features: [
      {
        icon: Coins, title: "Shared Treasury", desc: "Pool Skill Points into a collective fund. Treasury covers member taxes, funds training gigs, and grows through Guild War winnings.", highlight: true,
        details: ["Democratic allocation through guild voting", "Auto-contribution settings (% of earnings)", "Treasury audit log visible to all members", "Emergency fund for member disputes"],
        metrics: [{ label: "Avg treasury", value: "8,400 SP" }, { label: "Largest", value: "142K SP" }],
      },
      {
        icon: ArrowLeftRight, title: "Point Lending", desc: "Members can borrow from the treasury for gigs they can't afford. Interest-free within the guild.",
        details: ["Interest-free borrowing for guild members", "Automatic repayment from next earnings", "Borrowing limits based on member ELO", "Lending history visible to guild leaders"],
      },
      {
        icon: FolderKanban, title: "Gig Delegation", desc: "Guild leaders receive incoming project requests and delegate tasks to the right specialist.",
        details: ["Smart matching based on skill and availability", "Leader dashboard with incoming requests", "Performance tracking per member", "Client relationship management"],
      },
      {
        icon: Swords, title: "Guild Wars", desc: "Weekly competitive events matched by collective ELO. Winners get treasury bonuses.",
        details: ["Bracket-style tournament format", "Metrics: completion rate, quality, activity", "Live leaderboard during events", "Seasonal championships with premium rewards"],
        metrics: [{ label: "Active wars/week", value: "12" }, { label: "Prize pool", value: "25K SP" }],
      },
      {
        icon: CheckCircle2, title: "Quality Control", desc: "Guild members can review each other's deliverables before submission.",
        details: ["Internal QA workflow before client delivery", "Peer review checklists per skill type", "Quality metrics tracked per reviewer", "Guild reputation tied to delivery quality"],
      },
      {
        icon: Target, title: "Collective ELO", desc: "Guild rating is the weighted average of member ELOs. Higher guild ELO means better matchmaking.",
        details: ["Weighted by member activity level", "Affects Guild War matchmaking tier", "Premium marketplace placement for high-ELO guilds", "Enterprise visibility for top-ranked guilds"],
      },
      {
        icon: FolderOpen, title: "Guild Portfolio", desc: "A public showcase page with the guild's best work, member profiles, and client testimonials.",
        details: ["Customizable guild landing page", "Curated project showcase", "Member profiles with roles and specialties", "Client testimonials and case studies"],
      },
    ],
    bottomCTA: { text: "Find a Guild", link: "/marketplace" },
  },
  court: {
    hero: {
      title: "Skill Court",
      subtitle: "When disputes arise, Skill Court provides fair, transparent resolution with community members, AI analysis, and domain experts.",
      stat: [
        { value: "48h", label: "Avg resolution" },
        { value: "3-panel", label: "Hybrid judges" },
        { value: "1", label: "Appeal allowed" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop", title: "How Skill Court Works", duration: "4:22", url: "#" },
    features: [
      {
        icon: Scale, title: "Hybrid Judging Panel", desc: "25% community users, 25% AI analysis, 50% high-ELO domain experts. Balanced and fair.", highlight: true,
        details: ["Random selection from eligible community pool", "AI reviews all workspace evidence automatically", "Domain experts matched by relevant skill", "Unanimous verdict required for major penalties"],
        metrics: [{ label: "Avg resolution", value: "38 hours" }, { label: "Satisfaction", value: "94%" }],
      },
      {
        icon: Bot, title: "AI Evidence Analysis", desc: "AI reviews all workspace data: messages, files, recordings, and deliverables.",
        details: ["Natural language analysis of all communications", "File comparison and plagiarism detection", "Timeline reconstruction of events", "Behavioral pattern analysis for both parties"],
      },
      {
        icon: GraduationCap, title: "Expert Panels", desc: "Judges are matched by skill relevance. A design dispute gets design experts.",
        details: ["Minimum Gold tier required for judge eligibility", "Skill-matched judge selection", "Judges earn 25 SP per case", "Judge ELO system for consistent fairness"],
        useCases: ["Design quality disputes reviewed by designers", "Code quality issues assessed by developers", "Content disputes judged by writing experts"],
      },
      {
        icon: Shield, title: "Appeal System", desc: "Each party gets one appeal per case. Appeals reviewed by Platinum+ judges.",
        details: ["One appeal per party, per case", "Higher-ELO panel for appeal review", "Appeal decisions are final and binding", "New evidence can be submitted with appeal"],
      },
      {
        icon: Coins, title: "Judge Rewards", desc: "Community judges earn 10 SP per case. Expert judges earn 25 SP.",
        details: ["Community judges: 10 SP per case", "Expert judges: 25 SP per case", "Bonus SP for consistent, fair judging", "Judge badges unlock at 10, 50, 100 cases"],
      },
      {
        icon: Target, title: "ELO Impact", desc: "Verdicts adjust both parties' ELO proportionally to case severity.",
        details: ["Proportional ELO adjustment by severity", "Escalating penalties for repeat offenders", "Clean record bonuses for stability", "ELO recovery program for unfair verdicts"],
      },
      {
        icon: Users, title: "Community Duty", desc: "Free tier users must serve as judges when called — it's part of the community contract.",
        details: ["Mandatory for Free tier users", "Declining reduces gig privileges temporarily", "Serving earns rewards and builds reputation", "Opt-out available for Pro tier users"],
      },
    ],
    bottomCTA: { text: "Learn more about disputes", link: "/help" },
  },
  ai: {
    hero: {
      title: "AI Integration",
      subtitle: "AI isn't a feature — it's woven into every layer. From gig creation to dispute resolution, intelligence augments every interaction.",
      stat: [
        { value: "6", label: "Integration points" },
        { value: "Real-time", label: "Analysis" },
        { value: "50+", label: "Languages" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop", title: "AI-Powered Platform Tour", duration: "5:15", url: "#" },
    features: [
      {
        icon: Sparkles, title: "Smart Gig Creation", desc: "AI suggests optimal pricing, predicts demand, recommends timing, and writes compelling gig descriptions.", highlight: true,
        details: ["Auto-generated gig descriptions from brief inputs", "Optimal pricing based on market analysis", "Best posting time recommendations", "Demand prediction for your skill set"],
        metrics: [{ label: "Time saved", value: "73%" }, { label: "Match rate", value: "+45%" }],
      },
      {
        icon: Bot, title: "Workspace Intelligence", desc: "Quality checks on deliverables, plagiarism detection, version comparison, and delivery compliance verification.",
        details: ["Real-time quality scoring (0-100)", "Internet-wide plagiarism scanning", "Version diff highlighting", "Requirement compliance checklist"],
      },
      {
        icon: Scale, title: "Court Analysis", desc: "AI serves as 25% of the judging panel. Reviews evidence, detects patterns, and provides structured recommendations.",
        details: ["Automated evidence review and timeline reconstruction", "Communication sentiment analysis", "Pattern detection across historical cases", "Structured verdict recommendations"],
      },
      {
        icon: Target, title: "Profile Optimization", desc: "Portfolio improvement suggestions, skill gap analysis, and personalized learning recommendations.",
        details: ["Portfolio layout and content suggestions", "Skill gap analysis based on market demand", "Personalized learning path recommendations", "Case study generation assistance"],
        useCases: ["Optimize your profile for higher visibility", "Identify high-demand skills to learn", "Generate professional case studies from gig history"],
      },
      {
        icon: Search, title: "Semantic Search", desc: "Natural language search across the marketplace. Ask for what you need in plain English.",
        details: ["Natural language query processing", "Context-aware result ranking", "Skill inference from descriptions", "Related suggestion engine"],
      },
      {
        icon: Shield, title: "Trust & Safety AI", desc: "24/7 behavioral monitoring, fake account detection, scam pattern recognition, and content moderation.",
        details: ["Continuous behavioral monitoring", "Fake account detection in < 5 minutes", "Scam pattern database with 10K+ signatures", "Multi-language content moderation"],
        metrics: [{ label: "Uptime", value: "99.99%" }, { label: "Response time", value: "< 200ms" }],
      },
    ],
    bottomCTA: { text: "Experience AI matching", link: "/marketplace" },
  },
  enterprise: {
    hero: {
      title: "Enterprise Mode",
      subtitle: "Access vetted, high-ELO student talent with enterprise-grade security, project management, and seamless hire-to-full-time pipelines.",
      stat: [
        { value: "1000+", label: "Vetted experts" },
        { value: "NDA", label: "Built-in" },
        { value: "API", label: "Custom integration" },
      ],
    },
    video: { thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop", title: "Enterprise Platform Demo", duration: "6:30", url: "#" },
    features: [
      {
        icon: Building2, title: "Vetted Expert Pool", desc: "Access curated talent: minimum Gold tier, 4.5+ star rating, 50+ completed gigs, and AI quality assessment.", highlight: true,
        details: ["Minimum requirements: Gold tier (1000+ ELO)", "4.5+ star rating across all gigs", "50+ successfully completed gigs", "Additional background checks available"],
        metrics: [{ label: "Vetted experts", value: "1,200+" }, { label: "Avg rating", value: "4.8" }],
      },
      {
        icon: Search, title: "AI-Powered Matching", desc: "Describe your project and our AI matches you with the best-fit experts based on skills, availability, and performance.",
        details: ["Multi-factor matching algorithm", "Availability and timezone optimization", "Communication style compatibility", "Past performance on similar projects"],
        useCases: ["Find React developers for a 2-week sprint", "Match with designers for brand refresh", "Hire content team for product launch"],
      },
      {
        icon: Users, title: "Direct Hire Pipeline", desc: "Track candidate performance across gigs. Convert to full-time with comprehensive performance data.",
        details: ["Performance tracking across multiple gigs", "Interview scheduling integration", "Comprehensive performance reports", "Offer management workflow"],
      },
      {
        icon: Shield, title: "NDA & IP Protection", desc: "Automatic NDA coverage on all enterprise gigs. Full IP transfer agreements available.",
        details: ["Auto-NDA on enterprise gig creation", "Full IP transfer agreements", "Digital fingerprinting on all deliverables", "Legal team support for custom agreements"],
      },
      {
        icon: FolderKanban, title: "Project Dashboard", desc: "Full project management with milestone tracking, team analytics, budget monitoring, and real-time status.",
        details: ["Gantt chart and Kanban views", "Team performance analytics", "Budget tracking and forecasting", "Real-time status updates and alerts"],
      },
      {
        icon: Settings, title: "Custom Integrations", desc: "Connect with Slack, Jira, Notion, GitHub, Figma, and 50+ tools via API.",
        details: ["50+ pre-built integrations", "Custom webhook configurations", "REST and GraphQL API access", "Dedicated integration support team"],
        metrics: [{ label: "Integrations", value: "50+" }, { label: "API uptime", value: "99.9%" }],
      },
    ],
    bottomCTA: { text: "Request a demo", link: "/enterprise" },
  },
  events: {
    hero: {
      title: "Events & Tournaments",
      subtitle: "Compete in skill challenges, attend workshops, join meetups, and participate in Guild Wars — there's always something happening on SkillSwappr.",
      stat: [
        { value: "340+", label: "Events hosted" },
        { value: "48K+", label: "Participants" },
        { value: "1.2M SP", label: "Prizes awarded" },
      ],
    },
    features: [
      {
        icon: Trophy, title: "Competitive Tournaments", desc: "Bracket-style competitions across design, development, writing, and more. Earn SP prizes and exclusive badges.", highlight: true,
        details: ["Multiple formats: solo, duo, team", "ELO-based matchmaking for fair competition", "Live leaderboards during events", "Seasonal championships with premium rewards"],
        metrics: [{ label: "Avg participants", value: "256" }, { label: "Prize pools", value: "50K SP" }],
      },
      {
        icon: Swords, title: "Guild Wars", desc: "Weekly guild-vs-guild competitions. Strategy, teamwork, and collective skill determine the champion.",
        details: ["5-round elimination format", "Metrics: completion rate, quality, activity", "Treasury bonuses for winning guilds", "Season-long standings and playoffs"],
      },
      {
        icon: Globe, title: "In-Person Meetups", desc: "Local events in London, NYC, Berlin, Toronto, Singapore, and Tokyo. Network, swap skills, and get exclusive swag.",
        details: ["Monthly events in 6+ cities", "Lightning talks and demos", "Exclusive merchandise for attendees", "Community-organized satellite events"],
      },
      {
        icon: Lightbulb, title: "Workshops & AMAs", desc: "Hands-on learning sessions and Ask Me Anything events with founders, top swappers, and industry experts.",
        details: ["Live coding and design sessions", "Q&A with platform founders", "Skill-building bootcamps", "Recording available for 30 days"],
      },
      {
        icon: Award, title: "Event Rewards", desc: "Earn exclusive badges, SP prizes, ELO boosts, and featured profile placement through event participation.",
        details: ["Event-specific achievement badges", "SP prizes for top performers", "ELO multiplier for tournament wins", "Homepage feature for champions"],
      },
    ],
    bottomCTA: { text: "View Events Calendar", link: "/events" },
  },
  clips: {
    hero: {
      title: "Clips",
      subtitle: "Short-form content that showcases your skills and builds your brand on the platform.",
      stat: [
        { value: "15–60s", label: "Clip length" },
        { value: "6", label: "Pinned to profile" },
        { value: "SP", label: "Earned via engagement" },
      ],
    },
    features: [
      {
        icon: Play, title: "Visual Portfolio Feed", desc: "Showcase your work through short videos and images. Timelapses, before/afters, tutorials, and process breakdowns.", highlight: true,
        details: ["15–60 second video clips", "Image carousels with captions", "Auto-generated thumbnails", "Category tagging for discoverability"],
        metrics: [{ label: "Avg views", value: "1.2K" }, { label: "Engagement", value: "+34%" }],
      },
      {
        icon: Heart, title: "Engagement Rewards", desc: "Earn SP through likes, shares, and saves on your clips. Popular clips get boosted visibility.",
        details: ["SP earned per engagement milestone", "Trending clips featured on Discover page", "Weekly top clips showcase", "Share clips to external platforms"],
      },
      {
        icon: Star, title: "Profile Pinning", desc: "Pin up to 6 clips to your profile's portfolio section for maximum visibility to potential collaborators.",
        details: ["Drag-and-drop pin ordering", "Clips appear alongside portfolio items", "Analytics per pinned clip", "Seasonal pin themes"],
      },
      {
        icon: Sparkles, title: "AI Enhancement", desc: "AI suggests optimal posting times, generates captions, and recommends trending formats for maximum reach.",
        details: ["Best time to post recommendations", "Auto-generated captions and tags", "Trending format suggestions", "Performance prediction before posting"],
      },
    ],
    bottomCTA: { text: "Start Creating Clips", link: "/clips" },
  },
  "analytics-dash": {
    hero: {
      title: "Analytics Dashboard",
      subtitle: "Deep insights into your performance, growth, and marketplace position with real-time data visualization.",
      stat: [
        { value: "Real-time", label: "Data updates" },
        { value: "12+", label: "Metric types" },
        { value: "Custom", label: "Date ranges" },
      ],
    },
    features: [
      {
        icon: BarChart3, title: "Performance Overview", desc: "Track gigs completed, SP earned, rating trends, and ELO progression over time.", highlight: true,
        details: ["Interactive time-series charts", "Custom date range selection", "Comparison with platform averages", "Export data as CSV"],
        metrics: [{ label: "Metrics tracked", value: "12+" }, { label: "Update frequency", value: "Real-time" }],
      },
      {
        icon: TrendingUp, title: "Growth Tracking", desc: "Monitor your skill progression, tier advancement, and marketplace ranking over time.",
        details: ["Skill-by-skill progression charts", "Tier advancement timeline", "Ranking position history", "Growth velocity indicators"],
      },
      {
        icon: Target, title: "Goal Setting", desc: "Set personal targets for gigs, SP, and ELO. Track progress with visual indicators and milestone alerts.",
        details: ["Custom goal creation", "Progress bars and percentages", "Email alerts on milestone completion", "Streak and consistency tracking"],
      },
      {
        icon: Gauge, title: "Market Position", desc: "See where you rank in your skill categories, how your pricing compares, and which skills are trending.",
        details: ["Category-specific rankings", "Price benchmarking tool", "Demand trend analysis", "Competitor comparison (anonymized)"],
      },
    ],
    bottomCTA: { text: "View Your Analytics", link: "/analytics" },
  },
};

/* ───── Expandable Feature Card ───── */
const FeatureCard = ({ feature, index, categoryColor, categoryBg }: { feature: FeatureItem; index: number; categoryColor: string; categoryBg: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group rounded-2xl border overflow-hidden transition-all duration-300 ${
        feature.highlight
          ? "border-foreground/20 bg-foreground/[0.03]"
          : "border-border bg-card hover:border-foreground/20"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            feature.highlight ? `${categoryBg} ${categoryColor}` : "bg-surface-2 text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground"
          }`}>
            <feature.icon size={20} />
          </div>
          {(feature.details || feature.useCases || feature.metrics) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} />
              </motion.div>
            </button>
          )}
        </div>
        <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
        {feature.highlight && (
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground">
            <Star size={12} className="text-badge-gold" /> Core Feature
          </div>
        )}

        {/* Inline metrics */}
        {feature.metrics && !expanded && (
          <div className="mt-4 flex gap-4">
            {feature.metrics.map((m) => (
              <div key={m.label} className="text-center">
                <p className="font-mono text-sm font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded detail section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-6 py-5 space-y-5 bg-surface-1/50">
              {/* Details list */}
              {feature.details && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</h4>
                  <ul className="space-y-1.5">
                    {feature.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="text-skill-green mt-0.5 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Use cases */}
              {feature.useCases && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.useCases.map((uc, i) => (
                      <span key={i} className="rounded-full bg-surface-2 px-3 py-1 text-[11px] text-muted-foreground">{uc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {feature.metrics && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Metrics</h4>
                  <div className="flex gap-6">
                    {feature.metrics.map((m) => (
                      <div key={m.label}>
                        <p className="font-mono text-lg font-black text-foreground">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ───── Video Preview Component ───── */
const VideoPreview = ({ video }: { video: { thumbnail: string; title: string; duration: string; url: string } }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-12 overflow-hidden rounded-2xl border border-border bg-card group cursor-pointer"
  >
    <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/90 backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play size={24} className="text-background ml-1" fill="currentColor" />
        </motion.div>
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-4 right-4 rounded-lg bg-background/80 backdrop-blur-sm px-2.5 py-1 font-mono text-xs text-foreground">
        {video.duration}
      </div>
    </div>
    <div className="p-5 flex items-center justify-between">
      <div>
        <h3 className="font-heading text-sm font-bold text-foreground">{video.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Watch the walkthrough</p>
      </div>
      <ExternalLink size={14} className="text-muted-foreground" />
    </div>
  </motion.div>
);

const FeaturesPage = () => {
  const [active, setActive] = useState("economy");
  const currentCategory = featureCategories.find((c) => c.id === active)!;
  const currentData = featureMap[active];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <CustomCursor />
        <CursorGlow />
        <Navbar />

        {/* Hero */}
        <section className="relative flex items-center justify-center overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--silver)/0.05),transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-block rounded-full border border-border bg-surface-2 px-4 py-1.5 font-mono text-xs text-muted-foreground">Platform Features</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="mb-6 font-heading text-5xl font-black text-foreground sm:text-6xl lg:text-7xl">
              Everything You Need to{" "}<span className="text-muted-foreground">Swap Skills</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-auto max-w-xl text-lg text-muted-foreground">
              9 feature categories, 60+ capabilities. Explore every tool, system, and innovation powering the SkillSwappr platform.
            </motion.p>
          </div>
        </section>

        {/* Sticky Category Tabs */}
        <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-3 scrollbar-hide">
            {featureCategories.map((cat) => (
              <motion.button key={cat.id} onClick={() => setActive(cat.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${active === cat.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                <cat.icon size={14} />
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feature Content */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>

                {/* Section Hero */}
                <div className="mb-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${currentCategory.bg}`}>
                      <currentCategory.icon size={28} className={currentCategory.color} />
                    </div>
                    <div>
                      <h2 className="font-heading text-3xl font-bold text-foreground">{currentData.hero.title}</h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{currentData.hero.subtitle}</p>
                    </div>
                  </div>
                  {currentData.hero.stat && (
                    <div className="flex gap-6">
                      {currentData.hero.stat.map((s) => (
                        <div key={s.label} className="text-center">
                          <p className="font-heading text-2xl font-black text-foreground">{s.value}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Preview */}
                {currentData.video && <VideoPreview video={currentData.video} />}

                {/* Feature Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {currentData.features.map((feature, i) => (
                    <FeatureCard
                      key={feature.title}
                      feature={feature}
                      index={i}
                      categoryColor={currentCategory.color}
                      categoryBg={currentCategory.bg}
                    />
                  ))}
                </div>

                {/* Workflow Steps */}
                {currentData.workflow && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 rounded-2xl border border-border bg-card p-8">
                    <h3 className="mb-6 text-center font-heading text-lg font-bold text-foreground">How It Works</h3>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
                      {currentData.workflow.map((w, i) => (
                        <div key={w.step} className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-mono text-sm font-bold text-background">{i + 1}</div>
                            <p className="font-heading text-sm font-bold text-foreground">{w.step}</p>
                            <p className="max-w-[160px] text-xs text-muted-foreground">{w.desc}</p>
                          </div>
                          {i < currentData.workflow!.length - 1 && <ChevronRight size={16} className="hidden text-muted-foreground sm:block" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Bottom CTA */}
                {currentData.bottomCTA && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-10 text-center">
                    <a href={currentData.bottomCTA.link} className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:opacity-90">
                      {currentData.bottomCTA.text} <ArrowRight size={16} />
                    </a>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Global Stats */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 sm:grid-cols-4">
              {[
                { value: "60+", label: "Features" },
                { value: "9", label: "Categories" },
                { value: "7", label: "Gig Formats" },
                { value: "AI", label: "Powered" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <p className="font-heading text-4xl font-black text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default FeaturesPage;
