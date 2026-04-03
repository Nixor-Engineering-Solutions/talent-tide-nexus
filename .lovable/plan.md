

# Dedicated Format Pages + Real Data Cards

## Problem

1. **GigDetailPage.tsx** is a single 552-line file with `if` branches for each format. Each format gets a small panel rather than a full, purpose-built page.
2. **Format listing pages** (AuctionsPage, ContestsPage, etc.) render inline cards with hardcoded values instead of using their format-specific card components.
3. **Cards display hardcoded data** — `gig.views` comes from the `Gig` interface mock, `"Reserve Met"` is always shown on AuctionCard, ContestCard hardcodes `maxEntries = 50`, etc. None of this reflects real DB values.

## Solution

### 1. Split GigDetailPage into 10 Format-Specific Detail Pages

Replace the monolithic `GigDetailPage.tsx` with a lightweight router component that delegates to dedicated pages:

```
/marketplace/:gigId → GigDetailRouter.tsx
  → reads listing.format from DB
  → renders AuctionDetailPage | ContestDetailPage | SPOnlyDetailPage | etc.
```

Each detail page is a standalone file with format-appropriate sections. All share reusable sub-components (seller card, reviews, tags, FAQ, interaction bar, tier selector).

**Shared sub-components** (new folder `src/features/marketplace/components/detail/`):
- `DetailSellerCard` — avatar, ELO tier, rating, verified, university, response time, completed swaps
- `DetailInteractionBar` — like/save/share/report with real counts from `useGigInteractions`
- `DetailReviews` — star breakdown + review list
- `DetailTags` — tag chips from `listing.tags`
- `DetailFAQ` — accordion from `listing.gig_faq`
- `DetailRequirements` — from `listing.requirements`
- `DetailTimeline` — delivery stages
- `DetailStatsGrid` — delivery days, views, likes, live viewers

**Format detail pages** (`src/features/marketplace/components/detail/`):

| Page | Unique Sections |
|------|----------------|
| **AuctionDetail** | Live bid panel (current bid, bid count, countdown), bid history table from `auction_bids` table (new), reserve price indicator from `auction_config.reserve_price`, place bid form with validation, auto-extend rules |
| **ContestDetail** | Prize podium (1st/2nd/3rd from `contest_config`), entry gallery grid from `contest_entries` table (new), submit entry form (upload + description), deadline countdown, entry count vs `contest_config.max_entries`, participation SP |
| **SPOnlyDetail** | TierSelector (reused), single-price display if no tiers, subscription badge + interval from `is_subscription`/`subscription_interval`, "Buy Now" CTA per tier |
| **CoCreationDetail** | Team roster from `roles_needed` jsonb (filled/open slots), "Apply for Role" per open slot, progress tracker, collaboration description |
| **SkillFusionDetail** | Required skills from `fusion_skills`, complexity meter, participant slots with skill badges, "Apply to Fuse" form |
| **ProjectDetail** | Role board from `roles_needed` (role name, skill, filled/open), project timeline, budget breakdown per role, applicant counts, deadline countdown |
| **FlashMarketDetail** | Large countdown timer, SP multiplier from `flash_config.sp_multiplier`, urgency banner, claim button |
| **RequestDetail** | "What I Need" section, budget range, response count from `listing_interactions`, "Submit Your Offer" form |
| **DirectSwapDetail** | Two-column "Offering ↔ Wants" visual, delivery timeline, SP bonus |
| **SubscriptionDetail** | Billing cycle from `subscription_interval`, renewal terms, tier packages, cancel badge |

### 2. New DB Tables for Auction Bids & Contest Entries

**`auction_bids`**:
```sql
CREATE TABLE public.auction_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
-- RLS: authenticated users can insert their own bids, all authenticated can read
```

**`contest_entries`**:
```sql
CREATE TABLE public.contest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  entrant_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  file_urls text[] DEFAULT '{}',
  rank integer,
  created_at timestamptz DEFAULT now()
);
-- RLS: authenticated can insert own, all can read
```

### 3. Remove All Hardcoded Values from Cards

**AuctionCard**: Remove hardcoded `"Reserve Met"` — compute from `auction_config.reserve_price` vs `currentBid`. Remove hardcoded `gig.views` display — only show real interaction counts or omit.

