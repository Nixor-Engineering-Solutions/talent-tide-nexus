export type Panel =
  | "chat" | "whiteboard" | "video" | "files"
  | "progress" | "submit" | "revisions" | "metrics"
  | "members" | "dispute" | "ai" | "settings"
  | "bids" | "team" | "kanban" | "deadline";

export type WorkspaceRole = "owner" | "client" | "consultant" | "editor" | "viewer";

export interface WsMessage {
  id: string; sender_id: string; content: string;
  message_type: string; created_at: string;
  translated_text?: Record<string, string> | null;
}

export interface VoiceMsg {
  id: string; workspace_id: string; sender_id: string;
  audio_url: string; duration_seconds: number;
  transcript: string | null;
  translated_text?: Record<string, string> | null;
  created_at: string;
}

export interface WsFile {
  id: string; file_name: string; file_url: string;
  file_size: string; file_type: string; version: number;
  uploaded_by: string; created_at: string;
  access_level?: string; tags?: string[];
  description?: string;
}

export interface WsStage {
  id: string; name: string; status: string;
  sp_allocated: number; order_index: number;
  completed_at: string | null;
}

export interface Escrow {
  id: string; workspace_id: string; buyer_id: string;
  seller_id: string; total_sp: number; released_sp: number;
  status: string; terms: any; created_at: string;
}

export interface WsDispute {
  id: string; reason: string; status: string;
  outcome: string | null; created_at: string;
  filed_by: string;
}

export interface WsDeliverable {
  id: string; title: string; description: string;
  status: string; reviewer_notes: string | null;
  created_at: string; submitted_by: string;
  requirements?: any[]; file_urls?: string[];
  ai_quality_score?: number; ai_feedback?: string;
  revision_count?: number; max_revisions?: number;
  approved_by?: string | null; approved_at?: string | null;
}

export interface WsMember {
  id: string; workspace_id: string; user_id: string;
  role: string; status: string; invited_by: string | null;
  invited_at: string; accepted_at: string | null;
}

export interface WsInvite {
  id: string; workspace_id: string; role: string;
  token: string; created_by: string;
  expires_at: string; used_by: string | null;
  used_at: string | null; created_at: string;
}

export interface Workspace {
  id: string; title: string; workspace_type: string;
  listing_id: string | null; created_by: string;
  created_at: string; metadata: any;
}

export interface WorkspaceData {
  workspace: Workspace | null;
  escrow: Escrow | null;
  stages: WsStage[];
  members: WsMember[];
  userRole: WorkspaceRole;
  loading: boolean;
}

export const ROLE_CONFIG: Record<WorkspaceRole, { color: string; icon: string; label: string }> = {
  owner: { color: "bg-badge-gold/10 text-badge-gold", icon: "crown", label: "Owner" },
  client: { color: "bg-skill-green/10 text-skill-green", icon: "user", label: "Client" },
  consultant: { color: "bg-court-blue/10 text-court-blue", icon: "briefcase", label: "Consultant" },
  editor: { color: "bg-foreground/10 text-foreground", icon: "edit", label: "Editor" },
  viewer: { color: "bg-surface-2 text-muted-foreground", icon: "eye", label: "Viewer" },
};

export const STAGE_STATUSES = [
  "active", "completed", "locked", "dispute", "abandoned",
  "revision", "consultation", "on_hold",
] as const;
