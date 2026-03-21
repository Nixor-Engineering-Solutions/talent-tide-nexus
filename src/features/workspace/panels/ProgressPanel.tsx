import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, Lock, Shield, Coins, Clock,
  Layers, AlertTriangle, Pause, RotateCcw, Users2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import type { WsStage, Escrow, WorkspaceRole } from "../types";

type SubView = "stages" | "escrow" | "timeline";

interface TimelineEvent {
  id: string;
  type: string;
  label: string;
  detail: string;
  timestamp: string;
  icon: any;
  color: string;
}

const stageStatusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: "text-skill-green", bg: "bg-skill-green/10 border-skill-green/20" },
  active: { icon: Circle, color: "text-foreground", bg: "bg-foreground/5 border-foreground/20" },
  locked: { icon: Lock, color: "text-muted-foreground", bg: "bg-surface-1 border-border" },
  dispute: { icon: AlertTriangle, color: "text-alert-red", bg: "bg-alert-red/5 border-alert-red/20" },
  abandoned: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-surface-2 border-border" },
  revision: { icon: RotateCcw, color: "text-court-blue", bg: "bg-court-blue/5 border-court-blue/20" },
  consultation: { icon: Users2, color: "text-badge-gold", bg: "bg-badge-gold/5 border-badge-gold/20" },
  on_hold: { icon: Pause, color: "text-badge-gold", bg: "bg-badge-gold/5 border-badge-gold/20" },
};

interface Props {
  workspaceId: string;
  userId: string | null;
  escrow: Escrow | null;
  stages: WsStage[];
  userRole: WorkspaceRole;
  onGigComplete: (code: string) => void;
}

