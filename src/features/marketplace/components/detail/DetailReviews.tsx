import { Star } from "lucide-react";

interface Review {
  reviewer_name?: string;
  overall_rating?: number;
  comment?: string;
  created_at: string;
}

interface Props {
  reviews: Review[];
}

export default function DetailReviews({ reviews }: Props) {
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        Reviews ({reviews.length})
      </h3>
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-1 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-heading font-semibold text-foreground">{r.reviewer_name || "User"}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: r.overall_rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 text-badge-gold fill-current" />
                ))}
              </div>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground mt-1.5">{r.comment}</p>}
            <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
