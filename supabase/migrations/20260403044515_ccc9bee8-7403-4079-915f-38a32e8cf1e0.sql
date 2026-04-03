
-- Auction bids table
CREATE TABLE public.auction_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read auction bids"
  ON public.auction_bids FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own bids"
  ON public.auction_bids FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

-- Contest entries table
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

ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read contest entries"
  ON public.contest_entries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own entries"
  ON public.contest_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = entrant_id);

-- Enable realtime for both
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contest_entries;
