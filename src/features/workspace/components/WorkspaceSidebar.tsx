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
    <nav className="w-16 shrink-0 border-r border-border bg-surface-1/50 flex flex-col py-3 overflow-y-auto">
      {sections.map((section, si) => (
        <div key={section.label}>
          {si > 0 && <div className="mx-3 my-2 h-px bg-border/50" />}
          <p className="px-2 mb-1 text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40 text-center">
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
                className={`relative flex flex-col items-center justify-center w-full h-12 gap-0.5 transition-all ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-foreground"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-bg"
                    className="absolute inset-1 rounded-lg bg-foreground/5"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon size={18} className="relative z-10" />
                <span className="text-[8px] font-medium relative z-10 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
