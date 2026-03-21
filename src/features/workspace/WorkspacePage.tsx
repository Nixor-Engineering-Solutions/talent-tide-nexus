import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import PageTransition from "@/components/shared/PageTransition";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import WorkspaceHeader from "./components/WorkspaceHeader";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import ChatPanel from "./panels/ChatPanel";
import WhiteboardPanel from "./panels/WhiteboardPanel";
import VideoPanel from "./panels/VideoPanel";
import FilesPanel from "./panels/FilesPanel";
import ProgressPanel from "./panels/ProgressPanel";
import SubmitPanel from "./panels/SubmitPanel";
import RevisionsPanel from "./panels/RevisionsPanel";
import MetricsPanel from "./panels/MetricsPanel";
import MembersPanel from "./panels/MembersPanel";
import DisputePanel from "./panels/DisputePanel";
import AIPanel from "./panels/AIPanel";
import SettingsPanel from "./panels/SettingsPanel";
import type { Panel } from "./types";

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activePanel, setActivePanel] = useState<Panel>("chat");
  const [transactionCode, setTransactionCode] = useState<string | null>(null);
  const [preferredLang, setPreferredLang] = useState("en");

  const workspaceId = id || "demo-workspace-001";
  const userId = user?.id || null;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const { workspace, escrow, stages, members, userRole, loading } = useWorkspaceData(workspaceId, userId);

  const partnerName = escrow
    ? (escrow.buyer_id === userId ? "Seller" : "Buyer")
    : "Partner";

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <WorkspaceHeader
          workspace={workspace}
          escrow={escrow}
          userRole={userRole}
          members={members}
          workspaceId={workspaceId}
          onPanelSwitch={setActivePanel}
        />

        <div className="flex flex-1 overflow-hidden">
          <WorkspaceSidebar
            activePanel={activePanel}
            onPanelSwitch={setActivePanel}
            workspaceType={workspace?.workspace_type || "direct_swap"}
          />

          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activePanel === "chat" && <ChatPanel workspaceId={workspaceId} userId={userId} partnerName={partnerName} preferredLang={preferredLang} />}
                {activePanel === "whiteboard" && <WhiteboardPanel />}
                {activePanel === "video" && <VideoPanel partnerName={partnerName} workspaceId={workspaceId} />}
                {activePanel === "files" && <FilesPanel workspaceId={workspaceId} userId={userId} userRole={userRole} />}
                {activePanel === "progress" && <ProgressPanel workspaceId={workspaceId} userId={userId} escrow={escrow} stages={stages} userRole={userRole} onGigComplete={(code) => { setTransactionCode(code); }} />}
                {activePanel === "submit" && <SubmitPanel workspaceId={workspaceId} userId={userId} userRole={userRole} />}
                {activePanel === "revisions" && <RevisionsPanel workspaceId={workspaceId} userId={userId} userRole={userRole} />}
                {activePanel === "metrics" && <MetricsPanel workspaceId={workspaceId} stages={stages} />}
                {activePanel === "members" && <MembersPanel workspaceId={workspaceId} userId={userId} userRole={userRole} />}
                {activePanel === "dispute" && <DisputePanel workspaceId={workspaceId} userId={userId} escrow={escrow} userRole={userRole} />}
                {activePanel === "ai" && <AIPanel workspaceId={workspaceId} />}
                {activePanel === "settings" && <SettingsPanel workspaceId={workspaceId} escrow={escrow} partnerName={partnerName} transactionCode={transactionCode} preferredLang={preferredLang} onLangChange={setPreferredLang} userRole={userRole} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkspacePage;
