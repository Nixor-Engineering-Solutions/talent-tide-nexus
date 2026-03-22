import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Video, Users, Settings, Circle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Workspace, Escrow, WorkspaceRole, WsMember, Panel } from "../types";

interface Props {
  workspace: Workspace | null;
  escrow: Escrow | null;
  userRole: WorkspaceRole;
  members: WsMember[];
  workspaceId: string;
  onPanelSwitch: (p: Panel) => void;
}

const roleConfig: Record<string, { color: string; bg: string; label: string }> = {
  owner: { color: "text-badge-gold", bg: "bg-badge-gold/10", label: "Owner" },
  client: { color: "text-skill-green", bg: "bg-skill-green/10", label: "Client" },
  consultant: { color: "text-court-blue", bg: "bg-court-blue/10", label: "Consultant" },
  editor: { color: "text-foreground", bg: "bg-foreground/10", label: "Editor" },
  viewer: { color: "text-muted-foreground", bg: "bg-surface-2", label: "Viewer" },
};

const statusBadge = (status: string) => {
  switch (status) {
    case "active": return { label: "Active", color: "bg-skill-green/10 text-skill-green border-skill-green/20", icon: Circle, pulse: true };
    case "completed": return { label: "Completed", color: "bg-court-blue/10 text-court-blue border-court-blue/20", icon: CheckCircle2, pulse: false };
    case "disputed": return { label: "Disputed", color: "bg-alert-red/10 text-alert-red border-alert-red/20", icon: AlertTriangle, pulse: true };
    default: return { label: status || "Active", color: "bg-surface-2 text-muted-foreground border-border", icon: Circle, pulse: false };
  }
};

export default function WorkspaceHeader({ workspace, escrow, userRole, members, workspaceId, onPanelSwitch }: Props) {
  const role = roleConfig[userRole] || roleConfig.viewer;
  const escrowStatus = statusBadge(escrow?.status || "active");
  const EscrowIcon = escrowStatus.icon;
  const totalSp = escrow?.total_sp || 0;
  const releasedSp = escrow?.released_sp || 0;
  const progress = totalSp > 0 ? Math.round((releasedSp / totalSp) * 100) : 0;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 h-14">
        <Link to="/dashboard?tab=my-gigs" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft size={16} />
          <span className="text-xs font-mono hidden sm:inline">BACK</span>
        </Link>
        <div className="h-6 w-px bg-border shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="font-heading text-sm font-bold text-foreground truncate">{workspace?.title || "Workspace"}</h1>
          <Badge className={`${escrowStatus.color} border text-[9px] font-mono flex items-center gap-1 shrink-0`}>
            {escrowStatus.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            <EscrowIcon size={10} />
            {escrowStatus.label}
          </Badge>
          <Badge className={`${role.bg} ${role.color} border-none text-[9px] font-mono shrink-0`}>{role.label}</Badge>
        </div>
        {totalSp > 0 && (
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-mono text-muted-foreground uppercase">Escrow</p>
              <p className="text-xs font-mono font-bold text-skill-green">{releasedSp}/{totalSp} SP</p>
            </div>
            <div className="w-20 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <motion.div className="h-full rounded-full bg-skill-green" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
            </div>
          </div>
        )}
        <div className="hidden md:flex items-center -space-x-1.5 shrink-0">
          {members.slice(0, 4).map((m) => (
            <div key={m.id} className="w-6 h-6 rounded-full bg-surface-2 border-2 border-card flex items-center justify-center text-[8px] font-mono font-bold text-muted-foreground" title={m.role}>
              {m.role[0].toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-surface-1 border-2 border-card flex items-center justify-center text-[8px] font-mono text-muted-foreground">+{members.length - 4}</div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onPanelSwitch("video")} className="w-7 h-7 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors" title="Video Call"><Video size={13} /></button>
          <button onClick={() => onPanelSwitch("members")} className="w-7 h-7 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors" title="Members"><Users size={13} /></button>
          <button onClick={() => onPanelSwitch("settings")} className="w-7 h-7 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors" title="Settings"><Settings size={13} /></button>
        </div>
      </div>
    </header>
  );
}
