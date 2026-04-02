import { useState } from "react";
import { motion } from "framer-motion";
import AppNav from "@/components/shared/AppNav";
import MarketplaceSidebar from "./components/MarketplaceSidebar";
import MarketplaceHeader from "./components/MarketplaceHeader";
import GigCard from "./components/GigCard";
import AuctionCard from "./components/AuctionCard";
import CoCreationCard from "./components/CoCreationCard";
import ContestCard from "./components/ContestCard";
import ProjectCard from "./components/ProjectCard";
import SkillFusionCard from "./components/SkillFusionCard";
import FlashMarketCard from "./components/FlashMarketCard";
import SPOnlyCard from "./components/SPOnlyCard";
import RequestCard from "./components/RequestCard";
import DirectSwapCard from "./components/DirectSwapCard";
import FeaturedSellers from "./components/FeaturedSellers";
import GigQuickView from "./components/GigQuickView";
import MarketplacePagination from "./components/MarketplacePagination";
import { useMarketplaceData } from "./hooks/useMarketplaceData";
import { type Gig } from "./data/mockData";

/* ─── Format-routed card renderer ─── */
const FormatCard = ({ gig, onClick }: { gig: Gig; onClick: () => void }) => {
  switch (gig.format) {
    case "Auction":
      return <AuctionCard gig={gig} onClick={onClick} />;
    case "SP Only":
      return <SPOnlyCard gig={{ id: gig.id, skill: gig.skill, spPrice: gig.points, seller: gig.seller, elo: gig.elo, rating: gig.rating, avatar: gig.avatar, category: gig.category, hot: gig.hot, posted: gig.posted, views: gig.views, uni: gig.uni, verified: gig.verified, desc: gig.desc, deliveryDays: gig.deliveryDays, completedGigs: gig.completedSwaps }} onClick={onClick} />;
    case "Co-Creation":
      return <CoCreationCard gig={gig} onClick={onClick} />;
    case "Skill Fusion":
      return <SkillFusionCard fusion={{ id: gig.id, title: gig.skill, description: gig.desc, participants: [{ name: gig.seller, skill: gig.category, elo: gig.elo, avatar: gig.avatar }], lookingFor: [gig.wants], totalSP: gig.points, complexity: "Intermediate", duration: `${gig.deliveryDays} days` }} onClick={onClick} />;
    case "Flash Market":
      return <FlashMarketCard gig={gig} onClick={onClick} />;
    case "Contest":
      return <ContestCard gig={gig} onClick={onClick} />;
    case "Projects":
      return <ProjectCard project={{ id: gig.id, title: gig.skill, description: gig.desc, leader: gig.seller, leaderElo: gig.elo, leaderAvatar: gig.avatar, status: "Recruiting", roles: [], totalSP: gig.points, deadline: "", applicants: gig.views, category: gig.category }} onClick={onClick} />;
    case "Requests":
      return <RequestCard request={{ id: gig.id, title: gig.skill, description: gig.desc, requester: gig.seller, requesterElo: gig.elo, offering: gig.category, seeking: gig.wants, budget: gig.points, responses: gig.views, posted: gig.posted }} onClick={onClick} />;
    default:
      return <DirectSwapCard gig={gig} onClick={onClick} />;
  }
};

