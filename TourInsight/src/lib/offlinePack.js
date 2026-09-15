/* TourInsight Offline Trip Pack — standalone, self-contained HTML trip file with a
   real coordinate-based map snapshot, plus localStorage snapshot for the in-app
   offline assistant. No network is needed to open the downloaded file. */
import { TI_EMERGENCY, computeBudgetBreakdown, fmtRupee } from './tripEngine';
import { placeImageKey, splitLocation } from './placeImages';

const PACK_KEY = 'tourinsight.offline.pack.v1';

export function savePackLocal(bundle) {
  try { localStorage.setItem(PACK_KEY, JSON.stringify(bundle)); } catch (e) { return false; }
  return true;
}
export function loadPackLocal() {
  try { return JSON.parse(localStorage.getItem(PACK_KEY) || 'null'); } catch (e) { return null; }
}

export function uniquePlaces(trip, stops) {
  const seen = new Set();
  const out = [];
  (stops || []).forEach((s) => {
    if (s.activity && !seen.has(s.activity)) {
      seen.add(s.activity);
      out.push({ name: s.activity, day: s.day_number, time: s.time || '', notes: s.notes || '', tip: s.tip || '' });
    }
  });
  return out;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* SVG snapshot of a day's route, projected from real stop coordinates where available
   (clearly a saved snapshot — not a live map), with schematic fallback. */
export function buildSvgDayMap(dayNumber, stops, destination) {
  const mapped = (stops || []).filter((s) => s.day_number === dayNumber && s.lat != null && s.lon != null);
  if (mapped.length >= 2) {
    const lats = mapped.map((s) => s.lat);
    const lons = mapped.map((s) => s.lon);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const spanLat = maxLat - minLat || 0.01;
    const spanLon = maxLon - minLon || 0.01;
    const W = 560, H = 320, P = 44;
    const pts = mapped.map((s, i) => ({
      x: P + ((s.lon - minLon) / spanLon) * (W - 2 * P),
      y: H - P - ((s.lat - minLat) / spanLat) * (H - 2 * P),
      stop: s, i,
    }));
    const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const nodes = pts.map((p) => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" fill="#0D9488" stroke="#fff" stroke-width="3"/>
      <text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="10" font-family="Arial" font-weight="700">${p.i + 1}</text>
      <text x="${Math.min(Math.max(p.x, 78), W - 78).toFixed(1)}" y="${Math.max(p.y - 20, 14).toFixed(1)}" text-anchor="middle" fill="#0F172A" font-size="10" font-family="Arial">${esc(p.stop.activity).slice(0, 34)}</text>`).join('');
    return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Saved offline map snapshot for day ${dayNumber}" style="width:100%;display:block;background:linear-gradient(#f6f2e8,#edf4f2)">
      <path d="${path}" fill="none" stroke="#C29B38" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>${nodes}</svg>`, geo: true };
  }
  // Schematic fallback when stops could not be located on the map
  const items = (stops || []).filter((s) => s.day_number === dayNumber);
  const count = Math.max(items.length, 1);
  const height = Math.max(290, 96 + count * 92);
  const xA = 92, xB = 292;
  const pts = items.map((item, i) => ({ x: i % 2 === 0 ? xA : xB, y: 70 + i * 88, item }));
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
  const nodes = pts.map((p, i) => `
      <circle cx="${p.x}" cy="${p.y}" r="16" fill="#0D9488" stroke="#fff" stroke-width="4"/>
      <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="#fff" font-size="11" font-family="Arial" font-weight="700">${i + 1}</text>
      <text x="${p.x < 190 ? p.x + 30 : p.x - 30}" y="${p.y - 2}" text-anchor="${p.x < 190 ? 'start' : 'end'}" fill="#0F172A" font-size="12" font-family="Arial" font-weight="700">${esc(p.item.activity).slice(0, 38)}</text>
      <text x="${p.x < 190 ? p.x + 30 : p.x - 30}" y="${p.y + 15}" text-anchor="${p.x < 190 ? 'start' : 'end'}" fill="#5c6777" font-size="10" font-family="Arial">${esc(p.item.time || '')}</text>`).join('');
  return { svg: `<svg viewBox="0 0 560 ${height}" role="img" aria-label="Saved offline route map for day ${dayNumber}" style="width:100%;display:block;background:linear-gradient(#f6f2e8,#edf4f2)">
      <path d="${path}" fill="none" stroke="#C29B38" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>${nodes}</svg>`, geo: false };
}

export function buildStandaloneHtml(bundle) {
  const { trip, stops, budget, emergency, places, savedAt, images } = bundle;
  const destLoc = splitLocation(trip.destination);
  const imgFor = (name) => (images ? images[placeImageKey(name, destLoc.city, destLoc.state, trip.country || '')] || images.fallback || null : null);
  const destImg = imgFor(trip.destination);
  const safeData = JSON.stringify({ trip, stops, budget: budget ? {
    grandTotal: budget.grandTotal, stayTotal: budget.stayTotal, foodTotal: budget.foodTotal,
    localTransportTotal: budget.localTransportTotal, attractionsTotal: budget.attractionsTotal,
  } : null, emergency: emergency || TI_EMERGENCY }).replace(/</g, '\\u003c');
  const dayNumbers = [...new Set((stops || []).map((s) => s.day_number))].sort((a, b) => a - b);
  const maps = dayNumbers.map((d) => {
    const { svg, geo } = buildSvgDayMap(d, stops, trip.destination);
    return `<div class="ti-route-card"><div class="ti-route-head"><strong>${esc(trip.destination)} · Day ${d}</strong><span>${geo ? 'Saved map snapshot · real stop locations' : 'Offline route map · schematic'}</span></div>${svg}</div>`;
  }).join('');
  const itinerary = dayNumbers.map((d) => `
    <section class="day"><h2>Day ${d}</h2>${(stops || []).filter((s) => s.day_number === d).map((x, i) => {
      const img = imgFor(x.place_name || x.activity);
      return `
      <article>${img ? `<img class="stopimg" src="${img}" alt="${esc(x.activity)}">` : ''}<span>${esc(x.time)}</span><div><b>${i + 1}. ${esc(x.activity)}</b><p>${esc(x.notes || '')}</p>${x.tip ? `<small>Tip: ${esc(x.tip)}</small>` : ''}</div></article>`;
    }).join('')}
    </section>`).join('');
  const placeHtml = (places || []).map((p, i) => `<li><b>${i + 1}. ${esc(p.name)}</b><span>Day ${p.day}${p.time ? ' · ' + esc(p.time) : ''}</span></li>`).join('');
  const emergencyHtml = (emergency || TI_EMERGENCY).map((x) => `<a href="tel:${esc(x.number)}"><span>${esc(x.label)}</span><b>${esc(x.number)}</b></a>`).join('');
  const weather = trip.weather_json || null;
  const weatherHtml = weather && weather.time
    ? `<div class="card"><h2>Saved weather snapshot</h2><p>${weather.time.map((d, i) => `${esc(d)}: ${Math.round(weather.temperature_2m_min[i])}°–${Math.round(weather.temperature_2m_max[i])}°C`).join(' · ')}</p></div>`
    : '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0F172A"><title>${esc(trip.destination)} · TourInsight Offline Trip</title><style>
  *{box-sizing:border-box}body{margin:0;background:#0f172a;color:#f7f1df;font-family:Arial,sans-serif}
  .hero{padding:42px max(20px,5vw);background:radial-gradient(circle at 80% 0,#2b7775,transparent 36%),linear-gradient(135deg,#0f172a,#0b1527)}
  .ey{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d7b969}
  .hero h1{font-family:Georgia,serif;font-size:clamp(34px,7vw,66px);margin:10px 0}
  .hero p{color:#d9d3c4;max-width:680px;line-height:1.6}
  .badge{display:inline-block;padding:7px 10px;border:1px solid #6cc49f;border-radius:99px;color:#a8e8cb;font-size:11px}
  .wrap{max-width:980px;margin:auto;padding:24px}
  .card,.day{background:#fbf8f0;color:#0f172a;border-radius:18px;padding:20px;margin:16px 0;box-shadow:0 18px 55px #0004}
  .day h2,.card h2{font-family:Georgia,serif;margin-top:0}
  .day article{display:flex;gap:16px;padding:14px 0;border-top:1px solid #0f172a20}
  .day article>span{font-family:monospace;color:#0d9488;min-width:55px}
  .day p{margin:5px 0;color:#4b586c;line-height:1.5}
  .day small{color:#8a6731}
  .stopimg{width:96px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0;align-self:center}
  .places{list-style:none;padding:0}
  .places li{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid #0f172a18}
  .places span{color:#667287;font-size:12px}
  .em{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:9px}
  .em a{text-decoration:none;background:#fff;border:1px solid #0f172a18;border-radius:12px;padding:12px;color:#0f172a;display:flex;justify-content:space-between}
  .chat{position:fixed;right:16px;bottom:16px;width:min(380px,calc(100vw - 32px));background:#fbf8f0;color:#0f172a;border-radius:18px;box-shadow:0 24px 70px #0008;overflow:hidden}
  .ch{padding:13px 15px;background:#0d9488;color:#fff}
  .msgs{height:230px;overflow:auto;padding:12px}
  .m{padding:9px 10px;border-radius:11px;margin:7px 0;white-space:pre-wrap;font-size:13px;line-height:1.45}
  .bot{background:#fff}.usr{background:#0d9488;color:#fff;margin-left:50px}
  .cmp{display:flex;gap:7px;padding:10px;border-top:1px solid #0f172a20}
  .cmp input{flex:1;padding:10px;border:1px solid #ccc;border-radius:10px}
  .cmp button{border:0;background:#c15b3e;color:#fff;border-radius:10px;padding:0 13px}
  .ti-route-card{background:#eef4f1;border:1px solid #0f172a1f;border-radius:15px;overflow:hidden;margin:14px 0;color:#0f172a}
  .ti-route-head{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #0f172a1f}
  .ti-route-head span{font-size:10px;color:#0d9488}
  .budget{font-size:32px;font-family:Georgia,serif}
  .foot{padding:20px;text-align:center;color:#aeb6c3;font-size:11px}
  @media(max-width:650px){.chat{position:relative;right:auto;bottom:auto;width:100%;margin-top:18px}.msgs{height:260px}}
  </style></head><body><header class="hero"><div class="ey">TOURINSIGHT · OFFLINE TRIP PACK</div><h1>${esc(trip.destination)}</h1><p>${esc(trip.name || trip.trip_title || 'Your saved trip')} · Saved ${esc(new Date(savedAt).toLocaleString())}. Everything in this file works without internet; live maps, fresh weather and online AI require reconnection.</p><span class="badge">✓ Offline assistant ready</span></header><main class="wrap">
  <div class="card"><h2>Trip snapshot</h2>${destImg ? `<img src="${destImg}" alt="${esc(trip.destination)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:12px">` : ''}<p><b>From:</b> ${esc(trip.origin || 'Not set')} &nbsp; <b>Travelers:</b> ${esc(String(trip.travellers || 1))} &nbsp; <b>Style:</b> ${esc(trip.hotel_preference || 'standard')}</p>${budget ? `<div class="budget">${fmtRupee(budget.grandTotal)}</div><small>Saved planning estimate</small>` : ''}</div>
  <div class="card"><h2>Offline route maps</h2>${maps}</div>
  ${itinerary}
  <div class="card"><h2>Saved places</h2><ul class="places">${placeHtml}</ul></div>
  ${weatherHtml}
  <div class="card"><h2>Emergency contacts</h2><div class="em">${emergencyHtml}</div><p><b>Immediate emergency in India: 112.</b></p></div>
  <div class="chat"><div class="ch"><b>✦ TourInsight Offline Assistant</b><div style="font-size:10px;opacity:.8">Answers only from this saved trip</div></div><div class="msgs" id="msgs"><div class="m bot">Your trip is downloaded. Ask me about a day plan, places, route, budget, saved weather or emergency numbers.</div></div><div class="cmp"><input id="q" placeholder="Ask about this trip…"><button id="send">Send</button></div></div>
  </main><div class="foot">TourInsight · Offline data is a saved snapshot. Verify changing conditions when connected.</div>
  <script>const B=${safeData};function ans(message){const q=String(message||'').toLowerCase(),t=B.trip,s=B.stops||[];const dm=q.match(/day\\s*(\\d+)/i);if(/emergency|sos|police|ambulance|women|helpline/.test(q))return B.emergency.map(x=>x.label+': '+x.number).join('\\n')+'\\n\\nImmediate emergency: 112';if(/budget|cost|money|price/.test(q))return B.budget?'Saved estimated total: '+B.budget.grandTotal+'. This is not a live fare.':'No budget snapshot.';if(dm){const items=s.filter(y=>Number(y.day_number)===Number(dm[1]));return items.length?'Day '+dm[1]+' in '+t.destination+':\\n'+items.map((z,i)=>(i+1)+'. '+(z.time||'')+' — '+z.activity+(z.notes?' · '+z.notes:'')).join('\\n'):'This trip has '+[...new Set(s.map(y=>y.day_number))].length+' days.'}if(/map|route|direction/.test(q))return 'The offline route maps are saved above for every day. Live maps return when connected.';if(/place|visit|attraction|where/.test(q))return 'Saved places:\\n'+s.map((p,i)=>(i+1)+'. '+p.activity+' (Day '+p.day_number+')').join('\\n');if(/weather|temperature|rain/.test(q)){const w=t.weather_json;return w&&w.time?'Last saved forecast:\\n'+w.time.map((x,i)=>x+': '+Math.round(w.temperature_2m_min[i])+'°–'+Math.round(w.temperature_2m_max[i])+'°C').join('\\n'):'No weather snapshot was saved.'}return 'I am the offline assistant for '+t.destination+'. Ask about a day plan, places, route, budget, saved weather, or emergency contacts.'}const M=document.getElementById('msgs'),Q=document.getElementById('q');function send(){const v=Q.value.trim();if(!v)return;M.innerHTML+='<div class="m usr"></div>';M.lastElementChild.textContent=v;Q.value='';M.innerHTML+='<div class="m bot"></div>';M.lastElementChild.textContent=ans(v);M.scrollTop=M.scrollHeight}document.getElementById('send').onclick=send;Q.addEventListener('keydown',e=>{if(e.key==='Enter')send()});<\/script></body></html>`;
}

export function downloadStandalone(html, destination) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (destination || 'trip').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-tourinsight-offline.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* Build the bundle from a trip + stops (plus embedded place images for
   offline viewing — keyed by the same cache keys used everywhere else). */
export function buildBundle(trip, stops, images = {}) {
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    trip,
    stops,
    images,
    places: uniquePlaces(trip, stops),
    budget: computeBudgetBreakdown(trip, stops.length),
    emergency: TI_EMERGENCY,
  };
}

/* Rule-based in-app offline assistant (works with the localStorage pack). */
export function offlineAssistantAnswer(message, bundle) {
  const q = String(message || '').toLowerCase();
  if (!bundle) return 'No offline trip is saved yet. Generate a trip online, then tap Offline Trip Pack.';
  const trip = bundle.trip;
  const stops = bundle.stops || [];
  const days = [...new Set(stops.map((s) => s.day_number))];
  const emergency = (bundle.emergency || TI_EMERGENCY).map((x) => `${x.label}: ${x.number}`).join('\n');
  const dayMatch = q.match(/day\s*(\d+)/i);
  if (/emergency|sos|police|ambulance|women|helpline|help number/.test(q)) return `Saved emergency contacts:\n${emergency}\n\nFor an immediate emergency in India, call 112.`;
  if (/budget|cost|money|price|spend/.test(q)) {
    const b = bundle.budget;
    return b ? `Saved estimated trip total: ${fmtRupee(b.grandTotal)}. Accommodation ${fmtRupee(b.stayTotal)}, food ${fmtRupee(b.foodTotal)}, local transport ${fmtRupee(b.localTransportTotal)}. These are planning estimates, not live fares.` : 'Your offline trip is saved, but no budget snapshot is available.';
  }
  if (dayMatch) {
    const items = stops.filter((s) => Number(s.day_number) === Number(dayMatch[1]));
    if (!items.length) return `This saved trip has ${days.length} day(s).`;
    return `Day ${dayMatch[1]} in ${trip.destination}:\n` + items.map((x, i) => `${i + 1}. ${x.time || ''} — ${x.activity}${x.notes ? ' · ' + x.notes : ''}`).join('\n');
  }
  if (/map|route|direction|stop/.test(q)) return `Your offline route for ${trip.destination} is saved in the pack. It contains ${bundle.places?.length || stops.length} saved places across ${days.length} day(s). Live maps and traffic return when internet reconnects.`;
  if (/place|visit|attraction|where/.test(q)) return `Saved places for ${trip.destination}:\n` + (bundle.places || []).slice(0, 20).map((p, i) => `${i + 1}. ${p.name} (Day ${p.day})`).join('\n');
  if (/weather|temperature|rain/.test(q)) {
    const w = trip.weather_json;
    if (!w || !w.time) return 'No weather snapshot was available when this trip was saved.';
    return 'Last saved weather snapshot:\n' + w.time.map((d, i) => `${d}: ${Math.round(w.temperature_2m_min[i])}°–${Math.round(w.temperature_2m_max[i])}°C`).join('\n');
  }
  if (/hotel|stay|accommodation/.test(q)) return `Your saved plan uses the ${trip.hotel_preference || 'standard'} travel style. Accommodation estimate is included in the budget snapshot.`;
  return `I'm your offline TourInsight assistant for ${trip.destination}. I can answer from the saved trip about day plans, places, route, budget, saved weather and emergency numbers. I do not invent live data while offline.`;
}