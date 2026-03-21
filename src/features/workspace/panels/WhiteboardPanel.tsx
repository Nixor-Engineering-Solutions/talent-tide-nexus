import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MousePointer2, Pencil, Square, Circle, Minus, Type, Eraser,
  ZoomIn, ZoomOut, StickyNote, ArrowRight, LayoutGrid,
  Undo2, Redo2, Trash2, Download,
} from "lucide-react";
import { logInteraction } from "@/lib/activity-logger";

type Tool = "select" | "pen" | "rectangle" | "circle" | "line" | "text" | "eraser" | "sticky" | "arrow" | "card";

const TOOLS: { id: Tool; icon: any; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "pen", icon: Pencil, label: "Freehand" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "text", icon: Type, label: "Text" },
  { id: "sticky", icon: StickyNote, label: "Sticky Note" },
  { id: "card", icon: LayoutGrid, label: "Issue Card" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

const COLORS = ["#ffffff", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function WhiteboardPanel() {
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#ffffff");
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // Dark canvas with subtle dot grid
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Dot grid
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < canvas.width; x += 20) {
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Save initial state
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
    setHistoryIdx(0);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(state);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const newIdx = historyIdx - 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const newIdx = historyIdx + 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "pen" && tool !== "eraser") return;
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#0A0A0A" : color;
    ctx.lineWidth = tool === "eraser" ? 20 : 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const onMouseUp = () => {
    if (drawing) saveState();
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < canvas.width; x += 20) {
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    saveState();
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-0.5">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); logInteraction("whiteboard_tool", { tool: t.id }); }}
              title={t.label}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                tool === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
              }`}
            >
              <t.icon size={14} />
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1.5" />
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={undo} title="Undo" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <Undo2 size={14} />
          </button>
          <button onClick={redo} title="Redo" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <Redo2 size={14} />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] text-muted-foreground font-mono w-8 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={clearCanvas} title="Clear" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-alert-red hover:bg-alert-red/5">
            <Trash2 size={14} />
          </button>
          <button onClick={exportCanvas} title="Export" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#0A0A0A]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: tool === "pen" || tool === "eraser" ? "crosshair" : tool === "select" ? "default" : "crosshair" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
    </div>
  );
}
