import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle2, X, Clock, User, Coins, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import { callAI } from "../hooks/useWorkspaceAI";
import type { WsDeliverable, WorkspaceRole } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  userRole: WorkspaceRole;
}

export default function RevisionsPanel({ workspaceId, userId, userRole }: Props) {
  const [deliverables, setDeliverables] = useState<WsDeliverable[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

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
    const maxFree = d.max_revisions || 3;
    const isOverLimit = currentCount >= maxFree;

    if (isOverLimit) {
      // Charge revision cost — look up listing revision_cost_sp
      const { data: ws } = await supabase.from("workspaces").select("listing_id").eq("id", workspaceId).maybeSingle();
      let revisionCost = 0;
      if (ws?.listing_id) {
        const { data: listing } = await supabase.from("listings").select("revision_cost_sp").eq("id", ws.listing_id).maybeSingle();
        revisionCost = (listing as any)?.revision_cost_sp || 10;
      } else {
        revisionCost = 10; // default
      }

      // Deduct from escrow or warn
      toast.info(`Extra revision costs ${revisionCost} SP (revision ${currentCount + 1} beyond ${maxFree} free)`);
    }

    await supabase.from("workspace_deliverables").update({
      status: "revision_requested",
      revision_count: currentCount + 1,
      reviewer_notes: reviewNotes[d.id] || null,
    }).eq("id", d.id);
    logActivity("workspace:revision_requested", { entity_type: "workspace", entity_id: workspaceId });
    toast.success(isOverLimit ? "Paid revision requested" : "Revision requested");
    fetchDel();
  };

  const rejectDeliverable = async (d: WsDeliverable) => {
    if (!canApprove || !userId) return;
    if (!reviewNotes[d.id]?.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    await supabase.from("workspace_deliverables").update({
      status: "rejected",
      reviewer_notes: reviewNotes[d.id],
    }).eq("id", d.id);
    toast.success("Deliverable rejected with reason");
    fetchDel();
  };

  const aiEditRequirements = async (d: WsDeliverable) => {
    setAiLoading(d.id);
    const currentReqs = d.requirements?.map((r: any) => r.text || r).join(", ") || d.description || "";
    const improved = await callAI({
      action: "suggest_requirements",
      content: `Improve and expand these requirements for "${d.title}": ${currentReqs}`,
    });
    try {
      const parsed = JSON.parse(improved);
      if (Array.isArray(parsed)) {
        await supabase.from("workspace_deliverables").update({
          requirements: parsed.map((r: string) => ({ text: r, met: false })),
        }).eq("id", d.id);
        toast.success("Requirements updated by AI");
        fetchDel();
      }
    } catch {
      toast.info("Could not parse AI suggestions");
    }
    setAiLoading(null);
  };

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: "bg-badge-gold/10 text-badge-gold", icon: Clock, label: "Pending Review" },
    accepted: { color: "bg-skill-green/10 text-skill-green", icon: CheckCircle2, label: "Accepted" },
    revision_requested: { color: "bg-court-blue/10 text-court-blue", icon: RotateCcw, label: "Revision Requested" },
    rejected: { color: "bg-alert-red/10 text-alert-red", icon: X, label: "Rejected" },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-5 py-3 flex items-center gap-2">
        <RotateCcw size={15} />
        <h3 className="text-sm font-semibold text-foreground">Revisions & Approvals</h3>
        <span className="text-[10px] text-muted-foreground ml-auto font-mono">
          {deliverables.filter(d => d.status === "pending").length} pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {deliverables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <RotateCcw size={40} className="mb-3 opacity-20" />
            <p className="text-sm">No deliverables to review</p>
          </div>
        ) : (
          deliverables.map(d => {
            const cfg = statusConfig[d.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const maxFree = d.max_revisions || 3;
            const revCount = d.revision_count || 0;
            const isOverFree = revCount >= maxFree;

            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                  <Badge className={`border-none text-[9px] flex items-center gap-1 ${cfg.color}`}>
                    <StatusIcon size={9} /> {cfg.label}
                  </Badge>
                </div>

                <div className="p-4 space-y-3">
                  {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}

                  {/* Revision counter with cost warning */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-mono flex items-center gap-1 ${isOverFree ? "text-badge-gold" : "text-muted-foreground"}`}>
                      <RotateCcw size={10} /> Rev {revCount}/{maxFree} free
                    </span>
                    {isOverFree && (
                      <span className="flex items-center gap-1 text-badge-gold">
                        <Coins size={10} /> Extra revisions cost SP
                      </span>
                    )}
                    {d.ai_quality_score != null && (
                      <span className={`font-mono ${d.ai_quality_score >= 70 ? "text-skill-green" : "text-badge-gold"}`}>
                        AI: {d.ai_quality_score}/100
                      </span>
                    )}
                  </div>

                  {/* Requirements with AI edit */}
                  {d.requirements && Array.isArray(d.requirements) && d.requirements.length > 0 && (
                    <div className="rounded-lg bg-surface-1 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-foreground">Requirements</span>
                        {canApprove && (
                          <button
                            onClick={() => aiEditRequirements(d)}
                            disabled={aiLoading === d.id}
                            className="text-[10px] text-court-blue hover:underline flex items-center gap-1 disabled:opacity-50"
                          >
                            <Sparkles size={9} /> {aiLoading === d.id ? "Editing..." : "AI Edit"}
                          </button>
                        )}
                      </div>
                      {d.requirements.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-0.5">
                          <CheckCircle2 size={10} className="text-muted-foreground/40 shrink-0" />
                          <span className="text-[10px] text-muted-foreground">{r.text || r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {d.reviewer_notes && (
                    <div className="rounded-lg bg-surface-1 border border-border/50 p-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Review notes: </span>{d.reviewer_notes}
                    </div>
                  )}

                  {/* Review actions */}
                  {canApprove && d.status === "pending" && d.submitted_by !== userId && (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        placeholder="Reason for rejection or revision notes (required for reject)..."
                        value={reviewNotes[d.id] || ""}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [d.id]: e.target.value })}
                        className="bg-surface-1 border-border min-h-[60px] text-xs"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => approveDeliverable(d)}
                          className="flex-1 rounded-lg bg-skill-green py-2 text-xs font-semibold text-background hover:bg-skill-green/90 flex items-center justify-center gap-1">
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button onClick={() => requestRevision(d)}
                          className="flex-1 rounded-lg bg-court-blue py-2 text-xs font-semibold text-white hover:bg-court-blue/90 flex items-center justify-center gap-1">
                          <RotateCcw size={12} /> Revise {isOverFree && "(paid)"}
                        </button>
                        <button onClick={() => rejectDeliverable(d)}
                          className="rounded-lg border border-alert-red/30 px-3 py-2 text-xs text-alert-red hover:bg-alert-red/5 flex items-center justify-center gap-1">
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
