

# Plan: Full Workspace System + Flow + Spline Embeds + Events Backend

This is a massive undertaking covering workspace functionality, platform flow, Spline embeds, and events backend. Given the scope, this will span **multiple implementation messages** (4-5).

---

## Current State Assessment

**What exists:**
- Workspace page with 11 panels: Chat (real-time), Whiteboard (basic canvas), Video (mock), Files (working uploads), Stages (working), Escrow (display), Submit (with AI review), Dispute (with AI help), Members (invite/roles), AI Assistant (streaming), Settings
- Proposals can be sent from marketplace but **no acceptance flow** — proposals don't create workspaces
- No workspace creation automation
- Whiteboard is a basic HTML5 canvas with pen/eraser only
- No consultation, revisions, timeline, or metrics tabs
- Events page uses hardcoded data, no backend for Register/RSVP/Remind

**What's missing for the full flow:**
1. Proposal acceptance → auto-create workspace + escrow + stages + members
2. Whiteboard upgrade (tldraw-style with boards, kanban, pins)
3. Consultation tab, Revisions tab, Timeline tab, Metrics tab
4. Events backend (Register Now, Remind Me, RSVP)
5. Spline embeds on hero + events

---

## Implementation Phases

### Phase 1: Spline Embeds + Proposal→Workspace Flow (Message 1)

**1a. Spline Embed — Landing Hero**
- The hero already has a Spline iframe: `https://my.spline.design/nexbotrobotcharacterconcept-...`
- Verify it's rendering. If not, check the URL. The current code looks correct.

**1b. Spline Embed — Events Hero**
- Currently shows a fallback illustration (Trophy icon + decorative divs)
- Replace with a real Spline embed similar to the hero section
- Use: `https://my.spline.design/nexbotrobotcharacterconcept-1d5c831dc4fdd14e0f11e1217b1b5843/` (same as hero — reuse the working embed, since fabricated URLs won't work)

**1c. Proposal Acceptance → Workspace Creation Flow**
- In `DashboardPage.tsx` "My Gigs" tab, add a proposals section showing incoming proposals
- Add Accept/Decline buttons on proposals
- On Accept:
  1. Update proposal status to "accepted"
  2. Create `workspaces` row (id=uuid, title from listing, workspace_type based on format, listing_id, created_by)
  3. Create `escrow_contracts` row (buyer=proposer, seller=listing owner, total_sp from proposal)
  4. Create default `workspace_stages` (3 stages: Requirements, Work, Delivery)
  5. Create `workspace_members` (both users as owner)
  6. Link proposal to workspace via `workspace_id`
  7. Create notification for proposer
  8. Navigate to workspace

**1d. Events Backend Wiring**
- Wire "Register Now" button on EventsPage to insert into `event_registrations`
- Wire "Remind Me" button similarly with status="reminded"
- Show registration state (already registered / register / full)
- Events hero: add working Spline embed

### Phase 2: Workspace Enhancement — New Tabs (Message 2)

Add 5 new panels to the workspace sidebar:

**2a. Consultation Tab**
- Request external consultants from guilds or platform
- Form: description, SP offered, required skills
- Lists active consultation requests
- Backend: new `workspace_consultations` table or use workspace_members with role="consultant"

**2b. Revisions Tab**
- Shows revision history for each deliverable
- Accept/Request Revision buttons for workspace owner
- Revision counter (max 3 by default)
- Links to deliverables with status tracking

**2c. Timeline Tab**
- Visual timeline of workspace activity (Gantt-style or vertical)
- Pulls from stages, deliverables, messages timestamps
- Shows milestones, deadlines, progress

**2d. Metrics & Reporting Tab**
- Workspace analytics: messages sent, files uploaded, time spent, stage velocity
- Charts using existing data
- Export report functionality

**2e. Reporting Tab (within Settings)**
- Report workspace partner for misconduct
- Links to dispute system

### Phase 3: Whiteboard Upgrade (Message 3)

Replace basic canvas with a rich collaborative board:

**Option A: tldraw integration**
- Install `tldraw` package
- Embed tldraw editor in whiteboard panel
- Provides: drawing, shapes, text, sticky notes, connectors, frames, image paste
- Supports: zoom, pan, selection, multi-tool
- Data persistence: save tldraw document JSON to `workspace_files` as a special entry

**Option B: Custom rich board (if tldraw is too heavy)**
- Keep canvas but add:
  - Sticky notes (draggable, colorable, text editable)
  - Image placement (drag from files)
  - Kanban columns overlay
  - Pin/bookmark items
  - Pinterest-style idea boards
  - Export as image

**Recommendation**: Use tldraw — it's the most feature-rich option and aligns with "figma boards + pinterest" request. It handles telemetry/interaction tracking natively.

### Phase 4: Full Flow Verification + Polish (Message 4)

- Test: Signup → Create gig → Receive proposal → Accept → Workspace opens → Chat → Upload files → Submit deliverable (AI review) → Complete stages → Release escrow → Transaction generated → Clips auto-created → Analytics updated
- Fix any broken links in the chain
- Ensure SP transfer is recorded
- Ensure transaction appears in transaction lookup

---

## Database Changes Needed

**New table: `workspace_consultations`**
```
id, workspace_id, requested_by, description, sp_offered, 
required_skills, status (open/accepted/completed), 
consultant_id, created_at
```

**Table modifications:**
- `event_registrations`: Ensure RLS allows authenticated users to insert their own registrations
- `proposals`: Ensure `workspace_id` column exists (it does per types.ts)

**No new tables needed for:**
- Revisions (use existing `workspace_deliverables` with revision_count)
- Timeline (computed from existing data)
- Metrics (computed from existing data)

---

## Files to Create/Modify

**Create:**
- `src/features/workspace/panels/ConsultationPanel.tsx`
- `src/features/workspace/panels/RevisionsPanel.tsx`
- `src/features/workspace/panels/TimelinePanel.tsx`
- `src/features/workspace/panels/MetricsPanel.tsx`

**Heavy Rewrites:**
- `src/features/workspace/WorkspacePage.tsx` — add new panels to sidebar, integrate tldraw, expand whiteboard
- `src/features/dashboard/DashboardPage.tsx` — add proposal management (accept/decline), workspace creation flow
- `src/features/events/EventsPage.tsx` — wire Register/Remind buttons to backend, add Spline embed

**Modify:**
- `src/features/marketplace/components/ProposalModal.tsx` — fix proposal field names (proposer_id→sender_id, seller_id→receiver_id per schema)

---

## Implementation Order

1. **Message 1**: Spline embeds (hero verified, events added), proposal acceptance flow with workspace auto-creation, events Register/Remind backend wiring
2. **Message 2**: New workspace panels (Consultation, Revisions, Timeline, Metrics), sidebar expansion
3. **Message 3**: Whiteboard upgrade with tldraw, kanban boards, persistence
4. **Message 4**: Full flow testing, SP transfer completion, clips auto-generation, polish

---

## Design Standards (from STYLE-GUIDE.md)

- All new panels: `bg-background`, `border-border`, `text-foreground` / `text-muted-foreground`
- Cards: `rounded-2xl border border-border bg-card p-5`
- Buttons: `rounded-xl bg-foreground text-background` (primary), `border border-border text-muted-foreground` (secondary)
- Mono for stats/numbers, Framer Motion for all transitions
- No shared layouts between panels — each gets unique design
- Color pops: green for SP/success, red for disputes/alerts, gold for badges, blue for court/info

