

# Revised Plan: Enhanced Gig Creation, Format Pages, Tags, Tiers & Transaction Backend

## Overview

Overhaul gig creation into a 7-step Fiverr-grade wizard with format-specific branching, tiered packages, custom tags with role-based limits, image gallery uploads, subscription/one-time toggle, revision pricing, and gig FAQ. Redesign format-specific detail pages. Make transaction generation use only real data. Profile sections from onboarding are opt-in, not default.

---

## 1. Profile Sections — Opt-In Only

Currently `CORE_SECTIONS` in `ProfilePage.tsx` auto-renders: about, skills, badges, achievements, experience, education, portfolio, listings, disputes, activity, blog-activity, saved.

**Change**: Only show sections the user has data for OR has explicitly added via the "Add Section" button. Add new PREMADE_SECTIONS entries for onboarding-sourced data:
- "What I'm Looking For" (needs)
- "Interests & Hobbies" (interests)
- "Availability & Rates" (availability, hourly_rate, timezone, response_time)
- "Languages" (languages)

These appear in the "Add Section" menu but are NOT rendered by default. User clicks "+" to add them to their profile.

---

## 2. Onboarding — Mandatory vs Optional Steps

Current: 12 steps, all skippable.

**Mandatory** (cannot skip):
- Step 1: Email + password
- Step 2: Full name
- Step 3: Avatar selection
- Step 4: Skills (min 1)
- Step 5: Skill levels
- Step 8: What do you need? (min 1)

**Optional** (can skip with "Decide Later"):
- Step 6: Work history
- Step 7: Education
- Step 9: Interests
- Step 10: Languages
- Step 11: Portfolio
- Step 12: Social links, referral

**Add new fields** (inserted into existing steps):
- Professional headline / tagline (Step 2, after name)
- Preferred communication method (Step 10, with languages)
- Minimum project budget preference (Step 8, after needs)

Show step counter more prominently: "Step 4 of 12 — Required" or "Step 6 of 12 — Optional"

---

## 3. Database Migration — Listings Table Expansion

Add columns to `listings`:

```sql
tags text[] default '{}',
tiers jsonb default null,
-- tiers: { basic: {name, desc, price_sp, delivery_days, revisions, features[]}, standard: {...}, premium: {...} }
images text[] default '{}',
gig_faq jsonb default '[]',
-- [{question, answer}]
is_subscription boolean default false,
subscription_interval text default null,
-- 'weekly' | 'biweekly' | 'monthly'
revision_cost_sp integer default 0,
max_revisions integer default 3,
contest_config jsonb default null,
-- {prize_1st, prize_2nd, prize_3rd, participation_sp, max_entries, entry_deadline}
conditions jsonb default null,
-- {time_bonus_pct, time_bonus_days, review_bonus_sp, streak_multiplier, nda_required, auto_release}
roles_needed jsonb default null,
-- [{role_name, skill_required, filled: bool}]
auction_config jsonb default null,
-- {starting_bid, min_decrement, reserve_price, duration_hours}
flash_config jsonb default null,
-- {duration_hours, sp_multiplier}
fusion_skills text[] default '{}',
requirements text[] default '{}',
-- questions seller asks buyer before order
completed_swaps integer default 0
```

---

## 4. Tag System

**Tag limits by role/badge**:
- Default user: 3 tags max
- Pro badge / Gold tier+: 5 tags
- Diamond tier: 8 tags

**Implementation**:
- Popular tags shown as quick-select chips (top 20 from existing data)
- Custom tag input with character limit (25 chars per tag)
- Tags replace the `category` grid in Create Gig Step 2
- `MarketplaceSidebar.tsx`: tag cloud replaces category list
- `useMarketplaceData.ts`: filter using `tags.cs` (array contains)
- `GigCard.tsx` / `GigDetailPage.tsx`: show tag badges

---

## 5. Create Gig — Full 7-Step Wizard

### Step 1: Format Selection (full-page cards)
10 formats: Direct Swap, Auction, Co-Creation, Skill Fusion, SP Only, Projects, Flash Market, Requests, Contest (new), Subscription

### Step 2: Basics
- Title (required)
- Tags (multi-select chips + custom input, limit based on role)
- Offering skill / Seeking skill (hidden for SP Only, Contest)
- Professional summary (short tagline for the gig)
- Is this a subscription? Toggle → if yes, pick interval (weekly/biweekly/monthly)

