import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Paperclip, Send, Mic, MicOff, StopCircle,
  Languages, AudioLines,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity, logInteraction } from "@/lib/activity-logger";
import { translateText } from "../hooks/useWorkspaceAI";
import type { WsMessage, VoiceMsg } from "../types";

interface Props {
  workspaceId: string;
  userId: string | null;
  partnerName: string;
  preferredLang: string;
}

export default function ChatPanel({ workspaceId, userId, partnerName, preferredLang }: Props) {
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [recording, setRecording] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const [{ data: msgs }, { data: voice }] = await Promise.all([
      supabase.from("workspace_messages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }).limit(200),
      supabase.from("workspace_voice_messages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }).limit(100),
    ]);
    if (msgs) setMessages(msgs as WsMessage[]);
    if (voice) setVoiceMessages(voice as VoiceMsg[]);
  }, [workspaceId]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel(`ws-chat-${workspaceId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "workspace_messages", filter: `workspace_id=eq.${workspaceId}` },
        (payload) => setMessages(prev => [...prev, payload.new as WsMessage]))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "workspace_voice_messages", filter: `workspace_id=eq.${workspaceId}` },
        (payload) => setVoiceMessages(prev => [...prev, payload.new as VoiceMsg]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, fetchMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, voiceMessages]);

  const send = async () => {
    if (!newMsg.trim() || !userId) return;
    const content = newMsg.trim();
    let translated: Record<string, string> = {};
    if (autoTranslate && preferredLang !== "en") {
      const t = await translateText(content, preferredLang);
      if (t) translated[preferredLang] = t;
    }
    await supabase.from("workspace_messages").insert({ workspace_id: workspaceId, sender_id: userId, content, message_type: "text", translated_text: Object.keys(translated).length ? translated : null });
    logActivity("workspace:message_sent", { entity_type: "workspace", entity_id: workspaceId, context: { message_length: content.length } });
    setNewMsg("");
  };

  const translateMessage = async (msg: WsMessage) => {
    setTranslating(msg.id);
    const translated = await translateText(msg.content, preferredLang || "en");
    if (translated) {
      await supabase.from("workspace_messages").update({ translated_text: { ...(msg.translated_text || {}), [preferredLang]: translated } }).eq("id", msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translated_text: { ...(m.translated_text || {}), [preferredLang]: translated } } : m));
    }
    setTranslating(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        if (!userId) return;
        const path = `${workspaceId}/voice/${userId}/${Date.now()}.webm`;
        const { error } = await supabase.storage.from("workspace-files").upload(path, blob);
        if (error) { toast.error("Voice upload failed"); return; }
        const { data: { publicUrl } } = supabase.storage.from("workspace-files").getPublicUrl(path);
        await supabase.from("workspace_voice_messages").insert({ workspace_id: workspaceId, sender_id: userId, audio_url: publicUrl, duration_seconds: Math.round(chunksRef.current.length) });
        toast.success("Voice message sent");
        fetchMessages();
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch { toast.error("Microphone access denied"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const allItems = [
    ...messages.map(m => ({ ...m, type: "text" as const, ts: new Date(m.created_at).getTime() })),
    ...voiceMessages.map(v => ({ ...v, type: "voice" as const, sender_id: v.sender_id, ts: new Date(v.created_at).getTime() })),
  ].sort((a, b) => a.ts - b.ts);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-badge-gold/10 font-mono text-sm font-bold text-badge-gold">
            {partnerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{partnerName}</p>
            <p className="text-xs text-skill-green">Online</p>
          </div>
        </div>
        <button onClick={() => setAutoTranslate(!autoTranslate)}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors ${autoTranslate ? "bg-court-blue/10 text-court-blue" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"}`}>
          <Languages size={14} />
          {autoTranslate ? "Auto" : "Translate"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {allItems.map((item) => {
          const isMe = item.sender_id === userId;
          if (item.type === "voice") {
            const v = item as VoiceMsg & { type: "voice"; ts: number };
            return (
              <motion.div key={`v-${v.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${isMe ? "justify-end" : ""}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-foreground text-background rounded-br-md" : "bg-surface-2 text-foreground rounded-bl-md"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AudioLines size={14} />
                    <span className="text-xs font-medium">Voice</span>
                    <span className="text-[10px] opacity-60">{v.duration_seconds}s</span>
                  </div>
                  <audio src={v.audio_url} controls className="w-full h-8" style={{ filter: isMe ? "invert(1)" : "none" }} />
                  <p className={`text-[10px] mt-1 ${isMe ? "text-background/60" : "text-muted-foreground"}`}>
                    {new Date(v.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          }
          const m = item as WsMessage & { type: "text"; ts: number };
          const translated = m.translated_text && preferredLang && m.translated_text[preferredLang];
          return (
            <motion.div key={`m-${m.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${isMe ? "justify-end" : ""}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-foreground text-background rounded-br-md" : "bg-surface-2 text-foreground rounded-bl-md"}`}>
                <p className="text-sm">{m.content}</p>
                {translated && <p className="text-xs mt-1 opacity-70 italic border-t border-current/10 pt-1">🌐 {translated}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-[10px] ${isMe ? "text-background/60" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {!isMe && !translated && (
                    <button onClick={() => translateMessage(m)} disabled={translating === m.id}
                      className="text-[10px] flex items-center gap-0.5 text-muted-foreground/50 hover:text-muted-foreground">
                      <Languages size={10} /> {translating === m.id ? "..." : "Translate"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <Paperclip size={18} />
          </button>
          {recording ? (
            <div className="flex-1 flex items-center gap-3 rounded-xl border border-alert-red/30 bg-alert-red/5 px-4 py-2.5">
              <div className="h-2 w-2 rounded-full bg-alert-red animate-pulse" />
              <span className="text-sm text-alert-red flex-1">Recording...</span>
              <button onClick={stopRecording} className="flex h-8 w-8 items-center justify-center rounded-lg bg-alert-red text-white">
                <StopCircle size={16} />
              </button>
            </div>
          ) : (
            <>
              <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message..." className="flex-1 rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20" />
              <button onClick={startRecording} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-1">
                <Mic size={18} />
              </button>
            </>
          )}
          {!recording && (
            <button onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90">
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