const MarketplacePage = () => {
  const {
    mode, setMode, filters, updateFilter, resetFilters, activeFilterCount,
    page, setPage, totalPages, viewMode, setViewMode, pagedGigs, totalResults, filteredGigs,
  } = useMarketplaceData();

  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openQuickView = (gig: Gig) => {
    setSelectedGig(gig);
    setDrawerOpen(true);
  };

  const EmptyState = ({ title, desc }: { title: string; desc: string }) => (
    <div className="py-20 text-center">
      <p className="text-lg font-heading font-bold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );

  const renderContent = () => {
    const gigs = pagedGigs;

    switch (mode) {
      case "explore":
      case "trending":
      case "recommended":
        return (
          <>
            {mode === "explore" && (
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Featured Sellers</p>
                <FeaturedSellers />
              </div>
            )}
            {mode === "recommended" && (
              <div className="mb-4 p-3 rounded-xl bg-surface-1 border border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="text-[10px] font-mono bg-foreground text-background px-1.5 py-0.5 rounded">AI</span>
                  Personalized recommendations based on your skills and swap history
                </p>
              </div>
            )}
            {viewMode === "list" ? (
              <div className="space-y-3">
                {gigs.map(gig => (
                  <GigCard key={gig.id} gig={gig} viewMode="list" onClick={() => openQuickView(gig)} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gigs.map(gig => (
                  <FormatCard key={gig.id} gig={gig} onClick={() => openQuickView(gig)} />
                ))}
              </div>
            )}
            {gigs.length === 0 && <EmptyState title="No gigs found" desc="Try adjusting your filters or post the first gig!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "auctions":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map(gig => <AuctionCard key={gig.id} gig={gig} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No live auctions" desc="Check back soon or create one!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "cocreation":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map(gig => <CoCreationCard key={gig.id} gig={gig} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No co-creation gigs" desc="Start a collaborative project!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "projects":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map(gig => <ProjectCard key={gig.id} project={{ id: gig.id, title: gig.skill, description: gig.desc, leader: gig.seller, leaderElo: gig.elo, leaderAvatar: gig.avatar, status: "Recruiting", roles: [], totalSP: gig.points, deadline: "", applicants: gig.views, category: gig.category }} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No projects" desc="Create the first project!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "fusion":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map(gig => <SkillFusionCard key={gig.id} fusion={{ id: gig.id, title: gig.skill, description: gig.desc, participants: [{ name: gig.seller, skill: gig.category, elo: gig.elo, avatar: gig.avatar }], lookingFor: [gig.wants], totalSP: gig.points, complexity: "Intermediate", duration: `${gig.deliveryDays} days` }} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No skill fusions" desc="Start a multi-skill collaboration!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "sp-only":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map(gig => <SPOnlyCard key={gig.id} gig={{ id: gig.id, skill: gig.skill, spPrice: gig.points, seller: gig.seller, elo: gig.elo, rating: gig.rating, avatar: gig.avatar, category: gig.category, hot: gig.hot, posted: gig.posted, views: gig.views, uni: gig.uni, verified: gig.verified, desc: gig.desc, deliveryDays: gig.deliveryDays, completedGigs: gig.completedSwaps }} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No SP-only gigs" desc="List a gig for SP purchase!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "flash":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map(gig => <FlashMarketCard key={gig.id} gig={gig} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No flash market gigs" desc="Flash deals appear here — check back soon!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "contests":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map(gig => <ContestCard key={gig.id} gig={gig} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No contests" desc="Create a contest!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      case "requests":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map(gig => <RequestCard key={gig.id} request={{ id: gig.id, title: gig.skill, description: gig.desc, requester: gig.seller, requesterElo: gig.elo, offering: gig.category, seeking: gig.wants, budget: gig.points, responses: gig.views, posted: gig.posted }} onClick={() => openQuickView(gig)} />)}
            </div>
            {gigs.length === 0 && <EmptyState title="No requests" desc="Post what you're looking for!" />}
            <MarketplacePagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav />
      <div className="flex flex-1 overflow-hidden">
        <MarketplaceSidebar
          mode={mode}
          onModeChange={m => { setMode(m); setPage(1); }}
          filters={filters}
          onFilterChange={updateFilter}
          activeFilterCount={activeFilterCount}
          onResetFilters={resetFilters}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MarketplaceHeader
            search={filters.search}
            onSearchChange={v => updateFilter("search", v)}
            sort={filters.sort}
            onSortChange={v => updateFilter("sort", v)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            category={filters.category}
            onCategoryChange={v => updateFilter("category", v)}
            totalResults={totalResults}
          />
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
      <GigQuickView gig={selectedGig} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default MarketplacePage;
