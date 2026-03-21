import { useState } from "react";
import { Video, Phone, PhoneOff, Mic, MicOff, Monitor } from "lucide-react";
import { logActivity } from "@/lib/activity-logger";

interface Props {
  partnerName: string;
  workspaceId: string;
}

export default function VideoPanel({ partnerName, workspaceId }: Props) {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  const startCall = () => { setInCall(true); logActivity("workspace:video_start", { entity_type: "workspace", entity_id: workspaceId }); };
  const endCall = () => { setInCall(false); logActivity("workspace:video_end", { entity_type: "workspace", entity_id: workspaceId }); };

  return (
    <div className="flex flex-col h-full">
      {!inCall ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-court-blue/10 mx-auto mb-4">
              <Video size={32} className="text-court-blue" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Video Call</h3>
            <p className="text-sm text-muted-foreground mb-6">Connect face-to-face with your workspace partner</p>
            <button onClick={startCall} className="inline-flex items-center gap-2 rounded-xl bg-court-blue px-6 py-3 text-sm font-semibold text-white hover:bg-court-blue/90 transition-colors">
              <Phone size={16} /> Start Call
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 bg-surface-1 relative">
            <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
              <div className="text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-badge-gold/10 mx-auto mb-2 font-mono text-3xl font-bold text-badge-gold">
                  {partnerName.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm text-foreground">{partnerName}</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl bg-surface-3 border border-border flex items-center justify-center">
              <span className="text-xs text-muted-foreground">You</span>
            </div>
            {sharing && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-alert-red/90 px-3 py-1.5">
                <Monitor size={14} className="text-white" />
                <span className="text-xs font-medium text-white">Sharing Screen</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-border py-4">
            <button onClick={() => setMuted(!muted)} className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${muted ? "bg-alert-red text-white" : "bg-surface-2 text-foreground hover:bg-surface-3"}`}>
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={() => setVideoOn(!videoOn)} className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${!videoOn ? "bg-alert-red text-white" : "bg-surface-2 text-foreground hover:bg-surface-3"}`}>
              <Video size={20} />
            </button>
            <button onClick={() => setSharing(!sharing)} className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${sharing ? "bg-skill-green text-white" : "bg-surface-2 text-foreground hover:bg-surface-3"}`}>
              <Monitor size={20} />
            </button>
            <button onClick={endCall} className="flex h-12 w-12 items-center justify-center rounded-full bg-alert-red text-white hover:bg-alert-red/90">
              <PhoneOff size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
