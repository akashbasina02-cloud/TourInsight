import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { appClient } from '@/api/appClient';
import TopNav from '@/components/TopNav';
import { fmtRupee } from '@/lib/tripEngine';

export default function Dashboard() {
  const [trips, setTrips] = useState(null); const [error, setError] = useState(null); const [deletingId, setDeletingId] = useState(null);
  const load = useCallback(async () => { try { const list = await appClient.entities.Trip.list('-created_date', 50); setTrips(list); setError(null); } catch (e) { setError(e?.message || 'Could not load your trips'); } }, []);
  useEffect(() => { load(); }, [load]);
  const deleteTrip = async (trip) => {
    if (deletingId && deletingId !== trip.id) return;
    if (deletingId !== trip.id) { setDeletingId(trip.id); return; }
    setDeletingId('working:' + trip.id);
    try { await appClient.entities.TripStop.deleteMany({ trip_id: trip.id }); await appClient.entities.Trip.delete(trip.id); await load(); }
    catch (e) { setError('Could not delete the trip: ' + (e?.message || 'unknown error')); }
    finally { setDeletingId(null); }
  };
  return <div className="min-h-screen"><TopNav/><div className="mx-auto max-w-5xl px-4 py-10 pb-24"><div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Private dashboard</div><h1 className="font-heading text-3xl font-semibold sm:text-4xl">My trips</h1><p className="mt-2 text-sm text-muted-foreground">Every trip you generate is saved privately to your account — only you can open, edit or delete it.</p>
    {trips===null?<div className="mt-10 flex items-center gap-2 font-mono text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading your trips…</div>:null}
    {error?<div className="mt-6 rounded-xl border border-[#C15B3E]/40 bg-[#C15B3E]/10 p-4 font-mono text-xs text-[#a94d33]">{error}</div>:null}
    {trips?.length===0?<div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center"><MapPin className="mx-auto h-8 w-8 text-primary"/><p className="mt-3 font-mono text-xs text-muted-foreground">No trips yet — plan your first one.</p><Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#C15B3E] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-white">Plan a trip <ArrowRight className="h-4 w-4"/></Link></div>:null}
    {trips?.length>0?<div className="mt-8 grid gap-4 sm:grid-cols-2">{trips.map(t=><div key={t.id} className="flex flex-col rounded-2xl bg-card p-5 text-card-foreground shadow-xl"><div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#1E6B69]">{t.destination}</div><h2 className="font-heading text-xl font-semibold">{t.name||`${t.days}-day trip`}</h2><div className="mt-1.5 font-mono text-[11px] text-muted-foreground">{t.start_date?new Date(t.start_date+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Flexible'} · {t.days} day{t.days>1?'s':''} · {t.travellers||1} traveler{(t.travellers||1)>1?'s':''}</div>{t.budget_total?<div className="mt-2 font-mono text-sm font-semibold text-[#1E6B69]">{fmtRupee(t.budget_total)}</div>:null}<div className="mt-4 flex items-center gap-2"><Link to={`/trip/${t.id}`} className="flex-1 rounded-lg bg-[#1E6B69] px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-wide text-white">Open trip</Link><button type="button" onClick={()=>deleteTrip(t)} disabled={String(deletingId).startsWith('working:')} className={`rounded-lg border px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-wide ${deletingId===t.id?'border-[#C15B3E] bg-[#C15B3E] text-white':'border-border text-muted-foreground'}`}><Trash2 className="h-3.5 w-3.5"/>{deletingId===t.id?' · Confirm':''}</button></div></div>)}</div>:null}
  </div></div>;
}
