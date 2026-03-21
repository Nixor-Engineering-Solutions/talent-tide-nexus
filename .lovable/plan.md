

# Plan: Workspace Redesign From Scratch

## Current State

The workspace is a 1390-line monolith with 11 panels in a single file. The sidebar is a 14px icon strip. The whiteboard is a basic HTML5 canvas with pen/eraser only. Roles are limited to `owner | editor | viewer`. Escrow, Stages, and Timeline are separate panels. No consultation integration in members. AI assistant is a single chat tab. Settings are minimal. Deliverable acceptance has no role-based approval flow.

---

## Architecture: Split Into Modular Files

```text
src/features/workspace/
├── WorkspacePage.tsx          ← Shell: header + sidebar + panel router
├── types.ts                   ← All workspace types
├── hooks/
│   ├── useWorkspaceData.ts    ← Fetch escrow, stages, members, role
│   └── useWorkspaceAI.ts      ← AI helper calls
├── panels/
│   ├── ChatPanel.tsx
│   ├── WhiteboardPanel.tsx    ← Rich board (issues, flowcharts, freehand, sprints, cards)
│   ├── VideoPanel.tsx
│   ├── FilesPanel.tsx
│   ├── ProgressPanel.tsx      ← MERGED: Stages + Escrow + Timeline
│   ├── SubmitPanel.tsx        ← Deliverable submission
│   ├── RevisionsPanel.tsx     ← Revision history + accept/reject
│   ├── MetricsPanel.tsx       ← Workspace analytics
│   ├── MembersPanel.tsx       ← Roles: owner, client, consultant, editor, viewer + invite by link
│   ├── DisputePanel.tsx
│   ├── AIPanel.tsx            ← Sub-tabs: Chat, Code, Images, Video, Audio
│   └── SettingsPanel.tsx      ← Expanded settings
└── components/
    ├── WorkspaceHeader.tsx
    ├── WorkspaceSidebar.tsx
    └── WhiteboardToolbar.tsx
```

---

## Key Changes

### 1. Merged Progress Panel (Stages + Escrow + Timeline)

Single "Progress" panel with 3 sub-views toggled by horizontal pills:
- **Stages**: Current stage cards with complete/lock/active states. New stages: `dispute`, `abandoned`, `revision`, `consultation`, `on_hold` (added via migration to allow any status string)
- **Escrow**: SP breakdown per stage, insurance, release status
- **Timeline**: Vertical activity log pulling from stages, messages, files, deliverables — chronological view of all workspace events

### 2. Enhanced Members Panel with Consultation

**New roles** (DB migration to extend `workspace_role` enum): `owner`, `client`, `consultant`, `editor`, `viewer`

- **Invite by email** (existing) + **Invite by link** (generate shareable link with role + expiry stored in `workspace_invites` table)
- **Consultation flow**: Owner or Client can invite a consultant. Consultant receives notification and can accept/decline (like gig proposals). Recorded who invited whom
- Role badges with distinct colors: Owner=gold, Client=green, Consultant=blue, Editor=silver, Viewer=muted
- Role permissions matrix enforced in each panel

### 3. Deliverable Approval Flow

- Deliverables require acceptance by **Client** OR **Consultant** (not the submitter)
- Accept/Reject/Request Revision buttons shown only to Client and Consultant roles
- Approval recorded with `approved_by` field (migration to add column to `workspace_deliverables`)
- Revision requests increment `revision_count` and require re-submission

### 4. Rich Whiteboard