### Step 3: Scope & Pricing (Tiers)
Inspired by Fiverr's 3-package system:
- Toggle: "Offer packages" on/off
- If on: 3 tiers (Basic, Standard, Premium) each with:
  - Tier name (editable)
  - Description
  - SP price
  - Delivery time (days)
  - Revisions included
  - Features checklist (add/remove feature rows)
- If off: single flat-rate with SP, delivery days, revisions
- Extra revision cost (SP per additional revision beyond included)
- For SP Only: just SP price per tier
- For Auction: starting bid, min bid decrement, reserve price, duration
- For Flash Market: duration before removal (hours), SP multiplier
- For Contest: prize pool (1st/2nd/3rd SP), participation SP, max entries, entry deadline
- For Projects: total SP budget, deadline
- For Co-Creation/Fusion: complexity level, estimated duration

### Step 4: Description, FAQ & Requirements
- Rich description textarea (2000 char min suggested)
- Milestones / stages builder (add/remove, name + SP allocation + duration)
  - AI-assisted "Suggest Stages" button
- Gig FAQ (add up to 10 Q&A pairs)
- Requirements: questions for the buyer before order starts
  - Free text questions (add/remove, mark as required/optional)
  - e.g., "What's your brand name?", "Do you have existing assets?"
- Escrow terms: auto-release toggle, hold duration, insurance toggle

### Step 5: Conditions & Bonuses
- Time-based bonus: complete before X days = +Y% SP
- Review-based bonus: 5-star review = +Z SP
- Streak multiplier (if both parties have active streaks)
- NDA required toggle
- Revision limit enforcement
- Late delivery penalty (optional, -X% SP per day late)
- Cancellation policy: flexible / moderate / strict

### Step 6: Gallery
- Upload up to 5 images (gig-images bucket)
- Upload 1 video URL (YouTube/Vimeo embed)
- Portfolio samples drag & drop
- Thumbnail auto-selected from first image

### Step 7: Review & Publish
- Full preview card showing how gig appears in marketplace
- Tier comparison table preview
- "Save as Draft" (saves to DB with status='draft' AND localStorage)
- "Publish" button
- Show posted date, estimated reach

**Draft System**: auto-save to localStorage every 30s, persist to DB on explicit save. Show drafts list at top of Create Gig tab.

---

## 6. Gig Format Detail Pages — Deep Redesign

`GigDetailPage.tsx` currently has ~457 lines with basic format-specific panels. Expand each format into a rich, unique experience:

### All Formats (shared sections):
- **Header**: Format badge, title, tags, posted date ("Posted 3 days ago"), completed swaps count
- **Seller card**: Avatar, name, ELO/tier, rating, verified badge, university, response time, member since
- **Tier/Package selector**: If tiers enabled, show comparison table (Basic/Standard/Premium columns with features, price, delivery, revisions)
- **About section**: Description + FAQ accordion
- **Requirements**: What the seller needs from you before starting
- **Reviews**: Star breakdown, individual reviews with responses
- **Interaction bar**: Like, save, share, report counts + live viewers
- **Related gigs**: 3-4 similar gigs by tag overlap

### Format-Specific Sections:

**Direct Swap**:
- "What You'll Get" / "What They Want" two-column exchange visual
- Swap compatibility score (computed from buyer/seller skills)
- Delivery timeline with stage cards

**Auction**:
- Live bid panel: current bid, bid history (scrollable list with bidder avatars), time remaining countdown, place bid input
- Reserve price indicator (met/not met)
- Auto-extend rules display
- Bid activity chart (mini sparkline)

**SP Only**:
- Package comparison table (if tiers)
- "Order Now" button per tier
- Add-ons section (extra revisions, priority delivery)
- Subscription badge if recurring

**Co-Creation**:
- Team roster: filled/open slots with role name + required skill
- "Apply for Role" per open slot
- Team chat preview (last 3 messages)
- Progress tracker if workspace exists

**Skill Fusion**:
- Required skills visualization (skill nodes connected)
- Complexity meter (easy/medium/hard/expert)
- Participant slots with skill badges
- "Bring Your Skill" application form

**Projects**:
- Kanban-style role board: each role as a card (name, skill, filled/open)
- Project timeline (Gantt-style horizontal bars)
- Budget breakdown per role
- Applicant count per role

