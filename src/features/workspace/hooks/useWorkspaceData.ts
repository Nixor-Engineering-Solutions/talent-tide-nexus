import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logPageView, logActivity } from "@/lib/activity-logger";
import type { Workspace, Escrow, WsStage, WsMember, WorkspaceRole, WorkspaceData } from "../types";

export function useWorkspaceData(workspaceId: string, userId: string | null): WorkspaceData {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [stages, setStages] = useState<WsStage[]>([]);
  const [members, setMembers] = useState<WsMember[]>([]);
  const [userRole, setUserRole] = useState<WorkspaceRole>("owner");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [wsRes, escRes, stgRes, memRes] = await Promise.all([
      (supabase as any).from("workspaces").select("*").eq("id", workspaceId).maybeSingle(),
      supabase.from("escrow_contracts").select("*").eq("workspace_id", workspaceId).maybeSingle(),
      supabase.from("workspace_stages").select("*").eq("workspace_id", workspaceId).order("order_index", { ascending: true }),
      supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId),
    ]);

    if (wsRes.data) setWorkspace(wsRes.data as Workspace);
    if (escRes.data) setEscrow(escRes.data as Escrow);
    if (stgRes.data) setStages(stgRes.data as WsStage[]);
    if (memRes.data) setMembers(memRes.data as WsMember[]);

    // Determine user role
    if (userId && memRes.data) {
      const myMembership = (memRes.data as WsMember[]).find(m => m.user_id === userId);
      if (myMembership) {
        setUserRole(myMembership.role as WorkspaceRole);
      } else if (escRes.data) {
        const esc = escRes.data as Escrow;
        if (esc.buyer_id === userId || esc.seller_id === userId) setUserRole("owner");
      }
    }

    setLoading(false);
  }, [workspaceId, userId]);

  useEffect(() => {
    fetchData();
    logPageView("workspace");
    logActivity("workspace:opened", { entity_type: "workspace", entity_id: workspaceId });
  }, [fetchData, workspaceId]);

  return { workspace, escrow, stages, members, userRole, loading };
}

export function useWorkspaceMembers(workspaceId: string) {
  const [members, setMembers] = useState<WsMember[]>([]);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId);
    if (data) setMembers(data as WsMember[]);
  }, [workspaceId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  return { members, refetch: fetchMembers };
}
