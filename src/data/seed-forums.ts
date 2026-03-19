/**
 * Local test forum data for development/testing.
 * Remove before production launch.
 */
export const seedForumCategories = [
  { name: "General", slug: "general", description: "General discussions about SkillSwappr", icon: "💬", color: "foreground" },
  { name: "Introductions", slug: "introductions", description: "Introduce yourself to the community", icon: "👋", color: "skill-green" },
  { name: "Feature Requests", slug: "feature-requests", description: "Suggest new features and improvements", icon: "💡", color: "badge-gold" },
  { name: "Bug Reports", slug: "bug-reports", description: "Report bugs and issues", icon: "🐛", color: "alert-red" },
  { name: "Tips & Tricks", slug: "tips-tricks", description: "Share your best practices", icon: "🎯", color: "court-blue" },
  { name: "Guild Recruitment", slug: "guild-recruitment", description: "Find members or join a guild", icon: "⚔️", color: "court-blue" },
  { name: "Marketplace", slug: "marketplace-discussion", description: "Discuss marketplace trends and tips", icon: "🏪", color: "badge-gold" },
  { name: "Off-Topic", slug: "off-topic", description: "Chat about anything else", icon: "🎲", color: "muted-foreground" },
];

export const seedForumThreads = [
  { title: "👋 Welcome to SkillSwappr Forums!", content: "Welcome to the official SkillSwappr community forums!", category: "introductions", is_pinned: true, upvotes: 234, view_count: 8900 },
  { title: "📜 Platform Rules & Community Guidelines", content: "Please review these guidelines before participating.", category: "general", is_pinned: true, upvotes: 189, view_count: 12340 },
  { title: "💡 Feature Request: Dark Mode Scheduling", content: "Would love auto dark mode scheduling based on time of day.", category: "feature-requests", is_pinned: false, upvotes: 67, view_count: 1230 },
  { title: "🐛 Bug: Avatar not updating after upload", content: "Avatar keeps reverting to default after upload on Chrome macOS.", category: "bug-reports", is_pinned: false, upvotes: 23, view_count: 456 },
  { title: "🏆 How I Reached Diamond Tier in 6 Months", content: "Here's my journey from Bronze to Diamond with tips.", category: "tips-tricks", is_pinned: false, upvotes: 312, view_count: 5670 },
  { title: "Best Practices for Gig Descriptions", content: "After 200+ gigs, here's what works for listing conversions.", category: "tips-tricks", is_pinned: false, upvotes: 189, view_count: 3420 },
  { title: "⚔️ [Recruiting] Phoenix Rising Guild", content: "Phoenix Rising is looking for new members! All tiers welcome.", category: "guild-recruitment", is_pinned: false, upvotes: 45, view_count: 890 },
  { title: "Marketplace Tips: When to Use Flash Market", content: "Flash Market timing and strategies for maximum SP.", category: "marketplace-discussion", is_pinned: false, upvotes: 78, view_count: 2100 },
];
