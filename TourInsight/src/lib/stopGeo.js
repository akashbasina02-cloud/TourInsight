/* Per-stop geocoding via OpenStreetMap Nominatim (browser, throttled + cached). */
const CACHE_KEY = 'tourinsight.nominatim.v1';
function readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } }
function writeCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* ignore */ } }
export async function geocodeStop(activity, destination) {
  const q = `${activity}, ${destination}`;
  const key = q.toLowerCase().trim();
  const cache = readCache();
  if (cache[key]) return cache[key].lat != null ? { lat: cache[key].lat, lon: cache[key].lon } : null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { 'Accept-Language': 'en' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        cache[key] = coords; writeCache(cache); return coords;
      }
    }
  } catch { /* fall through */ }
  cache[key] = { lat: null, lon: null }; writeCache(cache); return null;
}
export async function geocodeStops(stops, destination, onProgress) {
  const out = [];
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    if (stop.lat != null && stop.lon != null) out.push(stop);
    else {
      const coords = await geocodeStop(stop.activity, destination);
      out.push(coords ? { ...stop, lat: coords.lat, lon: coords.lon } : stop);
    }
    if (onProgress) onProgress(i + 1, stops.length);
    if (i < stops.length - 1) await new Promise((r) => setTimeout(r, 1100));
  }
  return out;
}