Custom-built rich canvas (not tldraw — avoids heavy dependency):
- **Tools**: Select, Freehand draw, Rectangle, Circle, Line, Text, Arrow/Connector, Sticky note, Issue card, Sprint card
- **Features**: Infinite canvas with pan/zoom, color picker, layers, undo/redo stack, grid snap
- **Cards**: Draggable issue cards (title, assignee, priority, status), sprint cards (name, dates, items), flowchart connectors
- **Persistence**: Save canvas state as JSON to `workspace_files` with type `whiteboard_state`
- **Style**: Dark canvas (#0A0A0A) with subtle dot grid, cards use surface-1/2 colors

### 5. AI Panel with Sub-Tabs

Replace single chat with tabbed AI interface:
- **Chat**: General assistant (existing, refined)
- **Code**: Code generation/review with syntax highlighting
- **Images**: Image generation prompts + gallery
- **Video**: Video analysis/summary tools
- **Audio**: Transcription, voice-to-text tools
- **More**: Plagiarism check, audit trail, advice engine

Each sub-tab has its own UI but shares the same AI backend with different `action` parameters.

### 6. Expanded Settings

Add sections:
- **Workspace Preferences**: Theme, density, auto-save interval
- **Notification Rules**: Per-event toggle (messages, files, stages, disputes)
- **Access Control**: Default role for new members, link sharing toggle
- **Danger Zone**: Archive, transfer ownership, delete workspace
- **Report**: Report partner for misconduct (moved from separate panel)
- **Export**: Export workspace data as ZIP (messages, files, deliverables)

### 7. Visual Redesign

**Header**: Full-width with workspace title (editable), status badge, SP amount, member avatars stack, quick-action buttons (video call, AI, settings)

**Sidebar**: Wider (56px→64px) with icon + label on hover/expanded state. Grouped with subtle section headers. Active indicator is a left accent bar + background highlight. Badge dots for unread counts on Chat, Notifications

**Panel transitions**: Framer Motion slide + fade. Each panel has a distinctive header bar with icon + title + contextual actions

**Cards**: `rounded-2xl border border-border bg-card` with hover lift effect. Stats in JetBrains Mono. Color pops only for status indicators

---

## Database Migrations

1. **Extend `workspace_role` enum**: Add `client` and `consultant` values
2. **Add `approved_by` column to `workspace_deliverables`**: UUID nullable, tracks who approved
3. **Add `approved_at` column to `workspace_deliverables`**: Timestamp nullable
4. **Create `workspace_invites` table**: `id, workspace_id, role, token, created_by, expires_at, used_by, used_at, created_at`
5. **Add new stage statuses**: No schema change needed — `status` is already a text column

---

## Files Created (15+)

- `src/features/workspace/types.ts`
- `src/features/workspace/hooks/useWorkspaceData.ts`
- `src/features/workspace/hooks/useWorkspaceAI.ts`
- `src/features/workspace/components/WorkspaceHeader.tsx`
- `src/features/workspace/components/WorkspaceSidebar.tsx`
- `src/features/workspace/panels/ChatPanel.tsx`
- `src/features/workspace/panels/WhiteboardPanel.tsx`
- `src/features/workspace/panels/VideoPanel.tsx`
- `src/features/workspace/panels/FilesPanel.tsx`
- `src/features/workspace/panels/ProgressPanel.tsx`
- `src/features/workspace/panels/SubmitPanel.tsx`
- `src/features/workspace/panels/RevisionsPanel.tsx`
- `src/features/workspace/panels/MetricsPanel.tsx`
- `src/features/workspace/panels/MembersPanel.tsx`
- `src/features/workspace/panels/DisputePanel.tsx`
- `src/features/workspace/panels/AIPanel.tsx`
- `src/features/workspace/panels/SettingsPanel.tsx`

## Files Rewritten

- `src/features/workspace/WorkspacePage.tsx` — reduced to ~150 lines (shell only)

## Implementation Order

1. **Message 1**: DB migrations + types + hooks + shell + sidebar + header + ProgressPanel (merged) + MembersPanel (new roles, invite link, consultation)
2. **Message 2**: ChatPanel + FilesPanel + SubmitPanel + RevisionsPanel (approval flow) + DisputePanel
3. **Message 3**: WhiteboardPanel (rich canvas with cards, flowcharts, persistence) + VideoPanel
4. **Message 4**: AIPanel (sub-tabs) + MetricsPanel + SettingsPanel (expanded) + polish