**ContestCard**: Remove `maxEntries = 50` — use `contest_config.max_entries`. Remove fallback prize calculation — use `contest_config` or hide prizes section.

**FlashMarketCard**: Use `flash_config.sp_multiplier` instead of hardcoded `2.5x`. Use `flash_config.duration_hours` for countdown.

**DirectSwapCard**: Remove `gig.views` — use real count from `listing_interactions` or omit from card (detail page shows real counts).

**All cards**: The `views` field on the `Gig` interface currently maps to `listing.views` (a DB column). Cards should use this real value, but if it's 0/null, show nothing rather than "0 views". Remove any synthetic/mock values in the `toGig()` mappers across format pages.

### 4. Update Format Listing Pages to Use Their Card Components

Each format page (AuctionsPage, CoCreationPage, etc.) currently renders inline JSX cards. Instead, they should use their dedicated card components (AuctionCard, CoCreationCard, etc.) — some already do (ContestsPage uses ContestCard), but most don't.

### 5. Route Changes

Replace the single `GigDetailPage` route with `GigDetailRouter`:
```
<Route path="/marketplace/:gigId" element={<GigDetailRouter />} />
```

The router fetches the listing, reads `format`, and renders the correct detail page component.

---

## Files Created

- `src/features/marketplace/components/detail/GigDetailRouter.tsx` — format router
- `src/features/marketplace/components/detail/AuctionDetail.tsx`
- `src/features/marketplace/components/detail/ContestDetail.tsx`
- `src/features/marketplace/components/detail/SPOnlyDetail.tsx`
- `src/features/marketplace/components/detail/CoCreationDetail.tsx`
- `src/features/marketplace/components/detail/SkillFusionDetail.tsx`
- `src/features/marketplace/components/detail/ProjectDetail.tsx`
- `src/features/marketplace/components/detail/FlashMarketDetail.tsx`
- `src/features/marketplace/components/detail/RequestDetail.tsx`
- `src/features/marketplace/components/detail/DirectSwapDetail.tsx`
- `src/features/marketplace/components/detail/SubscriptionDetail.tsx`
- `src/features/marketplace/components/detail/DetailSellerCard.tsx`
- `src/features/marketplace/components/detail/DetailInteractionBar.tsx`
- `src/features/marketplace/components/detail/DetailReviews.tsx`
- `src/features/marketplace/components/detail/DetailTags.tsx`
- `src/features/marketplace/components/detail/DetailFAQ.tsx`
- `src/features/marketplace/components/detail/DetailRequirements.tsx`
- `src/features/marketplace/components/detail/DetailStatsGrid.tsx`
- DB migration for `auction_bids` and `contest_entries` tables

## Files Modified

- `src/App.tsx` — point `/marketplace/:gigId` to `GigDetailRouter`
- `src/features/marketplace/components/AuctionCard.tsx` — remove hardcoded reserve badge, use real data
- `src/features/marketplace/components/ContestCard.tsx` — use `contest_config` values
- `src/features/marketplace/components/FlashMarketCard.tsx` — use `flash_config` values
- `src/features/marketplace/components/DirectSwapCard.tsx` — remove hardcoded views
- `src/features/marketplace/components/SPOnlyCard.tsx` — remove hardcoded views
- `src/features/marketplace/components/GigCard.tsx` — remove hardcoded views
- `src/features/marketplace/pages/AuctionsPage.tsx` — use AuctionCard component
- `src/features/marketplace/pages/CoCreationPage.tsx` — use CoCreationCard component
- `src/features/marketplace/pages/SPOnlyPage.tsx` — use SPOnlyCard component
- `src/features/marketplace/pages/FlashMarketPage.tsx` — use FlashMarketCard component
- `src/features/marketplace/pages/ProjectsPage.tsx` — use ProjectCard component
- `src/features/marketplace/pages/RequestsPage.tsx` — use RequestCard component
- `src/features/marketplace/pages/SkillFusionPage.tsx` — use SkillFusionCard component
- `src/features/marketplace/data/mockData.ts` — extend Gig interface with optional format config fields

## Implementation Order

1. DB migration (auction_bids, contest_entries) + shared detail sub-components
2. All 10 format detail pages + GigDetailRouter + App.tsx route update
3. Card cleanup (remove hardcoded values) + format page updates to use card components

