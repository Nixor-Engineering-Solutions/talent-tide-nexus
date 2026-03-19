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

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u: any) => u.email === email);

    if (existing) {
      adminUserId = existing.id;
      console.log("Admin user already exists:", adminUserId);
    } else {
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "SkillSwappr Admin" },
      });
      if (authError) throw authError;
      adminUserId = newUser.user.id;
      console.log("Created admin user:", adminUserId);
    }

    // 2. Upsert admin profile
    await supabase.from("profiles").upsert({
      user_id: adminUserId,
      full_name: "SkillSwappr Admin",
      display_name: "SkillSwappr Admin",
      email,
      elo: 2500,
      sp: 99999,
      tier: "Diamond",
      skills: ["Platform Management", "User Support", "Quality Review", "System Admin", "Community Ops"],
      bio: "Official SkillSwappr system administrator. Managing platform operations, quality control, and community support since day one.",
      university: "SkillSwappr HQ",
      total_gigs_completed: 500,
      avatar_emoji: "🛡️",
      slogan: "Building the future of skill exchange",
      location: "Global",
      languages: ["English"],
      onboarding_complete: true,
      streak_days: 365,
      availability: "Always Online",
      response_time: "< 5 minutes",
    }, { onConflict: "user_id" });

    // 3. Set admin role
    await supabase.from("user_roles").upsert({
      user_id: adminUserId,
      role: "admin",
    }, { onConflict: "user_id,role" });

    // 4. Create admin guild
    const { data: guildData } = await supabase
      .from("guilds")
      .upsert({
        name: "SkillSwappr HQ",
        slogan: "The official SkillSwappr operations guild",
        description: "The official guild for SkillSwappr platform administrators and moderators. We handle quality assurance, dispute resolution, and community management.",
        category: "Other",
        rank: 1,
        avg_elo: 2500,
        total_sp: 500000,
        total_gigs: 2500,
        win_rate: 98,
        is_public: true,
        created_by: adminUserId,
      }, { onConflict: "name" })
      .select("id")
      .single();

    if (guildData) {
      await supabase.from("guild_members").upsert({
        guild_id: guildData.id,
        user_id: adminUserId,
        role: "leader",
      }, { onConflict: "guild_id,user_id" });
    }

    // 5. Create enterprise account
    await supabase.from("enterprise_accounts").upsert({
      name: "SkillSwappr Official",
      owner_id: adminUserId,
      plan: "enterprise",
      max_seats: 100,
    }, { onConflict: "name" });

    // 6. Create 10 admin gigs
    const gigs = [
      { title: "System Maintenance & Monitoring", description: "Regular platform health checks, performance monitoring, uptime verification, and infrastructure maintenance.", category: "Development", points: 100, wants: "Quality Assurance", delivery_days: 1, hot: false, views: 892, rating: 5.0 },
      { title: "Human Gig Review & Quality Check", description: "Manual review of flagged gigs for quality, compliance, and community standards. Includes detailed feedback reports.", category: "Other", points: 50, wants: "Content Moderation", delivery_days: 1, hot: true, views: 1245, rating: 4.9 },
      { title: "1-on-1 User Onboarding", description: "Personalized onboarding session: platform walkthrough, profile setup, first gig guidance, and tips for success.", category: "Other", points: 30, wants: "User Feedback", delivery_days: 1, hot: true, views: 2103, rating: 5.0 },
      { title: "Account Recovery Assistance", description: "Help users regain access to locked accounts, reset credentials, and verify identity for account recovery.", category: "Other", points: 20, wants: null, delivery_days: 1, hot: false, views: 567, rating: 4.8 },
      { title: "Complaint Resolution Support", description: "Investigate user complaints, mediate disputes, and provide fair resolutions following platform guidelines.", category: "Other", points: 40, wants: null, delivery_days: 2, hot: false, views: 734, rating: 4.9 },
      { title: "Platform Feature Walkthrough", description: "Detailed demo of advanced features: workspace tools, guild management, marketplace filters, and analytics.", category: "Other", points: 25, wants: "Feature Feedback", delivery_days: 1, hot: true, views: 1567, rating: 5.0 },
      { title: "Bug Report Triage", description: "Review, categorize, and prioritize incoming bug reports. Reproduce issues and prepare detailed engineering tickets.", category: "Development", points: 35, wants: "Bug Reports", delivery_days: 1, hot: false, views: 423, rating: 4.7 },
      { title: "Community Guidelines Consultation", description: "One-on-one session explaining community rules, acceptable behavior, and best practices for successful swapping.", category: "Other", points: 15, wants: null, delivery_days: 1, hot: false, views: 389, rating: 4.9 },
      { title: "ELO Dispute Mediation", description: "Review ELO-related disputes, analyze match history, and provide fair ELO adjustments based on evidence.", category: "Other", points: 45, wants: null, delivery_days: 3, hot: false, views: 612, rating: 4.8 },
      { title: "Enterprise Integration Setup", description: "Help enterprise clients set up API integrations, configure webhooks, and connect with Slack/Jira/GitHub.", category: "Development", points: 80, wants: "Integration Testing", delivery_days: 5, hot: true, views: 945, rating: 5.0 },
    ];

    for (const gig of gigs) {
      await supabase.from("listings").insert({
        ...gig,
        user_id: adminUserId,
        status: "active",
        format: "Direct Swap",
        price: `${gig.points} SP`,
      });
    }

    // 7. Seed blog posts
    const blogPosts = [
      { slug: "welcome-to-skillswaprr", title: "Welcome to SkillSwappr", category: "Announcements", excerpt: "Everything you need to know about the skill exchange revolution.", tags: ["welcome", "getting-started", "platform"], read_time: 4, is_featured: true, is_published: true, view_count: 4520, like_count: 312, comment_count: 45 },
      { slug: "getting-started-first-swap", title: "Getting Started: Your First Skill Swap", category: "Tutorials", excerpt: "A step-by-step guide to completing your first skill exchange on the platform.", tags: ["tutorial", "beginner", "guide"], read_time: 6, is_featured: false, is_published: true, view_count: 8934, like_count: 567, comment_count: 89 },
      { slug: "troubleshooting-common-issues", title: "Troubleshooting Common Issues", category: "Support", excerpt: "Solutions to the most frequently reported problems on SkillSwappr.", tags: ["support", "troubleshooting", "faq"], read_time: 5, is_featured: false, is_published: true, view_count: 3201, like_count: 145, comment_count: 23 },
      { slug: "understanding-elo-tier-system", title: "Understanding the ELO & Tier System", category: "Education", excerpt: "How ELO ratings work, what tiers mean, and how to climb the ranks.", tags: ["elo", "tiers", "gamification", "ranking"], read_time: 8, is_featured: true, is_published: true, view_count: 12450, like_count: 890, comment_count: 134 },
      { slug: "how-to-write-great-gig-listing", title: "How to Write a Great Gig Listing", category: "Tutorials", excerpt: "Tips and tricks for creating listings that attract the best skill swaps.", tags: ["tutorial", "marketplace", "tips"], read_time: 5, is_featured: false, is_published: true, view_count: 6780, like_count: 432, comment_count: 67 },
      { slug: "guild-wars-strategy-guide", title: "Guild Wars: The Ultimate Strategy Guide", category: "Community", excerpt: "Win more Guild Wars with these proven strategies from top-ranked guilds.", tags: ["guilds", "guild-wars", "strategy", "competition"], read_time: 10, is_featured: true, is_published: true, view_count: 9200, like_count: 678, comment_count: 112 },
      { slug: "platform-security-safety-tips", title: "Platform Security & Safety Tips", category: "Security", excerpt: "How we protect you and what you can do to stay safe on SkillSwappr.", tags: ["security", "safety", "trust", "privacy"], read_time: 6, is_featured: false, is_published: true, view_count: 5430, like_count: 289, comment_count: 34 },
      { slug: "quarterly-wrap-q1-2026", title: "Quarterly Wrap: What's New in Q1 2026", category: "Announcements", excerpt: "A look back at everything we shipped in Q1 2026 — new features, improvements, and community milestones.", tags: ["quarterly-wrap", "updates", "features", "milestone"], read_time: 7, is_featured: true, is_published: true, view_count: 7890, like_count: 534, comment_count: 78 },
    ];

    const blogContent = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "This is a comprehensive article covering everything you need to know. Stay tuned for more updates from the SkillSwappr team." }] },
        { type: "paragraph", content: [{ type: "text", text: "We're constantly improving the platform based on your feedback. If you have suggestions, head to the Roadmap page and vote on features!" }] },
      ],
    };

    for (const post of blogPosts) {
      const { error } = await supabase.from("blog_posts").upsert({
        ...post,
        author_id: adminUserId,
        author_name: "SkillSwappr Admin",
        content: blogContent,
        cover_image: null,
      }, { onConflict: "slug" });
      if (error) console.log("Blog insert error:", error.message);
    }

    // 8. Ensure forum categories exist
    const categories = [
      { name: "General", slug: "general", description: "General discussions about SkillSwappr", icon: "💬", color: "foreground" },
      { name: "Introductions", slug: "introductions", description: "Introduce yourself to the community", icon: "👋", color: "skill-green" },
      { name: "Feature Requests", slug: "feature-requests", description: "Suggest new features and improvements", icon: "💡", color: "badge-gold" },
      { name: "Bug Reports", slug: "bug-reports", description: "Report bugs and issues", icon: "🐛", color: "alert-red" },
      { name: "Tips & Tricks", slug: "tips-tricks", description: "Share your best practices", icon: "🎯", color: "court-blue" },
      { name: "Guild Recruitment", slug: "guild-recruitment", description: "Find members or join a guild", icon: "⚔️", color: "court-blue" },
      { name: "Marketplace", slug: "marketplace-discussion", description: "Discuss marketplace trends and tips", icon: "🏪", color: "badge-gold" },
      { name: "Off-Topic", slug: "off-topic", description: "Chat about anything else", icon: "🎲", color: "muted-foreground" },
    ];

    const categoryIds: Record<string, string> = {};
    for (const cat of categories) {
      const { data } = await supabase
        .from("forum_categories")
        .upsert(cat, { onConflict: "slug" })
        .select("id")
        .single();
      if (data) categoryIds[cat.slug] = data.id;
    }

    // 9. Seed forum threads
    const threads = [
      { title: "👋 Welcome to SkillSwappr Forums!", content: "Welcome to the official SkillSwappr community forums! This is your space to connect, share, and learn from fellow skill swappers. Please read the community guidelines before posting. We're excited to have you here!", category: "introductions", is_pinned: true, upvotes: 234, view_count: 8900 },
      { title: "📜 Platform Rules & Community Guidelines", content: "Please review these guidelines before participating:\n\n1. Be respectful and constructive\n2. No spam or self-promotion outside of designated areas\n3. Report violations using the flag button\n4. Keep discussions on-topic\n5. Protect your personal information\n\nViolations may result in warnings, temporary bans, or permanent removal.", category: "general", is_pinned: true, upvotes: 189, view_count: 12340 },
      { title: "💡 Feature Request: Dark Mode Scheduling", content: "Would love to have the ability to schedule dark mode to automatically switch based on time of day. Anyone else interested in this?", category: "feature-requests", is_pinned: false, upvotes: 67, view_count: 1230 },
      { title: "🐛 Bug: Avatar not updating after upload", content: "I've tried uploading a new avatar three times and it keeps reverting to the default. I'm using Chrome on macOS. Has anyone else experienced this?", category: "bug-reports", is_pinned: false, upvotes: 23, view_count: 456 },
      { title: "🏆 How I Reached Diamond Tier in 6 Months", content: "Here's my journey from Bronze to Diamond:\n\n1. Focused on one core skill (React development)\n2. Maintained a 30-day streak for 3x multiplier\n3. Joined an active guild for Guild Wars bonuses\n4. Always delivered early with high quality\n5. Served as a judge in Skill Court for extra SP\n\nAMA about the climb!", category: "tips-tricks", is_pinned: false, upvotes: 312, view_count: 5670 },
      { title: "Best Practices for Gig Descriptions", content: "After 200+ completed gigs, here's what I've learned about writing listings that convert:\n\n- Be specific about deliverables\n- Include examples of past work\n- Set realistic timelines\n- Use relevant tags\n- Price fairly based on market data\n\nWhat are your tips?", category: "tips-tricks", is_pinned: false, upvotes: 189, view_count: 3420 },
      { title: "⚔️ [Recruiting] Phoenix Rising Guild — All Tiers Welcome", content: "Phoenix Rising is looking for new members! We're a friendly, competitive guild focused on design and development.\n\nRequirements:\n- Active at least 3 days/week\n- Willing to participate in Guild Wars\n- Good vibes only 😄\n\nDM me or reply here to apply!", category: "guild-recruitment", is_pinned: false, upvotes: 45, view_count: 890 },
      { title: "Marketplace Tips: When to Use Flash Market", content: "Flash Market gigs can earn you up to 3x the normal SP, but timing is everything. Here's when to post:\n\n- Weekday evenings (6-9 PM UTC) have the highest traffic\n- Quick tasks (under 2 hours) perform best\n- Design and writing tasks get the fastest responses\n\nWhat's your Flash Market strategy?", category: "marketplace-discussion", is_pinned: false, upvotes: 78, view_count: 2100 },
    ];

    for (const thread of threads) {
      const categoryId = categoryIds[thread.category];
      if (!categoryId) continue;
      
      await supabase.from("forum_threads").insert({
        title: thread.title,
        content: thread.content,
        author_id: adminUserId,
        author_name: "SkillSwappr Admin",
        category_id: categoryId,
        is_pinned: thread.is_pinned,
        upvotes: thread.upvotes,
        view_count: thread.view_count,
        comment_count: 0,
      });
    }

    // 10. Seed some events
    const events = [
      { title: "Design Sprint Showdown", description: "48-hour design challenge. Teams of 4 compete to redesign a real product.", category: "Design", event_type: "Tournament", event_date: "2026-04-22T15:00:00Z", spots: 64, spots_filled: 48, icon: "🎯", prize: "5,000 SP", is_featured: true, tags: ["design", "competition", "teams"] },
      { title: "Guild Wars: Season 5 Kickoff", description: "Guild vs Guild. 5 rounds. Strategy, skill, and teamwork determine the champion.", category: "Competition", event_type: "Tournament", event_date: "2026-05-01T18:00:00Z", spots: 32, spots_filled: 24, icon: "⚔️", prize: "15,000 SP", is_featured: true, tags: ["guilds", "tournament", "competition"] },
      { title: "Code & Coffee — NYC Meetup", description: "Casual Saturday morning meetup at Brooklyn Roasting. Bring your laptop and enthusiasm.", category: "Networking", event_type: "In-Person", event_date: "2026-04-28T14:00:00Z", spots: 40, spots_filled: 28, icon: "☕", prize: null, is_featured: false, tags: ["meetup", "networking", "nyc"] },
      { title: "ELO Blitz: Weekend Warrior", description: "48-hour ELO sprint. Complete as many gigs as possible. Top 10 get Diamond badges.", category: "Competition", event_type: "Tournament", event_date: "2026-05-15T12:00:00Z", spots: 256, spots_filled: 189, icon: "🔥", prize: "8,000 SP", is_featured: true, tags: ["elo", "sprint", "competition"] },
      { title: "API Workshop: Building Integrations", description: "Hands-on workshop with the SkillSwappr API team. Build your first integration live.", category: "Dev", event_type: "Workshop", event_date: "2026-05-05T14:00:00Z", spots: 100, spots_filled: 67, icon: "🔧", prize: null, is_featured: false, tags: ["workshop", "api", "development"] },
    ];

    for (const event of events) {
      await supabase.from("events").insert({
        ...event,
        created_by: adminUserId,
        status: "upcoming",
      });
    }

    return new Response(JSON.stringify({ success: true, adminUserId }), {
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
