import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Rocket, Download, MessageSquare } from 'lucide-react';
import { appClient } from '@/api/appClient';
import TopNav from '@/components/TopNav';
import ChatBot from '@/components/ChatBot';
import WorldMap from '@/components/WorldMap';
import CountryPanel from '@/components/world/CountryPanel';
import PlannerForm from '@/components/planner/PlannerForm';
import { findDestinationData, normalizeCountryName } from '@/lib/countryData';
import {
  generateItinerary, geocodeDestination, fetchWeather, haversineKm,
  estimateTransport, computeBudgetBreakdown } from
'@/lib/tripEngine';
import { loadPackLocal, buildStandaloneHtml, downloadStandalone } from '@/lib/offlinePack';

export default function Home() {
  const navigate = useNavigate();
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [plannerInitial, setPlannerInitial] = useState({});
  const [resetSignal, setResetSignal] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [authed, setAuthed] = useState(null);
  const [offlinePack, setOfflinePack] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, message: '' });
  const [feedbackState, setFeedbackState] = useState('');

  useEffect(() => {
    let alive = true;
    appClient.auth.isAuthenticated().then((v) => {if (alive) setAuthed(v);}).catch(() => setAuthed(false));
    if (!navigator.onLine) setOfflinePack(loadPackLocal());
    const off = () => setOfflinePack(loadPackLocal());
    const on = () => setOfflinePack(null);
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {alive = false;window.removeEventListener('offline', off);window.removeEventListener('online', on);};
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const useAsDestination = (place, country) => {
    setPlannerInitial({ destination: place });
    setResetSignal((s) => s + 1);
    setStatus(`Selected ${place}${country ? ` (${country})` : ''} from the World Explorer — adjust the details below and generate your itinerary.`);
    scrollTo('planner');
  };

  const generateTrip = async (inputs) => {
    if (generating) return;
    setStatus('Checking your account…');
    const authedNow = await appClient.auth.isAuthenticated().catch(() => false);
    if (!authedNow) {
      setStatus('Sign in first so your trips are saved privately to your account.');
      appClient.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setGenerating(true);
    try {
      const startDate = inputs.start_date ? new Date(inputs.start_date + 'T00:00:00') : new Date();
      const itinerary = generateItinerary({
        destination: inputs.destination,
        days: inputs.days,
        pace: inputs.pace,
        interests: inputs.interests,
        startDate
      });

      setStatus('Locating the destination…');
      const known = findDestinationData(inputs.destination);
      const destCoords = known && known.coords || (await geocodeDestination(inputs.destination));
      const startCoords = inputs.origin ? await geocodeDestination(inputs.origin) : null;

      setStatus('Checking the weather forecast…');
      let weather = null;
      if (destCoords) {
        try {weather = await fetchWeather(destCoords.lat, destCoords.lon, startDate, Number(inputs.days));} catch (e) {/* forecast stays null */}
      }

      let transport = null;
      if (startCoords && destCoords) {
        transport = estimateTransport(haversineKm(startCoords.lat, startCoords.lon, destCoords.lat, destCoords.lon), inputs.transport_mode);
        transport.destinationCoords = destCoords;
      }

      const tripFields = {
        name: itinerary.trip_title,
        destination: inputs.destination,
        origin: inputs.origin || '',
        start_date: startDate.toISOString().split('T')[0],
        days: Number(inputs.days),
        travellers: Math.max(1, Number(inputs.travellers) || 1),
        pace: Number(inputs.pace),
        interests: inputs.interests,
        transport_mode: inputs.transport_mode,
        hotel_preference: inputs.hotel_preference,
        custom_budget: inputs.custom_budget ? parseFloat(inputs.custom_budget) : undefined,
        women_travelling: !!inputs.women_travelling,
        guide_requested: !!inputs.guide_requested,
        transport_json: transport || undefined,
        weather_json: weather || undefined,
        destination_lat: destCoords ? destCoords.lat : undefined,
        destination_lon: destCoords ? destCoords.lon : undefined
      };
      const totalStops = itinerary.days.reduce((n, d) => n + d.items.length, 0);
      tripFields.budget_json = computeBudgetBreakdown(tripFields, totalStops);
      tripFields.budget_total = tripFields.budget_json.grandTotal;

      setStatus('Saving your trip…');
      const trip = await appClient.entities.Trip.create(tripFields);
      const stopRows = [];
      itinerary.days.forEach((d) => {
        d.items.forEach((item, i) => {
          stopRows.push({
            trip_id: trip.id,
            day_number: d.day,
            sequence: i + 1,
            time: item.time,
            place_name: item.place_name,
            activity: item.activity,
            notes: item.notes,
            rating: item.rating || undefined,
            tip: item.tip || undefined
          });
        });
      });
      await appClient.entities.TripStop.bulkCreate(stopRows);
      navigate('/trip/' + trip.id);
    } catch (e) {
      setStatus('Something went wrong while creating the trip: ' + (e && e.message ? e.message : 'unknown error'));
      setGenerating(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;
    const authedNow = await appClient.auth.isAuthenticated().catch(() => false);
    if (!authedNow) {setFeedbackState('Sign in to send feedback — it goes straight to us, nothing public.');return;}
    setFeedbackState('Sending…');
    try {
      await appClient.entities.Feedback.create({ rating: Number(feedback.rating), message: feedback.message.trim() });
      setFeedback({ rating: 5, message: '' });
      setFeedbackState('Thanks — feedback sent.');
    } catch (err) {
      setFeedbackState('Could not send — check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero */}
      <section
        className="flex items-center justify-center px-6 py-24 text-center"
        style={{
          backgroundImage:
          'linear-gradient(180deg, rgba(18,32,58,0.55) 0%, rgba(18,32,58,0.8) 55%, #12203A 100%), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=70)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary" /> TourInsight — AI Travel Companion <span className="h-px w-6 bg-primary" />
          </div>
          <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-6xl">
            Plan smart. Travel safe.<br /><em className="font-normal italic text-[#E4CE94]">Explore more.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Explore destinations on an interactive world map, build day-by-day itineraries with budget and
            safety tools, and ask TourInsight AI for help — with a private trip dashboard that follows you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => scrollTo('planner')} className="rounded-xl border border-[#C15B3E] bg-[#C15B3E] px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-white transition hover:bg-[#a94d33]">
              <Rocket className="mr-2 inline h-4 w-4" /> Start Planning
            </button>
            <button type="button" onClick={() => {setShowExplorer(true);setTimeout(() => scrollTo('explorer'), 50);}} className="rounded-xl border border-primary bg-black/10 px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-primary transition hover:bg-primary/10">
              <Globe className="mr-2 inline h-4 w-4" /> Explore the World
            </button>
          </div>
          {authed &&
          <div className="mt-6 font-mono text-xs text-muted-foreground">
              <Link to="/dashboard" className="underline decoration-primary underline-offset-4 hover:text-foreground">Open your trip dashboard →</Link>
            </div>
          }
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {/* Offline banner */}
        {offlinePack &&
        <div className="mt-6 rounded-xl border border-[#C9A24B]/50 bg-[#C9A24B]/10 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-xs text-primary">
                You're offline — a saved trip pack for <strong>{offlinePack.trip?.destination}</strong> is on this device.
              </div>
              <button
              type="button"
              onClick={() => downloadStandalone(buildStandaloneHtml(offlinePack), offlinePack.trip?.destination)}
              className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 font-mono text-[10px] uppercase text-primary hover:bg-primary/10">
              
                <Download className="h-3.5 w-3.5" /> Re-download offline file
              </button>
            </div>
          </div>
        }

        {/* World Explorer */}
        <section id="explorer" className="mt-10 scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-card p-5 text-card-foreground shadow-2xl sm:p-6">
            <div>
              <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">
                <span className="h-px w-5 bg-[#1E6B69]" /> World Explorer
              </div>
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Click a country. Discover its top places.</h2>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
                Choose a country on the interactive map to see its popular destinations, then select a place to
                use it directly in your trip planner.
              </p>
            </div>
            <span className="rounded-full bg-[#1E6B69] px-3 py-1.5 font-mono text-[10px] text-white">Interactive map</span>
          </div>
          {showExplorer ?
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <WorldMap selectedCountry={selectedCountry} onCountrySelect={(name) => setSelectedCountry(normalizeCountryName(name))} className="h-[440px]" />
              <CountryPanel country={selectedCountry} onUsePlace={useAsDestination} />
            </div> :

          <button
            type="button"
            onClick={() => setShowExplorer(true)}
            className="w-full rounded-2xl border-2 border-dashed border-white/20 bg-card/20 py-10 font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-primary">
            
              <Globe className="mb-2 inline h-5 w-5" /> Load the interactive world map
            </button>
          }
        </section>

        {/* Planner */}
        <section id="planner" className="mt-12 scroll-mt-20">
          <PlannerForm initial={plannerInitial} resetSignal={resetSignal} onGenerate={generateTrip} generating={generating} status={status} />
        </section>

        {/* Feedback */}
        <section className="mt-10 rounded-2xl p-6 text-card-foreground shadow-2xl sm:p-8 bg-[hsl(var(--popover-foreground))]">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">
            <MessageSquare className="h-4 w-4" /> Feedback
          </div>
          <p className="mb-4 text-[13px] text-muted-foreground">Used the planner? Tell us what worked and what didn't — it goes straight to us, nothing public.</p>
          <form onSubmit={submitFeedback} className="space-y-3">
            <select
              value={feedback.rating}
              onChange={(e) => setFeedback((f) => ({ ...f, rating: Number(e.target.value) }))}
              className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2.5 text-sm sm:w-72"
              aria-label="Overall rating">
              
              <option value={5}>Great — would use again</option>
              <option value={4}>Good, minor issues</option>
              <option value={3}>Okay, needs work</option>
              <option value={2}>Frustrating</option>
              <option value={1}>Didn't work for me</option>
            </select>
            <textarea
              rows={3}
              value={feedback.message}
              onChange={(e) => setFeedback((f) => ({ ...f, message: e.target.value }))}
              placeholder="e.g. loved the map, wish stops were more specific…"
              className="w-full resize-y rounded-lg border border-ink/25 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1E6B69]" />
            
            <button type="submit" className="rounded-xl bg-[#C15B3E] px-6 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-[#a94d33]">
              Send feedback
            </button>
            {feedbackState && <div className="font-mono text-xs text-muted-foreground">{feedbackState}</div>}
          </form>
        </section>

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-7 font-mono text-[11px] text-muted-foreground">
          <span>Runs on your account — itineraries, budget, world explorer and safety tools are private to you.</span>
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <ChatBot />
    </div>);

}