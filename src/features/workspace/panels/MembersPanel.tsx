import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Crown, Edit3, Eye, Trash2, Link2,
  Copy, Briefcase, User, Check, X, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import type { WsMember, WsInvite, WorkspaceRole, ROLE_CONFIG } from "../types";

const roleIcons: Record<string, any> = {
  owner: Crown, client: User, consultant: Briefcase, editor: Edit3, viewer: Eye,
};
const roleColors: Record<string, string> = {
  owner: "bg-badge-gold/10 text-badge-gold",
  client: "bg-skill-green/10 text-skill-green",
  consultant: "bg-court-blue/10 text-court-blue",
  editor: "bg-foreground/10 text-foreground",
  viewer: "bg-surface-2 text-muted-foreground",
};

interface Props {
  workspaceId: string;
  userId: string | null;
  userRole: WorkspaceRole;
}

export default function MembersPanel({ workspaceId, userId, userRole }: Props) {
  const [members, setMembers] = useState<WsMember[]>([]);
  const [invites, setInvites] = useState<WsInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("editor");
  const [inviting, setInviting] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string | null; avatar_emoji: string | null }>>({});

  const fetchData = useCallback(async () => {
    const [{ data: mem }, { data: inv }] = await Promise.all([
      supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId),
      (supabase as any).from("workspace_invites").select("*").eq("workspace_id", workspaceId).is("used_by", null),
    ]);
    if (mem) {
      setMembers(mem as WsMember[]);
      // Fetch profiles for display names
      const userIds = (mem as WsMember[]).map(m => m.user_id);
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id,display_name,avatar_emoji").in("user_id", userIds);
        if (profs) {
          const map: Record<string, { display_name: string | null; avatar_emoji: string | null }> = {};
          profs.forEach(p => { map[p.user_id] = { display_name: p.display_name, avatar_emoji: p.avatar_emoji }; });
          setProfiles(map);
        }
      }
    }
    if (inv) setInvites(inv as WsInvite[]);
  }, [workspaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const canInvite = userRole === "owner" || userRole === "client" || userRole === "editor";
  const canManage = userRole === "owner" || userRole === "client";

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !userId) return;
    if (!canInvite) { toast.error("You don't have permission to invite"); return; }
    setInviting(true);
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", inviteEmail.trim()).maybeSingle();
    if (!profile) { toast.error("User not found"); setInviting(false); return; }
    if (members.find(m => m.user_id === profile.user_id)) { toast.error("Already a member"); setInviting(false); return; }

    const roleToInsert = inviteRole as any;
    await supabase.from("workspace_members").insert([{
      workspace_id: workspaceId,
      user_id: profile.user_id,
      role: roleToInsert,
      invited_by: userId,
      status: inviteRole === "consultant" ? "pending" : "active",
    }]);

    // Notify
    await supabase.from("notifications").insert([{
      user_id: profile.user_id,
      type: "workspace_invite",
      title: inviteRole === "consultant" ? "Consultation Request" : "Workspace Invitation",
      message: `You've been invited as ${inviteRole} to a workspace`,
      link: `/workspace/${workspaceId}`,
      metadata: { workspace_id: workspaceId, role: inviteRole, invited_by: userId },
    }]);

    logActivity("workspace:member_invited", { entity_type: "workspace", entity_id: workspaceId, context: { role: inviteRole } });
    toast.success(`Invited as ${inviteRole}`);
    setInviteEmail("");
    await fetchData();
    setInviting(false);
  };

  const generateInviteLink = async () => {
    if (!userId || !canInvite) return;
    setGeneratingLink(true);
    const { data, error } = await (supabase as any).from("workspace_invites").insert([{
      workspace_id: workspaceId,
      role: inviteRole as any,
      created_by: userId,
    }]).select().single();

    if (error) { toast.error("Failed to generate link"); setGeneratingLink(false); return; }
    const link = `${window.location.origin}/workspace/${workspaceId}?invite=${data.token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
    await fetchData();
    setGeneratingLink(false);
  };

  const removeMember = async (member: WsMember) => {
    if (!canManage) { toast.error("Only owners/clients can remove members"); return; }
    if (member.user_id === userId) { toast.error("Can't remove yourself"); return; }
    await supabase.from("workspace_members").delete().eq("id", member.id);
    toast.success("Member removed");
    fetchData();
  };

  const changeRole = async (member: WsMember, newRole: string) => {
    if (!canManage) { toast.error("Only owners/clients can change roles"); return; }
    await supabase.from("workspace_members").update({ role: newRole as any }).eq("id", member.id);
    toast.success("Role updated");
    fetchData();
  };

  const availableRoles: WorkspaceRole[] = ["editor", "viewer", "consultant", "client"];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
        <Users size={16} /> Members ({members.length})
      </h3>

      {/* Invite Section */}
      {canInvite && (
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <UserPlus size={14} /> Invite Member
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-surface-1 border-border"
            />

            {/* Role selector */}
            <div className="flex flex-wrap gap-1.5">
              {availableRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    inviteRole === r
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={inviteMember}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50 hover:opacity-90"
              >
                {inviting ? "Inviting..." : "Send Invite"}
              </button>
              <button
                onClick={generateInviteLink}
                disabled={generatingLink}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-1 disabled:opacity-50"
              >
                <Link2 size={14} />
                {generatingLink ? "..." : "Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Invites */}
      {invites.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Active Invite Links</h4>
          <div className="space-y-1.5">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs">
                <Link2 size={12} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-muted-foreground truncate font-mono">{inv.token.slice(0, 16)}…</span>
                <Badge className={`border-none text-[9px] ${roleColors[inv.role] || "bg-surface-2"}`}>{inv.role}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.map((m) => {
          const Icon = roleIcons[m.role] || Eye;
          const profile = profiles[m.user_id];
          const displayName = profile?.display_name || (m.user_id === userId ? "You" : m.user_id.slice(0, 8));
          const emoji = profile?.avatar_emoji;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-foreground/10 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm">
                {emoji || displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <Badge className={`border-none text-[9px] flex items-center gap-0.5 ${roleColors[m.role] || "bg-surface-2"}`}>
                    <Icon size={10} /> {m.role}
                  </Badge>
                  {m.status === "pending" && (
                    <Badge className="border-none text-[9px] bg-badge-gold/10 text-badge-gold">
                      <Clock size={8} className="mr-0.5" /> Pending
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {m.invited_by && m.invited_by !== m.user_id ? "Invited" : "Original member"}
                  {m.accepted_at && ` · Joined ${new Date(m.accepted_at).toLocaleDateString()}`}
                </p>
              </div>

              {canManage && m.user_id !== userId && (
                <div className="flex items-center gap-1">
                  {m.role !== "owner" && (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      className="h-7 rounded-md bg-surface-1 border border-border px-1.5 text-[10px] text-foreground"
                    >
                      {["owner", "client", "consultant", "editor", "viewer"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => removeMember(m)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-alert-red hover:bg-alert-red/5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">No members yet</p>
        )}
      </div>
    </div>
  );
}
