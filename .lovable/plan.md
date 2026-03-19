# Plan: Revert Hero, Seed Admin Data, Demo Data Strategy, Discover Enhancements

## Overview

Revert the landing page hero section to its original design, seed comprehensive admin data (user, profile, guild, enterprise, gigs, blog posts, forum threads), implement a "use demo data until real data is more impressive" pattern across marketing pages (excluding analytics, help, roadmap), add events and tournaments tabs to Discover, and expand FAQ/Features content.

---

## 1. Revert Landing Page Hero Section

The current `HeroSection.tsx` already matches the original layout (left illustration with Sparkles/Zap/ArrowRight icons + right text content). The user wants the original version from conversation history restored exactly — the two-column layout with the decorative card, floating orbs, and cursor spotlight. **No changes needed here** — the current code IS the original. If any edits were made in the last message that haven't synced, we revert to the exact code shown in `<current-code>`.

## 2. Create Admin User & Seed All Admin Data

Use a seed migration to insert:

**Admin Auth User**: `Admin123@skillswaprr.com` / `Admin123!` — created via edge function since we can't insert into `auth.users` directly. Will use the `seed-admin` edge function approach.

**Admin Profile** (upsert into `profiles`):

- `display_name`: "SkillSwappr Admin"
- `elo`: 2500, `sp`: 99999, `tier`: "Diamond"
- `skills`: ["Platform Management", "User Support", "Quality Review", "System Admin", "Community Ops"]
- `bio`: "Official SkillSwappr system administrator..."
- `university`: "SkillSwappr HQ"
- `total_gigs_completed`: 500
- `avatar_emoji`: "🛡️"

**Admin Guild** ("SkillSwappr HQ"):

- category: "Other", rank: 1, avg_elo: 2500, is_public: true
- Admin as leader in guild_members

**Admin Enterprise** ("SkillSwappr Official"):

- Inserted into `enterprise_accounts` (if table exists) or `demo_bookings` as a reference

**10 Admin Gigs** (inserted into `listings`):

1. System Maintenance & Monitoring
2. Human Gig Review & Quality Check
3. 1-on-1 User Onboarding
4. Account Recovery Assistance
5. Complaint Resolution Support
6. Platform Feature Walkthrough
7. Bug Report Triage
8. Community Guidelines Consultation
9. ELO Dispute Mediation
10. Enterprise Integration Setup

**Blog Posts** (7+ articles by admin):

- Welcome to SkillSwappr
- Getting Started: Your First Skill Swap
- Troubleshooting Common Issues
- Understanding ELO & Tier System
- How to Write a Great Gig Listing
- Guild Wars: Strategy Guide
- Platform Security & Safety Tips
- Quarterly Wrap: What's New

**Forum Threads** (seeded into existing categories):

- Welcome & Introductions (pinned)
- Platform Rules & Guidelines (pinned)
- Feature Requests & Suggestions
- Bug Reports Thread
- How to Maximize Your ELO
- Best Practices for Gig Descriptions
- Guild Recruitment Board
- Marketplace Tips & Tricks

All seeded via an edge function that creates the auth user and then inserts data.

## 3. Demo Data Fallback Pattern

Create a utility hook `useSmartStats(realValue, demoValue)` that returns `demoValue` when `realValue` is 0 or less impressive. Apply this pattern to:

- **Landing page**: HeroSection stats, MarketplacePreviewSection stats, HowSwappingWorksSection stats
- **About page**: CommunityStatsSection
- **Pricing page**: useLivePricingStats (already has fallbacks — verify they're impressive)
- **Events page**: platformStats
- **Leaderboard page**: count

**NOT applied to**: Analytics, Help, Roadmap (per user request)

The logic: `return realValue > demoValue ? realValue : demoValue`

## 4. Discover Page — Add Events & Tournaments Tabs

Extend the TABS constant in `DiscoverPage.tsx`:

```
{ key: "events", label: "Events", icon: Calendar },
{ key: "tournaments", label: "Tournaments", icon: Trophy },
```

- **Events tab**: Query the hardcoded events data (or DB `events` table if exists) and display event cards with search/filter
- **Tournaments tab**: Show tournament cards filtered from events with type="Tournament"
- Both searchable via the existing search bar

## 5. FAQ Expansion

Add 3 new sections to `faqSections` array:

- **Messaging & Communication** (5 questions about DMs, workspace chat, notifications)
- **Events & Tournaments** (5 questions about events, RSVPs, prizes, Guild Wars)
- **Clips & Content** (4 questions about clips, sharing, content creation)

Expand existing sections with 1-2 additional questions each.

## 6. Features Page Expansion

Add new feature categories to `featureCategories` and `featureMap`:

- **Events & Tournaments**: event calendar, RSVPs, prizes
- **Clips**: short-form content, sharing
- **Analytics Dashboard**: personal/admin analytics

---

## Database Operations

1. **Edge function** `seed-admin`: Creates admin auth user + all seed data (profile, guild, gigs, blog posts, forum threads)
2. **No schema migrations needed** — all tables already exist (listings, blog_posts, forum_threads, forum_categories, guilds, guild_members, profiles)

## Files Modified

- `src/features/home/sections/HeroSection.tsx` — revert to original if changed
- `src/features/discover/DiscoverPage.tsx` — add Events/Tournaments tabs
- `src/features/faq/FAQPage.tsx` — add new sections
- `src/features/features/FeaturesPage.tsx` — add new feature cards
- `src/features/home/sections/MarketplacePreviewSection.tsx` — smart fallback
- `src/features/home/sections/HowSwappingWorksSection.tsx` — smart fallback
- `src/features/about/sections/CommunityStatsSection.tsx` — smart fallback
- `src/features/events/EventsPage.tsx` — smart fallback for stats
- `supabase/functions/seed-admin/index.ts` — create + deploy for seeding

## Implementation Order

1. Create and deploy seed-admin edge function (admin user + all content)
2. Apply demo data fallback pattern across marketing pages
3. Expand FAQ and Features pages
4. Add Events/Tournaments tabs to Discover
5. Verify hero section is correct