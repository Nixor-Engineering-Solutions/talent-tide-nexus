import { motion } from "framer-motion";
import {
  MessageSquare, Pencil, Video, FileText, Layers, Package,
  Gavel, Users, Bot, Settings, BarChart3, RotateCcw,
  ListChecks, Clock,
} from "lucide-react";
import { logInteraction } from "@/lib/activity-logger";
import type { Panel } from "../types";

interface SidebarSection {
  label: string;
  items: { id: Panel; icon: any; label: string; badge?: number }[];
}

const baseSections: SidebarSection[] = [
  {
    label: "Communicate",
    items: [
      { id: "chat", icon: MessageSquare, label: "Chat" },
      { id: "whiteboard", icon: Pencil, label: "Board" },
      { id: "video", icon: Video, label: "Video" },
      { id: "files", icon: FileText, label: "Files" },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "progress", icon: Layers, label: "Progress" },
      { id: "submit", icon: Package, label: "Submit" },
      { id: "revisions", icon: RotateCcw, label: "Revisions" },
      { id: "dispute", icon: Gavel, label: "Dispute" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "members", icon: Users, label: "Members" },
      { id: "metrics", icon: BarChart3, label: "Metrics" },
      { id: "ai", icon: Bot, label: "AI" },
      { id: "settings", icon: Settings, label: "Settings" },
    ],
  },
];

const formatExtraSections: Record<string, SidebarSection> = {
  auction: { label: "Auction", items: [{ id: "bids", icon: Gavel, label: "Bids" }] },
  "co-creation": { label: "Team", items: [{ id: "team", icon: Users, label: "Team" }] },
  projects: { label: "Project", items: [{ id: "kanban", icon: ListChecks, label: "Kanban" }, { id: "deadline", icon: Clock, label: "Timeline" }] },
};

function getSections(workspaceType: string): SidebarSection[] {
  const extra = formatExtraSections[workspaceType];
  if (!extra) return baseSections;
  return [baseSections[0], extra, baseSections[1], baseSections[2]];
}

interface Props {
  activePanel: Panel;
  onPanelSwitch: (p: Panel) => void;
  workspaceType: string;
}

export default function WorkspaceSidebar({ activePanel, onPanelSwitch, workspaceType }: Props) {
  const sections = getSections(workspaceType);

  return (
    <nav className="w-[68px] shrink-0 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col py-2 overflow-y-auto">
      {sections.map((section, si) => (
        <div key={section.label}>
          {si > 0 && <div className="mx-3 my-1.5 h-px bg-border/40" />}
          <p className="px-2 mb-0.5 text-[7px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 text-center select-none">
            {section.label}
          </p>
          {section.items.map((item) => {
            const isActive = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPanelSwitch(item.id);
                  logInteraction("workspace_tab_switch", { to: item.id });
                }}
                title={item.label}
                className={`relative flex flex-col items-center justify-center w-full h-11 gap-0.5 transition-all ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-foreground/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="ws-sidebar-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-foreground"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="ws-sidebar-bg"
                    className="absolute inset-x-1 inset-y-0.5 rounded-lg bg-foreground/[0.04]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon size={16} className="relative z-10" />
                <span className="text-[7px] font-medium relative z-10 leading-none tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
