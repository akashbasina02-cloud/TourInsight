import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Loader2, Phone, Star } from 'lucide-react';
import { appClient } from '@/api/appClient';
import DestinationImage from '@/components/DestinationImage';
import { normalizeCountryName } from '@/lib/countryData';
import { splitLocation } from '@/lib/placeImages';

export default function GuideView({ trip, onTripChanged }) {
  const [guides, setGuides] = useState(null); const [reviews, setReviews] = useState({}); const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ guide_id:'', rating:5, comment:'' });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await appClient.entities.Guide.list('-rating', 100);
        if (!alive) return;
        setGuides(all || []);
        const pairs = await Promise.all((all || []).map(async (g) => [g.id, await appClient.entities.GuideReview.filter({ guide_id:g.id }, '-created_date', 20).catch(()=>[])]));
        if (alive) setReviews(Object.fromEntries(pairs));
      } catch (e) { if (alive) { setGuides([]); setError(e.message || 'Could not load guides'); } }
    })();
    return () => { alive = false; };
  }, []);
  const loc = splitLocation(trip.destination);
  const matches = useMemo(() => {
    if (!guides) return null;
    const d = trip.destination.toLowerCase(); const c = normalizeCountryName(trip.country || '').toLowerCase();
    return guides.filter((g) => !g.destination && !g.country || String(g.destination||'').toLowerCase().includes(d) || d.includes(String(g.destination||'').toLowerCase()) || (c && normalizeCountryName(g.country||'').toLowerCase() === c));
  }, [guides, trip]);
  const choose = async (g) => { setBusy(g.id); try { await appClient.entities.Trip.update(trip.id, { guide_id:g.id, guide_requested:true }); await onTripChanged?.(); } catch (e) { setError(e.message); } finally { setBusy(''); } };
  const submitReview = async (e, guide) => {
    e.preventDefault(); if (!reviewForm.comment.trim()) return; setBusy('review:'+guide.id);
    try {
      const r = await appClient.entities.GuideReview.create({ guide_id:guide.id, trip_id:trip.id, rating:Number(reviewForm.rating), comment:reviewForm.comment.trim() });
      setReviews((v)=>({ ...v, [guide.id]:[r,...(v[guide.id]||[])] })); setReviewForm({ guide_id:'', rating:5, comment:'' });
    } catch (e) { setError(e.message || 'Could not add review'); } finally { setBusy(''); }
  };
  if (guides === null) return <div className="flex items-center gap-2 rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-xl"><Loader2 className="h-4 w-4 animate-spin" /> Loading guides…</div>;
  return <section className="space-y-4"><div className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-7"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">Local guide ecosystem</div><h2 className="mt-1 font-heading text-2xl font-semibold">Guides for {trip.destination}</h2><p className="mt-2 text-xs text-muted-foreground">Guide records are community or starter data. Verified badges are shown only when the guide record is marked verified.</p>{error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}</div>
    {matches?.length ? matches.map((g)=>{
      const rs = reviews[g.id] || []; const avg = rs.length ? rs.reduce((n,x)=>n+Number(x.rating||0),0)/rs.length : Number(g.rating||0);
      return <article key={g.id} className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-xl"><DestinationImage place={g.destination || trip.destination} city={loc.city} state={loc.state} country={g.country || trip.country || ''} className="h-40 w-full" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-heading text-xl font-semibold">{g.name}</h3>{g.verified ? <BadgeCheck className="h-5 w-5 text-[#1E6B69]" /> : null}</div><div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-4 w-4 fill-current text-primary" /> {avg ? avg.toFixed(1) : 'New'} {rs.length ? `· ${rs.length} review${rs.length>1?'s':''}`:''}</div></div><button disabled={busy===g.id} onClick={()=>choose(g)} className={`rounded-xl px-4 py-2.5 font-mono text-[10px] uppercase ${trip.guide_id===g.id?'bg-[#1E6B69]/15 text-[#0f766e]':'bg-[#1E6B69] text-white'}`}>{busy===g.id?'Saving…':trip.guide_id===g.id?'Selected':'Select guide'}</button></div>
        <div className="mt-4 flex flex-wrap gap-2">{(g.languages||[]).map((x)=><span key={x} className="rounded-full bg-muted px-2.5 py-1 text-xs">{x}</span>)}{(g.specialties||[]).map((x)=><span key={x} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-[#8a6731]">{x}</span>)}</div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm"><span><strong>₹{Number(g.price_per_day||0).toLocaleString('en-IN')}</strong> / day</span>{g.phone ? <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-[#1E6B69]"><Phone className="h-3.5 w-3.5" />{g.phone}</a> : null}</div>
        {rs.length ? <div className="mt-5 space-y-2"><div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Public reviews</div>{rs.slice(0,5).map((r)=><div key={r.id} className="rounded-xl bg-muted p-3 text-sm"><span className="font-medium">{'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||0)))}</span><p className="mt-1 text-muted-foreground">{r.comment}</p></div>)}</div> : null}
        <form onSubmit={(e)=>submitReview(e,g)} className="mt-5 grid gap-2 sm:grid-cols-[120px_1fr_auto]"><select value={reviewForm.guide_id===g.id?reviewForm.rating:5} onChange={(e)=>setReviewForm({ ...reviewForm, guide_id:g.id, rating:Number(e.target.value) })} className="ti-input"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input value={reviewForm.guide_id===g.id?reviewForm.comment:''} onChange={(e)=>setReviewForm({ ...reviewForm, guide_id:g.id, comment:e.target.value })} placeholder="Share a review" className="ti-input" /><button className="rounded-lg bg-[#C15B3E] px-4 py-2 text-xs text-white" disabled={busy==='review:'+g.id}>Post</button></form>
      </div></article>;
    }) : <div className="rounded-2xl bg-card p-7 text-sm text-muted-foreground shadow-xl">No matching guide records are available for this destination yet.</div>}
  </section>;
}
