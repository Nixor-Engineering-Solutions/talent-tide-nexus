import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import { callAI } from "../hooks/useWorkspaceAI";
import { useEffect } from "react";
import type { Escrow, WorkspaceRole, WsDispute } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  escrow: Escrow | null;
  userRole: WorkspaceRole;
}

export default function DisputePanel({ workspaceId, userId, escrow, userRole }: Props) {
  const [disputes, setDisputes] = useState<WsDispute[]>([]);
  const [reason, setReason] = useState("");
  const [filing, setFiling] = useState(false);
  const [aiHelping, setAiHelping] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("workspace_disputes").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (data) setDisputes(data as WsDispute[]);
    })();
  }, [workspaceId]);

  const aiHelpDispute = async () => {
    if (!reason.trim()) return;
    setAiHelping(true);
    const helped = await callAI({ action: "help_dispute", content: reason });
    if (helped) setReason(helped);
    setAiHelping(false);
  };

  const fileDispute = async () => {
    if (!reason.trim() || !userId || !escrow) return;
    setFiling(true);
    const filedAgainst = escrow.buyer_id === userId ? escrow.seller_id : escrow.buyer_id;
    await supabase.from("workspace_disputes").insert({ workspace_id: workspaceId, filed_by: userId, filed_against: filedAgainst, reason: reason.trim() });
    await supabase.from("escrow_contracts").update({ status: "disputed" }).eq("id", escrow.id);
    logActivity("workspace:dispute_filed", { entity_type: "workspace", entity_id: workspaceId });
    toast.success("Dispute filed — escrow frozen");
    setReason("");
    const { data } = await supabase.from("workspace_disputes").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (data) setDisputes(data as WsDispute[]);
    setFiling(false);
  };

  const statusColor: Record<string, string> = { open: "bg-badge-gold/10 text-badge-gold", under_review: "bg-court-blue/10 text-court-blue", resolved: "bg-skill-green/10 text-skill-green" };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <div className="rounded-2xl border border-alert-red/20 bg-alert-red/5 p-5 mb-6">
        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-alert-red" /> Open a Dispute
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Filing freezes escrow and notifies both parties.</p>
        <Textarea placeholder="Describe the issue..." value={reason} onChange={(e) => setReason(e.target.value)} className="bg-surface-1 border-border min-h-[100px] mb-3" />
        <div className="flex gap-2">
          <button onClick={aiHelpDispute} disabled={aiHelping || !reason.trim()}
            className="flex-1 rounded-xl border border-court-blue/30 py-2 text-xs text-court-blue disabled:opacity-50 hover:bg-court-blue/5 flex items-center justify-center gap-1">
            <Sparkles size={12} /> {aiHelping ? "AI Writing..." : "AI Help Draft"}
          </button>
          <button onClick={fileDispute} disabled={filing || !reason.trim()}
            className="flex-1 rounded-xl bg-alert-red py-2 text-xs font-medium text-white disabled:opacity-50 hover:bg-alert-red/90">
            {filing ? "Filing..." : "File Dispute"}
          </button>
        </div>
      </div>

      <h4 className="text-sm font-medium text-foreground mb-3">History</h4>
      <div className="space-y-2">
        {disputes.length === 0 && <p className="text-sm text-muted-foreground text-center">No disputes — great!</p>}
        {disputes.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge className={`border-none text-[10px] ${statusColor[d.status] || "bg-surface-2"}`}>{d.status.replace("_", " ")}</Badge>
              <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{d.reason}</p>
            {d.outcome && <p className="text-xs text-skill-green mt-1">Outcome: {d.outcome}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
