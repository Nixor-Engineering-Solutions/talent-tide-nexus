import { useState, useMemo } from "react";
import { validateEmail } from "@/lib/email-validation";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, GraduationCap, CheckCircle2, Github,
  Circle, AlertCircle, Camera, Globe, Briefcase, Tag, Link2, Shield, Play, SkipForward,
  Upload, Award, Users, MessageSquare, Zap, BookOpen, Star, Sparkles, FileText, IdCard,
  MapPin, Languages, Clock, Heart, ChevronRight, Plus, X, FolderOpen, FileBadge, Image,
  ShoppingCart, Wrench, Package, Building2, Calendar, Trash2, Hash, Palette, Music,
  Dumbbell, Gamepad2, Plane, Coffee, PenTool, Code, Megaphone, Trophy, Instagram, Twitter, Youtube
} from "lucide-react";
import PageTransition from "@/components/shared/PageTransition";
import { useAuth } from "@/lib/auth-context";
import { logFormSubmission, logInteraction } from "@/lib/activity-logger";

const TOTAL_STEPS = 12;

const passwordCriteria = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const allSkills = [
  "UI/UX Design", "Web Development", "Mobile Dev", "Video Editing", "Copywriting",
  "Data Science", "Marketing", "Illustration", "Photography", "3D Modeling",
  "Animation", "Music Production", "SEO", "Graphic Design", "Game Dev",
  "AI/ML", "Cybersecurity", "Cloud/DevOps", "Technical Writing", "Social Media",
  "Accounting", "Legal Consulting", "Translation", "Voice Over", "Tutoring",
  "Event Planning", "Interior Design", "Fashion Design", "Nutrition", "Fitness Coaching",
];

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

const defaultLanguages = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese",
  "Korean", "Portuguese", "Arabic", "Hindi", "Russian", "Italian",
  "Dutch", "Turkish", "Thai", "Swahili", "Polish", "Vietnamese",
];

const needCategories = [
  { label: "I need a website", icon: Globe, desc: "Landing pages, portfolios, web apps" },
  { label: "I need a logo / brand", icon: Image, desc: "Logos, brand identity, style guides" },
  { label: "I need marketing help", icon: ShoppingCart, desc: "Ads, SEO, social media, copywriting" },
  { label: "I need an app built", icon: Package, desc: "Mobile or web applications" },
  { label: "I need video content", icon: Play, desc: "Editing, motion graphics, YouTube" },
  { label: "I need tutoring", icon: BookOpen, desc: "Academic help, exam prep, skills coaching" },
  { label: "I need business help", icon: Briefcase, desc: "Strategy, finance, legal, planning" },
  { label: "I need tech support", icon: Wrench, desc: "Bug fixes, migrations, DevOps" },
  { label: "I need creative work", icon: Sparkles, desc: "Art, music, writing, photography" },
  { label: "I need data work", icon: FileText, desc: "Analysis, dashboards, ML models" },
  { label: "I need translations", icon: Languages, desc: "Documents, apps, subtitles" },
  { label: "Something else", icon: Star, desc: "Tell us what you need" },
];

const defaultAvatars = [
  { id: "av1", bg: "bg-court-blue/20", text: "text-court-blue", emoji: "🎨" },
  { id: "av2", bg: "bg-skill-green/20", text: "text-skill-green", emoji: "💻" },
  { id: "av3", bg: "bg-badge-gold/20", text: "text-badge-gold", emoji: "🚀" },
  { id: "av4", bg: "bg-destructive/20", text: "text-destructive", emoji: "🎵" },
  { id: "av5", bg: "bg-foreground/10", text: "text-foreground", emoji: "📸" },
  { id: "av6", bg: "bg-court-blue/20", text: "text-court-blue", emoji: "✍️" },
  { id: "av7", bg: "bg-skill-green/20", text: "text-skill-green", emoji: "🎮" },
  { id: "av8", bg: "bg-badge-gold/20", text: "text-badge-gold", emoji: "📊" },
];

