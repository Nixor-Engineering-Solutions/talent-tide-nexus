import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, MessageSquare, FileText, Package, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { WsStage } from "../types";

interface Props {
  workspaceId: string;
  stages: WsStage[];
}

interface Metrics {
  messageCount: number;
  fileCount: number;
  deliverableCount: number;
  completedStages: number;
  totalStages: number;
  totalSP: number;
  releasedSP: number;
  daysSinceCreated: number;
}

export default function MetricsPanel({ workspaceId, stages }: Props) {
  const [metrics, setMetrics] = useState<Metrics>({
    messageCount: 0, fileCount: 0, deliverableCount: 0,
    completedStages: 0, totalStages: 0, totalSP: 0, releasedSP: 0, daysSinceCreated: 0,
  });

  useEffect(() => {
    (async () => {
      const [{ count: msgCount }, { count: fileCount }, { count: delCount }, { data: escrow }] = await Promise.all([
        supabase.from("workspace_messages").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_files").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_deliverables").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("escrow_contracts").select("total_sp,released_sp,created_at").eq("workspace_id", workspaceId).maybeSingle(),
      ]);

      const completedStages = stages.filter(s => s.status === "completed").length;
      const totalSP = stages.reduce((a, s) => a + s.sp_allocated, 0);
      const daysSinceCreated = escrow ? Math.floor((Date.now() - new Date(escrow.created_at).getTime()) / 86400000) : 0;

      setMetrics({
        messageCount: msgCount || 0,
        fileCount: fileCount || 0,
        deliverableCount: delCount || 0,
        completedStages,
        totalStages: stages.length,
        totalSP: escrow?.total_sp || totalSP,
        releasedSP: escrow?.released_sp || 0,
        daysSinceCreated,
      });
    })();
  }, [workspaceId, stages]);

  const cards = [
    { label: "Messages", value: metrics.messageCount, icon: MessageSquare, color: "text-court-blue" },
    { label: "Files", value: metrics.fileCount, icon: FileText, color: "text-badge-gold" },
    { label: "Deliverables", value: metrics.deliverableCount, icon: Package, color: "text-skill-green" },
    { label: "Duration", value: `${metrics.daysSinceCreated}d`, icon: Clock, color: "text-muted-foreground" },
  ];

  const stageVelocity = metrics.completedStages > 0 && metrics.daysSinceCreated > 0
    ? (metrics.daysSinceCreated / metrics.completedStages).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <h3 className="font-medium text-foreground mb-6 flex items-center gap-2">
        <BarChart3 size={16} /> Workspace Metrics
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} className={c.color} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-4">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={14} /> Stage Velocity
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-foreground">{metrics.completedStages}/{metrics.totalStages}</p>
            <p className="text-[10px] text-muted-foreground">Stages Done</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-skill-green">{metrics.releasedSP}</p>
            <p className="text-[10px] text-muted-foreground">SP Released</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-foreground">{stageVelocity}</p>
            <p className="text-[10px] text-muted-foreground">Days/Stage</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h4 className="text-sm font-medium text-foreground mb-3">SP Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Contract</span>
            <span className="font-mono text-foreground">{metrics.totalSP} SP</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-skill-green">Released</span>
            <span className="font-mono text-skill-green">{metrics.releasedSP} SP</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-badge-gold">Held</span>
            <span className="font-mono text-badge-gold">{metrics.totalSP - metrics.releasedSP} SP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
