/* Nearby essentials lookup via Overpass API (OpenStreetMap), cached per area. */
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const CACHE_KEY = 'tourinsight.nearby.v1';

export const NEARBY_CATEGORY_META = {
  hospital: { label: 'Hospitals', icon: '🏥' },
  police: { label: 'Police', icon: '👮' },
  pharmacy: { label: 'Pharmacies', icon: '💊' },
  atm: { label: 'ATMs', icon: '🏧' },
  bank: { label: 'Banks', icon: '🏦' },
  fuel: { label: 'Fuel', icon: '⛽' },
  restaurant: { label: 'Restaurants', icon: '🍽️' },
  cafe: { label: 'Cafés', icon: '☕' },
  hotel: { label: 'Hotels', icon: '🏨' },
  station: { label: 'Railway stations', icon: '🚉' },
};
function categorize(tags) {
  if (tags.amenity && NEARBY_CATEGORY_META[tags.amenity]) return tags.amenity;
  if (tags.tourism === 'hotel') return 'hotel';
  if (tags.railway === 'station') return 'station';
  return null;
}
function readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } }
function writeCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* ignore */ } }
export function nearbyCacheKey(lat, lon, radiusM) { return `${lat.toFixed(2)},${lon.toFixed(2)},${radiusM}`; }
export function readCachedNearby(lat, lon, radiusM) {
  const entry = readCache()[nearbyCacheKey(lat, lon, radiusM)];
  return entry ? { ...entry, stale: true } : null;
}
export async function fetchNearbyEssentials(lat, lon, radiusM = 5000) {
  const key = nearbyCacheKey(lat, lon, radiusM);
  const query = `[out:json][timeout:25];\n(\n  nwr["amenity"~"^(hospital|police|pharmacy|atm|bank|fuel|restaurant|cafe)$"](around:${radiusM},${lat},${lon});\n  nwr["tourism"="hotel"](around:${radiusM},${lat},${lon});\n  nwr["railway"="station"](around:${radiusM},${lat},${lon});\n);\nout center 80;`;
  try {
    const res = await fetch(OVERPASS_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(query) });
    if (!res.ok) throw new Error('Overpass unavailable');
    const data = await res.json();
    const items = (data.elements || []).map((el) => ({
      id: `${el.type}/${el.id}`,
      name: (el.tags && (el.tags.name || el.tags['name:en'])) || 'Unnamed',
      category: el.tags ? categorize(el.tags) : null,
      lat: el.lat != null ? el.lat : el.center ? el.center.lat : null,
      lon: el.lon != null ? el.lon : el.center ? el.center.lon : null,
    })).filter((i) => i.category && i.lat != null);
    const cache = readCache();
    cache[key] = { items, savedAt: new Date().toISOString() };
    writeCache(cache);
    return { items, stale: false };
  } catch (e) {
    const cached = readCachedNearby(lat, lon, radiusM);
    if (cached) return cached;
    throw e;
  }
}
