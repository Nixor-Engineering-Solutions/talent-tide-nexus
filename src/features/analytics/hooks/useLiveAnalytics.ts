import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  metrics: any | null;
  quarters: any[];
  telemetry: TelemetryData;
  activityFeed: ActivityEvent[];
  guildStats: { total: number; totalSP: number; avgElo: number; totalWars: number };
  profileStats: { total: number; avgSP: number; avgElo: number };
  listingStats: { total: number; avgRating: number; hotCount: number };
  disputeStats: { total: number; resolved: number; pending: number };
  enterpriseStats: { projects: number; consultations: number; candidates: number };
  funnelData: FunnelStep[];
  errorBreakdown: ErrorBreakdown[];
  loading: boolean;
}

export interface TelemetryData {
  totalSessions: number;
  avgDuration: number;
  avgScrollDepth: number;
  avgEngagement: number;
  totalClicks: number;
  rageClicks: number;
  deadClicks: number;
  totalErrors: number;
  topPages: { path: string; count: number; avgDuration: number }[];
  topClickElements: { tag: string; text: string; count: number }[];
  errorTypes: { type: string; count: number }[];
  hourlyActivity: { hour: number; sessions: number }[];
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface FunnelStep {
  step: string;
  count: number;
  pct: number;
}

export interface ErrorBreakdown {
  type: string;
  count: number;
  pct: number;
}

export function useLiveAnalytics(): AnalyticsData {
  const [metrics, setMetrics] = useState<any>(null);
  const [quarters, setQuarters] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    totalSessions: 0, avgDuration: 0, avgScrollDepth: 0, avgEngagement: 0,
    totalClicks: 0, rageClicks: 0, deadClicks: 0, totalErrors: 0,
    topPages: [], topClickElements: [], errorTypes: [], hourlyActivity: [],
  });
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [guildStats, setGuildStats] = useState({ total: 0, totalSP: 0, avgElo: 0, totalWars: 0 });
  const [profileStats, setProfileStats] = useState({ total: 0, avgSP: 0, avgElo: 0 });
  const [listingStats, setListingStats] = useState({ total: 0, avgRating: 0, hotCount: 0 });
  const [disputeStats, setDisputeStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [enterpriseStats, setEnterpriseStats] = useState({ projects: 0, consultations: 0, candidates: 0 });
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [errorBreakdown, setErrorBreakdown] = useState<ErrorBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [qRes, mRes, sessRes, clickRes, errRes, actRes, guildRes, profRes, listRes, dispRes, entProjRes, entConsRes, funnelRes] = await Promise.all([
        supabase.from("quarterly_reports").select("*").order("quarter_id"),
        supabase.from("platform_metrics").select("*").order("metric_date", { ascending: false }).limit(1),
        supabase.from("page_sessions").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("click_heatmap").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("error_log").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("guilds").select("id, total_sp, avg_elo, total_gigs"),
        supabase.from("profiles").select("user_id, sp, elo"),
        supabase.from("listings").select("id, rating, hot, status"),
        supabase.from("disputes").select("id, status"),
        supabase.from("enterprise_projects").select("id, status, budget"),
        supabase.from("enterprise_consultations").select("id, status"),
        supabase.from("funnel_events").select("*").order("created_at", { ascending: false }).limit(1000),
      ]);

      if (qRes.data?.length) {
        setQuarters(qRes.data.map((q: any) => ({
          id: q.quarter_id, label: q.label, period: q.period, status: q.status,
          kpis: q.kpis, growth: q.growth,
          highlights: q.highlights, monthlyBreakdown: q.monthly_breakdown,
          topSkills: q.top_skills,
        })));
      }
      if (mRes.data?.length) setMetrics(mRes.data[0]);

      // Telemetry aggregation
      const sessions = sessRes.data || [];
      const clicks = clickRes.data || [];
      const errors = errRes.data || [];
      const totalSessions = sessions.length;
      const avgDuration = totalSessions ? Math.round(sessions.reduce((a: number, s: any) => a + (s.duration_seconds || 0), 0) / totalSessions) : 0;
      const avgScrollDepth = totalSessions ? Math.round(sessions.reduce((a: number, s: any) => a + (s.scroll_depth_max || 0), 0) / totalSessions) : 0;
      const avgEngagement = totalSessions ? Math.round(sessions.reduce((a: number, s: any) => a + (s.engagement_score || 0), 0) / totalSessions) : 0;
      const rageClicks = clicks.filter((c: any) => c.is_rage_click).length;
      const deadClicks = clicks.filter((c: any) => c.is_dead_click).length;

      const pageMap = new Map<string, { count: number; totalDur: number }>();
      sessions.forEach((s: any) => { const e = pageMap.get(s.page_path) || { count: 0, totalDur: 0 }; e.count++; e.totalDur += s.duration_seconds || 0; pageMap.set(s.page_path, e); });
      const topPages = Array.from(pageMap.entries()).map(([path, v]) => ({ path, count: v.count, avgDuration: Math.round(v.totalDur / v.count) })).sort((a, b) => b.count - a.count).slice(0, 10);

      const elemMap = new Map<string, number>();
      clicks.forEach((c: any) => { const key = `${c.element_tag || "?"}:${(c.element_text || "").slice(0, 30)}`; elemMap.set(key, (elemMap.get(key) || 0) + 1); });
      const topClickElements = Array.from(elemMap.entries()).map(([k, count]) => { const [tag, text] = k.split(":"); return { tag, text: text || "(no text)", count }; }).sort((a, b) => b.count - a.count).slice(0, 10);

      const errMap = new Map<string, number>();
      errors.forEach((e: any) => { errMap.set(e.error_type, (errMap.get(e.error_type) || 0) + 1); });
      const errorTypes = Array.from(errMap.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

      const hourMap = new Map<number, number>();
      sessions.forEach((s: any) => { const h = new Date(s.entered_at).getHours(); hourMap.set(h, (hourMap.get(h) || 0) + 1); });
      const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({ hour: i, sessions: hourMap.get(i) || 0 }));

      setTelemetry({ totalSessions, avgDuration, avgScrollDepth, avgEngagement, totalClicks: clicks.length, rageClicks, deadClicks, totalErrors: errors.length, topPages, topClickElements, errorTypes, hourlyActivity });

      // Activity feed
      const acts = (actRes.data || []).map((a: any) => ({
        id: a.id,
        type: a.action,
        message: `${a.action}${a.entity_type ? ` on ${a.entity_type}` : ""}`,
        timestamp: a.created_at,
      }));
      setActivityFeed(acts);

      // Guild stats
      const guilds = guildRes.data || [];
      setGuildStats({
        total: guilds.length,
        totalSP: guilds.reduce((a: number, g: any) => a + (g.total_sp || 0), 0),
        avgElo: guilds.length ? Math.round(guilds.reduce((a: number, g: any) => a + (g.avg_elo || 0), 0) / guilds.length) : 0,
        totalWars: 0,
      });

      // Profile stats
      const profiles = profRes.data || [];
      setProfileStats({
        total: profiles.length,
        avgSP: profiles.length ? Math.round(profiles.reduce((a: number, p: any) => a + (p.sp || 0), 0) / profiles.length) : 0,
        avgElo: profiles.length ? Math.round(profiles.reduce((a: number, p: any) => a + (p.elo || 0), 0) / profiles.length) : 0,
      });

      // Listing stats
      const listings = listRes.data || [];
      setListingStats({
        total: listings.length,
        avgRating: listings.length ? parseFloat((listings.reduce((a: number, l: any) => a + (l.rating || 0), 0) / listings.length).toFixed(1)) : 0,
        hotCount: listings.filter((l: any) => l.hot).length,
      });

      // Dispute stats
      const disputes = dispRes.data || [];
      setDisputeStats({
        total: disputes.length,
        resolved: disputes.filter((d: any) => d.status === "Resolved").length,
        pending: disputes.filter((d: any) => d.status === "Open" || d.status === "Under Review").length,
      });

      // Enterprise
      setEnterpriseStats({
        projects: (entProjRes.data || []).length,
        consultations: (entConsRes.data || []).length,
        candidates: 0,
      });

      // Funnel
      const funnelEvents = funnelRes.data || [];
      const funnelMap = new Map<string, number>();
      funnelEvents.forEach((f: any) => { funnelMap.set(f.step, (funnelMap.get(f.step) || 0) + 1); });
      const funnelSteps = ["visit", "signup", "first_gig", "repeat", "power_user"];
      const maxFunnel = Math.max(...funnelSteps.map(s => funnelMap.get(s) || 0), 1);
      setFunnelData(funnelSteps.map(step => ({
        step: step.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        count: funnelMap.get(step) || 0,
        pct: Math.round(((funnelMap.get(step) || 0) / maxFunnel) * 100),
      })));

      // Error breakdown
      const totalErr = errors.length || 1;
      setErrorBreakdown(errorTypes.map(e => ({ ...e, pct: Math.round((e.count / totalErr) * 100) })));

      setLoading(false);
    };

    fetchAll();
  }, []);

  return { metrics, quarters, telemetry, activityFeed, guildStats, profileStats, listingStats, disputeStats, enterpriseStats, funnelData, errorBreakdown, loading };
}
