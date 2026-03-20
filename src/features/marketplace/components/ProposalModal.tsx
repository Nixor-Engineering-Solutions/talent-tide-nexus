import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Coins, ArrowRight } from "lucide-react";
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
  } | null;
  onClose: () => void;
}

const ProposalModal = ({ listing, onClose }: ProposalModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [offeredSP, setOfferedSP] = useState(0);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [sending, setSending] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!listing) return null;

  const handleSubmit = async () => {
    if (!user) { setShowLogin(true); return; }
    if (!message.trim()) { toast.error("Add a message"); return; }

    setSending(true);
    const { error } = await supabase.from("proposals").insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.user_id,
      message: message.trim(),
      offered_sp: offeredSP,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send proposal");
    } else {
      toast.success("Proposal sent!");
      // Create notification for seller
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
            className="w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Send Proposal</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-xl bg-surface-1 p-3">
                <p className="text-sm font-medium text-foreground">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{listing.price}</p>
              </div>

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
                <p className="text-[10px] text-muted-foreground mt-1">Add SP to sweeten your offer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the seller why you're a great match..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/20 resize-none"
                />
              </div>

              <button
                onClick={handleSubmit} disabled={sending || !message.trim()}
                className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={14} /> {sending ? "Sending..." : "Send Proposal"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};

export default ProposalModal;
