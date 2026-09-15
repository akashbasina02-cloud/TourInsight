import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { appClient } from '@/api/appClient';
import { loadPackLocal, offlineAssistantAnswer } from '@/lib/offlinePack';

/* Floating TourInsight AI chat. Online: server-side AI with trip context and
   inline Confirm/Cancel proposals. Offline (or unreachable): saved-trip assistant. */
export default function ChatBot({ trip, stops, onTripChanged }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { who: 'bot', text: "Hi! I'm TourInsight AI. Ask me about your trip — or tell me to add or remove a stop and I'll propose the change for you to confirm." },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [applying, setApplying] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const historyRef = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking, proposal]);

  const addMsg = (text, who) => setMessages((m) => [...m, { who, text }]);

  const compactTrip = () => {
    if (!trip) return null;
    return {
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      origin: trip.origin,
      start_date: trip.start_date,
      days: trip.days,
      travellers: trip.travellers,
      hotel_preference: trip.hotel_preference,
      custom_budget: trip.custom_budget,
      budget_total: trip.budget_total,
      stops: (stops || []).map((s) => ({ day_number: s.day_number, sequence: s.sequence, time: s.time, activity: s.activity, notes: s.notes })),
    };
  };

  const submit = async (raw) => {
    const q = (raw || input).trim();
    if (!q || thinking) return;
    setInput('');
    addMsg(q, 'user');
    historyRef.current.push({ role: 'user', text: q });
    setThinking(true);

    let reply = null;
    let newProposal = null;
    if (online) {
      try {
        const res = await appClient.functions.invoke('chatAssistant', {
          message: q,
          tripContext: compactTrip(),
          history: historyRef.current.slice(-8),
        });
        reply = res.data && res.data.reply;
        newProposal = res.data && res.data.proposal;
      } catch (e) { /* fall through to offline assistant */ }
    }
    if (!reply) {
      const bundle = loadPackLocal() || (trip ? { trip, stops, places: null, budget: null, emergency: null } : null);
      reply = online
        ? 'The online assistant could not be reached, so I answered from your saved trip.\n\n' + offlineAssistantAnswer(q, bundle)
        : offlineAssistantAnswer(q, bundle);
    }
    setThinking(false);
    addMsg(reply, 'bot');
    historyRef.current.push({ role: 'assistant', text: reply });
    if (newProposal && (newProposal.kind === 'add_stop' || newProposal.kind === 'remove_stop') && newProposal.activity && trip) {
      setProposal(newProposal);
    }
  };

  const applyProposal = async () => {
    if (!proposal || !trip || !onTripChanged) { setProposal(null); return; }
    setApplying(true);
    try {
      if (proposal.kind === 'add_stop') {
        const dayNumber = Math.min(Math.max(1, proposal.day_number), trip.days || proposal.day_number);
        const dayStops = (stops || []).filter((s) => Number(s.day_number) === dayNumber);
        await appClient.entities.TripStop.create({
          trip_id: trip.id,
          day_number: dayNumber,
          sequence: dayStops.length + 1,
          time: proposal.time || '10:00',
          activity: proposal.activity,
          notes: proposal.notes || '',
        });
        addMsg(`Done — added "${proposal.activity}" to Day ${dayNumber}. The itinerary, map and budget have been updated.`, 'bot');
      } else if (proposal.kind === 'remove_stop') {
        const target = (stops || []).find(
          (s) => String(s.day_number) === String(proposal.day_number) && s.activity.trim().toLowerCase() === proposal.activity.trim().toLowerCase()
        ) || (stops || []).find((s) => s.activity.trim().toLowerCase() === proposal.activity.trim().toLowerCase());
        if (!target) {
          addMsg("I couldn't find that stop in the current trip — nothing was changed.", 'bot');
        } else {
          await appClient.entities.TripStop.delete(target.id);
          addMsg(`Done — removed "${target.activity}" from Day ${target.day_number}.`, 'bot');
        }
      }
      await onTripChanged();
    } catch (e) {
      addMsg('The change could not be saved: ' + (e && e.message ? e.message : 'unknown error'), 'bot');
    }
    setApplying(false);
    setProposal(null);
  };

  const quickAsk = (q) => { if (trip) submit(q); };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open TourInsight AI"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#1E6B69] to-[#12203A] text-white shadow-2xl transition hover:scale-105"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[min(600px,calc(100vh-120px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/40 bg-card text-card-foreground shadow-2xl">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#12203A] to-[#1E6B69] px-4 py-3 text-white">
            <div>
              <div className="font-heading text-lg font-semibold">TourInsight AI</div>
              <div className="font-mono text-[9px] uppercase tracking-widest opacity-80">
                {online ? 'Online intelligence · Gemini' : 'Offline trip assistant'}
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2 font-mono text-[10px] text-muted-foreground">
            <span>{online ? '🟢 Online AI' : '🟠 Offline mode — saved trip answers'}</span>
            <span>{trip ? trip.destination : 'No trip loaded'}</span>
          </div>

          <div ref={scrollRef} className="ti-scroll flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow ${m.who === 'bot' ? 'self-start rounded-bl-sm border border-ink/10 bg-white' : 'self-end rounded-br-sm bg-[#1E6B69] text-white'}`}
              >
                {m.text}
              </div>
            ))}
            {thinking && <div className="px-1 font-mono text-[10px] text-muted-foreground">TourInsight AI is thinking…</div>}
            {proposal && (
              <div className="self-start rounded-2xl border-2 border-primary bg-white p-3 text-[13px] shadow">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-primary">Proposed change</div>
                <div className="font-semibold">
                  {proposal.kind === 'add_stop' ? 'Add' : 'Remove'} “{proposal.activity}” · Day {proposal.day_number}
                </div>
                {proposal.notes && <div className="mt-1 text-muted-foreground">{proposal.notes}</div>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={applying}
                    onClick={applyProposal}
                    className="rounded-lg bg-[#1E6B69] px-3 py-1.5 font-mono text-[10px] uppercase text-white disabled:opacity-50"
                  >
                    {applying ? 'Applying…' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    disabled={applying}
                    onClick={() => { setProposal(null); addMsg('Cancelled — no changes were made.', 'bot'); }}
                    className="rounded-lg border border-ink/30 px-3 py-1.5 font-mono text-[10px] uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {trip && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-2">
              {['Show my Day 1 plan', 'What places are saved?', 'What is my budget?', 'Emergency numbers'].map((q) => (
                <button key={q} type="button" onClick={() => quickAsk(q)} className="whitespace-nowrap rounded-full border border-ink/15 bg-white px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 border-t border-ink/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder="Ask about your trip…"
              className="min-w-0 flex-1 rounded-xl border border-ink/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1E6B69]"
            />
            <button type="button" onClick={() => submit()} disabled={thinking} aria-label="Send" className="rounded-xl bg-[#C15B3E] px-3.5 font-bold text-white disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}