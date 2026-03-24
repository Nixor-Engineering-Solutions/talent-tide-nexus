import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, MessageSquare, Code2, Image, Video, AudioLines,
  Shield, FileSearch, Sparkles, Languages, ListChecks, Bug,
  FileText, Lightbulb, Scale, PenTool, Wand2, Zap,
  CheckCircle2, AlertTriangle, Target, BookOpen, Braces,
  Palette, Globe, Lock, Scan, Eye, Gauge,
} from "lucide-react";
import { logActivity } from "@/lib/activity-logger";
import { streamAI, callAI } from "../hooks/useWorkspaceAI";

type AiMsg = { role: "user" | "assistant"; content: string };
type AITool =
  | "chat" | "code" | "images" | "video" | "audio"
  | "plagiarism" | "quality" | "translate" | "requirements"
  | "dispute" | "copywriting" | "seo" | "accessibility"
  | "security" | "performance" | "legal" | "branding"
  | "data" | "debug" | "summarize" | "competitor"
  | "tone" | "grammar" | "readability" | "formatting"
  | "compliance" | "bias" | "factcheck" | "citations"
  | "keywords" | "sentiment" | "structure" | "originality";

interface ToolDef {
  key: AITool;
  label: string;
  icon: any;
  color: string;
  systemPrompt: string;
  placeholder: string;
}

