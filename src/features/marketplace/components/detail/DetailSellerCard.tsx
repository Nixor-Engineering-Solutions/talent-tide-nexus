import { Link } from "react-router-dom";
import { Shield, Star, GraduationCap } from "lucide-react";
import { eloTier } from "../../utils/marketplace-utils";

interface Props {
  userId: string;
  name: string;
  elo: number;
  verified: boolean;
  university?: string;
  completedSwaps: number;
  rating: number;
  avatarUrl?: string;
}

export default function DetailSellerCard({ userId, name, elo, verified, university, completedSwaps, rating, avatarUrl }: Props) {
  const tier = eloTier(elo);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 ${tier.glow}`}>
      <Link to={`/profile/${userId}`} className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-xl border ${tier.border} ${tier.bg} flex items-center justify-center font-heading font-bold text-lg ${tier.color}`}>
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-foreground text-lg">{name}</span>
            {verified && <Shield className="w-4 h-4 text-skill-green" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-mono font-medium ${tier.color}`}>{tier.label} · {elo}</span>
            <span className="flex items-center gap-0.5 text-xs text-badge-gold">
              <Star className="w-3 h-3 fill-current" />{rating}
            </span>
          </div>
          {university && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <GraduationCap className="w-3 h-3" />{university}
            </span>
          )}
        </div>
      </Link>
      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        {completedSwaps} completed swaps
      </div>
    </div>
  );
}
