import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Video, Bot, Settings, Sparkles } from "lucide-react";
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

export default function WorkspaceHeader({ workspace, escrow, userRole, members, workspaceId, onPanelSwitch }: Props) {
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    held: "bg-badge-gold/10 text-badge-gold",
    partial_release: "bg-court-blue/10 text-court-blue",
    released: "bg-skill-green/10 text-skill-green",
    refunded: "bg-alert-red/10 text-alert-red",
    disputed: "bg-alert-red/10 text-alert-red",
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard?tab=my-gigs")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">
            {workspace?.title || "Workspace"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-muted-foreground">
              {workspaceId.slice(0, 12)}…
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <Badge className="border-none text-[9px] bg-surface-2 text-muted-foreground capitalize px-1.5 py-0">
              {userRole}
            </Badge>
            {workspace?.workspace_type && workspace.workspace_type !== "direct_swap" && (
              <Badge className="border-none text-[9px] bg-surface-2 text-muted-foreground capitalize px-1.5 py-0">
                {workspace.workspace_type.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {escrow && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-skill-green">{escrow.total_sp} SP</span>
            <Badge className={`border-none text-[10px] ${statusColors[escrow.status] || "bg-surface-2 text-muted-foreground"}`}>
              {escrow.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Member avatars stack */}
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-surface-2 text-[10px] font-mono font-bold text-muted-foreground"
              style={{ zIndex: 10 - i }}
            >
              {m.user_id.slice(0, 2).toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-surface-2 text-[9px] font-mono text-muted-foreground">
              +{members.length - 4}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border" />

        <button onClick={() => onPanelSwitch("video")} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors">
          <Video size={16} />
        </button>
        <button onClick={() => onPanelSwitch("ai")} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-court-blue hover:bg-court-blue/5 transition-colors">
          <Sparkles size={16} />
        </button>
        <button onClick={() => onPanelSwitch("settings")} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
