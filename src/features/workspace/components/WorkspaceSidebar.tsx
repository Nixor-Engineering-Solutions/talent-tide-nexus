import { motion } from "framer-motion";
import {
  MessageSquare, Pencil, Video, FileText, Layers, Package,
  Gavel, Users, Bot, Settings, BarChart3, RotateCcw,
  ListChecks, Clock, ChevronLeft, ChevronRight,
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
  collapsed: boolean;
  onToggle: () => void;
}

export default function WorkspaceSidebar({ activePanel, onPanelSwitch, workspaceType, collapsed, onToggle }: Props) {
  const sections = getSections(workspaceType);

  return (
    <motion.nav
      animate={{ width: collapsed ? 52 : 200 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex flex-col overflow-hidden relative"
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface-1 transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {sections.map((section, si) => (
          <div key={section.label}>
            {si > 0 && <div className="mx-3 my-2 h-px bg-border/40" />}
            {!collapsed && (
              <p className="px-4 mb-1 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground/40 select-none">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5 px-1.5">
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
                    className={`relative flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 transition-all group ${
                      isActive
                        ? "text-foreground bg-foreground/[0.06]"
                        : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ws-sidebar-indicator"
                        className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-full bg-foreground"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <item.icon size={16} className="shrink-0 relative z-10" />
                    {!collapsed && (
                      <span className="text-xs font-medium relative z-10 leading-none truncate">
                        {item.label}
                      </span>
                    )}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-alert-red text-[8px] font-bold text-white px-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.nav>
  );
}
