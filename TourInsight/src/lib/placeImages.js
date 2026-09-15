/* Wikipedia/Wikimedia destination images with server and device caching. */
import { appClient } from '@/api/appClient';
export const FALLBACK_IMAGE = '/tourinsight-fallback.svg';
const DEVICE_KEY = 'tourinsight.placeImages.v1';
const MAX_BATCH = 12;
const MAX_DEVICE_ENTRIES = 300;
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' '); }
export function placeImageKey(place, city, state, country) { return [norm(place), norm(city), norm(state), norm(country)].filter(Boolean).join('|'); }
export function splitLocation(destination) {
  const parts = String(destination || '').split(',').map((s) => s.trim()).filter(Boolean);
  return { city: parts[0] || '', state: parts[1] || '' };
}
function readDeviceCache() { try { return JSON.parse(localStorage.getItem(DEVICE_KEY) || '{}'); } catch { return {}; } }
function writeDeviceCache(cache) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_DEVICE_ENTRIES) keys.slice(0, keys.length - MAX_DEVICE_ENTRIES).forEach((k) => delete cache[k]);
    localStorage.setItem(DEVICE_KEY, JSON.stringify(cache));
  } catch { /* best effort */ }
}
const queue = [];
let flushTimer = null;
function scheduleLookup(place) {
  return new Promise((resolve) => {
    queue.push({ place, resolve });
    if (!flushTimer) flushTimer = setTimeout(flushQueue, 80);
  });
}
async function flushQueue() {
  flushTimer = null;
  const batch = queue.splice(0, queue.length);
  const cache = readDeviceCache();
  const toSearch = [];
  const seen = new Set();
  batch.forEach(({ place }) => {
    const key = placeImageKey(place.place, place.city, place.state, place.country);
    if (cache[key] || seen.has(key)) return;
    seen.add(key); toSearch.push({ place: place.place, city: place.city, state: place.state, country: place.country, key });
  });
  for (let i = 0; i < toSearch.length; i += MAX_BATCH) {
    const chunk = toSearch.slice(i, i + MAX_BATCH);
    let serverResults = {};
    try {
      const res = await appClient.functions.invoke('destinationImageLookup', { places: chunk.map(({ key, ...rest }) => rest) });
      serverResults = (res && res.data && res.data.results) || {};
    } catch { serverResults = {}; }
    Object.entries(serverResults).forEach(([key, r]) => {
      if (!r || r.status === 'error') return;
      cache[key] = { image_url: r.image_url || '', thumb_url: r.thumb_url || r.image_url || '', found: !!r.found, notFound: !r.found };
    });
  }
  writeDeviceCache(cache);
  batch.forEach(({ place, resolve }) => resolve(cache[placeImageKey(place.place, place.city, place.state, place.country)] || null));
}
export async function getPlaceImages(places) {
  const entries = (places || []).filter((p) => p && String(p.place || '').trim());
  const results = await Promise.all(entries.map((p) => scheduleLookup(p)));
  const out = {};
  entries.forEach((p, i) => { if (results[i]) out[placeImageKey(p.place, p.city, p.state, p.country)] = results[i]; });
  return out;
}
export async function getPlaceImage(place) { return scheduleLookup(place); }
async function toDataUrl(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size > 400000) return null;
    return await new Promise((resolve) => {
      const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(blob);
    });
  } catch { return null; }
}
export async function buildPackImages(trip, stops) {
  if (!trip || !trip.destination) return {};
  const destLoc = splitLocation(trip.destination); const country = trip.country || '';
  const places = [{ place: trip.destination, city: destLoc.city, state: destLoc.state, country }];
  const seen = new Set([norm(trip.destination)]);
  (stops || []).forEach((s) => {
    const name = String(s.place_name || s.activity || '').trim();
    if (name && !seen.has(norm(name))) { seen.add(norm(name)); places.push({ place: name, city: destLoc.city, state: destLoc.state, country }); }
  });
  try {
    const results = await getPlaceImages(places.slice(0, MAX_BATCH)); const dataUrls = {};
    await Promise.all(Object.entries(results).filter(([, r]) => r && r.found && r.thumb_url).slice(0, MAX_BATCH).map(async ([key, r]) => {
      const d = await toDataUrl(r.thumb_url); if (d) dataUrls[key] = d;
    }));
    const fallbackData = await toDataUrl(FALLBACK_IMAGE); if (fallbackData) dataUrls.fallback = fallbackData;
    return dataUrls;
  } catch { return {}; }
}
