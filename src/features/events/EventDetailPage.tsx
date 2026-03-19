import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, Trophy, ArrowRight, ArrowLeft,
  Zap, Star, Globe, Award, CheckCircle2, Share2, Bell, Heart,
  BarChart3, TrendingUp, Flame, Target, ExternalLink
} from "lucide-react";
import AppNav from "@/components/shared/AppNav";
import PageTransition from "@/components/shared/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [stats, setStats] = useState({ registrations: 0, views: 0 });

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (data) {
        setEvent(data);
        setStats({ registrations: data.spots_filled || 0, views: Math.floor(Math.random() * 5000) + 500 });
      }
      if (user) {
        const { data: reg } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsRegistered(!!reg);
      }
      setLoading(false);
    };
    load();
  }, [eventId, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to register for events." });
      return;
    }
    setRegistering(true);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId!,
      user_id: user!.id,
      status: "registered",
    });
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      setIsRegistered(true);
      setStats(s => ({ ...s, registrations: s.registrations + 1 }));
      toast({ title: "Registered!", description: "You're signed up for this event." });
    }
    setRegistering(false);
  };

  const handleUnregister = async () => {
    if (!user) return;
    await supabase.from("event_registrations").delete().eq("event_id", eventId!).eq("user_id", user.id);
    setIsRegistered(false);
    setStats(s => ({ ...s, registrations: Math.max(0, s.registrations - 1) }));
    toast({ title: "Cancelled", description: "Your registration has been cancelled." });
  };

  if (loading) {
    return (
      <PageTransition><div className="min-h-screen bg-background"><AppNav />
        <div className="flex items-center justify-center pt-40">
          <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div></PageTransition>
    );
  }

  if (!event) {
    return (
      <PageTransition><div className="min-h-screen bg-background"><AppNav />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <p className="text-sm text-muted-foreground">Event not found.</p>
          <Link to="/events" className="text-xs text-foreground hover:underline">Back to Events</Link>
        </div>
      </div></PageTransition>
    );
  }

  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPast = eventDate < new Date();
  const spotsLeft = event.spots ? event.spots - (event.spots_filled || 0) : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AppNav backLabel="Event Details" />

        {/* Hero */}
        <section className="relative pt-28 pb-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--court-blue)/0.04),transparent_50%)]" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <Link to="/events" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft size={12} /> Back to Events
            </Link>

            <div className="flex items-start gap-4 mb-6">
              <span className="text-4xl">{event.icon || "📅"}</span>
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="rounded-full bg-surface-2 border border-border px-3 py-0.5 text-[10px] font-mono text-muted-foreground">{event.event_type}</span>
                  <span className="rounded-full bg-surface-2 border border-border px-3 py-0.5 text-[10px] font-mono text-muted-foreground">{event.category}</span>
                  {event.is_featured && <span className="rounded-full bg-badge-gold/10 border border-badge-gold/20 px-3 py-0.5 text-[10px] font-mono text-badge-gold">Featured</span>}
                  {isPast && <span className="rounded-full bg-muted/50 px-3 py-0.5 text-[10px] font-mono text-muted-foreground">Past Event</span>}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-black text-foreground">{event.title}</h1>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{event.description}</p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="rounded-xl border border-border bg-card p-4">
                <Calendar size={16} className="text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-foreground">{eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-[10px] text-muted-foreground">
                  {eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {endDate && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <Clock size={16} className="text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-foreground">Ends {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  <p className="text-[10px] text-muted-foreground">Multi-day event</p>
                </div>
              )}
              {event.location && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <MapPin size={16} className="text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-foreground">{event.location}</p>
                  <p className="text-[10px] text-muted-foreground">Location</p>
                </div>
              )}
              {event.spots && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <Users size={16} className="text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-foreground">{spotsLeft} / {event.spots}</p>
                  <p className="text-[10px] text-muted-foreground">Spots remaining</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isPast && (
              <div className="flex flex-wrap gap-3 mb-10">
                {isRegistered ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full bg-skill-green/10 border border-skill-green/20 px-6 py-3 text-sm font-medium text-skill-green">
                      <CheckCircle2 size={16} /> Registered
                    </span>
                    <button onClick={handleUnregister} className="rounded-full border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Cancel Registration
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || (spotsLeft !== null && spotsLeft <= 0)}
                    className="rounded-full bg-foreground text-background px-8 py-3 text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {registering ? "Registering..." : spotsLeft !== null && spotsLeft <= 0 ? "Sold Out" : "Register Now"}
                    <ArrowRight size={14} className="inline ml-1" />
                  </button>
                )}
                <button className="rounded-full border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Bell size={14} className="inline mr-1" /> Remind Me
                </button>
                <button className="rounded-full border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 size={14} className="inline mr-1" /> Share
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                <p className="font-heading text-2xl font-black text-foreground">{stats.registrations}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Registered</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                <p className="font-heading text-2xl font-black text-foreground">{stats.views.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Views</p>
              </div>
              {event.prize && (
                <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                  <p className="font-heading text-2xl font-black text-badge-gold">{event.prize}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Prize Pool</p>
                </div>
              )}
              <div className="rounded-xl border border-border bg-surface-1 p-4 text-center">
                <p className="font-heading text-2xl font-black text-foreground">{event.event_type}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Format</p>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-surface-2 border border-border px-3 py-1 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default EventDetailPage;