**Flash Market**:
- Countdown timer (large, prominent)
- SP multiplier badge (2.5x)
- "Expires in" urgency banner
- Claim button with instant workspace creation

**Contest**:
- Prize breakdown: 1st/2nd/3rd + participation SP
- Entry gallery: grid of submitted entries (images/files)
- Entry count / max entries
- Submit entry form (upload + description)
- Deadline countdown
- Judge (poster) can rank entries

**Requests**:
- What they need (detailed)
- Budget range
- "Offer Help" form with custom proposal
- Response count

**Subscription**:
- Billing cycle display
- "Subscribe" button
- Renewal terms
- Cancel anytime badge

---

## 7. Transaction Generation — No Dummy Data

Remove ALL mock/random values from `transaction-generator.ts`:

**Replace with real data**:
- `quality.score` → computed from actual deliverable AI scores (avg of `ai_quality_score` from `workspace_deliverables`)
- `quality.plagiarism` → from actual AI check result stored in deliverable
- `quality.originalityScore` → from AI assessment
- `quality.technicalScore`, `creativityScore`, `communicationScore`, `professionalismScore` → from review ratings if available, otherwise omit
- `security_data.riskScore` → remove random, set to 0 or compute from actual flags
- `security_data.deviceFingerprint` → use actual session data or "N/A"
- `fingerprint` → hash of workspace ID + timestamps (deterministic)
- `blockchain_hash` → hash of transaction code + escrow ID (deterministic, not random)
- `performance.durationPercentile`, `qualityPercentile` → query actual averages from completed transactions or omit
- `performance.categoryRank` → query actual rank or omit
- Remove `"Mock"` or placeholder strings entirely

**Add real fields**:
- `listing_id` reference
- `format` (gig format type)
- `tiers_used` (which tier was purchased)
- `tags` (from listing)
- `is_subscription` flag
- `revision_count` (actual)
- `total_messages`, `total_files` (actual counts, not from passed arrays)

---

## 8. Additional Gig Card/List Enhancements

On marketplace cards (`GigCard.tsx`) and detail page, show:
- "Posted X days ago" (from `created_at`)
- "X swaps completed" (from `completed_swaps` column)
- Tier badge if packages available ("3 packages available")
- Subscription badge if `is_subscription`
- Tag chips (first 2-3 visible, "+N more" overflow)

---

## Database Migrations

1. Alter `listings` table: add ~15 new columns (tags, tiers, images, gig_faq, is_subscription, subscription_interval, revision_cost_sp, max_revisions, contest_config, conditions, roles_needed, auction_config, flash_config, fusion_skills, requirements, completed_swaps)

## Files Modified

- `src/features/dashboard/DashboardPage.tsx` — Complete CreateGigTab rewrite (3→7 steps, format branching, tiers, tags, images, FAQ, requirements, conditions, gallery, drafts)
- `src/features/marketplace/components/GigDetailPage.tsx` — Expand from 457→800+ lines with format-specific rich sections, tier selector, FAQ accordion, requirements, posted date, swap count
- `src/features/marketplace/components/GigCard.tsx` — Add tags, posted date, swap count, tier badge
- `src/features/marketplace/components/MarketplaceSidebar.tsx` — Replace categories with tag cloud
- `src/features/marketplace/hooks/useMarketplaceData.ts` — Tag-based filtering
- `src/features/profile/ProfilePage.tsx` — Make onboarding sections opt-in via Add Section menu
- `src/features/auth/SignupPage.tsx` — Mark mandatory vs optional steps, add step labels
- `src/lib/transaction-generator.ts` — Remove all random/mock values, use real data only
- `src/features/marketplace/data/mockData.ts` — Add Contest mode, tags support

## Files Created

- `src/features/marketplace/components/ContestCard.tsx`
- `src/features/marketplace/pages/ContestsPage.tsx`
- `src/features/marketplace/components/TierSelector.tsx` — Reusable 3-package comparison table

## Implementation Order

1. **Message 1**: DB migration (all new listing columns) + CreateGigTab full 7-step rewrite with format branching, tiers, tags, images, FAQ, requirements, conditions, gallery, drafts
2. **Message 2**: GigDetailPage format-specific redesign + TierSelector + ContestCard + marketplace tag system
3. **Message 3**: Transaction generator cleanup (real data only) + Profile opt-in sections + Onboarding mandatory/optional labels + GigCard enhancements

