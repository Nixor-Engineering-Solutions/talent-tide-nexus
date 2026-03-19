import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Create admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "Admin123@skillswaprr.com",
      password: "Admin123!",
      email_confirm: true,
      user_metadata: { full_name: "SkillSwappr Admin" }
    });

    if (userError && !userError.message?.includes("already been registered")) {
      throw userError;
    }

    // Get user id
    let adminId: string;
    if (userData?.user?.id) {
      adminId = userData.user.id;
    } else {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const admin = existingUsers?.users?.find((u: any) => u.email === "Admin123@skillswaprr.com");
      if (!admin) throw new Error("Could not find admin user");
      adminId = admin.id;
    }

    // 2. Update profile (trigger should have created it)
    await supabase.from("profiles").update({
      display_name: "SkillSwappr Admin",
      full_name: "SkillSwappr Admin",
      bio: "Official SkillSwappr platform administrator. Managing system gigs, moderating content, and keeping the community running smoothly.",
      elo: 2500,
      sp: 999999,
      tier: "Diamond",
      skills: ["System Administration", "Community Management", "Quality Assurance", "Platform Operations"],
      avatar_emoji: "🛡️",
      university: "SkillSwappr HQ",
      onboarding_complete: true,
      location: "Global",
      languages: ["English"],
      availability: "Always Online",
      slogan: "Building the future of skill exchange",
    }).eq("user_id", adminId);

    // 3. Set admin role
    await supabase.from("user_roles").upsert({
      user_id: adminId,
      role: "admin",
    }, { onConflict: "user_id,role" });

    // 4. Create admin listings
    const listings = [
      { title: "System Maintenance & Health Check", description: "Comprehensive platform maintenance including performance optimization, security audits, and system health monitoring. Ensures SkillSwappr runs at peak performance.", category: "Development", points: 100, format: "gig", wants: "Bug Reports & Feedback", delivery_days: 3, rating: 5.0, hot: true, views: 1500 },
      { title: "Human Gig Review & Quality Assurance", description: "Manual review of gig deliverables by our quality team. Ensures all submitted work meets platform standards before final approval.", category: "Other", points: 50, format: "gig", wants: "Detailed Deliverables", delivery_days: 1, rating: 4.9, hot: true, views: 2200 },
      { title: "1-on-1 Onboarding Support", description: "Personal onboarding session for new users. Walk through the platform, set up your profile, understand skill points, and get matched with your first swap partner.", category: "Other", points: 25, format: "gig", wants: "New User Enthusiasm", delivery_days: 1, rating: 5.0, hot: false, views: 890 },
      { title: "Community Moderation & Dispute Mediation", description: "Fair and transparent dispute resolution between swap partners. Our moderation team reviews evidence, facilitates dialogue, and ensures fair outcomes.", category: "Other", points: 75, format: "gig", wants: "Fair Documentation", delivery_days: 2, rating: 4.8, hot: false, views: 650 },
      { title: "Platform Feature Testing & Beta Access", description: "Help shape the future of SkillSwappr by testing new features before release. Provide feedback, report bugs, and earn bonus SP for quality contributions.", category: "Development", points: 150, format: "gig", wants: "Detailed Feedback", delivery_days: 7, rating: 4.9, hot: true, views: 1800 },
    ];

    for (const listing of listings) {
      await supabase.from("listings").insert({
        ...listing,
        user_id: adminId,
        status: "active",
      });
    }

    // 5. Create admin guild
    const { data: guildData } = await supabase.from("guilds").insert({
      name: "SkillSwappr HQ",
      description: "The official SkillSwappr headquarters guild. Home of the platform team, moderators, and founding community members.",
      slogan: "Building the future of skill exchange",
      category: "Other",
      created_by: adminId,
      is_public: true,
      avg_elo: 2000,
      total_sp: 500000,
      total_gigs: 250,
      rank: 1,
      win_rate: 85,
      perks: ["Priority Support", "Beta Access", "Custom Badges", "Mod Powers"],
      requirements: ["Invitation Only", "1500+ ELO", "Verified Account"],
    }).select("id").single();

    if (guildData) {
      await supabase.from("guild_members").insert({
        guild_id: guildData.id,
        user_id: adminId,
        role: "leader",
      });
    }

    // 6. Create admin enterprise
    await supabase.from("enterprise_accounts").insert({
      name: "SkillSwappr Official",
      owner_id: adminId,
      plan: "enterprise",
      max_seats: 100,
    });

    return new Response(JSON.stringify({ success: true, adminId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
