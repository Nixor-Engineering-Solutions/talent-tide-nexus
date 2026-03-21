import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, FileImage, File, Download, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";
import type { WsFile, WorkspaceRole } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  userRole: WorkspaceRole;
}

export default function FilesPanel({ workspaceId, userId, userRole }: Props) {
  const [files, setFiles] = useState<WsFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase.from("workspace_files").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (data) setFiles(data as WsFile[]);
  }, [workspaceId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (userRole === "viewer") { toast.error("Viewers cannot upload"); return; }
    setUploading(true);
    const path = `${workspaceId}/${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("workspace-files").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("workspace-files").getPublicUrl(path);
    await supabase.from("workspace_files").insert({ workspace_id: workspaceId, uploaded_by: userId, file_name: file.name, file_url: publicUrl, file_size: `${(file.size / 1024).toFixed(0)} KB`, file_type: file.type.split("/")[0] || "file", access_level: "all" });
    logActivity("workspace:file_upload", { entity_type: "workspace", entity_id: workspaceId, context: { file_name: file.name } });
    await fetchFiles();
    setUploading(false);
    toast.success("File uploaded");
  };

  const deleteFile = async (file: WsFile) => {
    if (userRole === "viewer") { toast.error("Viewers cannot delete"); return; }
    await supabase.from("workspace_files").delete().eq("id", file.id);
    toast.success("Deleted");
    fetchFiles();
  };

  const getIcon = (t: string) => (t === "image" ? FileImage : t === "application" ? FileText : File);
  const filtered = filter === "all" ? files : files.filter(f => f.file_type === filter);
  const types = ["all", ...Array.from(new Set(files.map(f => f.file_type)))];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">Files</h3>
          <div className="flex gap-1 ml-2">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`rounded-md px-2 py-0.5 text-[10px] transition-colors ${filter === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-1"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {userRole !== "viewer" && (
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50">
            <Upload size={14} /> {uploading ? "..." : "Upload"}
          </button>
        )}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">No files</p>}
        {filtered.map(f => {
          const Icon = getIcon(f.file_type);
          return (
            <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-foreground/15 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2"><Icon size={18} className="text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.file_name}</p>
                <p className="text-xs text-muted-foreground">{f.file_size} · v{f.version} · {new Date(f.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {f.file_url && (
                  <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
                    <Download size={14} />
                  </a>
                )}
                {userRole !== "viewer" && (
                  <button onClick={() => deleteFile(f)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-alert-red hover:bg-alert-red/5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
