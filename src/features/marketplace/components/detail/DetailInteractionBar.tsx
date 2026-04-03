import { Heart, Bookmark, Share2, Flag, MessageSquare } from "lucide-react";

interface Props {
  counts: { likes: number; saves: number; shares: number };
  userState: { liked: boolean; saved: boolean };
  toggle: (type: "like" | "save") => void;
  share: () => void;
  report: (reason?: string) => void;
  onMessage?: () => void;
  onPropose: () => void;
  ctaLabel: string;
  ctaIcon?: React.ReactNode;
  ctaClassName?: string;
}

export default function DetailInteractionBar({ counts, userState, toggle, share, report, onMessage, onPropose, ctaLabel, ctaIcon, ctaClassName }: Props) {
  return (
    <div className="space-y-2">
      <button
        onClick={onPropose}
        className={ctaClassName || "w-full h-12 rounded-xl bg-foreground text-background font-heading font-bold text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"}
      >
        {ctaIcon}{ctaLabel}
      </button>

      {onMessage && (
        <button
          onClick={onMessage}
          className="w-full h-10 rounded-xl border border-border text-foreground text-xs font-heading font-semibold hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />Message Seller
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => toggle("like")}
          className={`flex-1 h-9 rounded-lg border text-xs flex items-center justify-center gap-1 transition-colors ${
            userState.liked
              ? "border-alert-red/30 bg-alert-red/10 text-alert-red"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${userState.liked ? "fill-current" : ""}`} />{counts.likes || "Like"}
        </button>
        <button
          onClick={() => toggle("save")}
          className={`flex-1 h-9 rounded-lg border text-xs flex items-center justify-center gap-1 transition-colors ${
            userState.saved
              ? "border-badge-gold/30 bg-badge-gold/10 text-badge-gold"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${userState.saved ? "fill-current" : ""}`} />{counts.saves || "Save"}
        </button>
        <button
          onClick={share}
          className="flex-1 h-9 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground hover:bg-surface-2 transition-colors flex items-center justify-center gap-1"
        >
          <Share2 className="w-3.5 h-3.5" />{counts.shares || "Share"}
        </button>
      </div>

      <button onClick={() => report()} className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-alert-red transition-colors">
        <Flag className="w-3 h-3" />Report this listing
      </button>
    </div>
  );
}
