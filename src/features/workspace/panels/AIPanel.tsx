import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, MessageSquare, Code2, Image, Video, AudioLines, MoreHorizontal,
} from "lucide-react";
import { logActivity } from "@/lib/activity-logger";
import { streamAI, callAI } from "../hooks/useWorkspaceAI";

type AiMsg = { role: "user" | "assistant"; content: string };
type AITab = "chat" | "code" | "images" | "video" | "audio" | "more";

const AI_TABS: { key: AITab; label: string; icon: any }[] = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "code", label: "Code", icon: Code2 },
  { key: "images", label: "Images", icon: Image },
  { key: "video", label: "Video", icon: Video },
  { key: "audio", label: "Audio", icon: AudioLines },
  { key: "more", label: "More", icon: MoreHorizontal },
];

const systemPrompts: Record<AITab, string> = {
  chat: "You are a helpful workspace assistant. Help with anything the user asks about their workspace, gig, or tasks.",
  code: "You are a code assistant. Help with code generation, review, debugging, and technical questions. Format code in markdown code blocks.",
  images: "You are an image assistant. Help describe, analyze, or suggest images. You can help write alt text, create image prompts, or discuss visual design.",
  video: "You are a video assistant. Help with video analysis, summarization, storyboarding, and video-related tasks.",
  audio: "You are an audio assistant. Help with transcription, voice-to-text, audio analysis, and audio-related tasks.",
  more: "You are a multi-purpose assistant. You can help with plagiarism checks, audit trails, advice, and more.",
};

interface Props {
  workspaceId: string;
}

export default function AIPanel({ workspaceId }: Props) {
  const [activeTab, setActiveTab] = useState<AITab>("chat");
  const [messages, setMessages] = useState<Record<AITab, AiMsg[]>>({
    chat: [{ role: "assistant", content: "👋 I'm your Workspace AI. Ask me anything about your workspace, deliverables, or tasks!" }],
    code: [{ role: "assistant", content: "💻 Code Assistant ready. Paste code for review, ask for generation, or describe bugs." }],
    images: [{ role: "assistant", content: "🎨 Image Assistant. Describe images, get alt text suggestions, or discuss visual design." }],
    video: [{ role: "assistant", content: "🎬 Video Assistant. Help with storyboards, video summaries, or content planning." }],
    audio: [{ role: "assistant", content: "🎵 Audio Assistant. Help with transcription, voice notes, or audio analysis." }],
    more: [{ role: "assistant", content: "🔧 Multi-tool Assistant. Plagiarism checks, audit trails, strategy advice, and more." }],
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const currentMsgs = messages[activeTab];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMsgs]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: AiMsg = { role: "user", content: input };
    const newMsgs = [...currentMsgs, userMsg];
    setMessages(prev => ({ ...prev, [activeTab]: newMsgs }));
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const tab = prev[activeTab];
        const last = tab[tab.length - 1];
        if (last?.role === "assistant" && tab.length === newMsgs.length + 1)
          return { ...prev, [activeTab]: tab.map((m, i) => i === tab.length - 1 ? { ...m, content: assistantSoFar } : m) };
        return { ...prev, [activeTab]: [...tab, { role: "assistant", content: assistantSoFar }] };
      });
    };

    // Add system prompt
    const fullMsgs = [{ role: "system", content: systemPrompts[activeTab] }, ...newMsgs];
    await streamAI(fullMsgs as any, upsert, () => {
      logActivity("workspace:ai_chat", { entity_type: "workspace", entity_id: workspaceId, context: { tab: activeTab } });
      setStreaming(false);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 border-b border-border px-3 py-2 overflow-x-auto">
        {AI_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-court-blue/10 text-court-blue"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMsgs.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-court-blue/10">
                <Bot size={12} className="text-court-blue" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === "user" ? "bg-foreground text-background" : "bg-surface-2 text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {streaming && currentMsgs[currentMsgs.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-court-blue/10">
              <Bot size={12} className="text-court-blue" />
            </div>
            <div className="flex gap-1 rounded-2xl bg-surface-2 px-3 py-2">
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d }}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Ask ${activeTab === "chat" ? "anything" : activeTab}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="h-9 flex-1 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button onClick={send} disabled={streaming}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-court-blue text-white disabled:opacity-50">
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
