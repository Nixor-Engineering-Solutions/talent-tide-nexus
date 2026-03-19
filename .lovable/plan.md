# Plan: Platform-Wide Fixes and Backend Wiring

This covers ~20 distinct improvements across the site. Given the scope, implementation will be split across multiple messages.

---

## Items to Address (Grouped by Priority)

### Group A: Backend Wiring for Static/Demo Sections

**1. Landing Page — Live Marketplace Section**

- The stats (Active Gigs, Online Now, Avg Response) are hardcoded. Wire them to query `listings` count, `page_sessions` count (recent 15min), and avg response time from `escrow_contracts`.
- Show fallback gigs if DB is empty (currently `fallbackGigs` is an empty array — populate with hardcoded samples).

**2. Landing Page — Hero Section Spline Logo Cover**

- Wrap the Spline iframe logo in a div that covers it (so users see a styled placeholder/illustration instead). Ensure it works in both light and dark mode using `bg-background` overlays with a gradient illustration.

**3. How It Works —blank stats (In hero section)**

- This section has no stats currently . Its hard coded, Add fall back if 0

**4. Pricing — "Platform Never Sleeps" stats**

- `useLivePricingStats` already queries real DB data. If data is empty, the fallback shows zeros. Enhance fallback data to show meaningful demo values when DB has no data yet. Add impressive fallback if 0

**5. About Page — Community in Numbers**

- `CommunityStatsSection` uses hardcoded values (24500, 89200, etc.). Replace with DB queries: count profiles, count completed listings, sum SP transactions, count guilds, count resolved disputes, count universities. Add fall back

**6. Roadmap — Next Major Update countdown**

- Wire the countdown timer and "upcoming features" to a `roadmap_updates` table or use platform_metrics. For now, keep the static date but add a DB check for overrides.

**7. Roadmap — Full Changelog from prompt history**

- Expand `ChangelogSection` with comprehensive entries covering all phases from the conversation: Phase 1 (auth guards, discovery), Phase 2 (profile redesign), Phase 3 (guild enhancement), Phase 4 (messaging), Phase 5 (blog/forum integration). And other messages throughout the convo.

**8. Roadmap — Feature Voting remove demo data**

- `FeatureVotingSection` queries `feature_requests` table from DB. It already uses real data. If empty, it shows nothing. Seed real feature requests via migration INSERT.

**9. Analytics — Fix "Total Users 0" and "Active Gigs 0"**

- `useLiveAnalytics` queries `profiles` and `listings` correctly. The issue is the admin user's profile may be using `elo_rating` field vs `elo`. Check field name mapping: the hook uses `p.elo_rating` but profiles table likely stores as `elo`. Fix the field name.
- Also `p.skill_points` vs `sp` — verify correct column name.

**10. Analytics — Soft sections without backend**

- Several sections (Revenue Intelligence, Benchmarks, Risk & Compliance, Hall of Fame) display empty cards. Wire them to existing data or provide meaningful computed values from existing tables.

### Group B: Page Enhancements

**11. Events Page — Full Backend Rewrite**

- Remove all hardcoded event data (`upcomingEvents`, `pastHighlights`, `tournaments`, etc.)
- Create `events` table: `id, title, description, event_type, category, date, end_date, location, spots, spots_filled, prize, icon, tags, is_featured, created_at`
- Create `event_rsvps` table: `id, event_id, user_id, status (going/interested/reminded), created_at`
- Seed initial events from the existing hardcoded data
- Wire RSVP buttons, reminder functionality
- Replace broken Spline embed URL with a working one or a styled fallback div

**12. Events Page — Spline Not Loading**

- The URL `https://my.spline.design/eventticketanimation-e3d7f9a2b1c4d5e6f7a8b9c0d1e2f3a4/` is fake. Replace with a styled fallback (gradient animation, event icon composition).

**13. Discover Page — Hero Not Centered**

- The hero section search/tabs area needs centering fix. Add `items-center justify-center text-center` to the hero container.

**14. Leaderboard Page — Very Short**

- Currently shows data properly but feels sparse. Add: season info banner, weekly highlights, stat comparison widget, recent achievements feed, and expand the Hall of Fame section.

**15. FAQ Page — Add More Questions**

- Add 2-3 more FAQ sections: "Messaging & Communication", "Events & Tournaments", "Enterprise Features". Expand existing sections with more entries.

**16. Features Page — Add More Content**

- Add feature cards for: Direct Messaging, Events & Tournaments, Clips, Analytics Dashboard.

**17. Help Page — Real Links**

- Update "Quick Actions" links to use real routes (`/discover` instead of `/guild/browse`, `/dashboard?tab=settings`, etc.)
- Wire the search bar to actually search knowledge base categories and redirect
- Add blog/forum redirect links in community resources
- Bug Bounty section: wire stats (total reports, resolved, avg response) to a DB query or computed values
- "Help Us Improve" section: wire feedback form to DB insert

**18. Blog & Forums Enhancement**

- Blog: improve the article reader modal layout, add related posts section, better image handling
- Forums: add "New Thread" creation form (currently shows "coming soon" toast), improve thread detail view

### Group C: Admin Data Fix

**19. Admin Profile/Gigs Not Showing**

- The seeded admin gigs may have wrong `user_id` or `status`. Check and fix via data query. The listings table may have no rows for the admin user. Seed listings with the correct admin user_id (`8e40581f-5d43-4894-896d-45c82248f770`).

**20. Profile fields mismatch**

- `useLiveAnalytics` references `p.skill_points` and `p.elo_rating`. Check actual column names in profiles table against the types file. Fix any field name mismatches.

---

## Database Migrations Needed

1. `**events` table** — full event management with RSVP
2. `**event_rsvps` table** — user RSVPs with RLS
3. **Seed data**: Feature requests, events, admin listings

## Implementation Order (across messages)

**Message 1**: Fix analytics field mapping, admin data seeding (listings for admin user), discover hero centering, hero section Spline cover, events page Spline fallback, about page community stats backend, marketplace preview fallback data, how-it-works stats bar

**Message 2**: Events page full backend rewrite (tables + UI), help page real links + search + bug bounty, FAQ expansion, features page additions

**Message 3**: Leaderboard expansion, blog/forums enhancement, roadmap changelog + feature voting seeding, pricing fallback fix, remaining analytics sections wiring

---

## Technical Details

- All DB reads use the existing Supabase client pattern
- New tables get RLS policies (authenticated for RSVPs, public read for events)
- Field name fixes are code-only changes (no migration needed if columns exist)
- Admin data seeding uses the insert tool with the known admin user_id
- Spline fallbacks use CSS gradient compositions with Lucide icons
- Style guide compliance: all changes use existing design tokens (surface-1/2, border, card, foreground/muted-foreground)