const AI_TOOLS: ToolDef[] = [
  { key: "chat", label: "Chat", icon: MessageSquare, color: "text-foreground", systemPrompt: "You are a helpful workspace assistant.", placeholder: "Ask anything..." },
  { key: "code", label: "Code Review", icon: Code2, color: "text-court-blue", systemPrompt: "You are a code review assistant. Analyze code for bugs, security issues, performance, and best practices. Format output with markdown.", placeholder: "Paste code to review..." },
  { key: "plagiarism", label: "Plagiarism Check", icon: FileSearch, color: "text-alert-red", systemPrompt: "You are a plagiarism detection assistant. Analyze text for potential plagiarism, unoriginal content, and provide an originality score 0-100. Flag any suspicious passages.", placeholder: "Paste content to check..." },
  { key: "quality", label: "Quality Audit", icon: Shield, color: "text-skill-green", systemPrompt: "You are a quality auditor. Score deliverables on: completeness (0-100), technical quality (0-100), communication clarity (0-100), professionalism (0-100). Give actionable feedback.", placeholder: "Describe or paste deliverable..." },
  { key: "translate", label: "Translate", icon: Languages, color: "text-badge-gold", systemPrompt: "You are a translation assistant. Translate text accurately while preserving tone and context. Always state the detected source language.", placeholder: "Text to translate..." },
  { key: "requirements", label: "Requirements AI", icon: ListChecks, color: "text-court-blue", systemPrompt: "You are a requirements analyst. Generate, refine, and validate acceptance criteria. Output as a checklist.", placeholder: "Describe what you need..." },
  { key: "dispute", label: "Dispute Helper", icon: Scale, color: "text-alert-red", systemPrompt: "You are a dispute resolution assistant. Help draft clear dispute reasons, suggest evidence to gather, and advise on resolution strategies.", placeholder: "Describe the issue..." },
  { key: "copywriting", label: "Copywriting", icon: PenTool, color: "text-badge-gold", systemPrompt: "You are a copywriting assistant. Help write compelling titles, descriptions, and marketing copy.", placeholder: "What do you need written?" },
  { key: "seo", label: "SEO Analysis", icon: Target, color: "text-skill-green", systemPrompt: "You are an SEO specialist. Analyze content for keyword density, meta descriptions, heading structure, and search optimization.", placeholder: "Paste content for SEO review..." },
  { key: "accessibility", label: "Accessibility", icon: Eye, color: "text-court-blue", systemPrompt: "You are an accessibility auditor. Check content and designs for WCAG compliance, color contrast, alt text, and screen reader compatibility.", placeholder: "Describe UI or paste code..." },
  { key: "security", label: "Security Scan", icon: Lock, color: "text-alert-red", systemPrompt: "You are a security analyst. Scan code for vulnerabilities: XSS, SQL injection, CSRF, insecure dependencies, exposed secrets, and data leaks.", placeholder: "Paste code to scan..." },
  { key: "performance", label: "Performance", icon: Gauge, color: "text-badge-gold", systemPrompt: "You are a performance optimization expert. Analyze code for bottlenecks, memory leaks, unnecessary renders, and suggest optimizations.", placeholder: "Paste code to optimize..." },
  { key: "legal", label: "Legal Review", icon: FileText, color: "text-muted-foreground", systemPrompt: "You are a legal review assistant. Check contracts, terms, and agreements for common issues. Not legal advice — flag concerns for professional review.", placeholder: "Paste terms or contract..." },
  { key: "branding", label: "Brand Check", icon: Palette, color: "text-purple-400", systemPrompt: "You are a brand consistency auditor. Check content for brand voice, tone, visual consistency, and messaging alignment.", placeholder: "Paste content to audit..." },
  { key: "debug", label: "Debug Helper", icon: Bug, color: "text-alert-red", systemPrompt: "You are a debugging assistant. Analyze error messages, stack traces, and help identify root causes with fix suggestions.", placeholder: "Paste error or describe bug..." },
  { key: "summarize", label: "Summarize", icon: BookOpen, color: "text-skill-green", systemPrompt: "You are a summarization assistant. Create concise summaries of long texts, meetings, or conversations. Include key points and action items.", placeholder: "Paste text to summarize..." },
  { key: "tone", label: "Tone Analyzer", icon: Wand2, color: "text-badge-gold", systemPrompt: "You are a tone analyzer. Detect the emotional tone of text (professional, casual, aggressive, passive, etc.) and suggest improvements.", placeholder: "Paste text to analyze tone..." },
  { key: "grammar", label: "Grammar", icon: Braces, color: "text-foreground", systemPrompt: "You are a grammar and spelling checker. Fix errors, improve sentence structure, and enhance clarity. Show original vs corrected.", placeholder: "Paste text to check..." },
  { key: "readability", label: "Readability", icon: Scan, color: "text-court-blue", systemPrompt: "You are a readability analyst. Calculate reading level (Flesch-Kincaid), suggest simplifications, and improve content accessibility.", placeholder: "Paste text to analyze..." },
  { key: "formatting", label: "Formatter", icon: Sparkles, color: "text-badge-gold", systemPrompt: "You are a content formatter. Convert unformatted text into well-structured markdown with headings, lists, and proper formatting.", placeholder: "Paste unformatted text..." },
  { key: "compliance", label: "Compliance", icon: Shield, color: "text-skill-green", systemPrompt: "You are a compliance checker. Verify content against GDPR, CCPA, ADA, and industry-specific regulations. Flag potential issues.", placeholder: "Paste content to check..." },
  { key: "bias", label: "Bias Detection", icon: AlertTriangle, color: "text-badge-gold", systemPrompt: "You are a bias detection assistant. Analyze text for gender, racial, cultural, or other biases. Suggest inclusive alternatives.", placeholder: "Paste text to check for bias..." },
  { key: "factcheck", label: "Fact Check", icon: CheckCircle2, color: "text-skill-green", systemPrompt: "You are a fact-checking assistant. Verify claims, statistics, and statements. Flag unverifiable claims and suggest sources.", placeholder: "Paste claims to verify..." },
  { key: "citations", label: "Citations", icon: Globe, color: "text-court-blue", systemPrompt: "You are a citation assistant. Generate proper citations (APA, MLA, Chicago) and check existing citations for accuracy.", placeholder: "Describe what needs citations..." },
  { key: "keywords", label: "Keywords", icon: Zap, color: "text-badge-gold", systemPrompt: "You are a keyword extraction specialist. Extract key terms, topics, and themes from text. Rank by relevance.", placeholder: "Paste text to extract keywords..." },
  { key: "sentiment", label: "Sentiment", icon: Lightbulb, color: "text-skill-green", systemPrompt: "You are a sentiment analyzer. Score text sentiment (-100 to +100), detect emotions, and identify sentiment shifts throughout.", placeholder: "Paste text for sentiment analysis..." },
  { key: "structure", label: "Structure", icon: Sparkles, color: "text-court-blue", systemPrompt: "You are a document structure analyzer. Evaluate logical flow, coherence, and suggest reorganization for clarity.", placeholder: "Paste document to analyze structure..." },
  { key: "originality", label: "Originality", icon: Sparkles, color: "text-purple-400", systemPrompt: "You are an originality scorer. Evaluate how unique and creative content is. Score 0-100 and explain what makes it original or generic.", placeholder: "Paste content to score..." },
  { key: "images", label: "Image Analysis", icon: Image, color: "text-badge-gold", systemPrompt: "You are an image analysis assistant. Help describe images, write alt text, create prompts, and discuss visual design.", placeholder: "Describe an image..." },
  { key: "video", label: "Video Helper", icon: Video, color: "text-court-blue", systemPrompt: "You are a video assistant. Help with storyboarding, video summaries, and content planning.", placeholder: "Describe video needs..." },
  { key: "audio", label: "Audio Helper", icon: AudioLines, color: "text-skill-green", systemPrompt: "You are an audio assistant. Help with transcription, voice notes, and audio analysis.", placeholder: "Describe audio task..." },
  { key: "data", label: "Data Analysis", icon: Target, color: "text-foreground", systemPrompt: "You are a data analyst. Help interpret data, create visualizations descriptions, and derive insights.", placeholder: "Paste data or describe analysis..." },
  { key: "competitor", label: "Competitor Intel", icon: Sparkles, color: "text-alert-red", systemPrompt: "You are a competitive analysis assistant. Help analyze competitors, identify differentiators, and suggest positioning strategies.", placeholder: "Describe competitor to analyze..." },
];

