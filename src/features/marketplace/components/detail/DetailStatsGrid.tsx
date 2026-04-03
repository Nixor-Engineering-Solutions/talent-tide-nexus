import { Clock, Eye, Heart, Radio } from "lucide-react";

interface Props {
  deliveryDays: number;
  views: number;
  likes: number;
  liveViewers: number;
}

export default function DetailStatsGrid({ deliveryDays, views, likes, liveViewers }: Props) {
  const stats = [
    { label: "Delivery", value: `${deliveryDays}d`, icon: Clock, highlight: false },
    { label: "Views", value: `${views}`, icon: Eye, highlight: false },
    { label: "Likes", value: `${likes}`, icon: Heart, highlight: false },
    { label: "Live", value: `${liveViewers}`, icon: Radio, highlight: liveViewers > 0 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl bg-surface-1 border border-border p-3 text-center">
          <s.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.highlight ? "text-skill-green animate-pulse" : "text-muted-foreground"}`} />
          <p className="text-sm font-mono font-bold text-foreground">{s.value}</p>
          <p className="text-[9px] text-muted-foreground uppercase font-mono">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
