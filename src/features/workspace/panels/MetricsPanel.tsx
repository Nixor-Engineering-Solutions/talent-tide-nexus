import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, MessageSquare, FileText, Package, Clock, TrendingUp,
  Zap, Users, Eye, MousePointer2, Activity, Gauge, ArrowUp, ArrowDown,
  Timer, CheckCircle2, RotateCcw, AlertTriangle,
} from "lucide-react";
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
  voiceMessages: number;
  revisionsRequested: number;
  acceptedDeliverables: number;
  rejectedDeliverables: number;
  avgQualityScore: number;
  disputeCount: number;
  memberCount: number;
  avgResponseTimeMs: number;
  peakHour: number;
  pageViews: number;
  clickCount: number;
  errorCount: number;
}

export default function MetricsPanel({ workspaceId, stages }: Props) {
  const [metrics, setMetrics] = useState<Metrics>({
    messageCount: 0, fileCount: 0, deliverableCount: 0,
    completedStages: 0, totalStages: 0, totalSP: 0, releasedSP: 0,
    daysSinceCreated: 0, voiceMessages: 0, revisionsRequested: 0,
    acceptedDeliverables: 0, rejectedDeliverables: 0, avgQualityScore: 0,
    disputeCount: 0, memberCount: 0, avgResponseTimeMs: 0,
    peakHour: 0, pageViews: 0, clickCount: 0, errorCount: 0,
  });

  useEffect(() => {
    (async () => {
      const [
        { count: msgCount },
        { count: fileCount },
        { data: dels },
        { data: escrow },
        { count: voiceCount },
        { count: disputeCount },
        { count: memberCount },
        { count: pageViews },
        { count: clickCount },
        { count: errorCount },
      ] = await Promise.all([
        supabase.from("workspace_messages").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_files").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_deliverables").select("id,status,ai_quality_score").eq("workspace_id", workspaceId),
        supabase.from("escrow_contracts").select("total_sp,released_sp,created_at").eq("workspace_id", workspaceId).maybeSingle(),
        supabase.from("workspace_voice_messages").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_disputes").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("workspace_members").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("page_sessions").select("*", { count: "exact", head: true }).like("page_path", `/workspace/${workspaceId}%`),
        supabase.from("click_heatmap").select("*", { count: "exact", head: true }).like("page_path", `/workspace/${workspaceId}%`),
        supabase.from("error_log").select("*", { count: "exact", head: true }).like("page_path", `/workspace/${workspaceId}%`),
      ]);

      const completedStages = stages.filter(s => s.status === "completed").length;
      const totalSP = stages.reduce((a, s) => a + s.sp_allocated, 0);
      const daysSinceCreated = escrow ? Math.floor((Date.now() - new Date(escrow.created_at).getTime()) / 86400000) : 0;

      const deliverables = dels || [];
      const revisionsRequested = deliverables.filter(d => d.status === "revision_requested").length;
      const acceptedDeliverables = deliverables.filter(d => d.status === "accepted").length;
      const rejectedDeliverables = deliverables.filter(d => d.status === "rejected").length;
      const scores = deliverables.filter(d => d.ai_quality_score != null).map(d => d.ai_quality_score!);
      const avgQualityScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      setMetrics({
        messageCount: msgCount || 0,
        fileCount: fileCount || 0,
        deliverableCount: deliverables.length,
        completedStages,
        totalStages: stages.length,
        totalSP: escrow?.total_sp || totalSP,
        releasedSP: escrow?.released_sp || 0,
        daysSinceCreated,
        voiceMessages: voiceCount || 0,
        revisionsRequested,
        acceptedDeliverables,
        rejectedDeliverables,
        avgQualityScore,
        disputeCount: disputeCount || 0,
        memberCount: memberCount || 0,
        avgResponseTimeMs: 0,
        peakHour: 14,
        pageViews: pageViews || 0,
        clickCount: clickCount || 0,
        errorCount: errorCount || 0,
      });
    })();
  }, [workspaceId, stages]);

  const topCards = [
    { label: "Messages", value: metrics.messageCount, sub: `+${metrics.voiceMessages} voice`, icon: MessageSquare, color: "text-court-blue" },
    { label: "Files", value: metrics.fileCount, sub: "shared", icon: FileText, color: "text-badge-gold" },
    { label: "Deliverables", value: metrics.deliverableCount, sub: `${metrics.acceptedDeliverables} accepted`, icon: Package, color: "text-skill-green" },
    { label: "Duration", value: `${metrics.daysSinceCreated}d`, sub: "elapsed", icon: Clock, color: "text-muted-foreground" },
    { label: "Members", value: metrics.memberCount, sub: "active", icon: Users, color: "text-court-blue" },
    { label: "AI Score", value: metrics.avgQualityScore > 0 ? `${metrics.avgQualityScore}` : "—", sub: "/100 avg", icon: Gauge, color: "text-skill-green" },
  ];

  const stageVelocity = metrics.completedStages > 0 && metrics.daysSinceCreated > 0
    ? (metrics.daysSinceCreated / metrics.completedStages).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="border-b border-border px-5 py-3 flex items-center gap-2">
        <BarChart3 size={15} className="text-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Workspace Metrics</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Top metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {topCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <c.icon size={13} className={c.color} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{c.label}</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Velocity + SP */}
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={13} /> Stage Velocity
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl font-bold font-mono text-foreground">{metrics.completedStages}/{metrics.totalStages}</p>
                <p className="text-[9px] text-muted-foreground">Stages Done</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-mono text-skill-green">{metrics.releasedSP}</p>
                <p className="text-[9px] text-muted-foreground">SP Released</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-mono text-foreground">{stageVelocity}</p>
                <p className="text-[9px] text-muted-foreground">Days/Stage</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-semibold text-foreground mb-3">SP Breakdown</h4>
            <div className="space-y-2">
              {[
                { label: "Total Contract", value: `${metrics.totalSP} SP`, color: "text-foreground" },
                { label: "Released", value: `${metrics.releasedSP} SP`, color: "text-skill-green" },
                { label: "Held", value: `${metrics.totalSP - metrics.releasedSP} SP`, color: "text-badge-gold" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className={row.color}>{row.label}</span>
                  <span className={`font-mono ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery health */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity size={13} /> Delivery Health
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Revisions", value: metrics.revisionsRequested, icon: RotateCcw, color: "text-court-blue" },
              { label: "Accepted", value: metrics.acceptedDeliverables, icon: CheckCircle2, color: "text-skill-green" },
              { label: "Rejected", value: metrics.rejectedDeliverables, icon: AlertTriangle, color: "text-alert-red" },
              { label: "Disputes", value: metrics.disputeCount, icon: AlertTriangle, color: metrics.disputeCount > 0 ? "text-alert-red" : "text-skill-green" },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-surface-1 p-3 text-center">
                <item.icon size={14} className={`mx-auto mb-1 ${item.color}`} />
                <p className="text-lg font-bold font-mono text-foreground">{item.value}</p>
                <p className="text-[9px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye size={13} /> Telemetry
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Page Views", value: metrics.pageViews, icon: Eye },
              { label: "Clicks", value: metrics.clickCount, icon: MousePointer2 },
              { label: "Errors", value: metrics.errorCount, icon: AlertTriangle },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-surface-1 p-3 text-center">
                <p className="text-lg font-bold font-mono text-foreground">{item.value}</p>
                <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-1">
                  <item.icon size={9} /> {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
