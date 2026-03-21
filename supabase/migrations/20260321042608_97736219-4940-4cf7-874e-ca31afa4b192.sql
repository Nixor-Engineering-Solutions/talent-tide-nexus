-- Tighten the workspace_invites UPDATE policy
DROP POLICY IF EXISTS "Anyone can update invite (to use it)" ON public.workspace_invites;
CREATE POLICY "Authenticated users can use invites" ON public.workspace_invites
  FOR UPDATE TO authenticated 
  USING (used_by IS NULL AND expires_at > now())
  WITH CHECK (auth.uid() = used_by);

-- Tighten the INSERT policy  
DROP POLICY IF EXISTS "Owners/editors can create invites" ON public.workspace_invites;
CREATE POLICY "Workspace members can create invites" ON public.workspace_invites
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = created_by 
    AND EXISTS (
      SELECT 1 FROM public.workspace_members wm 
      WHERE wm.workspace_id = workspace_invites.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'editor', 'client')
    )
  );