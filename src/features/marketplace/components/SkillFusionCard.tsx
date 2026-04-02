import { GitMerge, Users, Clock } from "lucide-react";
import { type SkillFusion } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface Props { fusion: SkillFusion; onClick: () => void; }

export default function SkillFusionCard({ fusion, onClick }: Props) {
  const complexityColor = fusion.complexity === "Advanced" || fusion.complexity === "Expert"
    ? "bg-alert-red/10 text-alert-red"
    : fusion.complexity === "Intermediate"
    ? "bg-badge-gold/10 text-badge-gold"
    : "bg-skill-green/10 text-skill-green";

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-purple-400/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">
            <GitMerge className="w-3 h-3" />SKILL FUSION
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${complexityColor}`}>
            {fusion.complexity}
          </span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{fusion.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{fusion.description}</p>

        {/* Participants */}
        <div className="mt-3 flex items-center gap-2">
          {fusion.participants.map(p => {
            const tier = eloTier(p.elo);
            return (
              <UserPreviewPopover
                key={p.name} name={p.name} avatar={p.avatar} elo={p.elo}
                rating={5.0} verified={true} completedSwaps={0}
              >
                <div onClick={e => e.stopPropagation()} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${tier.border} ${tier.bg} cursor-pointer`}>
                  <span className={`font-heading font-bold text-[10px] ${tier.color}`}>{p.avatar}</span>
                  <span className="text-[10px] text-foreground">{p.skill}</span>
                </div>
              </UserPreviewPopover>
            );
          })}
          {/* Participant count */}
          <span className="flex items-center gap-1 text-[10px] text-purple-400">
            <Users className="w-3 h-3" />{fusion.participants.length}
          </span>
        </div>

        {/* Looking for */}
        <div className="mt-2 flex flex-wrap gap-1">
          {fusion.lookingFor.map(l => (
            <span key={l} className="px-2 py-0.5 bg-purple-400/10 text-purple-400 text-[10px] font-mono rounded-md border border-purple-400/20">
              + {l}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      <div className="px-4 py-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-mono text-skill-green font-bold text-xs">{fusion.totalSP} SP</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fusion.duration}</span>
      </div>
    </button>
  );
}
