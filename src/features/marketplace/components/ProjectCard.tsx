import { Briefcase, Users, CalendarDays } from "lucide-react";
import { type Project } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";
import UserPreviewPopover from "./UserPreviewPopover";

interface Props { project: Project; onClick: () => void; }

export default function ProjectCard({ project, onClick }: Props) {
  const tier = eloTier(project.leaderElo);
  const filledCount = project.roles.filter(r => r.filled).length;
  const totalRoles = Math.max(project.roles.length, 4);
  const fillPercent = totalRoles > 0 ? (filledCount / totalRoles) * 100 : 0;

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-orange-400/20 bg-card hover:bg-surface-1 transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md">
            <Briefcase className="w-3 h-3" />PROJECT
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            project.status === "Recruiting" ? "bg-skill-green/10 text-skill-green" : "bg-court-blue/10 text-court-blue"
          }`}>
            {project.status}
          </span>
        </div>

        <h3 className="font-heading font-bold text-foreground text-base mt-3">{project.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>

        {/* Role fill progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Roles filled</span>
            <span className="font-mono">{filledCount}/{totalRoles}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>

        {/* Roles grid */}
        {project.roles.length > 0 && (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {project.roles.map(r => (
              <div
                key={r.name}
                className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
                  r.filled
                    ? "bg-skill-green/5 border-skill-green/20 text-skill-green"
                    : "bg-surface-2 border-border text-muted-foreground"
                }`}
              >
                {r.filled ? `✓ ${r.name}` : r.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border mx-4" />

      <div className="px-4 py-3 flex items-center justify-between">
        <UserPreviewPopover
          name={project.leader} avatar={project.leaderAvatar} elo={project.leaderElo}
          rating={5.0} verified={true} completedSwaps={0}
        >
          <div onClick={e => e.stopPropagation()} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-7 h-7 rounded-lg ${tier.bg} ${tier.border} border flex items-center justify-center font-heading font-bold text-[10px] ${tier.color}`}>
              {project.leaderAvatar}
            </div>
            <span className="text-xs font-heading font-semibold text-foreground">{project.leader}</span>
          </div>
        </UserPreviewPopover>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="font-mono text-skill-green font-bold">{project.totalSP} SP</span>
          <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{filledCount}/{totalRoles}</span>
          {project.deadline && <span className="flex items-center gap-0.5"><CalendarDays className="w-3 h-3" />{project.deadline.split("-").slice(1).join("/")}</span>}
        </div>
      </div>
    </button>
  );
}
