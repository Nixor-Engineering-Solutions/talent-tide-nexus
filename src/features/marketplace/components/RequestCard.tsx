import { HandHeart, MessageSquare, ArrowRight, Coins } from "lucide-react";
import { type RequestItem } from "../data/mockData";
import { eloTier } from "../utils/marketplace-utils";

interface Props {
  request: RequestItem;
  onClick?: () => void;
}

export default function RequestCard({ request, onClick }: Props) {
  const tier = eloTier(request.requesterElo);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-card hover:bg-surface-1 transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-mono text-skill-green bg-skill-green/10 px-2 py-0.5 rounded-md">
            <HandHeart className="w-3 h-3" />{request.spOnly ? "SP PURCHASE" : "REQUEST"}
          </span>
          <div className="flex items-center gap-2">
            {request.responses > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-court-blue bg-court-blue/10 px-1.5 py-0.5 rounded-md">
                <MessageSquare className="w-3 h-3" />{request.responses} responses
              </span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">{request.posted}</span>
          </div>
        </div>

        <h3 className="font-heading font-bold text-foreground text-sm mt-3">{request.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{request.description}</p>

        <div className="mt-3 flex items-center gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Offering</p>
            <p className="text-xs font-heading font-semibold text-skill-green">{request.offering}</p>
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Seeking</p>
            <p className="text-xs font-heading font-semibold text-foreground">{request.seeking}</p>
          </div>
        </div>

        {/* Budget range display */}
        <div className="mt-2 flex items-center gap-1.5">
          <Coins className="w-3 h-3 text-skill-green" />
          <span className="text-xs font-mono font-bold text-skill-green">{request.budget} SP</span>
          <span className="text-[10px] text-muted-foreground">budget</span>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${tier.bg} flex items-center justify-center text-[9px] font-mono font-bold ${tier.color}`}>
            {request.requester.charAt(0)}
          </div>
          <span className="text-xs text-foreground">{request.requester}</span>
        </div>
        <span className="text-[10px] font-heading font-semibold text-skill-green bg-skill-green/10 px-2 py-0.5 rounded-md">
          Submit Offer
        </span>
      </div>
    </button>
  );
}
