
CREATE TABLE IF NOT EXISTS public.workspace_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id text NOT NULL,
  requested_by uuid NOT NULL,
  description text NOT NULL DEFAULT '',
  sp_offered integer NOT NULL DEFAULT 0,
  required_skills text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  consultant_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view consultations for their workspaces"
  ON public.workspace_consultations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_consultations.workspace_id
      AND wm.user_id = auth.uid()
    )
    OR requested_by = auth.uid()
    OR consultant_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create consultations"
  ON public.workspace_consultations FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can update their own consultations"
  ON public.workspace_consultations FOR UPDATE TO authenticated
  USING (requested_by = auth.uid() OR consultant_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can register for events'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can view their registrations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their registrations" ON public.event_registrations FOR SELECT TO authenticated USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Users can update their registrations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their registrations" ON public.event_registrations FOR UPDATE TO authenticated USING (user_id = auth.uid())';
  END IF;
END $$;
