import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, CheckCircle2, Circle, X, Sparkles, ListChecks, RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import { callAI } from "../hooks/useWorkspaceAI";
import type { WsDeliverable, WorkspaceRole } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  userRole: WorkspaceRole;
}

export default function SubmitPanel({ workspaceId, userId, userRole }: Props) {
  const [deliverables, setDeliverables] = useState<WsDeliverable[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiReviewing, setAiReviewing] = useState(false);
  const [suggestingReqs, setSuggestingReqs] = useState(false);

  const fetchDel = useCallback(async () => {
    const { data } = await supabase.from("workspace_deliverables").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (data) setDeliverables(data as WsDeliverable[]);
  }, [workspaceId]);

  useEffect(() => { fetchDel(); }, [fetchDel]);

  const addReq = () => { if (newReq.trim()) { setRequirements([...requirements, newReq.trim()]); setNewReq(""); } };

  const suggestRequirements = async () => {
    if (!desc.trim()) { toast.error("Add a description first"); return; }
    setSuggestingReqs(true);
    const result = await callAI({ action: "suggest_requirements", content: desc });
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) setRequirements(prev => [...prev, ...parsed]);
    } catch { toast.info("Add requirements manually"); }
    setSuggestingReqs(false);
  };

  const submit = async () => {
    if (!title.trim() || !userId) return;
    if (userRole === "viewer") { toast.error("Viewers cannot submit"); return; }
    setSubmitting(true);
    setAiReviewing(true);
    const aiReview = await callAI({ action: "review_deliverable", content: { title: title.trim(), description: desc.trim(), requirements } });
    setAiReviewing(false);

    let aiScore: number | null = null;
    const scoreMatch = aiReview.match(/(\d{1,3})\/100|score[:\s]+(\d{1,3})/i);
    if (scoreMatch) aiScore = parseInt(scoreMatch[1] || scoreMatch[2]);

    await supabase.from("workspace_deliverables").insert({
      workspace_id: workspaceId, submitted_by: userId, title: title.trim(), description: desc.trim(),
      requirements: requirements.map(r => ({ text: r, met: false })),
      ai_quality_score: aiScore, ai_feedback: aiReview || null,
    });
    logActivity("workspace:deliverable_submitted", { entity_type: "workspace", entity_id: workspaceId });
    toast.success("Deliverable submitted!");
    setTitle(""); setDesc(""); setRequirements([]);
    await fetchDel();
    setSubmitting(false);
  };

  const statusBadge: Record<string, string> = { pending: "bg-badge-gold/10 text-badge-gold", accepted: "bg-skill-green/10 text-skill-green", revision_requested: "bg-court-blue/10 text-court-blue", rejected: "bg-alert-red/10 text-alert-red" };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {userRole !== "viewer" && (
        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2"><Package size={16} className="text-court-blue" /> Submit Deliverable</h3>
          <div className="space-y-3">
            <Input placeholder="Deliverable title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface-1 border-border" />
            <Textarea placeholder="Description..." value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-surface-1 border-border min-h-[80px]" />
            <div className="rounded-xl border border-border bg-surface-1 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground flex items-center gap-1"><ListChecks size={12} /> Requirements ({requirements.length})</span>
                <button onClick={suggestRequirements} disabled={suggestingReqs} className="text-[10px] text-court-blue hover:underline flex items-center gap-1 disabled:opacity-50">
                  <Sparkles size={10} /> {suggestingReqs ? "..." : "AI Suggest"}
                </button>
              </div>
              {requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground flex-1">{r}</span>
                  <button onClick={() => setRequirements(requirements.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-alert-red"><X size={10} /></button>
                </div>
              ))}
              <div className="flex gap-1 mt-1">
                <input value={newReq} onChange={(e) => setNewReq(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReq()}
                  placeholder="Add requirement..." className="flex-1 text-xs bg-transparent border-b border-border py-1 text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
                <button onClick={addReq} className="text-xs text-court-blue hover:underline">Add</button>
              </div>
            </div>
            <button onClick={submit} disabled={submitting || !title.trim()} className="w-full rounded-xl bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2">
              {aiReviewing ? <><Sparkles size={14} className="animate-spin" /> AI Reviewing...</> : submitting ? "Submitting..." : "Submit with AI Review"}
            </button>
          </div>
        </div>
      )}

      <h4 className="text-sm font-medium text-foreground mb-3">Submissions</h4>
      <div className="space-y-2">
        {deliverables.length === 0 && <p className="text-sm text-muted-foreground text-center">No submissions yet</p>}
        {deliverables.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">{d.title}</p>
              <div className="flex items-center gap-1">
                {d.ai_quality_score != null && (
                  <Badge className={`border-none text-[10px] ${d.ai_quality_score >= 70 ? "bg-skill-green/10 text-skill-green" : d.ai_quality_score >= 40 ? "bg-badge-gold/10 text-badge-gold" : "bg-alert-red/10 text-alert-red"}`}>
                    AI: {d.ai_quality_score}/100
                  </Badge>
                )}
                <Badge className={`border-none text-[10px] ${statusBadge[d.status] || "bg-surface-2"}`}>{d.status.replace("_", " ")}</Badge>
              </div>
            </div>
            {d.description && <p className="text-xs text-muted-foreground mb-1">{d.description}</p>}
            {d.ai_feedback && (
              <details className="mt-1">
                <summary className="text-[10px] text-court-blue cursor-pointer flex items-center gap-1"><Sparkles size={10} /> AI Feedback</summary>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{d.ai_feedback}</p>
              </details>
            )}
            {d.revision_count != null && d.revision_count > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><RotateCcw size={8} /> Revision {d.revision_count}/{d.max_revisions || 3}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
