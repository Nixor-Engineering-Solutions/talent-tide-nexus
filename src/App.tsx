import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, ReactNode } from "react";
import ScrollToTop from "@/components/shared/ScrollToTop";
import LoadingScreen from "@/components/shared/LoadingScreen";
import LiveChatWidget from "@/components/shared/LiveChatWidget";
import CookieConsent from "@/components/shared/CookieConsent";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import TelemetryProvider from "@/components/shared/TelemetryProvider";
import { AuthProvider } from "@/lib/auth-context";
import RequireAuth from "@/components/shared/RequireAuth";

const HomePage = lazy(() => import("./features/home/HomePage"));
const AboutPage = lazy(() => import("./features/about/AboutPage"));
const FeaturesPage = lazy(() => import("./features/features/FeaturesPage"));
const HowItWorksPage = lazy(() => import("./features/how-it-works/HowItWorksPage"));
const PricingPage = lazy(() => import("./features/pricing/PricingPage"));
const EnterprisePage = lazy(() => import("./features/enterprise/EnterprisePage"));
const EnterpriseDashboardPage = lazy(() => import("./features/enterprise/EnterpriseDashboardPage"));
const GuildDashboardPage = lazy(() => import("./features/guild/GuildDashboardPage"));
const MarketplacePage = lazy(() => import("./features/marketplace/MarketplacePage"));
const GigDetailPage = lazy(() => import("./features/marketplace/components/GigDetailPage"));
const LegalPage = lazy(() => import("./features/legal/LegalPage"));
const RoadmapPage = lazy(() => import("./features/roadmap/RoadmapPage"));
const ContactPage = lazy(() => import("./features/contact/ContactPage"));
const BlogPage = lazy(() => import("./features/blog/BlogPage"));
const ForumsPage = lazy(() => import("./features/forums/ForumsPage"));
const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const SignupPage = lazy(() => import("./features/auth/SignupPage"));
const HelpPage = lazy(() => import("./features/help/HelpPage"));
const AnalyticsPage = lazy(() => import("./features/analytics/AnalyticsPage"));
const LeaderboardPage = lazy(() => import("./features/leaderboard/LeaderboardPage"));
const TransactionLookupPage = lazy(() => import("./features/transaction/TransactionLookupPage"));
const FAQPage = lazy(() => import("./features/faq/FAQPage"));
const EventsPage = lazy(() => import("./features/events/EventsPage"));
const EventDetailPage = lazy(() => import("./features/events/EventDetailPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const WorkspacePage = lazy(() => import("./features/workspace/WorkspacePage"));
const ProfilePage = lazy(() => import("./features/profile/ProfilePage"));
const GuildPage = lazy(() => import("./features/guild/GuildPage"));
const SuccessStoriesPage = lazy(() => import("./features/success-stories/SuccessStoriesPage"));
const DiscoverPage = lazy(() => import("./features/discover/DiscoverPage"));
const ClipsPage = lazy(() => import("./features/clips/ClipsPage"));
const SavedPostsPage = lazy(() => import("./features/saved/SavedPostsPage"));
const AuctionsPage = lazy(() => import("./features/marketplace/pages/AuctionsPage"));
const CoCreationPage = lazy(() => import("./features/marketplace/pages/CoCreationPage"));
const SkillFusionPage = lazy(() => import("./features/marketplace/pages/SkillFusionPage"));
const SPOnlyPage = lazy(() => import("./features/marketplace/pages/SPOnlyPage"));
const FlashMarketPage = lazy(() => import("./features/marketplace/pages/FlashMarketPage"));
const ProjectsPage = lazy(() => import("./features/marketplace/pages/ProjectsPage"));
const RequestsPage = lazy(() => import("./features/marketplace/pages/RequestsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MaintenancePage = lazy(() => import("./pages/Maintenance"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoon"));
const ServerErrorPage = lazy(() => import("./pages/ServerError"));
const ForbiddenPage = lazy(() => import("./pages/Forbidden"));
const OfflinePage = lazy(() => import("./pages/Offline"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/auctions" element={<AuctionsPage />} />
          <Route path="/marketplace/cocreation" element={<CoCreationPage />} />
          <Route path="/marketplace/skill-fusion" element={<SkillFusionPage />} />
          <Route path="/marketplace/sp-only" element={<SPOnlyPage />} />
          <Route path="/marketplace/flash-market" element={<FlashMarketPage />} />
          <Route path="/marketplace/projects" element={<ProjectsPage />} />
          <Route path="/marketplace/requests" element={<RequestsPage />} />
          <Route path="/marketplace/:gigId" element={<GigDetailPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/forums" element={<ForumsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/transaction" element={<TransactionLookupPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/workspace/:id" element={<RequireAuth><WorkspacePage /></RequireAuth>} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/guild/:guildId" element={<GuildPage />} />
          <Route path="/guild-dashboard/:guildId" element={<RequireAuth><GuildDashboardPage /></RequireAuth>} />
          <Route path="/enterprise-dashboard" element={<RequireAuth><EnterpriseDashboardPage /></RequireAuth>} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/saved" element={<RequireAuth><SavedPostsPage /></RequireAuth>} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/clips" element={<ClipsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <TelemetryProvider />
          <AnimatedRoutes />
          <MobileBottomNav />
          <LiveChatWidget />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
