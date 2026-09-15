import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { findDestinationData } from '@/lib/countryData';

const INTERESTS = [
  ['history','History & Temples'],['food','Food'],['nature','Nature'],['art','Art & Culture'],
  ['nightlife','Nightlife'],['shopping','Shopping'],['beaches','Beaches'],['offbeat','Offbeat']
];
const today = () => new Date().toISOString().slice(0,10);
const defaults = { origin:'', destination:'', start_date:today(), days:3, travellers:1, pace:3, transport_mode:'flight', hotel_preference:'standard', custom_budget:'', interests:['history','food'], women_travelling:false, guide_requested:false };

export default function PlannerForm({ initial = {}, resetSignal = 0, onGenerate, generating, status }) {
  const [form, setForm] = useState({ ...defaults, ...initial });
  useEffect(() => { setForm((f) => ({ ...defaults, ...f, ...initial })); }, [resetSignal, initial]);
  const destData = useMemo(() => findDestinationData(form.destination), [form.destination]);
  const set = (k,v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (key) => setForm((f) => ({ ...f, interests: f.interests.includes(key) ? f.interests.filter((x) => x !== key) : [...f.interests, key] }));
  const submit = (e) => { e.preventDefault(); onGenerate?.({ ...form, interests: form.interests.length ? form.interests : ['history','food'] }); };
  return <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-2xl sm:p-7">
    <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]"><Sparkles className="h-4 w-4" /> Smart Trip Planner</div>
    <h2 className="font-heading text-2xl font-semibold sm:text-3xl">Build a personalized trip in minutes.</h2>
    <p className="mt-2 text-sm text-muted-foreground">Your inputs drive a deterministic itinerary, planning budget, route and weather snapshot. Live booking prices are not invented.</p>
    <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
      <Field label="Starting location"><input value={form.origin} onChange={(e)=>set('origin',e.target.value)} placeholder="Visakhapatnam" className="ti-input" /></Field>
      <Field label="Destination"><input required value={form.destination} onChange={(e)=>set('destination',e.target.value)} placeholder="Hyderabad" className="ti-input" /></Field>
      <Field label="Start date"><input type="date" value={form.start_date} onChange={(e)=>set('start_date',e.target.value)} className="ti-input" /></Field>
      <Field label="Preferred transport"><select value={form.transport_mode} onChange={(e)=>set('transport_mode',e.target.value)} className="ti-input"><option value="flight">Flight</option><option value="train">Train</option><option value="bus">Bus</option><option value="car">Car</option><option value="ship">Ship / Cruise</option></select></Field>
      <Field label="Days"><input type="number" min="1" max="30" value={form.days} onChange={(e)=>set('days',e.target.value)} className="ti-input" /></Field>
      <Field label="Travellers"><input type="number" min="1" max="20" value={form.travellers} onChange={(e)=>set('travellers',e.target.value)} className="ti-input" /></Field>
      <Field label="Stops per day"><select value={form.pace} onChange={(e)=>set('pace',e.target.value)} className="ti-input"><option value="2">Relaxed · 2</option><option value="3">Balanced · 3</option><option value="4">Packed · 4</option></select></Field>
      <Field label="Hotel preference"><select value={form.hotel_preference} onChange={(e)=>set('hotel_preference',e.target.value)} className="ti-input"><option value="budget">Budget</option><option value="standard">Standard / 3 Star</option><option value="premium">Premium</option></select></Field>
      <Field label="Total budget (optional)"><input type="number" min="0" value={form.custom_budget} onChange={(e)=>set('custom_budget',e.target.value)} placeholder="20000" className="ti-input" /></Field>
      <div className="md:col-span-2"><div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Interests</div><div className="flex flex-wrap gap-2">{INTERESTS.map(([key,label]) => <button key={key} type="button" onClick={()=>toggleInterest(key)} className={`rounded-full border px-3 py-2 text-xs transition ${form.interests.includes(key) ? 'border-[#1E6B69] bg-[#1E6B69] text-white' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}>{label}</button>)}</div></div>
      {destData?.places ? <div className="md:col-span-2 rounded-xl border border-[#1E6B69]/30 bg-[#1E6B69]/5 p-4 text-xs text-muted-foreground"><span className="font-medium text-foreground">Destination data available.</span> TourInsight has curated activity pools for {form.destination}.</div> : null}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.women_travelling} onChange={(e)=>set('women_travelling',e.target.checked)} /> Women / girls travelling</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.guide_requested} onChange={(e)=>set('guide_requested',e.target.checked)} /> Include guide estimate</label>
      <div className="md:col-span-2"><button disabled={generating} className="w-full rounded-xl bg-[#C15B3E] px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-white hover:bg-[#a94d33] disabled:opacity-60"><Sparkles className="mr-2 inline h-4 w-4" /> {generating ? 'Generating smart trip…' : 'Generate Smart Trip'}</button>{status ? <div className="mt-3 font-mono text-[11px] text-muted-foreground">{status}</div> : null}</div>
    </form>
  </div>;
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>{children}</label>; }
