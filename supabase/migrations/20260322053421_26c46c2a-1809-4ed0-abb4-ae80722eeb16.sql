-- Table for gig likes/saves
CREATE TABLE IF NOT EXISTS public.listing_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'save', 'share', 'report', 'view')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id, interaction_type)
);

ALTER TABLE public.listing_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read interactions" ON public.listing_interactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert interactions" ON public.listing_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interactions" ON public.listing_interactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add live_viewers tracking (lightweight via page_sessions)
-- Add requirements column to proposals if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='requirements' AND table_schema='public') THEN
    ALTER TABLE public.proposals ADD COLUMN requirements text;
  END IF;
END $$;

-- Add escrow_terms to proposals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='escrow_terms' AND table_schema='public') THEN
    ALTER TABLE public.proposals ADD COLUMN escrow_terms jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add stage_config to proposals for AI-suggested stages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='stage_config' AND table_schema='public') THEN
    ALTER TABLE public.proposals ADD COLUMN stage_config jsonb DEFAULT '[]';
  END IF;
END $$;