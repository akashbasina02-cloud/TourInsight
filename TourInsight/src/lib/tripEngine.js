/* TourInsight trip engine — deterministic itinerary generation, budget, transport,
   geocoding and weather helpers. Ported from the uploaded single-file app. */
import { TEMPLATES, findDestinationData } from './countryData';

/* ---------- Seeded RNG so the same inputs always produce the same trip ---------- */
function hashString(str) {
  let h = 1779033703;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Itinerary generation ---------- */
export function generateItinerary({
  destination,
  days,
  pace,
  interests,
  startDate,
}) {
  const numDays = Math.min(30, Math.max(1, parseInt(days) || 3));
  const stopsPerDay = parseInt(pace) || 3;
  const selectedInterests = interests && interests.length ? interests : ['history', 'food'];
  const curated = findDestinationData(destination);
  const rng = mulberry32(hashString(`${destination}|${numDays}|${stopsPerDay}|${selectedInterests.join(',')}`));

  const pools = {};
  selectedInterests.forEach((k) => {
    const source = curated && curated.places[k] && curated.places[k].length ? curated.places[k] : TEMPLATES[k];
    pools[k] = shuffle(source || [], rng);
  });

  const dayList = [];
  let interestCursor = 0;
  for (let d = 1; d <= numDays; d++) {
    const items = [];
    let clock = 9 * 60; // 9:00 AM
    for (let s = 0; s < stopsPerDay; s++) {
      const key = selectedInterests[interestCursor % selectedInterests.length];
      interestCursor++;
      let pool = pools[key];
      if (!pool.length) {
        const source = curated && curated.places[key] && curated.places[key].length ? curated.places[key] : TEMPLATES[key];
        pool = pools[key] = shuffle(source || [], rng);
      }
      const tmpl = pool.pop() || { a: 'Free time to explore', n: 'Open block — wander and see what you find', dur: 90 };
      const h = Math.floor(clock / 60);
      const m = clock % 60;
      const isCuratedTmpl = !!(curated && curated.places[key] && curated.places[key].includes(tmpl));
      items.push({
        time: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'),
        duration_minutes: tmpl.dur,
        place_name: isCuratedTmpl ? tmpl.a : tmpl.a + ' — ' + destination,
        activity: tmpl.a,
        notes: tmpl.n,
        rating: tmpl.r || null,
        tip: tmpl.tip || null,
      });
      clock += tmpl.dur + 40; // 40 min gap between stops
    }
    dayList.push({ day: d, items });
  }

  return {
    trip_title: numDays + '-Day ' + destination + ' Itinerary',
    days: dayList,
    startDate,
    destination,
    interests: selectedInterests,
    stopsPerDay,
  };
}

/* ---------- Transportation estimate (planning estimate only — no live fares) ---------- */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const TRANSPORT_PROFILES = {
  flight: { perKm: 6.5, minFare: 2500, routeMultiplier: 1.15, label: 'Flight', icon: '✈️' },
  train: { perKm: 1.4, minFare: 300, routeMultiplier: 1.25, label: 'Train', icon: '🚆' },
  bus: { perKm: 1.1, minFare: 250, routeMultiplier: 1.3, label: 'Bus', icon: '🚌' },
  car: { perKm: 7.5, minFare: 500, routeMultiplier: 1.25, label: 'Car (self-drive, fuel only)', icon: '🚗' },
  ship: { perKm: 3.5, minFare: 3500, routeMultiplier: 1.4, label: 'Ship / Cruise', icon: '🚢' },
};

export function estimateTransport(straightLineKm, mode) {
  const profile = TRANSPORT_PROFILES[mode] || TRANSPORT_PROFILES.flight;
  const routeKm = straightLineKm * profile.routeMultiplier;
  const oneWay = Math.max(profile.minFare, (Math.round(routeKm * profile.perKm / 100) * 100));
  return {
    mode,
    label: profile.label,
    icon: profile.icon,
    distanceKm: Math.round(routeKm),
    oneWay,
    returnFare: oneWay,
    roundTrip: oneWay * 2,
  };
}

/* ---------- Budget (INR planning estimates) ---------- */
export const BUDGET_RATES = {
  budget: { stay: 700, food: 350, localTransport: 250, label: 'Budget' },
  standard: { stay: 2200, food: 800, localTransport: 600, label: 'Standard' },
  premium: { stay: 5500, food: 1600, localTransport: 1400, label: 'Premium' },
};
export const GUIDE_RATES = { budget: 1200, standard: 2500, premium: 4500 };
export const EMERGENCY_BUFFER_PCT = 0.08;

export function fmtRupee(n) {
  return '₹' + Math.round(n || 0).toLocaleString('en-IN');
}

export function computeBudgetBreakdown(trip, stopsCount) {
  const level = trip.hotel_preference || 'standard';
  const rates = BUDGET_RATES[level];
  const days = trip.days || 3;
  const nights = Math.max(days - 1, 1);
  const travelers = trip.travellers || 1;
  const rooms = Math.max(1, Math.ceil(travelers / 2));
  const transport = trip.transport_json || null;

  const outbound = transport ? transport.oneWay * travelers : null;
  const returnFare = transport ? transport.returnFare * travelers : null;
  const transportTotal = outbound !== null && returnFare !== null ? outbound + returnFare : 0;

  const stayTotal = rates.stay * nights * rooms;
  const foodTotal = rates.food * days * travelers;
  const localTransportTotal = rates.localTransport * days * travelers;
  const totalStops = stopsCount != null ? stopsCount : days * (trip.pace || 3);
  const attractionPerStop = level === 'budget' ? 40 : level === 'premium' ? 150 : 80;
  const attractionsTotal = totalStops * attractionPerStop * travelers;
  const guideTotal = trip.guide_requested ? GUIDE_RATES[level] * days : 0;

  const subtotal = transportTotal + stayTotal + foodTotal + localTransportTotal + attractionsTotal + guideTotal;
  const emergencyBuffer = Math.round(subtotal * EMERGENCY_BUFFER_PCT);
  const grandTotal = subtotal + emergencyBuffer;

  return {
    level, rates, days, nights, travelers, rooms, outbound, returnFare, transportTotal,
    stayTotal, foodTotal, localTransportTotal, totalStops, attractionPerStop, attractionsTotal,
    guideTotal, emergencyBuffer, grandTotal,
  };
}

/* ---------- Geocoding + weather (Open-Meteo — free, no key) ---------- */
const GEO_CACHE_KEY = 'tourinsight.geocache.v1';

function geoCache() {
  try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}'); } catch (e) { return {}; }
}
function geoCachePut(query, coords) {
  try {
    const cache = geoCache();
    cache[query] = { ...coords, _t: Date.now() };
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch (e) { /* storage unavailable — fine */ }
}

export async function geocodeDestination(name) {
  const key = String(name || '').toLowerCase().trim();
  if (!key) return null;
  const cached = geoCache()[key];
  if (cached && cached.lat != null) return { lat: cached.lat, lon: cached.lon };
  try {
    const res = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) + '&count=1');
    const data = await res.json();
    if (data.results && data.results[0]) {
      const coords = { lat: data.results[0].latitude, lon: data.results[0].longitude };
      geoCachePut(key, coords);
      return coords;
    }
  } catch (e) { /* caller handles null */ }
  return null;
}