export default function ProgressPanel({ workspaceId, userId, escrow, stages: initialStages, userRole, onGigComplete }: Props) {
  const [subView, setSubView] = useState<SubView>("stages");
  const [stages, setStages] = useState<WsStage[]>(initialStages);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [completing, setCompleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setStages(initialStages); }, [initialStages]);

  // Build timeline from workspace activity
  useEffect(() => {
    if (subView !== "timeline") return;
    (async () => {
      const [{ data: msgs }, { data: files }, { data: dels }] = await Promise.all([
        supabase.from("workspace_messages").select("id,created_at,sender_id,content").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
        supabase.from("workspace_files").select("id,created_at,file_name,uploaded_by").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(20),
        supabase.from("workspace_deliverables").select("id,created_at,title,status").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(20),
      ]);

      const events: TimelineEvent[] = [];
      stages.filter(s => s.completed_at).forEach(s => {
        events.push({ id: `s-${s.id}`, type: "stage", label: `Stage completed: ${s.name}`, detail: `${s.sp_allocated} SP released`, timestamp: s.completed_at!, icon: CheckCircle2, color: "text-skill-green" });
      });
      (files || []).forEach(f => {
        events.push({ id: `f-${f.id}`, type: "file", label: `File uploaded`, detail: f.file_name, timestamp: f.created_at, icon: Layers, color: "text-court-blue" });
      });
      (dels || []).forEach(d => {
        events.push({ id: `d-${d.id}`, type: "deliverable", label: `Deliverable: ${d.title}`, detail: d.status, timestamp: d.created_at, icon: CheckCircle2, color: "text-badge-gold" });
      });

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTimeline(events.slice(0, 30));
    })();
  }, [subView, workspaceId, stages]);

  const markComplete = async (stage: WsStage) => {
    if (userRole === "viewer") { toast.error("Viewers cannot modify stages"); return; }
    await supabase.from("workspace_stages").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", stage.id);
    const nextIdx = stage.order_index + 1;
    await supabase.from("workspace_stages").update({ status: "active" }).eq("workspace_id", workspaceId).eq("order_index", nextIdx);
    logActivity("workspace:stage_completed", { entity_type: "workspace", entity_id: workspaceId, context: { stage_name: stage.name } });
    toast.success(`Stage "${stage.name}" completed!`);
    const { data } = await supabase.from("workspace_stages").select("*").eq("workspace_id", workspaceId).order("order_index", { ascending: true });
    if (data) setStages(data as WsStage[]);
  };

  const completeGig = async () => {
    if (!escrow || !userId) return;
    setCompleting(true);
    try {
      const [msgRes, fileRes, delRes] = await Promise.all([
        supabase.from("workspace_messages").select("*").eq("workspace_id", workspaceId),
        supabase.from("workspace_files").select("*").eq("workspace_id", workspaceId),
        supabase.from("workspace_deliverables").select("*").eq("workspace_id", workspaceId),
      ]);
      const { createWorkspaceTransaction } = await import("@/lib/transaction-generator");
      const { code, error } = await createWorkspaceTransaction({ workspaceId, escrow, stages, messages: msgRes.data || [], files: fileRes.data || [], deliverables: delRes.data || [] });
      if (error) { toast.error(`Transaction failed: ${error}`); }
      else {
        await supabase.from("escrow_contracts").update({ status: "released", released_sp: escrow.total_sp, updated_at: new Date().toISOString() }).eq("id", escrow.id);
        toast.success(`Gig completed! Transaction: ${code}`, { action: { label: "View", onClick: () => navigate(`/transaction?code=${code}`) }, duration: 10000 });
        onGigComplete(code);
      }
    } catch { toast.error("Failed to complete gig"); }
    setCompleting(false);
  };

  const completed = stages.filter(s => s.status === "completed").length;
  const allDone = stages.length > 0 && completed === stages.length;
  const progress = stages.length > 0 ? (completed / stages.length) * 100 : 0;
  const totalSP = stages.reduce((a, s) => a + s.sp_allocated, 0);

  const pills: { key: SubView; label: string; icon: any }[] = [
    { key: "stages", label: "Stages", icon: Layers },
    { key: "escrow", label: "Escrow", icon: Coins },
    { key: "timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation pills */}
      <div className="flex items-center gap-1 border-b border-border px-4 py-2.5">
        {pills.map(p => (
          <button
            key={p.key}
            onClick={() => setSubView(p.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              subView === p.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
            }`}
          >
            <p.icon size={13} />
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ─── STAGES ─── */}
        {subView === "stages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl border border-border bg-card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Gig Progress</h3>
                <Badge className="bg-skill-green/10 text-skill-green border-none">{completed}/{stages.length}</Badge>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{totalSP} SP allocated</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
            </div>

            {allDone && escrow && escrow.status !== "released" && userRole !== "viewer" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <button onClick={completeGig} disabled={completing}
                  className="w-full rounded-2xl bg-skill-green py-4 text-sm font-bold text-background hover:bg-skill-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> {completing ? "Generating Transaction..." : "Complete Gig & Release Escrow"}
                </button>
              </motion.div>
            )}

            {escrow?.status === "released" && (
              <div className="mb-6 rounded-2xl border border-skill-green/20 bg-skill-green/5 p-4 text-center">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-skill-green" />
                <p className="text-sm font-medium text-foreground">Gig Completed</p>
              </div>
            )}

            <div className="space-y-3">
              {stages.map((stage) => {
                const cfg = stageStatusConfig[stage.status] || stageStatusConfig.locked;
                const Icon = cfg.icon;
                return (
                  <div key={stage.id} className={`rounded-xl border p-4 ${cfg.bg} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stage.status === "active" ? "bg-foreground" : "bg-surface-2/50"}`}>
                        <Icon size={16} className={stage.status === "active" ? "text-background" : cfg.color} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${stage.status === "locked" ? "text-muted-foreground" : "text-foreground"}`}>{stage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">{stage.sp_allocated} SP</span>
                          {stage.completed_at && ` · Done ${new Date(stage.completed_at).toLocaleDateString()}`}
                          {!stage.completed_at && ` · ${stage.status}`}
                        </p>
                      </div>
                      {stage.status === "active" && userRole !== "viewer" && (
                        <button onClick={() => markComplete(stage)}
                          className="rounded-lg bg-skill-green px-3 py-1.5 text-xs font-medium text-background hover:bg-skill-green/90 transition-colors">
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {stages.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">No stages configured</p>}
            </div>
          </motion.div>
        )}

        {/* ─── ESCROW ─── */}
        {subView === "escrow" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!escrow ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Coins size={48} className="mb-4 opacity-30" />
                <p className="text-sm">No escrow contract found</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-card p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <Shield size={16} className="text-court-blue" /> Escrow Contract
                    </h3>
                    <Badge className={`border-none text-[10px] ${
                      escrow.status === "released" ? "bg-skill-green/10 text-skill-green" :
                      escrow.status === "disputed" ? "bg-alert-red/10 text-alert-red" :
                      "bg-badge-gold/10 text-badge-gold"
                    }`}>
                      {escrow.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Total SP", value: escrow.total_sp, color: "text-foreground" },
                      { label: "Released", value: escrow.released_sp, color: "text-skill-green" },
                      { label: "Held", value: escrow.total_sp - escrow.released_sp, color: "text-badge-gold" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl bg-surface-1 p-3 text-center">
                        <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <Progress value={escrow.total_sp > 0 ? (escrow.released_sp / escrow.total_sp) * 100 : 0} className="h-2 mb-2" />
                </div>

                <div className="rounded-xl border border-court-blue/20 bg-court-blue/5 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-court-blue" />
                    <span className="text-sm font-medium text-foreground">SP Insurance Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your SP is protected. If abandoned, you'll be refunded based on stage progress.</p>
                </div>

                {stages.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">SP per Stage</h4>
                    <div className="space-y-2">
                      {stages.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span className={s.status === "completed" ? "text-skill-green" : "text-muted-foreground"}>{s.name}</span>
                          <span className="font-mono text-foreground">{s.sp_allocated} SP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ─── TIMELINE ─── */}
        {subView === "timeline" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Clock size={16} /> Activity Timeline
            </h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-8">No activity yet</p>
            ) : (
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" />
                {timeline.map((ev) => {
                  const Icon = ev.icon;
                  return (
                    <div key={ev.id} className="relative flex gap-3">
                      <div className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 border border-border ${ev.color}`}>
                        <Icon size={12} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{ev.label}</p>
                        <p className="text-xs text-muted-foreground">{ev.detail}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                          {new Date(ev.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
