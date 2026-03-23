ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tiers jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gig_faq jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_subscription boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_interval text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS revision_cost_sp integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_revisions integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS contest_config jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS roles_needed jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auction_config jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS flash_config jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fusion_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS completed_swaps integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_listings_tags ON public.listings USING GIN (tags);