const interestOptions = [
  { label: "Art & Design", icon: Palette },
  { label: "Music", icon: Music },
  { label: "Fitness", icon: Dumbbell },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Travel", icon: Plane },
  { label: "Photography", icon: Camera },
  { label: "Cooking", icon: Coffee },
  { label: "Writing", icon: PenTool },
  { label: "Coding", icon: Code },
  { label: "Entrepreneurship", icon: Megaphone },
  { label: "Sports", icon: Trophy },
  { label: "Reading", icon: BookOpen },
  { label: "Volunteering", icon: Heart },
  { label: "Film & TV", icon: Play },
  { label: "Science", icon: Sparkles },
  { label: "Fashion", icon: Star },
];

const platformTourSteps = [
  { icon: Briefcase, title: "Post & Browse Gigs", desc: "List your skills or find what you need. Choose from 7 gig formats including auctions and co-creation." },
  { icon: Zap, title: "Earn Skill Points", desc: "Complete gigs to earn SP — our cashless currency. No wallets, no fees, just skills." },
  { icon: MessageSquare, title: "Collaborate in Workspaces", desc: "Each gig gets a private workspace with messenger, whiteboard, video calls, and file sharing." },
  { icon: Shield, title: "Trust & Skill Court", desc: "ELO ratings, community judges, and AI analysis keep every exchange fair and transparent." },
  { icon: Users, title: "Join Guilds", desc: "Team up with like-minded swappers, compete in Guild Wars, and build your reputation together." },
  { icon: Award, title: "Level Up & Earn Badges", desc: "Progress through tiers, unlock achievements, and showcase your expertise with verified badges." },
];

interface WorkEntry {
  title: string;
  company: string;
  startYear: string;
  endYear: string;
  current: boolean;
  description: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
  current: boolean;
}

