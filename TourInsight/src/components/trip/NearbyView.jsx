import React, { useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { fetchNearbyEssentials, readCachedNearby, NEARBY_CATEGORY_META } from '@/lib/nearby';
import DestinationImage from '@/components/DestinationImage';
import { splitLocation } from '@/lib/placeImages';
import { haversineKm } from '@/lib/tripEngine';

export default function NearbyView({ trip }) {
  const lat = trip.destination_lat, lon = trip.destination_lon;
  const [radius, setRadius] = useState(5000); const [category, setCategory] = useState('all');
  const [result, setResult] = useState(() => lat != null && lon != null ? readCachedNearby(lat, lon, radius) : null);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const load = async () => {
    if (lat == null || lon == null) return;
    setLoading(true); setError('');
    try { setResult(await fetchNearbyEssentials(lat, lon, radius)); } catch (e) { setError(e.message || 'Nearby lookup failed'); }
    finally { setLoading(false); }
  };
  React.useEffect(() => { if (lat != null && lon != null) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [radius, lat, lon]);
  const items = useMemo(() => (result?.items || []).map((x)=>({ ...x, distance:haversineKm(lat,lon,x.lat,x.lon) })).filter((x)=>category==='all'||x.category===category).sort((a,b)=>a.distance-b.distance).slice(0,50), [result, category, lat, lon]);
  const loc = splitLocation(trip.destination);
  if (lat == null || lon == null) return <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-xl">Destination coordinates are unavailable, so nearby essentials cannot be searched yet.</div>;
  return <section className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">OpenStreetMap Data</div><h2 className="mt-1 font-heading text-2xl font-semibold">Nearby essentials</h2><p className="mt-2 text-xs text-muted-foreground">Hospitals, police, pharmacies, ATMs, fuel, restaurants, cafés, hotels and railway stations around {trip.destination}.</p></div><button onClick={load} disabled={loading} className="rounded-lg border border-border px-3 py-2 text-xs"><RefreshCw className={`mr-1 inline h-3.5 w-3.5 ${loading?'animate-spin':''}`} /> Refresh</button></div>
    <div className="mt-5 flex flex-wrap gap-2">{[2000,5000,10000].map((r)=><button key={r} onClick={()=>setRadius(r)} className={`rounded-full border px-3 py-1.5 text-xs ${radius===r?'border-[#1E6B69] bg-[#1E6B69] text-white':'border-border'}`}>{r/1000} km</button>)}</div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1"><button onClick={()=>setCategory('all')} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${category==='all'?'bg-primary text-primary-foreground':'border-border'}`}>All</button>{Object.entries(NEARBY_CATEGORY_META).map(([k,m])=><button key={k} onClick={()=>setCategory(k)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${category===k?'bg-primary text-primary-foreground':'border-border'}`}>{m.icon} {m.label}</button>)}</div>
    {loading && !result ? <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching nearby…</div> : null}
    {result?.stale ? <div className="mt-4 rounded-lg bg-[#C9A24B]/10 p-3 font-mono text-[10px] text-[#8a6731]">Showing a SAVED OFFLINE SNAPSHOT because fresh nearby data is unavailable.</div> : null}{error ? <div className="mt-4 text-sm text-destructive">{error}</div> : null}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((x)=><div key={x.id} className="flex overflow-hidden rounded-xl border border-border"><DestinationImage place={x.name} city={loc.city} state={loc.state} country={trip.country||''} variant="thumb" className="h-24 w-28 shrink-0" /><div className="min-w-0 p-3"><div className="truncate font-medium">{x.name}</div><div className="mt-1 text-xs text-muted-foreground">{NEARBY_CATEGORY_META[x.category]?.icon} {NEARBY_CATEGORY_META[x.category]?.label} · {x.distance.toFixed(1)} km</div></div></div>)}</div>
    {!loading && !items.length ? <div className="mt-6 text-sm text-muted-foreground">No matching places were returned for this radius.</div> : null}
  </section>;
}