interface Props {
  workspaceId: string;
}

export default function AIPanel({ workspaceId }: Props) {
  const [activeTool, setActiveTool] = useState<AITool>("chat");
  const [messages, setMessages] = useState<Record<string, AiMsg[]>>(() => {
    const init: Record<string, AiMsg[]> = {};
    AI_TOOLS.forEach(t => {
      init[t.key] = [{ role: "assistant", content: `${t.label} ready. ${t.systemPrompt.split(".")[0]}.` }];
    });
    return init;
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTool = AI_TOOLS.find(t => t.key === activeTool) || AI_TOOLS[0];
  const currentMsgs = messages[activeTool] || [];

  const filteredTools = searchQuery
    ? AI_TOOLS.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : AI_TOOLS;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMsgs]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: AiMsg = { role: "user", content: input };
    const newMsgs = [...currentMsgs, userMsg];
    setMessages(prev => ({ ...prev, [activeTool]: newMsgs }));
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const tab = prev[activeTool] || [];
        const last = tab[tab.length - 1];
        if (last?.role === "assistant" && tab.length === newMsgs.length + 1)
          return { ...prev, [activeTool]: tab.map((m, i) => i === tab.length - 1 ? { ...m, content: assistantSoFar } : m) };
        return { ...prev, [activeTool]: [...tab, { role: "assistant", content: assistantSoFar }] };
      });
    };

    const fullMsgs = [{ role: "system", content: currentTool.systemPrompt }, ...newMsgs];
    await streamAI(fullMsgs as any, upsert, () => {
      logActivity("workspace:ai_chat", { entity_type: "workspace", entity_id: workspaceId, context: { tool: activeTool } });
      setStreaming(false);
    });
  };

  return (
    <div className="flex h-full">
      {/* Tool sidebar */}
      <div className="w-48 shrink-0 border-r border-border bg-card/30 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-border">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 rounded-md bg-surface-1 border border-border px-2 text-[10px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto py-1 scrollbar-hide">
          {filteredTools.map(tool => (
            <button
              key={tool.key}
              onClick={() => setActiveTool(tool.key)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-left transition-all ${
                activeTool === tool.key
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-foreground/[0.03]"
              }`}
            >
              <tool.icon size={12} className={activeTool === tool.key ? tool.color : ""} />
              <span className="text-[10px] font-medium truncate">{tool.label}</span>
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <p className="text-[9px] text-muted-foreground/40 text-center font-mono">
            {AI_TOOLS.length} tools available
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Tool header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <currentTool.icon size={14} className={currentTool.color} />
          <span className="text-xs font-semibold text-foreground">{currentTool.label}</span>
          <span className="text-[10px] text-muted-foreground/50 ml-1">— Powered by AI</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMsgs.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-court-blue/10 mt-0.5">
                  <Bot size={11} className="text-court-blue" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-foreground text-background rounded-br-md"
                  : "bg-surface-1 text-foreground border border-border/50 rounded-bl-md"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {streaming && currentMsgs[currentMsgs.length - 1]?.role !== "assistant" && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-court-blue/10">
                <Bot size={11} className="text-court-blue" />
              </div>
              <div className="flex gap-1 rounded-2xl bg-surface-1 border border-border/50 px-3 py-2">
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
              placeholder={currentTool.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              className="h-9 flex-1 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/20"
            />
            <button onClick={send} disabled={streaming}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-50 hover:opacity-90 transition-opacity">
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
