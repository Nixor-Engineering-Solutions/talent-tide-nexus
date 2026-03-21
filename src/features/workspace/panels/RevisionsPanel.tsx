import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle2, X, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import type { WsDeliverable, WorkspaceRole } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  userRole: WorkspaceRole;
}

export default function RevisionsPanel({ workspaceId, userId, userRole }: Props) {
  const [deliverables, setDeliverables] = useState<WsDeliverable[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const fetchDel = useCallback(async () => {
    const { data } = await supabase.from("workspace_deliverables").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (data) setDeliverables(data as WsDeliverable[]);
  }, [workspaceId]);

  useEffect(() => { fetchDel(); }, [fetchDel]);

  const canApprove = userRole === "client" || userRole === "consultant" || userRole === "owner";

  const approveDeliverable = async (d: WsDeliverable) => {
    if (!canApprove || !userId) return;
    await supabase.from("workspace_deliverables").update({
      status: "accepted",
      approved_by: userId,
      approved_at: new Date().toISOString(),
      reviewer_notes: reviewNotes[d.id] || null,
    }).eq("id", d.id);
    logActivity("workspace:deliverable_approved", { entity_type: "workspace", entity_id: workspaceId });
    toast.success("Deliverable approved!");
    fetchDel();
  };

  const requestRevision = async (d: WsDeliverable) => {
    if (!canApprove || !userId) return;
    const currentCount = d.revision_count || 0;
    const maxRev = d.max_revisions || 3;
    if (currentCount >= maxRev) { toast.error("Max revisions reached"); return; }
    await supabase.from("workspace_deliverables").update({
      status: "revision_requested",
      revision_count: currentCount + 1,
      reviewer_notes: reviewNotes[d.id] || null,
    }).eq("id", d.id);
    logActivity("workspace:revision_requested", { entity_type: "workspace", entity_id: workspaceId });
    toast.success("Revision requested");
    fetchDel();
  };

  const rejectDeliverable = async (d: WsDeliverable) => {
    if (!canApprove || !userId) return;
    await supabase.from("workspace_deliverables").update({
      status: "rejected",
      reviewer_notes: reviewNotes[d.id] || null,
    }).eq("id", d.id);
    toast.success("Deliverable rejected");
    fetchDel();
  };

  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-badge-gold/10 text-badge-gold", icon: Clock },
    accepted: { color: "bg-skill-green/10 text-skill-green", icon: CheckCircle2 },
    revision_requested: { color: "bg-court-blue/10 text-court-blue", icon: RotateCcw },
    rejected: { color: "bg-alert-red/10 text-alert-red", icon: X },
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
        <RotateCcw size={16} /> Revisions & Approvals
      </h3>

      {deliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <RotateCcw size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No deliverables to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map(d => {
            const cfg = statusConfig[d.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <Badge className={`border-none text-[10px] flex items-center gap-1 ${cfg.color}`}>
                    <StatusIcon size={10} /> {d.status.replace("_", " ")}
                  </Badge>
                </div>
                {d.description && <p className="text-xs text-muted-foreground mb-2">{d.description}</p>}

                {/* Revision counter */}
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span className="font-mono">Rev {d.revision_count || 0}/{d.max_revisions || 3}</span>
                  {d.ai_quality_score != null && (
                    <span className={`font-mono ${d.ai_quality_score >= 70 ? "text-skill-green" : "text-badge-gold"}`}>
                      AI: {d.ai_quality_score}/100
                    </span>
                  )}
                  {d.approved_by && (
                    <span className="flex items-center gap-1">
                      <User size={10} /> Approved by {d.approved_by.slice(0, 8)}
                    </span>
                  )}
                </div>

                {d.reviewer_notes && (
                  <div className="rounded-lg bg-surface-1 p-2 mb-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Review notes: </span>{d.reviewer_notes}
                  </div>
                )}

                {/* Review actions for client/consultant */}
                {canApprove && d.status === "pending" && d.submitted_by !== userId && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Review notes (optional)..."
                      value={reviewNotes[d.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [d.id]: e.target.value })}
                      className="bg-surface-1 border-border min-h-[60px] text-xs"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => approveDeliverable(d)} className="flex-1 rounded-lg bg-skill-green py-2 text-xs font-medium text-background hover:bg-skill-green/90 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button onClick={() => requestRevision(d)} className="flex-1 rounded-lg bg-court-blue py-2 text-xs font-medium text-white hover:bg-court-blue/90 flex items-center justify-center gap-1">
                        <RotateCcw size={12} /> Revise
                      </button>
                      <button onClick={() => rejectDeliverable(d)} className="rounded-lg border border-alert-red/30 px-3 py-2 text-xs text-alert-red hover:bg-alert-red/5 flex items-center justify-center gap-1">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
