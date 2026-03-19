-- Allow anyone to view profiles (public leaderboard, profile pages)
DROP POLICY IF EXISTS "Public profile view for authenticated" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Drop redundant own-profile policy since the above covers it
DROP POLICY IF EXISTS "Users can view own profile fully" ON public.profiles;