import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // 1. Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "Admin123@skillswaprr.com",
      password: "Admin123!",
      email_confirm: true,
      user_metadata: { full_name: "SkillSwappr Admin" },
    });

    if (authError && !authError.message.includes("already been registered")) {
      throw authError;
    }

    // Get admin user id
    let adminId: string;
    if (authData?.user) {
      adminId = authData.user.id;
    } else {
      const { data: users } = await supabase.auth.admin.listUsers();
      const admin = users?.users?.find((u: any) => u.email === "admin123@skillswaprr.com");
      if (!admin) throw new Error("Admin user not found");
      adminId = admin.id;
    }

    // Update profile
    await supabase.from("profiles").update({
      display_name: "SkillSwappr Admin",
      full_name: "SkillSwappr Admin",
      bio: "Official SkillSwappr platform administrator. Here to keep the community running smoothly.",
      avatar_emoji: "👑",
      elo: 2000,
      sp: 99999,
      skills_offered: ["Platform Management", "Community Support", "Dispute Resolution"],
      skills_wanted: ["User Feedback", "Bug Reports"],
      hero_color: "#FFD700",
    }).eq("user_id", adminId);

    // Assign admin role
    await supabase.from("user_roles").upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id,role" });

    // 2. Create Admin Guild
    const { data: guild } = await supabase.from("guilds").insert({
      name: "SkillSwappr HQ",
      description: "Official SkillSwappr administration guild. Platform updates, mod discussions, and community management.",
      slogan: "Building the skill economy, one swap at a time.",
      category: "Administration",
      created_by: adminId,
      is_public: true,
      avg_elo: 2000,
      rank: 1,
      total_sp: 50000,
      total_gigs: 100,
      win_rate: 95,
      perks: ["Priority Support", "Beta Access", "Mod Tools", "Custom Badge"],
      requirements: ["Invited Only", "Must be verified"],
    }).select("id").single();

    const guildId = guild?.id;

    if (guildId) {
      // Add admin as guild leader
      await supabase.from("guild_members").insert({ guild_id: guildId, user_id: adminId, role: "leader" });

      // Create guild channels
      await supabase.from("guild_channels").insert([
        { guild_id: guildId, name: "general", description: "General discussion", position: 0, created_by: adminId },
        { guild_id: guildId, name: "announcements", description: "Official announcements", position: 1, created_by: adminId },
        { guild_id: guildId, name: "bug-reports", description: "Report bugs here", position: 2, created_by: adminId },
        { guild_id: guildId, name: "feature-requests", description: "Suggest new features", position: 3, created_by: adminId },
      ]);
    }

    // 3. Create Admin Enterprise
    await supabase.from("enterprise_accounts").insert({
      name: "SkillSwappr Official",
      owner_id: adminId,
      plan: "enterprise",
      max_seats: 100,
    });

    // 4. Create Admin Gigs/Listings
    await supabase.from("listings").insert([
      {
        user_id: adminId, title: "System Maintenance & Health Check", description: "Regular platform maintenance, performance optimization, and system health monitoring. Ensuring SkillSwappr runs smoothly 24/7.",
        category: "Development", format: "direct", price: "500 SP", points: 500, status: "active", rating: 5, views: 342, hot: true, delivery_days: 1,
      },
      {
        user_id: adminId, title: "Human Gig Review & Quality Assurance", description: "Manual review of gig listings for quality, accuracy, and compliance. Ensuring marketplace integrity and trust.",
        category: "Design", format: "direct", price: "200 SP", points: 200, status: "active", rating: 5, views: 218, hot: false, delivery_days: 2,
      },
      {
        user_id: adminId, title: "1-on-1 Platform Onboarding Session", description: "Personal walkthrough of SkillSwappr features, tips for getting started, and strategy for earning your first Skill Points.",
        category: "Marketing", format: "direct", price: "100 SP", points: 100, status: "active", rating: 5, views: 567, hot: true, delivery_days: 1,
      },
      {
        user_id: adminId, title: "Dispute Mediation & Resolution", description: "Professional mediation for skill swap disputes. Fair, transparent, and efficient conflict resolution.",
        category: "Writing", format: "direct", price: "300 SP", points: 300, status: "active", rating: 5, views: 189, hot: false, delivery_days: 3,
      },
      {
        user_id: adminId, title: "Community Event Planning & Hosting", description: "Planning and hosting community events, workshops, and competitions on the SkillSwappr platform.",
        category: "Marketing", format: "cocreation", price: "400 SP", points: 400, status: "active", rating: 5, views: 145, hot: false, delivery_days: 7,
      },
    ]);

    // 5. Seed Blog Posts
    const blogPosts = [
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "welcome-to-skillswappr",
        title: "Welcome to SkillSwappr — Your Journey Starts Here!", excerpt: "Everything you need to know about getting started on the skill economy's most exciting platform.",
        content: { blocks: [
          { type: "paragraph", text: "Welcome to SkillSwappr! We're thrilled to have you join the fastest-growing skill exchange community. Whether you're a student looking to learn, a professional wanting to share your expertise, or a team seeking talent — you're in the right place." },
          { type: "heading", text: "What is SkillSwappr?" },
          { type: "paragraph", text: "SkillSwappr is a platform where skills are currency. Instead of paying money, you exchange your abilities directly with others using our unique Skill Points (SP) system." },
          { type: "heading", text: "Getting Started" },
          { type: "paragraph", text: "1. Complete your profile — add your skills, interests, and a catchy bio.\n2. Browse the marketplace — find gigs that match your needs.\n3. Create your first gig — offer what you know, request what you need.\n4. Join a Guild — team up with like-minded swappers.\n5. Climb the ranks — earn SP, boost your ELO, unlock achievements." },
          { type: "paragraph", text: "Ready to swap? Head to the marketplace and start exploring!" },
        ]},
        category: "Guide", tags: ["getting-started", "beginners", "tutorial", "welcome"], read_time: 4, is_featured: true, is_published: true, view_count: 1250, like_count: 89, comment_count: 12,
        cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "troubleshooting-common-issues",
        title: "Troubleshooting Guide: Fixing Common Issues", excerpt: "Running into problems? Here's how to solve the most common issues on SkillSwappr.",
        content: { blocks: [
          { type: "paragraph", text: "We know that sometimes things don't go as planned. This guide covers the most common issues and their solutions." },
          { type: "heading", text: "Can't Log In?" },
          { type: "paragraph", text: "Try resetting your password via the login page. Make sure your email is verified. Clear your browser cache and try again." },
          { type: "heading", text: "Gig Not Showing Up?" },
          { type: "paragraph", text: "New gigs may take a few minutes to appear. Make sure your gig status is set to 'Active' and all required fields are filled." },
          { type: "heading", text: "SP Not Credited?" },
          { type: "paragraph", text: "SP transfers happen after both parties confirm completion. Check your transaction history in the dashboard for pending transfers." },
          { type: "heading", text: "Still Need Help?" },
          { type: "paragraph", text: "Contact our support team through the Help Center or use the live chat widget. We're here Monday–Friday, 9am–6pm EST." },
        ]},
        category: "Tips", tags: ["troubleshooting", "help", "FAQ", "support"], read_time: 3, is_featured: false, is_published: true, view_count: 876, like_count: 45, comment_count: 8,
        cover_image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "how-skill-points-work",
        title: "How Skill Points (SP) Work: The Complete Guide", excerpt: "Understanding the SP economy — earning, spending, and maximizing your skill currency.",
        content: { blocks: [
          { type: "paragraph", text: "Skill Points (SP) are the lifeblood of SkillSwappr. They represent the value of your skills and enable fair exchanges across the platform." },
          { type: "heading", text: "Earning SP" },
          { type: "paragraph", text: "Complete gigs, win competitions, contribute to guilds, and maintain your streak to earn SP. Higher-rated work earns more points." },
          { type: "heading", text: "Spending SP" },
          { type: "paragraph", text: "Use SP to hire other swappers, bid on auctions, enter tournaments, and access premium features." },
          { type: "heading", text: "SP Tips" },
          { type: "paragraph", text: "• Maintain a daily streak for bonus SP\n• Complete challenges for SP multipliers\n• Guild members earn shared SP from projects\n• High ELO = higher SP rates" },
        ]},
        category: "Guide", tags: ["skill-points", "economy", "guide", "SP"], read_time: 5, is_featured: true, is_published: true, view_count: 2100, like_count: 156, comment_count: 34,
        cover_image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "mastering-the-marketplace",
        title: "Mastering the Marketplace: Tips for Success", excerpt: "Pro tips for creating compelling gigs, winning clients, and building your reputation.",
        content: { blocks: [
          { type: "paragraph", text: "The marketplace is where the magic happens. Here's how to stand out and succeed." },
          { type: "heading", text: "Creating a Great Gig Listing" },
          { type: "paragraph", text: "Use a clear, descriptive title. Add detailed descriptions of what you offer. Set fair SP pricing. Include examples of past work." },
          { type: "heading", text: "Building Your Reputation" },
          { type: "paragraph", text: "Deliver on time, communicate clearly, and always aim for 5-star reviews. Your ELO rating is everything on SkillSwappr." },
          { type: "heading", text: "Advanced Strategies" },
          { type: "paragraph", text: "• Use auctions for high-demand skills\n• Join co-creation projects for bigger SP pools\n• Create skill fusions to offer unique packages\n• Leverage your guild for referrals" },
        ]},
        category: "Tips", tags: ["marketplace", "tips", "success", "strategy"], read_time: 6, is_featured: false, is_published: true, view_count: 1567, like_count: 98, comment_count: 21,
        cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "guild-wars-guide",
        title: "Guild Wars: Strategy, Teamwork & Glory", excerpt: "Everything you need to dominate in Guild Wars — from team composition to battle tactics.",
        content: { blocks: [
          { type: "paragraph", text: "Guild Wars are the ultimate test of teamwork on SkillSwappr. Here's your complete strategy guide." },
          { type: "heading", text: "What Are Guild Wars?" },
          { type: "paragraph", text: "Guilds compete head-to-head in skill challenges. The winning guild earns SP, badges, and bragging rights." },
          { type: "heading", text: "Building Your Team" },
          { type: "paragraph", text: "Diversify your guild's skills. You need designers, developers, writers, and strategists working together." },
          { type: "heading", text: "Battle Tips" },
          { type: "paragraph", text: "• Assign roles based on strengths\n• Communicate constantly\n• Focus on quality over speed\n• Study your opponent's past wars" },
        ]},
        category: "Community", tags: ["guilds", "guild-wars", "strategy", "competition"], read_time: 7, is_featured: false, is_published: true, view_count: 934, like_count: 67, comment_count: 15,
        cover_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "platform-review-q1-2026",
        title: "Platform Review: Q1 2026 — What We've Built", excerpt: "A look back at our biggest updates, milestones, and community achievements this quarter.",
        content: { blocks: [
          { type: "paragraph", text: "What an incredible quarter! Here's everything that happened on SkillSwappr in Q1 2026." },
          { type: "heading", text: "Key Milestones" },
          { type: "paragraph", text: "• 10,000+ active users\n• 50,000+ gigs completed\n• 200+ guilds formed\n• 15 university partnerships" },
          { type: "heading", text: "New Features" },
          { type: "paragraph", text: "We launched Skill Fusion, Flash Market, Co-Creation projects, and the completely redesigned Dashboard." },
          { type: "heading", text: "What's Next" },
          { type: "paragraph", text: "Q2 brings global messaging, enhanced profiles, mobile app improvements, and the SkillSwappr API." },
        ]},
        category: "Announcement", tags: ["review", "update", "announcement", "milestone"], read_time: 4, is_featured: true, is_published: true, view_count: 3200, like_count: 234, comment_count: 45,
        cover_image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
      },
      {
        author_id: adminId, author_name: "SkillSwappr Admin", slug: "elo-rating-explained",
        title: "ELO Rating System Explained: How Rankings Work", excerpt: "Understand how the ELO system determines your rank, tier, and marketplace visibility.",
        content: { blocks: [
          { type: "paragraph", text: "Your ELO rating is your reputation score on SkillSwappr. Here's everything you need to know." },
          { type: "heading", text: "The Tiers" },
          { type: "paragraph", text: "• Bronze (under 1300): Getting started\n• Silver (1300-1499): Established swapper\n• Gold (1500-1699): Top performer\n• Diamond (1700+): Elite status" },
          { type: "heading", text: "How ELO Changes" },
          { type: "paragraph", text: "Completing gigs successfully increases ELO. Disputes, cancellations, and low ratings decrease it. The system is designed to be fair and transparent." },
        ]},
        category: "Guide", tags: ["elo", "ranking", "tiers", "guide"], read_time: 3, is_featured: false, is_published: true, view_count: 1890, like_count: 112, comment_count: 28,
        cover_image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800",
      },
    ];

    await supabase.from("blog_posts").insert(blogPosts);

    // 6. Seed Forum Categories
    const forumCategories = [
      { name: "General Discussion", slug: "general", description: "Chat about anything SkillSwappr related", icon: "💬", color: "#6366f1", thread_count: 0 },
      { name: "Help & Support", slug: "help", description: "Get help from the community", icon: "🆘", color: "#ef4444", thread_count: 0 },
      { name: "Feature Requests", slug: "features", description: "Suggest new features and improvements", icon: "💡", color: "#f59e0b", thread_count: 0 },
      { name: "Showcase", slug: "showcase", description: "Show off your work and achievements", icon: "🏆", color: "#10b981", thread_count: 0 },
      { name: "Guild Talk", slug: "guilds", description: "Guild recruitment, strategies, and discussions", icon: "⚔️", color: "#8b5cf6", thread_count: 0 },
      { name: "Bug Reports", slug: "bugs", description: "Report bugs and technical issues", icon: "🐛", color: "#ec4899", thread_count: 0 },
      { name: "Marketplace Tips", slug: "marketplace", description: "Tips and strategies for the marketplace", icon: "🏪", color: "#06b6d4", thread_count: 0 },
      { name: "Off-Topic", slug: "off-topic", description: "Everything else — memes, life, hobbies", icon: "🎲", color: "#78716c", thread_count: 0 },
    ];

    const { data: insertedCats } = await supabase.from("forum_categories").insert(forumCategories).select("id, slug");
    const catMap: Record<string, string> = {};
    insertedCats?.forEach((c: any) => { catMap[c.slug] = c.id; });

    // 7. Seed Forum Threads
    const forumThreads = [
      {
        category_id: catMap["general"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "👋 Welcome to SkillSwappr Forums! Read This First", content: "Welcome to the official SkillSwappr community forums! This is your space to connect, share, and grow.\n\n**Forum Rules:**\n1. Be respectful and constructive\n2. No spam or self-promotion outside Showcase\n3. Use appropriate categories\n4. Search before posting duplicates\n5. Report bugs in the Bug Reports category\n\nHappy swapping! 🎉",
        is_pinned: true, is_locked: false, view_count: 1500, upvotes: 89, downvotes: 0, comment_count: 15, tags: ["welcome", "rules", "pinned"],
      },
      {
        category_id: catMap["help"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "📖 FAQ: Frequently Asked Questions", content: "**Q: How do I earn Skill Points?**\nA: Complete gigs, maintain streaks, win competitions, and contribute to guilds.\n\n**Q: What's the ELO system?**\nA: It's your reputation score. Higher ELO = better visibility and higher SP rates.\n\n**Q: How do disputes work?**\nA: Use Skill Court to file a dispute. A jury of peers reviews the case.\n\n**Q: Can I join multiple guilds?**\nA: Yes! You can be a member of up to 3 guilds.\n\n**Q: Is SkillSwappr free?**\nA: The core platform is free. Premium features are available via SP or subscription.",
        is_pinned: true, is_locked: false, view_count: 2300, upvotes: 156, downvotes: 2, comment_count: 34, tags: ["FAQ", "help", "pinned"],
      },
      {
        category_id: catMap["features"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "🗳️ Vote for Features You Want in 2026!", content: "We're planning our 2026 roadmap and want YOUR input!\n\nHead to the Roadmap page to vote on upcoming features, or suggest new ones right here in this thread.\n\nSome ideas being considered:\n- Mobile app (iOS & Android)\n- AI-powered skill matching\n- Video call integration\n- Marketplace analytics dashboard\n- Guild tournaments expansion\n\nWhat would YOU like to see?",
        is_pinned: false, is_locked: false, view_count: 890, upvotes: 67, downvotes: 3, comment_count: 28, tags: ["roadmap", "features", "voting"],
      },
      {
        category_id: catMap["showcase"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "🌟 Swapper of the Month: Share Your Success Story!", content: "Every month we highlight outstanding community members. Share your SkillSwappr journey here!\n\nTell us:\n- What skills do you offer/want?\n- Best swap you've done\n- Tips for new swappers\n- Your proudest achievement on the platform\n\nThe most inspiring stories get featured on our blog and earn bonus SP! 🏆",
        is_pinned: false, is_locked: false, view_count: 567, upvotes: 45, downvotes: 1, comment_count: 19, tags: ["showcase", "community", "success"],
      },
      {
        category_id: catMap["guilds"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "⚔️ Guild Wars Season 2 Announcement!", content: "Guild Wars Season 2 is coming!\n\n**Dates:** Starting next month\n**Format:** Round-robin with knockout finals\n**Stakes:** 5,000 SP pool per match\n**New Rules:**\n- Max 10 members per war team\n- Skill diversity bonuses\n- Live spectator mode\n\nStart assembling your teams NOW. May the best guild win! 💪",
        is_pinned: false, is_locked: false, view_count: 1234, upvotes: 78, downvotes: 0, comment_count: 42, tags: ["guild-wars", "competition", "announcement"],
      },
      {
        category_id: catMap["marketplace"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "💰 Top 10 Tips for Getting Your First 1000 SP", content: "New to SkillSwappr? Here's how to hit your first 1000 SP milestone:\n\n1. Complete your profile (100% = bonus SP)\n2. Create 3+ gig listings\n3. Respond to requests quickly\n4. Maintain a daily login streak\n5. Join an active guild\n6. Participate in community events\n7. Write helpful forum posts\n8. Complete the onboarding challenges\n9. Refer friends (earn 50 SP each)\n10. Focus on quality — 5-star reviews boost everything\n\nShare your own tips below! 👇",
        is_pinned: false, is_locked: false, view_count: 1890, upvotes: 134, downvotes: 2, comment_count: 56, tags: ["tips", "SP", "beginners", "guide"],
      },
      {
        category_id: catMap["bugs"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "🐛 How to Report a Bug Properly", content: "Found a bug? Here's how to report it effectively:\n\n1. **Title:** Brief description of the issue\n2. **Steps to reproduce:** What did you do?\n3. **Expected behavior:** What should have happened?\n4. **Actual behavior:** What actually happened?\n5. **Screenshots:** If applicable\n6. **Browser/Device:** Chrome, Firefox, mobile, etc.\n\nGood bug reports help us fix issues faster. Thank you for helping improve SkillSwappr! 🙏",
        is_pinned: true, is_locked: false, view_count: 456, upvotes: 34, downvotes: 0, comment_count: 8, tags: ["bugs", "reporting", "guide", "pinned"],
      },
      {
        category_id: catMap["general"], author_id: adminId, author_name: "SkillSwappr Admin",
        title: "🎉 Celebrating 10,000 Users! Thank You!!", content: "We just hit 10,000 registered users! 🎊\n\nThis milestone wouldn't be possible without each and every one of you. From our first beta testers to our newest members — thank you for believing in the skill economy.\n\nTo celebrate, we're giving away:\n- 500 SP to every active user\n- Special '10K Pioneer' badge\n- Double SP weekend\n\nHere's to the next 10,000! 🚀",
        is_pinned: false, is_locked: false, view_count: 2567, upvotes: 234, downvotes: 1, comment_count: 89, tags: ["milestone", "celebration", "community"],
      },
    ];

    await supabase.from("forum_threads").insert(forumThreads);

    // Update category thread counts
    for (const [slug, catId] of Object.entries(catMap)) {
      const count = forumThreads.filter(t => t.category_id === catId).length;
      await supabase.from("forum_categories").update({ thread_count: count }).eq("id", catId);
    }

    // 8. Seed some blog comments
    const { data: blogPostsData } = await supabase.from("blog_posts").select("id, slug").limit(3);
    if (blogPostsData?.length) {
      const blogComments = [
        { post_id: blogPostsData[0].id, author_id: adminId, author_name: "SkillSwappr Admin", content: "Welcome everyone! Feel free to ask questions here. We're happy to help you get started! 🚀", like_count: 12 },
        { post_id: blogPostsData[0].id, author_name: "NewSwapper", content: "This is amazing! Just signed up and already loving the platform.", like_count: 5 },
        { post_id: blogPostsData[0].id, author_name: "DesignPro", content: "Great guide! Would love to see more tutorials on the marketplace.", like_count: 8 },
      ];
      await supabase.from("blog_comments").insert(blogComments);
    }

    // 9. Add some forum comments
    const { data: forumThreadsData } = await supabase.from("forum_threads").select("id, title").limit(3);
    if (forumThreadsData?.length) {
      const forumComments = [
        { thread_id: forumThreadsData[0].id, author_id: adminId, author_name: "SkillSwappr Admin", content: "Thanks for reading! If you have any questions about the rules, don't hesitate to ask.", upvotes: 15, downvotes: 0 },
        { thread_id: forumThreadsData[0].id, author_name: "CuriousUser", content: "Love the community guidelines! Very clear and fair.", upvotes: 8, downvotes: 0 },
        { thread_id: forumThreadsData[1].id, author_id: adminId, author_name: "SkillSwappr Admin", content: "This FAQ is updated regularly. Let us know if you think something should be added!", upvotes: 12, downvotes: 0 },
      ];
      await supabase.from("forum_comments").insert(forumComments);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      adminId,
      guildId,
      message: "Admin user, guild, enterprise, gigs, blog posts, and forum content seeded successfully!" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
