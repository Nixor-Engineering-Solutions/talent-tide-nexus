

# Custom Gig Cards & Center Modal Popups — Per Format

## Problem
Currently, `GigCard.tsx` is a generic card used across explore/trending/recommended modes. The `GigQuickView` is a right-side drawer, not a centered popup. Format-specific cards exist (AuctionCard, ContestCard, etc.) but aren't used in explore/trending views, and the popup doesn't differentiate enough per format.

## What Changes

### 1. Replace GigQuickView Drawer → Centered Modal Popup
- Convert from `fixed right-0 max-w-[480px]` slide-in drawer to a **centered overlay modal** (`fixed inset-0 flex items-center justify-center`)
- Modal size: `max-w-3xl w-full max-h-[90vh]` with scrollable interior
- Each format gets its own **full popup layout** — not just a panel injected into a shared shell
- Backdrop with blur + click-to-close
- Smooth scale+fade entrance via Framer Motion

### 2. Format-Specific Popup Components (inside GigQuickView)
Create 10 dedicated popup layouts, each with unique structure, colors, and content:

**Direct Swap Popup**: Two-column "Offering ↔ Wants" exchange visual, delivery timeline stages, seller card, SP bonus, tags, reviews, "Propose Swap" CTA

**Auction Popup**: Red accent theme. Live countdown timer (HRS:MIN:SEC), current bid + bid history scrollable list, bid input with validation, reserve price indicator, bid activity sparkline, "Place Bid" CTA

**SP Only Popup**: Gold accent. Package comparison table if tiers exist (Basic/Standard/Premium columns), single price display if no tiers, user's SP balance + after-purchase calculation, subscription badge if recurring, "Buy Now" CTA

**Co-Creation Popup**: Blue accent. Team roster with filled/open slots per role, "Apply for Role" dropdown selector, team chat preview (last 3 messages), progress bar if workspace exists, "Request to Join" CTA

**Skill Fusion Popup**: Purple accent. Required skills as connected node visualization, participant cards with skill badges + ELO, complexity meter (Easy→Expert), open skill slots, "Apply to Fuse" CTA

**Projects Popup**: Orange accent. Kanban-style role board (columns: Open, Applied, Filled), project timeline as horizontal bars, budget breakdown per role, applicant counts, deadline countdown, "Apply for Role" CTA

**Flash Market Popup**: Gold-to-red gradient accent. Large pulsing countdown timer, 2.5x SP multiplier badge (animated), urgency banner, claim button with instant confirmation, "Grab Flash Deal" CTA

**Contest Popup**: Gold accent. Prize podium visual (1st/2nd/3rd with SP amounts), entry gallery grid (if entries exist), entry count vs max, submit entry form (upload + description), deadline countdown, participation SP display, "Submit Entry" CTA

**Request Popup**: Green accent. "What I Need" detailed section, budget range display, response count, "Submit Your Offer" form with custom proposal textarea, deadline if set

**Subscription Popup**: Teal accent. Billing cycle display (weekly/biweekly/monthly), renewal terms, tier packages if applicable, cancel anytime badge, "Subscribe" CTA

### 3. Format-Specific Marketplace Cards
Stop using generic `GigCard` in explore/trending/recommended. Instead, **route each gig to its format-specific card**:

In `MarketplacePage.tsx` `renderContent()` for explore/trending/recommended:
```
{gigs.map(gig => {
  switch(gig.format) {
    case "Auction": return <AuctionCard ... />
    case "SP Only": return <SPOnlyCard ... />
    case "Co-Creation": return <CoCreationCard ... />
    case "Skill Fusion": return <SkillFusionCard ... />
    case "Flash Market": return <FlashMarketCard ... />
    case "Contest": return <ContestCard ... />
    case "Projects": return <ProjectCard ... />
    case "Requests": return <RequestCard ... />
    default: return <DirectSwapCard ... />
  }
})}
```

Create a new `DirectSwapCard.tsx` for the default swap format (extracted from current GigCard grid view).

### 4. Card Design Enhancements (per format)
Each card already exists but needs enrichment:

- **AuctionCard**: Add animated bid pulse, reserve met/unmet badge
- **ContestCard**: Add entry count progress bar, participation SP badge
- **FlashMarketCard**: Add animated countdown, pulsing multiplier
- **ProjectCard**: Add role fill progress bar (e.g., "3/5 roles filled")
- **CoCreationCard**: Add team avatar stack, open slot count
- **SkillFusionCard**: Add complexity color coding, participant count
- **SPOnlyCard**: Add tier badge ("3 packages"), subscription indicator
- **RequestCard**: Add response count badge, budget range
- **DirectSwapCard** (new): Clean offering↔wants visual, SP bonus, seller row

### 5. Shared Popup Sections (reusable)
Extract reusable sub-components used across popups:
- `PopupSellerCard` — avatar, name, ELO tier, rating, verified, university
- `PopupInteractionBar` — like/save/share/report with counts
- `PopupStatsGrid` — delivery, views, swaps, live viewers
- `PopupReviews` — star breakdown + review list
- `PopupTags` — tag chips
- `PopupSPBonus` — SP bonus display

## Files Modified
- `src/features/marketplace/components/GigQuickView.tsx` — Complete rewrite: drawer→centered modal, 10 format-specific popup layouts
- `src/features/marketplace/MarketplacePage.tsx` — Route explore/trending/recommended to format-specific cards instead of generic GigCard
- `src/features/marketplace/components/AuctionCard.tsx` — Add pulse animation, reserve badge
- `src/features/marketplace/components/ContestCard.tsx` — Add progress bar, participation badge
- `src/features/marketplace/components/FlashMarketCard.tsx` — Add countdown, pulsing multiplier
- `src/features/marketplace/components/ProjectCard.tsx` — Add role fill progress
- `src/features/marketplace/components/CoCreationCard.tsx` — Add avatar stack, open count
- `src/features/marketplace/components/SkillFusionCard.tsx` — Add complexity colors, count
- `src/features/marketplace/components/SPOnlyCard.tsx` — Add tier badge, subscription indicator
- `src/features/marketplace/components/RequestCard.tsx` — Add onClick + response badge

## Files Created
- `src/features/marketplace/components/DirectSwapCard.tsx` — New card for default swap format

## Implementation Order
1. Create DirectSwapCard + rewrite GigQuickView as centered modal with all 10 format popups
2. Update MarketplacePage to route cards by format + enhance all existing cards
3. Delete or deprecate generic GigCard (keep for list view fallback only)

