import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Download, CalendarPlus, Loader2, MapPin } from 'lucide-react';
import { appClient } from '@/api/appClient';
import TopNav from '@/components/TopNav';
import ChatBot from '@/components/ChatBot';
import TripMap from '@/components/TripMap';
import ItineraryList from '@/components/trip/ItineraryList';
import BudgetView from '@/components/trip/BudgetView';
import SafetyView from '@/components/trip/SafetyView';
import GuideView from '@/components/trip/GuideView';
import NearbyView from '@/components/trip/NearbyView';
import { geocodeStops } from '@/lib/stopGeo';
import { buildIcsText } from '@/lib/tripEngine';
import { buildBundle, buildStandaloneHtml, downloadStandalone, savePackLocal } from '@/lib/offlinePack';
import { buildPackImages } from '@/lib/placeImages';
import { findDestinationData } from '@/lib/countryData';

const TABS = [
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'map', label: 'Map' },
  { key: 'budget', label: 'Budget' },
  { key: 'safety', label: 'Safety' },
  { key: 'guides', label: 'Guides' },
  { key: 'nearby', label: 'Nearby' },
];

export default function TripResult() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('itinerary');
  const [mapDay, setMapDay] = useState('all');
  const [geoStops, setGeoStops] = useState(null);
  const [geoProgress, setGeoProgress] = useState(null);
  const [packState, setPackState] = useState('idle'); // idle | working | ready
  const [feedback, setFeedback] = useState({ rating: 5, message: '' });
  const [feedbackState, setFeedbackState] = useState('');

  const refresh = useCallback(async () => {
    try {
      const t = await appClient.entities.Trip.get(id);
      setTrip(t);
      const s = await appClient.entities.TripStop.filter({ trip_id: id });
      setStops(s.sort((a, b) => a.day_number - b.day_number || a.sequence - b.sequence));
      setLoadError(null);
    } catch (e) {
      setLoadError(e && e.message ? e.message : 'Trip not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  // Resolve stop coordinates once, only when the map is opened or a pack is saved
  // (per-stop geocoding is throttled, so it shouldn't run on every trip load).
  const shouldGeocode = tab === 'map' || packState === 'working';
  useEffect(() => {
    let cancelled = false;
    if (!shouldGeocode) { setGeoStops(null); setGeoProgress(null); return undefined; }
    const unresolved = stops.filter((s) => s.lat == null && s.lon == null);
    if (!stops.length || !unresolved.length) { setGeoStops(stops); return undefined; }
    setGeoStops(null);
    setGeoProgress({ done: 0, total: stops.length });
    geocodeStops(stops, trip ? trip.destination : '', (done, total) => !cancelled && setGeoProgress({ done, total }))
      .then(async (resolved) => {
        if (cancelled) return;
        setGeoStops(resolved);
        setGeoProgress(null);
        const updates = resolved
          .filter((s, i) => s.lat != null && stops[i] && stops[i].lat == null)
          .map((s) => ({ id: s.id, lat: s.lat, lon: s.lon }));
        if (updates.length) {
          try { await appClient.entities.TripStop.bulkUpdate(updates); } catch (e) { /* non-fatal */ }
        }
      })
      .catch(() => !cancelled && setGeoStops(stops));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldGeocode, stops.length, trip && trip.id]);

  const days = useMemo(() => {
    const set = new Set(stops.map((s) => s.day_number));
    for (let d = 1; d <= (trip?.days || 1); d++) set.add(d);
    return [...set].sort((a, b) => a - b);
  }, [stops, trip]);

  const mapStops = useMemo(() => {
    const base = geoStops || stops;
    return mapDay === 'all'
      ? [...base].sort((a, b) => a.day_number - b.day_number || a.sequence - b.sequence)
      : base.filter((s) => Number(s.day_number) === Number(mapDay)).sort((a, b) => a.sequence - b.sequence);
  }, [geoStops, stops, mapDay]);

  const center = useMemo(() => {
    if (trip && trip.destination_lat != null) return { lat: trip.destination_lat, lon: trip.destination_lon };
    const known = findDestinationData(trip?.destination);
    return known ? known.coords : null;
  }, [trip]);

  const saveOfflinePack = async () => {
    if (packState === 'working') return;
    setPackState('working');
    try {
      let packStops = geoStops || stops;
      if (packStops.some((s) => s.lat == null || s.lon == null)) {
        try {
          packStops = await geocodeStops(packStops, trip.destination, (done, total) => setGeoProgress({ done, total }));
          setGeoStops(packStops);
          setGeoProgress(null);
          const updates = packStops.filter((s) => s.lat != null && s.lon != null).map((s) => ({ id: s.id, lat: s.lat, lon: s.lon }));
          if (updates.length) await appClient.entities.TripStop.bulkUpdate(updates).catch(() => null);
        } catch {
          setGeoProgress(null);
          packStops = geoStops || stops;
        }
      }
      const images = await buildPackImages(trip, packStops);
      const bundle = buildBundle(trip, packStops, images);
      savePackLocal(bundle);
      try {
        await appClient.entities.OfflinePack.create({
          trip_id: trip.id,
          trip_name: trip.name || trip.destination,
          destination: trip.destination,
          saved_at: new Date().toISOString(),
          snapshot: { trip, stops: packStops },
        });
      } catch (e) { /* entity save is best-effort; the device pack is the primary copy */ }
      downloadStandalone(buildStandaloneHtml(bundle), trip.destination);
      setPackState('ready');
    } catch (e) {
      setPackState('idle');
    }
  };

  const exportCalendar = () => {
    const ics = buildIcsText(trip, stops);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (trip.destination || 'trip').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-itinerary.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;
    setFeedbackState('Sending…');
    try {
      await appClient.entities.Feedback.create({ trip_id: trip.id, rating: Number(feedback.rating), message: feedback.message.trim() });
      setFeedback({ rating: 5, message: '' });
      setFeedbackState('Thanks — feedback sent.');
    } catch (err) {
      setFeedbackState('Could not send — check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your trip…</div>
      </div>
    );
  }

  if (loadError || !trip) {
    return (
      <div className="min-h-screen">
        <TopNav />
        <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-card p-8 text-center text-card-foreground shadow-xl">
          <h1 className="font-heading text-2xl font-semibold">Trip not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError || 'This trip does not exist or is not shared with you.'}</p>
          <Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-5 py-3 font-mono text-xs uppercase text-white">
            <ArrowLeft className="h-4 w-4" /> Back to my trips
          </Link>
        </div>
      </div>
    );
  }

  const startDateLabel = trip.start_date ? new Date(trip.start_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible dates';

  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 pb-24">
        {/* Trip header */}
        <div className="mb-6">
          <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> My trips
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                <MapPin className="h-3.5 w-3.5" /> {trip.destination}
              </div>
              <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{trip.name || `${trip.days}-Day ${trip.destination} Itinerary`}</h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {startDateLabel} · {trip.days} day{trip.days > 1 ? 's' : ''} · {trip.travellers || 1} traveler{(trip.travellers || 1) > 1 ? 's' : ''}
                {trip.origin ? ` · from ${trip.origin}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="tel:112" className="rounded-xl border border-[#C15B3E] px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-[#C15B3E] hover:bg-[#C15B3E]/10">
                <Phone className="mr-1.5 inline h-3.5 w-3.5" /> SOS
              </a>
              <button
                type="button"
                onClick={saveOfflinePack}
                disabled={packState === 'working'}
                className={`rounded-xl border px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide transition ${packState === 'ready' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0f766e]' : 'border-primary text-primary hover:bg-primary/10'} disabled:opacity-60`}
              >
                <Download className="mr-1.5 inline h-3.5 w-3.5" />
                {packState === 'working' ? 'Preparing pack…' : packState === 'ready' ? '✓ Offline trip ready' : 'Offline trip pack'}
              </button>
              <button type="button" onClick={exportCalendar} className="rounded-xl border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground">
                <CalendarPlus className="mr-1.5 inline h-3.5 w-3.5" /> Calendar
              </button>
            </div>
          </div>
          {packState === 'ready' && (
            <div className="mt-3 rounded-xl border border-[#0D9488]/40 bg-[#0D9488]/10 p-3 font-mono text-[11px] leading-relaxed text-[#0f766e]">
              ✓ Offline pack complete: itinerary, saved map snapshot, places, emergency contacts and the offline assistant are on this device (a standalone HTML file was downloaded). It also works in airplane mode.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-7 flex flex-wrap gap-1.5 rounded-xl bg-muted/60 p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide transition ${tab === t.key ? 'bg-[#C15B3E] text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'itinerary' && <ItineraryList trip={trip} stops={stops} onStopsChanged={refresh} />}
        {tab === 'map' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMapDay('all')}
                className={`rounded-lg border px-3.5 py-2 font-mono text-xs transition ${mapDay === 'all' ? 'border-primary bg-primary text-[#0F172A]' : 'border-border/70 bg-muted/60 text-muted-foreground hover:text-foreground'}`}
              >
                All days
              </button>
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setMapDay(d)}
                  className={`rounded-lg border px-3.5 py-2 font-mono text-xs transition ${Number(mapDay) === d ? 'border-primary bg-primary text-[#0F172A]' : 'border-border/70 bg-muted/60 text-muted-foreground hover:text-foreground'}`}
                >
                  Day {d}
                </button>
              ))}
            </div>
            {geoProgress && (
              <div className="mb-3 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mapping stops {geoProgress.done}/{geoProgress.total}…
              </div>
            )}
            {geoStops && !geoStops.some((s) => s.lat != null) && (
              <div className="mb-3 rounded-xl border border-border/60 bg-muted/60 p-4 font-mono text-xs text-muted-foreground">
                None of these stops could be located on the map by name — the map shows the destination area instead. Live maps return when connected.
              </div>
            )}
            <TripMap stops={mapStops} center={center} routeLabel={mapDay === 'all' ? 'Route · all mapped stops' : `Route · Day ${mapDay}`} className="h-[460px]" />
          </div>
        )}
        {tab === 'budget' && <BudgetView trip={trip} stopsCount={stops.length} />}
        {tab === 'safety' && <SafetyView trip={trip} stopsCount={stops.length} />}
        {tab === 'guides' && <GuideView trip={trip} onTripChanged={refresh} />}
        {tab === 'nearby' && <NearbyView trip={trip} />}

        {/* Trip feedback */}
        <section className="mt-12 rounded-2xl bg-card p-6 text-card-foreground shadow-2xl">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#0D9488]">Feedback on this trip</div>
          <form onSubmit={submitFeedback} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <select value={feedback.rating} onChange={(e) => setFeedback((f) => ({ ...f, rating: Number(e.target.value) }))} className="rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm" aria-label="Trip rating">
              <option value={5}>Great trip plan</option>
              <option value={4}>Good, minor issues</option>
              <option value={3}>Okay, needs work</option>
              <option value={2}>Frustrating</option>
              <option value={1}>Didn't work for me</option>
            </select>
            <input
              value={feedback.message}
              onChange={(e) => setFeedback((f) => ({ ...f, message: e.target.value }))}
              placeholder="What worked, what didn't?"
              className="min-w-0 flex-1 rounded-lg border border-ink/25 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
            <button type="submit" className="rounded-xl bg-[#C15B3E] px-5 py-2.5 font-mono text-[10px] uppercase tracking-wide text-white hover:bg-[#a94d33]">Send</button>
          </form>
          {feedbackState && <div className="mt-2 font-mono text-xs text-muted-foreground">{feedbackState}</div>}
        </section>
      </div>

      <ChatBot trip={trip} stops={stops} onTripChanged={refresh} />
    </div>
  );
}