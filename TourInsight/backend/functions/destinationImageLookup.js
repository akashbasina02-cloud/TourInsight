import { buildPlaceKey, buildQueryChain } from './placeImageKey.js';
import { mutateDb, readDb } from '../lib/store.js';
import { makeRecord } from '../lib/entities.js';

const MAX_PLACES = 12;
const WIKI = 'https://en.wikipedia.org/w/api.php';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wikiSearch(query) {
  const url = new URL(WIKI);
  Object.entries({ action:'query', format:'json', origin:'*', generator:'search', gsrsearch:query, gsrlimit:'5', prop:'pageimages|info', inprop:'url', piprop:'thumbnail|original', pithumbsize:'640' }).forEach(([k,v]) => url.searchParams.set(k,v));
  const res = await fetch(url, { headers: { 'User-Agent': 'TourInsight/1.0 (educational travel planner)' } });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {}).sort((a,b) => (a.index||999)-(b.index||999));
  const page = pages.find((p) => p.thumbnail?.source || p.original?.source);
  if (!page) return null;
  const image = page.original?.source || page.thumbnail?.source;
  const thumb = page.thumbnail?.source || image;
  return { image_url:image, thumb_url:thumb.replace('/640px-','/320px-') };
}

export async function destinationImageLookup(payload) {
  const places = Array.isArray(payload?.places) ? payload.places.slice(0, MAX_PLACES) : [];
  const clean = places.map((p) => ({ place:String(p?.place||'').trim().slice(0,120), city:String(p?.city||'').trim().slice(0,120), state:String(p?.state||'').trim().slice(0,120), country:String(p?.country||'').trim().slice(0,120) })).filter((p)=>p.place);
  const keys = clean.map((p)=>buildPlaceKey(p.place,p.city,p.state,p.country));
  const db = await readDb();
  const cached = Object.fromEntries(db.DestinationImage.filter((r)=>keys.includes(r.cache_key)).map((r)=>[r.cache_key,r]));
  const results = {};
  for (const p of clean) {
    const key = buildPlaceKey(p.place,p.city,p.state,p.country);
    if (cached[key]) {
      const r = cached[key]; results[key] = { found:!!r.found, image_url:r.image_url||'', thumb_url:r.thumb_url||'', source:r.source||'wikipedia', status:'cached' }; continue;
    }
    let found = null; let transient = false;
    for (const q of buildQueryChain(p.place,p.city,p.state,p.country)) {
      try { found = await wikiSearch(q); } catch { transient = true; break; }
      if (found) break;
      await sleep(120);
    }
    if (transient) { results[key] = { found:false, image_url:'', thumb_url:'', status:'error' }; continue; }
    const record = { cache_key:key, ...p, image_url:found?.image_url||'', thumb_url:found?.thumb_url||'', source:found?'wikipedia':'none', found:!!found };
    await mutateDb((state) => { state.DestinationImage.push(makeRecord(record, null, { created_by_id:null })); });
    results[key] = { ...record, status:'fresh' };
  }
  return { results };
}
