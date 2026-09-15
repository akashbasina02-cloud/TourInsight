import React from 'react';
import { ShieldCheck, Phone } from 'lucide-react';
import { TI_EMERGENCY } from '@/lib/tripEngine';

function riskFor(trip) {
  const weather = trip.weather_json;
  const codes = weather?.weathercode || [];
  const severe = codes.some((c) => [65,75,82,95,96,99].includes(Number(c)));
  const rainy = codes.some((c) => [61,63,80,81].includes(Number(c)));
  const items = [
    { label:'Weather risk', level: severe ? 'High' : rainy ? 'Moderate' : 'Low', note: severe ? 'Saved forecast includes potentially severe weather.' : rainy ? 'Rain is possible in the saved forecast.' : 'No severe weather signal in the saved forecast.' },
    { label:'Transport risk', level: trip.transport_mode === 'car' ? 'Moderate' : 'Low', note: trip.transport_mode === 'car' ? 'Allow rest breaks and avoid fatigue on long self-drive legs.' : 'Use verified operators and keep tickets/IDs accessible.' },
    { label:'Crowd risk', level:'Low', note:'Crowd conditions are not live; verify locally at popular attractions.' },
    { label:'Safety context', level: trip.women_travelling ? 'Moderate' : 'Low', note: trip.women_travelling ? 'Use well-reviewed transport, share plans, and prefer well-lit public areas at night.' : 'Keep emergency contacts and trip details accessible.' },
  ];
  const order = { Low:0, Moderate:1, High:2 }; const overall = items.reduce((a,x) => order[x.level] > order[a] ? x.level : a, 'Low');
  return { items, overall };
}
export default function SafetyView({ trip }) {
  const { items, overall } = riskFor(trip);
  const levelClass = overall === 'High' ? 'text-[#C15B3E]' : overall === 'Moderate' ? 'text-[#9a6a17]' : 'text-[#0f766e]';
  return <section className="space-y-5">
    <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-7"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]"><ShieldCheck className="h-4 w-4" /> Trip safety indicator</div><h2 className="mt-2 font-heading text-2xl font-semibold">Safety overview</h2><div className={`mt-3 font-heading text-3xl font-semibold ${levelClass}`}>{overall} risk</div><p className="mt-2 text-xs text-muted-foreground">This is a heuristic planning indicator based on saved trip context and weather. It is not a live security intelligence service.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{items.map((x)=><div key={x.label} className="rounded-xl border border-border p-4"><div className="flex justify-between gap-3"><strong>{x.label}</strong><span className="font-mono text-[10px] uppercase text-muted-foreground">{x.level}</span></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{x.note}</p></div>)}</div>
    </div>
    <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-7"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C15B3E]">Emergency contacts · India</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{TI_EMERGENCY.map((x)=><a key={x.label} href={`tel:${x.number}`} className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-[#C15B3E]/50"><span className="text-sm">{x.label}</span><span className="flex items-center gap-1 font-mono text-sm font-semibold"><Phone className="h-3.5 w-3.5" />{x.number}</span></a>)}</div>
      <div className="mt-5 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Travel tips:</strong> Keep ID copies, emergency contacts, accommodation details and a charged phone/power bank. Avoid isolated areas late at night, verify transport before boarding, and tell someone your route. {trip.women_travelling ? 'For women/girls travelling, prefer verified cabs/guides, share live trip details when online, and use official helplines if assistance is needed.' : ''}</div>
    </div>
  </section>;
}