const emptyWork: WorkEntry = { title: "", company: "", startYear: "", endYear: "", current: false, description: "" };
const emptyEdu: EducationEntry = { degree: "", institution: "", field: "", startYear: "", endYear: "", current: false };

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();
  const { signup, updateProfile } = useAuth();

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2: Profile
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [slogan, setSlogan] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState<string | null>(null);

  // Step 3: Details
  const [university, setUniversity] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [personalWebsite, setPersonalWebsite] = useState("");

  // Step 4: Work History
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([{ ...emptyWork }]);

  // Step 5: Education History
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([{ ...emptyEdu }]);

  // Step 6: Skills (what you CAN offer)
  const [skills, setSkills] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<Record<string, string>>({});
  const [customSkill, setCustomSkill] = useState("");

  // Step 7: What you NEED
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [customNeed, setCustomNeed] = useState("");

  // Step 8: Portfolio & Certificates
  const [certificates, setCertificates] = useState<{ name: string; file: string }[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<{ name: string; file: string; type: string }[]>([]);

  // Step 9: Interests & Hobbies
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");

  // Step 10: Preferences
  const [availability, setAvailability] = useState("Part-time");
  const [responseTime, setResponseTime] = useState("Within 24 hours");
  const [referralCode, setReferralCode] = useState("");
  const [timezone, setTimezone] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [preferredComm, setPreferredComm] = useState("Chat");

  // Step 11: Verification (skippable)
  const [idUploaded, setIdUploaded] = useState(false);

  // Step 12: Platform tour

  const criteriaMet = useMemo(() => passwordCriteria.map((c) => c.test(password)), [password]);
  const passedCount = criteriaMet.filter(Boolean).length;
  const strengthLabel = passedCount <= 1 ? "Weak" : passedCount <= 3 ? "Fair" : passedCount <= 4 ? "Good" : "Strong";
  const strengthColor = passedCount <= 1 ? "bg-destructive" : passedCount <= 3 ? "bg-badge-gold" : "bg-skill-green";
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const emailError = useMemo(() => {
    return email.trim() ? (validateEmail(email) === true ? "" : validateEmail(email) as string) : "";
  }, [email]);
  const canContinueStep1 = name.trim() && email.trim() && !emailError && passedCount >= 4 && passwordsMatch;

  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleLanguage = (l: string) => setSelectedLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  const toggleNeed = (n: string) => setSelectedNeeds((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);
  const toggleInterest = (i: string) => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setCustomSkill("");
    }
  };

  const addCustomLanguage = () => {
    const trimmed = customLanguage.trim();
    if (trimmed && !selectedLanguages.includes(trimmed)) {
      setSelectedLanguages((prev) => [...prev, trimmed]);
      setCustomLanguage("");
    }
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setCustomInterest("");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDefaultAvatar(null);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectDefaultAvatar = (id: string) => {
    setSelectedDefaultAvatar(id);
    setAvatarPreview(null);
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificates((prev) => [...prev, { name: file.name, file: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith("image/") ? "image" : "document";
        setPortfolioItems((prev) => [...prev, { name: file.name, file: reader.result as string, type }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateWork = (idx: number, field: keyof WorkEntry, value: string | boolean) => {
    setWorkHistory(prev => prev.map((w, i) => i === idx ? { ...w, [field]: value } : w));
  };

  const addWorkEntry = () => setWorkHistory(prev => [...prev, { ...emptyWork }]);
  const removeWorkEntry = (idx: number) => setWorkHistory(prev => prev.filter((_, i) => i !== idx));

  const updateEdu = (idx: number, field: keyof EducationEntry, value: string | boolean) => {
    setEducationHistory(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addEduEntry = () => setEducationHistory(prev => [...prev, { ...emptyEdu }]);
  const removeEduEntry = (idx: number) => setEducationHistory(prev => prev.filter((_, i) => i !== idx));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const inputClass = "h-11 w-full rounded-xl border border-border bg-surface-1 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none";
  const inputClassShort = "h-10 w-full rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none";

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-6 text-center">
            <Link to="/" className="inline-block font-heading text-2xl font-bold text-foreground">
              Skill<span className="text-muted-foreground">Swappr</span>
            </Link>
          </div>

          {/* Progress */}
          <div className="mb-2 flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-foreground" : "bg-border"}`} />
            ))}
          </div>
          <p className="mb-6 text-center text-[10px] text-muted-foreground">
            Step {step} of {TOTAL_STEPS} — {[1, 2, 3, 6, 7, 8].includes(step) ? <span className="text-foreground font-semibold">Required</span> : <span className="text-muted-foreground">Optional</span>}
          </p>

          <motion.div className="rounded-2xl border border-border bg-card p-7 sm:p-9" layout>
            <AnimatePresence mode="wait">

              {/* ═══ STEP 1: Account ═══ */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Create your account</h1>
                  <p className="mb-4 text-sm text-muted-foreground">Start your skill exchange journey.</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`h-11 w-full rounded-xl border ${emailError ? "border-destructive" : "border-border"} bg-surface-1 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none`} />
                    </div>
                    {emailError && <p className="text-xs text-destructive -mt-1 ml-1">{emailError}</p>}
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-surface-1 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>

                    {password.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Password strength</span>
                          <span className={`text-[10px] font-semibold ${passedCount <= 1 ? "text-destructive" : passedCount <= 3 ? "text-badge-gold" : "text-skill-green"}`}>{strengthLabel}</span>
                        </div>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < passedCount ? strengthColor : "bg-border"}`} />
                          ))}
                        </div>
                        <div className="space-y-1">
                          {passwordCriteria.map((c, i) => (
                            <div key={c.label} className="flex items-center gap-2">
                              {criteriaMet[i] ? <CheckCircle2 size={12} className="text-skill-green shrink-0" /> : <Circle size={12} className="text-muted-foreground/40 shrink-0" />}
                              <span className={`text-[10px] ${criteriaMet[i] ? "text-skill-green" : "text-muted-foreground/60"}`}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`h-11 w-full rounded-xl border bg-surface-1 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${passwordsMismatch ? "border-destructive" : passwordsMatch ? "border-skill-green/50" : "border-border"}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                    {passwordsMismatch && <p className="flex items-center gap-1 text-[10px] text-destructive"><AlertCircle size={11} /> Passwords don't match</p>}
                    {passwordsMatch && <p className="flex items-center gap-1 text-[10px] text-skill-green"><CheckCircle2 size={11} /> Passwords match</p>}

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] text-muted-foreground">or sign up with</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google
                      </button>
                      <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                        <Github size={14} /> GitHub
                      </button>
                    </div>

                    <motion.button onClick={() => canContinueStep1 && next()} className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${canContinueStep1 ? "bg-foreground text-background" : "bg-muted text-muted-foreground cursor-not-allowed"}`} whileHover={canContinueStep1 ? { scale: 1.01 } : {}} whileTap={canContinueStep1 ? { scale: 0.99 } : {}}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 2: Profile + Default Avatars ═══ */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Customize your profile</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Make a great first impression on other swappers.</p>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <label className="group relative cursor-pointer">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-surface-1 transition-colors group-hover:border-foreground/30">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                          ) : selectedDefaultAvatar ? (
                            <span className="text-4xl">{defaultAvatars.find(a => a.id === selectedDefaultAvatar)?.emoji}</span>
                          ) : (
                            <Camera size={28} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                          <Upload size={12} />
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                      <p className="text-[10px] text-muted-foreground">Upload a photo or pick a default below</p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Quick pick</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {defaultAvatars.map((av) => (
                          <button
                            key={av.id}
                            onClick={() => selectDefaultAvatar(av.id)}
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all ${av.bg} ${
                              selectedDefaultAvatar === av.id ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                            }`}
                          >
                            {av.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Display name (public)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
                    </div>

                    <div className="relative">
                      <Sparkles size={15} className="absolute left-4 top-3 text-muted-foreground" />
                      <input type="text" placeholder='Tagline (e.g. "Design wizard ✨")' value={slogan} onChange={(e) => setSlogan(e.target.value)} maxLength={60} className={inputClass} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">{slogan.length}/60</span>
                    </div>

                    <div>
                      <textarea placeholder="Bio — tell others about yourself, your passions, and what you bring to the table..." value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} className="h-24 w-full resize-none rounded-xl border border-border bg-surface-1 p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                      <p className="mt-1 text-right text-[9px] text-muted-foreground">{bio.length}/300</p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                      <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        Continue <ArrowRight size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Details + Social Links ═══ */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Your details & socials</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Help us connect you with the right community.</p>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                    <div className="relative">
                      <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Location (city, country)" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
                    </div>
                    <div className="relative">
                      <GraduationCap size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="University (optional — get a verified badge)" value={university} onChange={(e) => setUniversity(e.target.value)} className={inputClass} />
                    </div>

                    {/* Social links section */}
                    <div className="pt-2">
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><Link2 size={13} /> Social & Portfolio Links</p>
                      <div className="space-y-2">
                        <div className="relative">
                          <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="Personal website" value={personalWebsite} onChange={(e) => setPersonalWebsite(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Briefcase size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="Portfolio URL" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="LinkedIn profile" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Github size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="GitHub profile" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Twitter size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="Twitter / X profile" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Instagram size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="Instagram profile" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className={inputClass} />
                        </div>
                        <div className="relative">
                          <Youtube size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="url" placeholder="YouTube channel" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="pt-2">
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><Languages size={13} /> Languages you speak</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {defaultLanguages.map((l) => (
                          <button key={l} onClick={() => toggleLanguage(l)} className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-all ${selectedLanguages.includes(l) ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                            {selectedLanguages.includes(l) && <CheckCircle2 size={10} className="inline mr-1" />}{l}
                          </button>
                        ))}
                        {selectedLanguages.filter(l => !defaultLanguages.includes(l)).map((l) => (
                          <button key={l} onClick={() => toggleLanguage(l)} className="rounded-full px-3 py-1.5 text-[10px] font-medium bg-court-blue/10 text-court-blue border border-court-blue/20">
                            <CheckCircle2 size={10} className="inline mr-1" />{l}
                            <X size={10} className="inline ml-1" />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add another language..." value={customLanguage} onChange={(e) => setCustomLanguage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomLanguage()} className="h-9 flex-1 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        <button onClick={addCustomLanguage} disabled={!customLanguage.trim()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 4: Work History ═══ */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Work experience</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Share your professional background — freelance, full-time, or side projects all count.</p>

                  <div className="space-y-4 max-h-[55vh] overflow-y-auto scrollbar-hide pr-1">
                    {workHistory.map((work, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-surface-1 p-4 space-y-2.5 relative"
                      >
                        {workHistory.length > 1 && (
                          <button onClick={() => removeWorkEntry(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                            <Trash2 size={13} />
                          </button>
                        )}
                        <p className="text-[10px] font-semibold text-muted-foreground">Position {idx + 1}</p>
                        <div className="relative">
                          <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Job title (e.g. Freelance Designer)" value={work.title} onChange={(e) => updateWork(idx, "title", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        </div>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Company / Client / Self-employed" value={work.company} onChange={(e) => updateWork(idx, "company", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder="Start year" value={work.startYear} onChange={(e) => updateWork(idx, "startYear", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                          </div>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder={work.current ? "Present" : "End year"} value={work.current ? "Present" : work.endYear} onChange={(e) => updateWork(idx, "endYear", e.target.value)} disabled={work.current} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none disabled:opacity-50" />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={work.current} onChange={(e) => updateWork(idx, "current", e.target.checked)} className="rounded border-border" />
                          <span className="text-[10px] text-muted-foreground">I currently work here</span>
                        </label>
                        <textarea placeholder="Brief description of your role, responsibilities, or achievements..." value={work.description} onChange={(e) => updateWork(idx, "description", e.target.value)} maxLength={200} className="h-16 w-full resize-none rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        <p className="text-right text-[9px] text-muted-foreground">{work.description.length}/200</p>
                      </motion.div>
                    ))}

                    <button onClick={addWorkEntry} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                      <Plus size={14} /> Add another position
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 5: Education History ═══ */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Education</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Degrees, bootcamps, online courses — anything that shaped your skills.</p>

                  <div className="space-y-4 max-h-[55vh] overflow-y-auto scrollbar-hide pr-1">
                    {educationHistory.map((edu, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-surface-1 p-4 space-y-2.5 relative"
                      >
                        {educationHistory.length > 1 && (
                          <button onClick={() => removeEduEntry(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                            <Trash2 size={13} />
                          </button>
                        )}
                        <p className="text-[10px] font-semibold text-muted-foreground">Education {idx + 1}</p>
                        <div className="relative">
                          <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Degree / Certificate (e.g. B.Sc. Computer Science)" value={edu.degree} onChange={(e) => updateEdu(idx, "degree", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        </div>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Institution (e.g. MIT, Coursera, Le Wagon)" value={edu.institution} onChange={(e) => updateEdu(idx, "institution", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        </div>
                        <div className="relative">
                          <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Field of study" value={edu.field} onChange={(e) => updateEdu(idx, "field", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder="Start year" value={edu.startYear} onChange={(e) => updateEdu(idx, "startYear", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                          </div>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder={edu.current ? "Present" : "End year"} value={edu.current ? "Present" : edu.endYear} onChange={(e) => updateEdu(idx, "endYear", e.target.value)} disabled={edu.current} className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none disabled:opacity-50" />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={edu.current} onChange={(e) => updateEdu(idx, "current", e.target.checked)} className="rounded border-border" />
                          <span className="text-[10px] text-muted-foreground">Currently enrolled</span>
                        </label>
                      </motion.div>
                    ))}

                    <button onClick={addEduEntry} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                      <Plus size={14} /> Add another education
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 6: Skills (what you OFFER) ═══ */}
              {step === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">What can you offer?</h1>
                  <p className="mb-4 text-sm text-muted-foreground">Select skills you can provide to others. Pick at least 1.</p>

                  <div className="mb-3 flex flex-wrap gap-1.5 max-h-44 overflow-y-auto scrollbar-hide">
                    {allSkills.map((s) => (
                      <button key={s} onClick={() => toggleSkill(s)} className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-all ${skills.includes(s) ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                        {skills.includes(s) && <CheckCircle2 size={10} className="inline mr-1" />}{s}
                      </button>
                    ))}
                    {skills.filter(s => !allSkills.includes(s)).map((s) => (
                      <button key={s} onClick={() => toggleSkill(s)} className="rounded-full px-3 py-1.5 text-[10px] font-medium bg-badge-gold/10 text-badge-gold border border-badge-gold/20">
                        <CheckCircle2 size={10} className="inline mr-1" />{s} <X size={10} className="inline ml-1" />
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Add a custom skill..." value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomSkill()} className="h-9 flex-1 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                    <button onClick={addCustomSkill} disabled={!customSkill.trim()} className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  {skills.length > 0 && (
                    <div className="mb-4 space-y-2 rounded-xl border border-border bg-surface-1 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-2">Rate your proficiency</p>
                      {skills.map((s) => (
                        <div key={s} className="flex items-center justify-between">
                          <span className="text-xs text-foreground truncate mr-2">{s}</span>
                          <div className="flex gap-1 shrink-0">
                            {skillLevels.map((level) => (
                              <button key={level} onClick={() => setSkillLevel((prev) => ({ ...prev, [s]: level }))} className={`rounded-md px-2 py-0.5 text-[8px] font-medium transition-colors ${skillLevel[s] === level ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:text-foreground"}`}>
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={() => skills.length > 0 && next()} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${skills.length > 0 ? "bg-foreground text-background" : "bg-muted text-muted-foreground cursor-not-allowed"}`} whileHover={skills.length > 0 ? { scale: 1.01 } : {}} whileTap={skills.length > 0 ? { scale: 0.99 } : {}}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 7: What You NEED ═══ */}
              {step === 7 && (
                <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">What do you need?</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Tell us what you're looking for — we'll match you with people who can deliver.</p>
                  <div className="mb-4 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-hide">
                    {needCategories.map((need) => (
                      <button
                        key={need.label}
                        onClick={() => toggleNeed(need.label)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                          selectedNeeds.includes(need.label)
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/20"
                        }`}
                      >
                        <need.icon size={16} className={selectedNeeds.includes(need.label) ? "text-foreground" : "text-muted-foreground"} />
                        <span className={`text-[10px] font-semibold leading-tight ${selectedNeeds.includes(need.label) ? "text-foreground" : "text-muted-foreground"}`}>{need.label}</span>
                        <span className="text-[9px] text-muted-foreground/60 leading-tight">{need.desc}</span>
                      </button>
                    ))}
                  </div>

                  {selectedNeeds.includes("Something else") && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
                      <input type="text" placeholder="Describe what you need..." value={customNeed} onChange={(e) => setCustomNeed(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-surface-1 px-4 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 8: Portfolio & Certificates ═══ */}
              {step === 8 && (
                <motion.div key="s8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Showcase your work</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Upload certificates, portfolio pieces, or proof of past work.</p>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><FileBadge size={13} /> Certificates & Credentials</p>
                      <p className="mb-3 text-[10px] text-muted-foreground">Google certs, Coursera, university transcripts, etc.</p>
                      {certificates.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          {certificates.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-skill-green/20 bg-skill-green/5 p-2.5">
                              <CheckCircle2 size={12} className="text-skill-green shrink-0" />
                              <span className="text-xs text-foreground truncate flex-1">{cert.name}</span>
                              <button onClick={() => setCertificates(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-center transition-all hover:border-foreground/20 hover:bg-surface-1">
                        <Upload size={16} className="text-muted-foreground mx-auto" />
                        <div className="text-left flex-1">
                          <p className="text-xs font-medium text-foreground">Upload certificate</p>
                          <p className="text-[9px] text-muted-foreground">PDF, JPG, PNG · Max 10MB</p>
                        </div>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleCertUpload} className="hidden" />
                      </label>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><FolderOpen size={13} /> Portfolio Pieces</p>
                      <p className="mb-3 text-[10px] text-muted-foreground">Screenshots, case studies, designs, code samples.</p>
                      {portfolioItems.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          {portfolioItems.map((item, i) => (
                            <div key={i} className="relative rounded-lg border border-border bg-surface-1 p-2 group">
                              {item.type === "image" ? (
                                <img src={item.file} alt={item.name} className="h-20 w-full rounded object-cover" />
                              ) : (
                                <div className="flex h-20 items-center justify-center rounded bg-surface-2"><FileText size={24} className="text-muted-foreground" /></div>
                              )}
                              <p className="mt-1 text-[9px] text-muted-foreground truncate">{item.name}</p>
                              <button onClick={() => setPortfolioItems(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-center transition-all hover:border-foreground/20 hover:bg-surface-1">
                        <Image size={16} className="text-muted-foreground mx-auto" />
                        <div className="text-left flex-1">
                          <p className="text-xs font-medium text-foreground">Upload portfolio piece</p>
                          <p className="text-[9px] text-muted-foreground">Images, PDFs, documents · Max 10MB</p>
                        </div>
                        <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handlePortfolioUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 9: Interests & Hobbies ═══ */}
              {step === 9 && (
                <motion.div key="s9" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Interests & hobbies</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Help us find your tribe — what are you passionate about outside of work?</p>

                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest.label}
                        onClick={() => toggleInterest(interest.label)}
                        className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                          interests.includes(interest.label)
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/20"
                        }`}
                      >
                        <interest.icon size={16} className={interests.includes(interest.label) ? "text-foreground" : "text-muted-foreground"} />
                        <span className={`text-xs font-medium ${interests.includes(interest.label) ? "text-foreground" : "text-muted-foreground"}`}>{interest.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom added interests */}
                  {interests.filter(i => !interestOptions.find(o => o.label === i)).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {interests.filter(i => !interestOptions.find(o => o.label === i)).map((i) => (
                        <button key={i} onClick={() => toggleInterest(i)} className="rounded-full px-3 py-1.5 text-[10px] font-medium bg-court-blue/10 text-court-blue border border-court-blue/20">
                          <CheckCircle2 size={10} className="inline mr-1" />{i} <X size={10} className="inline ml-1" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Add a custom interest..." value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomInterest()} className="h-9 flex-1 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
                    <button onClick={addCustomInterest} disabled={!customInterest.trim()} className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Continue <ArrowRight size={15} />
                    </motion.button>
                  </div>
                  <button onClick={next} className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground">Skip for now</button>
                </motion.div>
              )}

              {/* ═══ STEP 10: Preferences ═══ */}
              {step === 10 && (
                <motion.div key="s10" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Preferences</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Set your availability and communication preferences.</p>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><Clock size={13} /> Availability</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["Full-time", "Part-time", "Weekends only"].map((a) => (
                          <button key={a} onClick={() => setAvailability(a)} className={`rounded-xl border py-3 text-xs font-medium transition-all ${availability === a ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><MessageSquare size={13} /> Typical response time</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Within 1 hour", "Within 24 hours", "Within 3 days", "Flexible"].map((r) => (
                          <button key={r} onClick={() => setResponseTime(r)} className={`rounded-xl border py-2.5 text-[10px] font-medium transition-all ${responseTime === r ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5"><Globe size={13} /> Preferred communication</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["Chat", "Video Call", "Email"].map((c) => (
                          <button key={c} onClick={() => setPreferredComm(c)} className={`rounded-xl border py-2.5 text-[10px] font-medium transition-all ${preferredComm === c ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Timezone (e.g. GMT+2, EST, PST)" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass} />
                    </div>

                    <div className="relative">
                      <Hash size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Hourly rate in SP (optional)" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={inputClass} />
                    </div>

                    <div className="relative">
                      <Tag size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Referral code (optional — earn bonus SP!)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={inputClass} />
                    </div>
                    {referralCode && <p className="flex items-center gap-1 text-[10px] text-skill-green"><Zap size={10} /> You'll both earn 50 bonus SP!</p>}

                    <div className="flex gap-3 pt-1">
                      <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                      <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        Continue <ArrowRight size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 11: Verification (Skippable) ═══ */}
              {step === 11 && (
                <motion.div key="s11" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Identity verification</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Optional — get a verified badge and unlock higher gig limits.</p>

                  <div className="space-y-4">
                    <div className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${idUploaded ? "border-skill-green/30 bg-skill-green/5" : "border-border hover:border-foreground/20 bg-surface-1"}`} onClick={() => setIdUploaded(!idUploaded)}>
                      {idUploaded ? (
                        <>
                          <CheckCircle2 size={32} className="mx-auto mb-3 text-skill-green" />
                          <p className="text-sm font-medium text-skill-green">ID uploaded successfully</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">We'll verify within 24 hours</p>
                        </>
                      ) : (
                        <>
                          <IdCard size={32} className="mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">Upload government ID</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">Passport, driver's license, or national ID</p>
                          <p className="mt-2 text-[9px] text-muted-foreground/60">Your data is encrypted and never shared</p>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-surface-1 p-4">
                      <p className="text-xs font-medium text-foreground mb-2">Benefits of verification</p>
                      <div className="space-y-1.5">
                        {["Verified badge on your profile", "Higher gig value limits", "Priority in search results", "Access to premium gig formats"].map((b) => (
                          <div key={b} className="flex items-center gap-2">
                            <CheckCircle2 size={11} className="text-skill-green shrink-0" />
                            <span className="text-[10px] text-muted-foreground">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                      <motion.button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        Continue <ArrowRight size={15} />
                      </motion.button>
                    </div>
                    <button onClick={next} className="flex w-full items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                      <SkipForward size={10} /> Skip verification
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 12: Platform Tour ═══ */}
              {step === 12 && (
                <motion.div key="s12" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <h1 className="mb-1 font-heading text-2xl font-bold text-foreground">Welcome to SkillSwappr!</h1>
                  <p className="mb-6 text-sm text-muted-foreground">Here's a quick rundown of how SkillSwappr works.</p>

                  <div className="mb-6 overflow-hidden rounded-xl border border-border bg-surface-1">
                    <div className="aspect-video flex flex-col items-center justify-center bg-surface-2">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10 backdrop-blur">
                        <Play size={24} className="text-foreground ml-1" />
                      </div>
                      <p className="text-xs font-medium text-foreground">Watch Platform Tour</p>
                      <p className="text-[10px] text-muted-foreground">2 min overview</p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    {platformTourSteps.map((t, i) => (
                      <motion.div
                        key={t.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 rounded-xl border border-border bg-surface-1 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                          <t.icon size={14} className="text-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mb-6 rounded-xl border border-skill-green/20 bg-skill-green/5 p-4 text-center">
                    <Zap size={20} className="mx-auto mb-1 text-skill-green" />
                    <p className="text-sm font-bold text-foreground">+100 Skill Points</p>
                    <p className="text-[10px] text-muted-foreground">Welcome bonus credited to your account</p>
                  </div>

                  {signupError && (
                    <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {signupError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                    <motion.button
                      onClick={async () => {
                        setSignupError("");
                        const result = await signup(email, password, name);
                        if (result.success) {
                          logFormSubmission("signup", {
                            email, name, university, location,
                            skills_count: skills.length, needs_count: selectedNeeds.length,
                            interests_count: interests.length, languages: selectedLanguages,
                            has_portfolio: !!portfolioUrl, has_linkedin: !!linkedinUrl,
                            has_github: !!githubUrl, has_work_history: workHistory.some(w => w.title),
                            has_education: educationHistory.some(e => e.degree),
                            availability, preferred_comm: preferredComm,
                            id_verified: idUploaded,
                          }, "auth");
                          // Save all onboarding data to profile
                          await updateProfile({
                            display_name: displayName || name,
                            bio,
                            slogan,
                            avatar_emoji: selectedDefaultAvatar ? defaultAvatars.find(a => a.id === selectedDefaultAvatar)?.emoji : undefined,
                            university,
                            location,
                            languages: selectedLanguages,
                            portfolio_url: portfolioUrl,
                            linkedin_url: linkedinUrl,
                            github_url: githubUrl,
                            twitter_url: twitterUrl,
                            instagram_url: instagramUrl,
                            youtube_url: youtubeUrl,
                            personal_website: personalWebsite,
                            skills,
                            skill_levels: skillLevel,
                            interests,
                            needs: selectedNeeds,
                            work_history: workHistory as unknown as import("@/integrations/supabase/types").Json,
                            education_history: educationHistory as unknown as import("@/integrations/supabase/types").Json,
                            availability,
                            response_time: responseTime,
                            preferred_comm: preferredComm,
                            hourly_rate: hourlyRate,
                            timezone,
                            referral_code: referralCode,
                            id_verified: idUploaded,
                            onboarding_complete: true,
                          });
                          navigate("/dashboard");
                        } else {
                          logInteraction("signup_failed", { email, error: result.error });
                          setSignupError(result.error || "Signup failed.");
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Start Swapping <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default SignupPage;
