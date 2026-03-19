import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Create admin auth user
    const email = "Admin123@skillswaprr.com";
    const password = "Admin123!";
    let adminUserId: string;

    // Look up admin by email in profiles first
    const { data: existingProfile } = await supabase.from("profiles").select("user_id").eq("email", email).maybeSingle();
    
    if (existingProfile) {
      adminUserId = existingProfile.user_id;
    } else {
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: "SkillSwappr Admin" },
      });
      if (authError) throw authError;
      adminUserId = newUser.user.id;
    }

    // 2. Upsert admin profile
    await supabase.from("profiles").upsert({
      user_id: adminUserId,
      full_name: "SkillSwappr Admin",
      display_name: "SkillSwappr Admin",
      email,
      elo: 2500, sp: 99999, tier: "Diamond",
      skills: ["Platform Management", "User Support", "Quality Review", "System Admin", "Community Ops"],
      bio: "Official SkillSwappr system administrator. Managing platform operations, quality control, and community support since day one.",
      university: "SkillSwappr HQ",
      total_gigs_completed: 500, avatar_emoji: "🛡️",
      slogan: "Building the future of skill exchange",
      location: "Global", languages: ["English"],
      onboarding_complete: true, streak_days: 365,
      availability: "Always Online", response_time: "< 5 minutes",
      hero_color: "#0A0A0A",
    }, { onConflict: "user_id" });

    // 3. Set admin role
    await supabase.from("user_roles").upsert({ user_id: adminUserId, role: "admin" }, { onConflict: "user_id,role" });

    // 4. Create test user profiles for leaderboard
    const testUsers = [
      { email: "alex@test.dev", name: "Alex Chen", elo: 2100, sp: 45000, tier: "Diamond", skills: ["React", "TypeScript", "Node.js", "GraphQL"], uni: "MIT", gigs: 340, streak: 120, emoji: "💻" },
      { email: "lena@test.dev", name: "Lena Müller", elo: 1950, sp: 38000, tier: "Platinum", skills: ["UI Design", "Figma", "Branding", "Motion Design"], uni: "Royal College of Art", gigs: 280, streak: 90, emoji: "🎨" },
      { email: "marcus@test.dev", name: "Marcus Rivera", elo: 1870, sp: 32000, tier: "Platinum", skills: ["Video Editing", "After Effects", "DaVinci Resolve"], uni: "UCLA Film School", gigs: 210, streak: 65, emoji: "🎬" },
      { email: "priya@test.dev", name: "Priya Sharma", elo: 1780, sp: 28000, tier: "Gold", skills: ["Data Science", "Python", "Machine Learning"], uni: "IIT Delhi", gigs: 190, streak: 45, emoji: "📊" },
      { email: "jordan@test.dev", name: "Jordan Park", elo: 1650, sp: 22000, tier: "Gold", skills: ["Copywriting", "SEO", "Content Strategy"], uni: "Columbia University", gigs: 160, streak: 30, emoji: "✍️" },
      { email: "nina@test.dev", name: "Nina Petrov", elo: 1520, sp: 18000, tier: "Gold", skills: ["Photography", "Lightroom", "Retouching"], uni: "Parsons School of Design", gigs: 130, streak: 22, emoji: "📸" },
      { email: "kai@test.dev", name: "Kai Tanaka", elo: 1400, sp: 14000, tier: "Silver", skills: ["Music Production", "Ableton Live", "Sound Design"], uni: "Berklee College of Music", gigs: 95, streak: 15, emoji: "🎵" },
      { email: "sofia@test.dev", name: "Sofia Rodriguez", elo: 1300, sp: 11000, tier: "Silver", skills: ["Marketing", "Social Media", "Google Ads"], uni: "University of Barcelona", gigs: 75, streak: 10, emoji: "📱" },
      { email: "ethan@test.dev", name: "Ethan Brooks", elo: 1150, sp: 8000, tier: "Bronze", skills: ["3D Modeling", "Blender", "Unity"], uni: "DigiPen Institute", gigs: 45, streak: 8, emoji: "🎮" },
      { email: "amira@test.dev", name: "Amira Okafor", elo: 1050, sp: 5500, tier: "Bronze", skills: ["Translation", "French", "Technical Writing"], uni: "University of Lagos", gigs: 30, streak: 5, emoji: "🌍" },
      { email: "jake@test.dev", name: "Jake Williams", elo: 950, sp: 3200, tier: "Bronze", skills: ["Illustration", "Procreate", "Character Design"], uni: "RISD", gigs: 20, streak: 3, emoji: "🖌️" },
    ];

    const testUserIds: Record<string, string> = {};
    for (const tu of testUsers) {
      const { data: existingTestProfile } = await supabase.from("profiles").select("user_id").eq("email", tu.email).maybeSingle();
      let uid: string;
      if (existingTestProfile) {
        uid = existingTestProfile.user_id;
      } else {
        const { data: newU, error } = await supabase.auth.admin.createUser({
          email: tu.email, password: "TestUser123!",
          email_confirm: true,
          user_metadata: { full_name: tu.name },
        });
        if (error) { console.log("Skip user:", tu.email, error.message); continue; }
        uid = newU.user.id;
      }
      testUserIds[tu.email] = uid;

      await supabase.from("profiles").upsert({
        user_id: uid,
        full_name: tu.name, display_name: tu.name, email: tu.email,
        elo: tu.elo, sp: tu.sp, tier: tu.tier,
        skills: tu.skills,
        bio: `Test user profile for ${tu.name}.`,
        university: tu.uni,
        total_gigs_completed: tu.gigs, streak_days: tu.streak,
        avatar_emoji: tu.emoji,
        onboarding_complete: true, location: "Global",
      }, { onConflict: "user_id" });
    }

    // 5. Create admin guild
    const { data: guildData } = await supabase
      .from("guilds")
      .upsert({
        name: "SkillSwappr HQ",
        slogan: "The official SkillSwappr operations guild",
        description: "Official guild for platform administrators and moderators.",
        category: "Other", rank: 1, avg_elo: 2500,
        total_sp: 500000, total_gigs: 2500, win_rate: 98,
        is_public: true, created_by: adminUserId,
      }, { onConflict: "name" })
      .select("id").single();

    if (guildData) {
      await supabase.from("guild_members").upsert({
        guild_id: guildData.id, user_id: adminUserId, role: "leader",
      }, { onConflict: "guild_id,user_id" });
    }

    // 6. Enterprise account
    await supabase.from("enterprise_accounts").upsert({
      name: "SkillSwappr Official", owner_id: adminUserId, plan: "enterprise", max_seats: 100,
    }, { onConflict: "name" });

    // 7. Admin gigs
    const gigs = [
      { title: "System Maintenance & Monitoring", description: "Platform health checks, performance monitoring.", category: "Development", points: 100, wants: "Quality Assurance", delivery_days: 1, hot: false, views: 892, rating: 5.0 },
      { title: "Human Gig Review & Quality Check", description: "Manual review of flagged gigs.", category: "Other", points: 50, wants: "Content Moderation", delivery_days: 1, hot: true, views: 1245, rating: 4.9 },
      { title: "1-on-1 User Onboarding", description: "Personalized onboarding session.", category: "Other", points: 30, wants: "User Feedback", delivery_days: 1, hot: true, views: 2103, rating: 5.0 },
      { title: "Account Recovery Assistance", description: "Help users regain account access.", category: "Other", points: 20, wants: null, delivery_days: 1, hot: false, views: 567, rating: 4.8 },
      { title: "Complaint Resolution Support", description: "Investigate and mediate complaints.", category: "Other", points: 40, wants: null, delivery_days: 2, hot: false, views: 734, rating: 4.9 },
      { title: "Platform Feature Walkthrough", description: "Demo of advanced platform features.", category: "Other", points: 25, wants: "Feature Feedback", delivery_days: 1, hot: true, views: 1567, rating: 5.0 },
      { title: "Bug Report Triage", description: "Review and prioritize bug reports.", category: "Development", points: 35, wants: "Bug Reports", delivery_days: 1, hot: false, views: 423, rating: 4.7 },
      { title: "Community Guidelines Consultation", description: "Consultation on community rules.", category: "Other", points: 15, wants: null, delivery_days: 1, hot: false, views: 389, rating: 4.9 },
      { title: "ELO Dispute Mediation", description: "Review and resolve ELO disputes.", category: "Other", points: 45, wants: null, delivery_days: 3, hot: false, views: 612, rating: 4.8 },
      { title: "Enterprise Integration Setup", description: "API integration setup for enterprise.", category: "Development", points: 80, wants: "Integration Testing", delivery_days: 5, hot: true, views: 945, rating: 5.0 },
    ];
    for (const gig of gigs) {
      await supabase.from("listings").upsert({
        ...gig, user_id: adminUserId, status: "active", format: "Direct Swap", price: `${gig.points} SP`,
      }, { onConflict: "user_id,title" });
    }

    // 8. Blog posts
    const blogContent = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Comprehensive article from the SkillSwappr team. Check the Roadmap for upcoming features!" }] }] };
    const blogPosts = [
      { slug: "welcome-to-skillswaprr", title: "Welcome to SkillSwappr", category: "Announcements", excerpt: "Everything about the skill exchange revolution.", tags: ["welcome", "platform"], read_time: 4, is_featured: true, is_published: true, view_count: 4520, like_count: 312, comment_count: 45 },
      { slug: "getting-started-first-swap", title: "Getting Started: Your First Skill Swap", category: "Tutorials", excerpt: "Step-by-step guide to your first exchange.", tags: ["tutorial", "beginner"], read_time: 6, is_featured: false, is_published: true, view_count: 8934, like_count: 567, comment_count: 89 },
      { slug: "troubleshooting-common-issues", title: "Troubleshooting Common Issues", category: "Support", excerpt: "Solutions to frequently reported problems.", tags: ["support", "faq"], read_time: 5, is_featured: false, is_published: true, view_count: 3201, like_count: 145, comment_count: 23 },
      { slug: "understanding-elo-tier-system", title: "Understanding the ELO & Tier System", category: "Education", excerpt: "How ELO ratings and tiers work.", tags: ["elo", "tiers"], read_time: 8, is_featured: true, is_published: true, view_count: 12450, like_count: 890, comment_count: 134 },
      { slug: "how-to-write-great-gig-listing", title: "How to Write a Great Gig Listing", category: "Tutorials", excerpt: "Tips for creating high-converting listings.", tags: ["tutorial", "marketplace"], read_time: 5, is_featured: false, is_published: true, view_count: 6780, like_count: 432, comment_count: 67 },
      { slug: "guild-wars-strategy-guide", title: "Guild Wars: Strategy Guide", category: "Community", excerpt: "Strategies from top-ranked guilds.", tags: ["guilds", "strategy"], read_time: 10, is_featured: true, is_published: true, view_count: 9200, like_count: 678, comment_count: 112 },
      { slug: "platform-security-safety-tips", title: "Platform Security & Safety Tips", category: "Security", excerpt: "How we protect you on SkillSwappr.", tags: ["security", "safety"], read_time: 6, is_featured: false, is_published: true, view_count: 5430, like_count: 289, comment_count: 34 },
      { slug: "quarterly-wrap-q1-2026", title: "Quarterly Wrap: Q1 2026", category: "Announcements", excerpt: "Everything shipped in Q1 2026.", tags: ["updates", "milestone"], read_time: 7, is_featured: true, is_published: true, view_count: 7890, like_count: 534, comment_count: 78 },
    ];
    for (const post of blogPosts) {
      await supabase.from("blog_posts").upsert({ ...post, author_id: adminUserId, author_name: "SkillSwappr Admin", content: blogContent }, { onConflict: "slug" });
    }

    // 9. Forum categories & threads
    const categories = [
      { name: "General", slug: "general", description: "General discussions", icon: "💬", color: "foreground" },
      { name: "Introductions", slug: "introductions", description: "Introduce yourself", icon: "👋", color: "skill-green" },
      { name: "Feature Requests", slug: "feature-requests", description: "Suggest features", icon: "💡", color: "badge-gold" },
      { name: "Bug Reports", slug: "bug-reports", description: "Report bugs", icon: "🐛", color: "alert-red" },
      { name: "Tips & Tricks", slug: "tips-tricks", description: "Best practices", icon: "🎯", color: "court-blue" },
      { name: "Guild Recruitment", slug: "guild-recruitment", description: "Find or join guilds", icon: "⚔️", color: "court-blue" },
      { name: "Marketplace", slug: "marketplace-discussion", description: "Marketplace tips", icon: "🏪", color: "badge-gold" },
      { name: "Off-Topic", slug: "off-topic", description: "Chat about anything", icon: "🎲", color: "muted-foreground" },
    ];
    const categoryIds: Record<string, string> = {};
    for (const cat of categories) {
      const { data } = await supabase.from("forum_categories").upsert(cat, { onConflict: "slug" }).select("id").single();
      if (data) categoryIds[cat.slug] = data.id;
    }
    const threads = [
      { title: "👋 Welcome to SkillSwappr Forums!", content: "Welcome to the official community forums!", category: "introductions", is_pinned: true, upvotes: 234, view_count: 8900 },
      { title: "📜 Platform Rules & Guidelines", content: "Be respectful, no spam, report violations.", category: "general", is_pinned: true, upvotes: 189, view_count: 12340 },
      { title: "💡 Dark Mode Scheduling", content: "Auto dark mode based on time of day?", category: "feature-requests", is_pinned: false, upvotes: 67, view_count: 1230 },
      { title: "🐛 Avatar not updating", content: "Avatar reverts to default after upload.", category: "bug-reports", is_pinned: false, upvotes: 23, view_count: 456 },
      { title: "🏆 How I Reached Diamond in 6 Months", content: "My journey and tips.", category: "tips-tricks", is_pinned: false, upvotes: 312, view_count: 5670 },
      { title: "Best Practices for Gig Descriptions", content: "After 200+ gigs, here are my tips.", category: "tips-tricks", is_pinned: false, upvotes: 189, view_count: 3420 },
      { title: "⚔️ Phoenix Rising Guild — Recruiting", content: "All tiers welcome!", category: "guild-recruitment", is_pinned: false, upvotes: 45, view_count: 890 },
      { title: "Flash Market Timing Tips", content: "Best times and strategies.", category: "marketplace-discussion", is_pinned: false, upvotes: 78, view_count: 2100 },
    ];
    for (const thread of threads) {
      const catId = categoryIds[thread.category];
      if (!catId) continue;
      await supabase.from("forum_threads").insert({
        title: thread.title, content: thread.content,
        author_id: adminUserId, author_name: "SkillSwappr Admin",
        category_id: catId, is_pinned: thread.is_pinned,
        upvotes: thread.upvotes, view_count: thread.view_count, comment_count: 0,
      });
    }

    // 10. Seed 2027 events
    const events2027 = [
      { title: "New Year Skill Sprint", description: "Kick off 2027 with a 48-hour skill sprint.", category: "Competition", event_type: "Tournament", event_date: "2027-01-10T12:00:00Z", end_date: "2027-01-12T12:00:00Z", spots: 256, icon: "🎆", prize: "10,000 SP", is_featured: true, tags: ["sprint", "new-year"] },
      { title: "Valentine's Collab Jam", description: "Pair up and create something in 24 hours.", category: "Design", event_type: "Workshop", event_date: "2027-02-14T10:00:00Z", spots: 100, icon: "💕", prize: "3,000 SP", is_featured: true, tags: ["collaboration", "design"] },
      { title: "Guild Wars: Season 6", description: "64 guilds, 8 rounds.", category: "Competition", event_type: "Tournament", event_date: "2027-02-20T18:00:00Z", end_date: "2027-03-20T18:00:00Z", spots: 64, icon: "⚔️", prize: "25,000 SP", is_featured: true, tags: ["guilds", "season-6"] },
      { title: "Women in Tech: Skill Swap Day", description: "Workshops, mentoring, and skill swaps.", category: "Community", event_type: "Workshop", event_date: "2027-03-08T10:00:00Z", spots: 200, icon: "👩‍💻", prize: null, is_featured: true, tags: ["women-in-tech"] },
      { title: "ELO Blitz: March Madness", description: "72-hour ELO sprint with double SP.", category: "Competition", event_type: "Tournament", event_date: "2027-03-28T00:00:00Z", end_date: "2027-03-31T00:00:00Z", spots: 512, icon: "🔥", prize: "12,000 SP", is_featured: true, tags: ["elo", "sprint"] },
      { title: "Design Sprint: E-Commerce", description: "Teams redesign an e-commerce checkout.", category: "Design", event_type: "Tournament", event_date: "2027-04-05T15:00:00Z", end_date: "2027-04-07T15:00:00Z", spots: 48, icon: "🎯", prize: "8,000 SP", is_featured: true, tags: ["design", "sprint"] },
      { title: "Game Jam: 72 Hours", description: "Build a complete game in 72 hours.", category: "Game Dev", event_type: "Tournament", event_date: "2027-05-02T00:00:00Z", end_date: "2027-05-05T00:00:00Z", spots: 200, icon: "🎮", prize: "15,000 SP", is_featured: true, tags: ["game-jam"] },
      { title: "University Challenge: Spring 2027", description: "16 universities compete.", category: "Academic", event_type: "Tournament", event_date: "2027-05-20T14:00:00Z", end_date: "2027-05-25T20:00:00Z", spots: 64, icon: "🎓", prize: "20,000 SP", is_featured: true, tags: ["university"] },
      { title: "SkillSwappr World Cup 2027", description: "128 teams. 10 disciplines. 1 champion.", category: "Competition", event_type: "Tournament", event_date: "2027-06-15T18:00:00Z", end_date: "2027-07-15T18:00:00Z", spots: 512, icon: "🏆", prize: "75,000 SP", is_featured: true, tags: ["world-cup", "global"] },
      { title: "Hackathon: AI Tools", description: "Build AI-powered tools. $50K SP pool.", category: "Dev", event_type: "Tournament", event_date: "2027-07-10T00:00:00Z", end_date: "2027-07-13T00:00:00Z", spots: 300, icon: "🤖", prize: "50,000 SP", is_featured: true, tags: ["hackathon", "ai"] },
      { title: "Art Battle Royale 2027", description: "64 artists in elimination rounds.", category: "Design", event_type: "Tournament", event_date: "2027-08-05T14:00:00Z", end_date: "2027-08-07T20:00:00Z", spots: 64, icon: "🎨", prize: "10,000 SP", is_featured: true, tags: ["art", "design"] },
      { title: "Back to School Sprint", description: "Students compete for SP scholarships.", category: "Academic", event_type: "Tournament", event_date: "2027-09-05T12:00:00Z", end_date: "2027-09-08T12:00:00Z", spots: 256, icon: "📚", prize: "15,000 SP", is_featured: true, tags: ["students"] },
      { title: "Hacktoberfest Collab 2027", description: "Open source contributions all month.", category: "Dev", event_type: "Workshop", event_date: "2027-10-01T00:00:00Z", end_date: "2027-10-31T23:59:00Z", spots: null, icon: "🎃", prize: "Open Source", is_featured: true, tags: ["hacktoberfest"] },
      { title: "Guild Wars: Season 7", description: "Winter season double elimination.", category: "Competition", event_type: "Tournament", event_date: "2027-11-10T18:00:00Z", end_date: "2027-12-10T18:00:00Z", spots: 64, icon: "⚔️", prize: "30,000 SP", is_featured: true, tags: ["guilds", "season-7"] },
      { title: "Winter Invitational 2027", description: "Top 100 ranked users compete.", category: "Competition", event_type: "Tournament", event_date: "2027-12-01T18:00:00Z", end_date: "2027-12-15T18:00:00Z", spots: 100, icon: "❄️", prize: "40,000 SP", is_featured: true, tags: ["winter", "flagship"] },
      // Meetups throughout 2027
      { title: "London Tech Meetup", description: "Monthly London meetup.", category: "Networking", event_type: "In-Person", event_date: "2027-01-25T18:30:00Z", spots: 60, icon: "🇬🇧", prize: null, is_featured: false, tags: ["meetup", "london"] },
      { title: "NYC Spring Meetup", description: "Spring edition NYC meetup.", category: "Networking", event_type: "In-Person", event_date: "2027-03-22T17:00:00Z", spots: 50, icon: "🗽", prize: null, is_featured: false, tags: ["meetup", "nyc"] },
      { title: "Berlin Dev Meetup", description: "Monthly Berlin dev meetup.", category: "Dev", event_type: "In-Person", event_date: "2027-04-12T18:00:00Z", spots: 45, icon: "🇩🇪", prize: null, is_featured: false, tags: ["meetup", "berlin"] },
      { title: "Singapore Skill Social", description: "Singapore meetup at Block71.", category: "Networking", event_type: "In-Person", event_date: "2027-05-10T18:00:00Z", spots: 40, icon: "🇸🇬", prize: null, is_featured: false, tags: ["meetup", "singapore"] },
      { title: "Tokyo Summer Meetup", description: "Summer meetup in Shibuya.", category: "Networking", event_type: "In-Person", event_date: "2027-07-20T18:00:00Z", spots: 35, icon: "🇯🇵", prize: null, is_featured: false, tags: ["meetup", "tokyo"] },
      { title: "Toronto Fall Meetup", description: "Fall meetup at MaRS Discovery.", category: "Networking", event_type: "In-Person", event_date: "2027-09-18T18:00:00Z", spots: 55, icon: "🇨🇦", prize: null, is_featured: false, tags: ["meetup", "toronto"] },
    ];
    for (const ev of events2027) {
      await supabase.from("events").insert({ ...ev, created_by: adminUserId, status: "upcoming", spots_filled: 0 });
    }

    // 11. Seed bi-weekly tournaments
    const tournamentPool = [
      { name: "ELO Blitz", description: "48-hour ELO sprint.", format: "Sprint", max_teams: 256, team_size: 1, entry_fee: 0, prize_pool: "8,000 SP", min_elo: 0, icon: "🔥" },
      { name: "Design Sprint", description: "Teams redesign a product in 48h.", format: "Elimination", max_teams: 16, team_size: 3, entry_fee: 50, prize_pool: "5,000 SP", min_elo: 800, icon: "🎯" },
      { name: "Code Duel", description: "1v1 coding challenges.", format: "Bracket", max_teams: 64, team_size: 1, entry_fee: 25, prize_pool: "3,000 SP", min_elo: 1000, icon: "⚡" },
      { name: "Creative Jam", description: "Solo creative challenge.", format: "Open", max_teams: 128, team_size: 1, entry_fee: 0, prize_pool: "4,000 SP", min_elo: 0, icon: "🎨" },
      { name: "Video Sprint", description: "60-sec video in 24 hours.", format: "Open", max_teams: 100, team_size: 1, entry_fee: 0, prize_pool: "3,500 SP", min_elo: 0, icon: "🎬" },
      { name: "Content Battle", description: "Best article on a given brief.", format: "Open", max_teams: 200, team_size: 1, entry_fee: 0, prize_pool: "2,500 SP", min_elo: 0, icon: "✍️" },
    ];

    // Generate bi-weekly tournaments for 2027
    const biWeeklyDates: string[] = [];
    let d = new Date("2027-01-05T18:00:00Z");
    while (d.getFullYear() === 2027) {
      biWeeklyDates.push(d.toISOString());
      d = new Date(d.getTime() + 14 * 86400000);
    }

    for (let i = 0; i < biWeeklyDates.length; i++) {
      const t = tournamentPool[i % tournamentPool.length];
      const startDate = biWeeklyDates[i];
      const endDate = new Date(new Date(startDate).getTime() + 2 * 86400000).toISOString();
      const regDeadline = new Date(new Date(startDate).getTime() - 3 * 86400000).toISOString();
      await supabase.from("tournaments").insert({
        name: `${t.name} #${Math.floor(i / tournamentPool.length) + 1}`,
        description: t.description,
        format: t.format,
        max_teams: t.max_teams,
        team_size: t.team_size,
        entry_fee: t.entry_fee,
        prize_pool: t.prize_pool,
        min_elo: t.min_elo,
        icon: t.icon,
        status: "upcoming",
        start_date: startDate,
        end_date: endDate,
        registration_deadline: regDeadline,
        created_by: adminUserId,
        is_quarterly: false,
      });
    }

    // 12. Seed leaderboard achievements
    const achievementEntries = [
      { user_name: "Alex Chen", badge: "🏆 ELO Champion", achieved_at: "2027-01-15T10:00:00Z" },
      { user_name: "Lena Müller", badge: "🎨 Design Master", achieved_at: "2027-01-10T14:00:00Z" },
      { user_name: "SkillSwappr Admin", badge: "🛡️ Platform Guardian", achieved_at: "2026-12-01T12:00:00Z" },
      { user_name: "Marcus Rivera", badge: "🎬 Video Virtuoso", achieved_at: "2027-01-08T16:00:00Z" },
      { user_name: "Priya Sharma", badge: "📊 Data Wizard", achieved_at: "2027-01-05T09:00:00Z" },
      { user_name: "Jordan Park", badge: "✍️ Content King", achieved_at: "2026-12-20T11:00:00Z" },
    ];
    for (const a of achievementEntries) {
      await supabase.from("leaderboard_achievements").insert(a);
    }

    // 13. Seed ranking history
    const rankingEntries = [
      {
        snapshot_date: "2027-01-15",
        changes: [
          { name: "Alex Chen", from: 3, to: 1, elo: 2100 },
          { name: "Lena Müller", from: 5, to: 2, elo: 1950 },
          { name: "Marcus Rivera", from: 2, to: 3, elo: 1870 },
        ],
      },
      {
        snapshot_date: "2027-01-08",
        changes: [
          { name: "Priya Sharma", from: 6, to: 4, elo: 1780 },
          { name: "Jordan Park", from: 4, to: 5, elo: 1650 },
          { name: "Nina Petrov", from: 8, to: 6, elo: 1520 },
        ],
      },
    ];
    for (const r of rankingEntries) {
      await supabase.from("ranking_history").insert(r);
    }

    return new Response(JSON.stringify({ success: true, adminUserId, testUsers: Object.keys(testUserIds).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
