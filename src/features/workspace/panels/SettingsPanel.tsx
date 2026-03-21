import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings, Bell, BellOff, Copy, ExternalLink, Archive, X,
  CheckCircle2, Shield, AlertTriangle, Download, Languages,
  Link2, Globe, Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logInteraction } from "@/lib/activity-logger";
import type { Escrow, WorkspaceRole } from "../types";

interface Props {
  workspaceId: string;
  escrow: Escrow | null;
  partnerName: string;
  transactionCode: string | null;
  preferredLang: string;
  onLangChange: (l: string) => void;
  userRole: WorkspaceRole;
}

const languages = [
  { code: "en", label: "English" }, { code: "es", label: "Spanish" }, { code: "fr", label: "French" },
  { code: "de", label: "German" }, { code: "zh", label: "Chinese" }, { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" }, { code: "ja", label: "Japanese" }, { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" }, { code: "ru", label: "Russian" }, { code: "tr", label: "Turkish" },
];

export default function SettingsPanel({ workspaceId, escrow, partnerName, transactionCode, preferredLang, onLangChange, userRole }: Props) {
  const [notifications, setNotifications] = useState(true);
  const [linkSharing, setLinkSharing] = useState(true);
  const navigate = useNavigate();

  const isOwner = userRole === "owner";

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <h3 className="font-medium text-foreground mb-6 flex items-center gap-2">
        <Settings size={16} /> Workspace Settings
      </h3>

      <div className="space-y-4">
        {/* Transaction ID */}
        {transactionCode && (
          <div className="rounded-xl border border-skill-green/20 bg-skill-green/5 p-4">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-skill-green" /> Transaction ID
            </h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-surface-1 px-3 py-2 font-mono text-xs text-foreground">{transactionCode}</code>
              <button onClick={() => { navigator.clipboard.writeText(transactionCode); toast.success("Copied!"); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1"><Copy size={14} /></button>
            </div>
            <button onClick={() => navigate(`/transaction?code=${transactionCode}`)}
              className="mt-2 w-full rounded-lg border border-skill-green/20 py-1.5 text-xs text-skill-green hover:bg-skill-green/10 flex items-center justify-center gap-1">
              <ExternalLink size={12} /> View Transaction
            </button>
          </div>
        )}

        {/* Workspace Preferences */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notifications ? <Bell size={16} className="text-foreground" /> : <BellOff size={16} className="text-muted-foreground" />}
                <span className="text-sm text-foreground">Notifications</span>
              </div>
              <button onClick={() => { setNotifications(!notifications); logInteraction("workspace_settings_toggle", { setting: "notifications" }); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${notifications ? "bg-skill-green" : "bg-surface-3"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {linkSharing ? <Globe size={16} className="text-foreground" /> : <Lock size={16} className="text-muted-foreground" />}
                <span className="text-sm text-foreground">Link Sharing</span>
              </div>
              <button onClick={() => setLinkSharing(!linkSharing)}
                className={`relative w-10 h-5 rounded-full transition-colors ${linkSharing ? "bg-skill-green" : "bg-surface-3"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${linkSharing ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Languages size={14} /> Language
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {languages.map(lang => (
              <button key={lang.code} onClick={() => onLangChange(lang.code)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  preferredLang === lang.code ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"
                }`}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report */}
        <div className="rounded-xl border border-alert-red/20 bg-alert-red/5 p-4">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-alert-red" /> Report
          </h4>
          <p className="text-xs text-muted-foreground mb-3">Report workspace partner for misconduct or policy violations.</p>
          <button className="w-full rounded-lg border border-alert-red/30 py-2 text-xs text-alert-red hover:bg-alert-red/10 flex items-center justify-center gap-1">
            <AlertTriangle size={12} /> Report Partner
          </button>
        </div>

        {/* Danger Zone */}
        {isOwner && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Danger Zone</h4>
            <div className="space-y-2">
              <button className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-1 flex items-center justify-center gap-2">
                <Download size={14} /> Export Workspace Data
              </button>
              <button className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-1 flex items-center justify-center gap-2">
                <Archive size={14} /> Archive Workspace
              </button>
              <button className="w-full rounded-lg border border-alert-red/20 py-2 text-sm text-alert-red hover:bg-alert-red/5 flex items-center justify-center gap-2">
                <X size={14} /> Leave Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
