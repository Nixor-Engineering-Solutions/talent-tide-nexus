-- 1. Extend workspace_role enum with client and consultant
ALTER TYPE public.workspace_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE public.workspace_role ADD VALUE IF NOT EXISTS 'consultant';

-- 2. Create workspace_invites table for link-based invitations
CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'editor',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_by UUID,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace invites" ON public.workspace_invites
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owners/editors can create invites" ON public.workspace_invites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can update invite (to use it)" ON public.workspace_invites
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 3. Add approved_by and approved_at to workspace_deliverables
ALTER TABLE public.workspace_deliverables 
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;