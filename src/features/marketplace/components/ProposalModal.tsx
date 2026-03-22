import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Coins, ArrowRight, Sparkles, ListChecks, Plus, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import LoginPrompt from "@/components/shared/LoginPrompt";

interface ProposalModalProps {
  listing: {
    id: string;
    title: string;
    user_id: string;
    points: number;
    price: string;
    format?: string;
  } | null;
  onClose: () => void;
}

const ProposalModal = ({ listing, onClose }: ProposalModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<"requirements" | "offer" | "review">("requirements");
  const [message, setMessage] = useState("");
  const [offeredSP, setOfferedSP] = useState(0);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requirements, setRequirements] = useState("");
  const [escrowTerms, setEscrowTerms] = useState("");
  const [suggestedStages, setSuggestedStages] = useState<{ name: string; sp: number; desc: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!listing) return null;

  const suggestStagesWithAI = async () => {
    if (!requirements.trim()) { toast.error("Describe your requirements first"); return; }
    setAiLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workspace-ai`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "suggest_requirements",
          content: `Create 3-5 project stages for this gig: "${listing.title}". Requirements: ${requirements}. Total budget: ${listing.points || offeredSP} SP. Return a JSON array of objects with {name, sp, desc} fields. SP values should sum to ${listing.points || offeredSP || 100}.`,
        }),
      });
      const data = await resp.json();
      try {
        const parsed = JSON.parse(data.result);
        if (Array.isArray(parsed)) {
          setSuggestedStages(parsed.map((s: any) => ({
            name: s.name || s.title || "Stage",
            sp: s.sp || s.points || 0,
            desc: s.desc || s.description || "",
          })));
          toast.success("AI suggested stages!");
        }
      } catch {
        // Try to extract from text
        setSuggestedStages([
          { name: "Requirements & Planning", sp: Math.round((listing.points || 100) * 0.2), desc: "Define scope and deliverables" },
          { name: "Development / Work", sp: Math.round((listing.points || 100) * 0.5), desc: "Main work phase" },
          { name: "Review & Delivery", sp: Math.round((listing.points || 100) * 0.3), desc: "Final review and handoff" },
        ]);
      }
    } catch {
      toast.error("AI unavailable, using default stages");
      setSuggestedStages([
        { name: "Requirements & Planning", sp: Math.round((listing.points || 100) * 0.2), desc: "Define scope" },
        { name: "Development", sp: Math.round((listing.points || 100) * 0.5), desc: "Main work" },
        { name: "Delivery", sp: Math.round((listing.points || 100) * 0.3), desc: "Final delivery" },
      ]);
    }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) { setShowLogin(true); return; }
    if (!requirements.trim()) { toast.error("Describe your requirements"); return; }
    if (!message.trim()) { toast.error("Add a message"); return; }

    setSending(true);
    const { error } = await supabase.from("proposals").insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.user_id,
      message: message.trim(),
      offered_sp: offeredSP,
      requirements: requirements.trim(),
      escrow_terms: escrowTerms ? { terms: escrowTerms } : {},
      stage_config: suggestedStages.length > 0 ? suggestedStages : [],
      status: "pending",
    } as any);

    if (error) {
      toast.error("Failed to send proposal");
    } else {
      toast.success("Proposal sent!");
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        title: "New Proposal",
        message: `You received a proposal for "${listing.title}"`,
        type: "proposal",
        link: `/dashboard?tab=my-gigs`,
      });
      onClose();
    }
    setSending(false);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-border bg-card overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Send Proposal</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{listing.title}</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-1 px-4 pt-3">
              {["requirements", "offer", "review"].map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${
                    (step === "requirements" && i === 0) || (step === "offer" && i <= 1) || step === "review"
                      ? "bg-foreground" : "bg-border"
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 mb-2">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Requirements</span>
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Offer</span>
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Review</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {step === "requirements" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <ListChecks size={14} className="inline mr-1" />
                      Project Requirements *
                    </label>
                    <textarea
                      value={requirements} onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Describe exactly what you need delivered. Be specific about quality, format, timeline expectations..."
                      rows={4}
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <FileText size={14} className="inline mr-1" />
                      Escrow Contract Terms (optional)
                    </label>
                    <textarea
                      value={escrowTerms} onChange={(e) => setEscrowTerms(e.target.value)}
                      placeholder="Any specific terms for the escrow contract: milestones, payment conditions, revision limits..."
                      rows={2}
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20 resize-none"
                    />
                  </div>

                  {/* AI Stage Suggestion */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Suggested Stages</label>
                      <button
                        onClick={suggestStagesWithAI}
                        disabled={aiLoading}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-surface-1 border border-border rounded-lg px-2.5 py-1.5 disabled:opacity-50"
                      >
                        {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        AI Suggest
                      </button>
                    </div>
                    {suggestedStages.length > 0 ? (
                      <div className="space-y-2">
                        {suggestedStages.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl bg-surface-1 border border-border p-3">
                            <span className="w-6 h-6 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
                            </div>
                            <span className="text-xs font-mono text-skill-green font-bold">{s.sp} SP</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground bg-surface-1 rounded-lg p-3 text-center">
                        Add requirements above, then click "AI Suggest" for auto-generated stages
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => { if (!requirements.trim()) { toast.error("Requirements are mandatory"); return; } setStep("offer"); }}
                    className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background flex items-center justify-center gap-2"
                  >
                    Next: Your Offer <ArrowRight size={14} />
                  </button>
                </>
              )}

              {step === "offer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Your Skill Offer</label>
                    <input
                      type="text" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)}
                      placeholder="e.g., React Development, Logo Design"
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">SP Bonus (optional)</label>
                    <div className="relative">
                      <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number" min={0} value={offeredSP} onChange={(e) => setOfferedSP(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-border bg-surface-1 pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Message *</label>
                    <textarea
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the seller why you're a great match..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setStep("requirements")} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground">
                      Back
                    </button>
                    <button
                      onClick={() => { if (!message.trim()) { toast.error("Add a message"); return; } setStep("review"); }}
                      className="flex-1 rounded-xl bg-foreground py-3 text-sm font-semibold text-background flex items-center justify-center gap-2"
                    >
                      Review <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              )}

              {step === "review" && (
                <>
                  <div className="rounded-xl bg-surface-1 border border-border p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">Gig</p>
                      <p className="text-sm font-medium text-foreground">{listing.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">Requirements</p>
                      <p className="text-sm text-foreground">{requirements}</p>
                    </div>
                    {escrowTerms && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Escrow Terms</p>
                        <p className="text-sm text-foreground">{escrowTerms}</p>
                      </div>
                    )}
                    {offeredSkill && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Skill Offered</p>
                        <p className="text-sm text-foreground">{offeredSkill}</p>
                      </div>
                    )}
                    {offeredSP > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">SP Bonus</p>
                        <p className="text-sm font-mono text-skill-green font-bold">{offeredSP} SP</p>
                      </div>
                    )}
                    {suggestedStages.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Proposed Stages</p>
                        <div className="space-y-1">
                          {suggestedStages.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-foreground">{i + 1}. {s.name}</span>
                              <span className="font-mono text-skill-green">{s.sp} SP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">Message</p>
                      <p className="text-sm text-foreground">{message}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setStep("offer")} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground">
                      Back
                    </button>
                    <button
                      onClick={handleSubmit} disabled={sending}
                      className="flex-1 rounded-xl bg-foreground py-3 text-sm font-semibold text-background flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={14} /> {sending ? "Sending..." : "Send Proposal"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};

export default ProposalModal;