export async function fetchWeather(lat, lon, startDate, days) {
  const fmt = (d) => d.toISOString().split('T')[0];
  const end = new Date(startDate);
  end.setDate(end.getDate() + Math.min(days, 16) - 1);
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=' + fmt(startDate) + '&end_date=' + fmt(end);
  const res = await fetch(url);
  if (!res.ok) throw new Error('forecast unavailable');
  const data = await res.json();
  return data.daily ? { ...data.daily, weathercode: data.daily.weathercode || data.daily.weather_code || [] } : null;
}

export const WEATHER_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌦️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};
export function weatherIcon(code) {
  return WEATHER_ICONS[code] || '🌡️';
}

/* ---------- Emergency numbers (India) ---------- */
export const TI_EMERGENCY = [
  { label: 'National Emergency', number: '112' },
  { label: 'Ambulance', number: '102' },
  { label: 'Medical Helpline', number: '104' },
  { label: 'Disaster Management', number: '108' },
  { label: 'Women Helpline', number: '181' },
  { label: 'Women in Distress', number: '1091' },
  { label: 'Tourist Helpline', number: '1363' },
  { label: 'Police', number: '100' },
  { label: 'Fire', number: '101' },
];

/* ---------- Calendar (.ics) export ---------- */
function toICSDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
}
function icsEscape(str) {
  return String(str || '').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
}
export function buildIcsText(trip, stops) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TourInsight//Smart Travel Planner//EN'];
  const startDate = trip.start_date ? new Date(trip.start_date + 'T00:00:00') : new Date();
  const byDay = {};
  (stops || []).forEach((s) => {
    if (!byDay[s.day_number]) byDay[s.day_number] = [];
    byDay[s.day_number].push(s);
  });
  Object.keys(byDay).forEach((dayNum) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (Number(dayNum) - 1));
    byDay[dayNum].forEach((stop) => {
      const [h, m] = String(stop.time || '09:00').split(':').map(Number);
      const start = new Date(dayDate);
      start.setHours(h || 9, m || 0, 0, 0);
      const end = new Date(start.getTime() + 90 * 60000);
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + stop.id + '@tourinsight');
      lines.push('DTSTAMP:' + toICSDate(new Date()));
      lines.push('DTSTART:' + toICSDate(start));
      lines.push('DTEND:' + toICSDate(end));
      lines.push('SUMMARY:' + icsEscape(stop.activity));
      lines.push('DESCRIPTION:' + icsEscape(stop.notes || ''));
      lines.push('LOCATION:' + icsEscape(stop.activity + ', ' + (trip.destination || '')));
      lines.push('END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}