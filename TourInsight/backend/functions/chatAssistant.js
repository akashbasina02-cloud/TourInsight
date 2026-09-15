const clamp = (v,n) => String(v || '').slice(0,n);
function fallback(message, trip) {
  const q = message.toLowerCase();
  const add = q.match(/(?:add|include|put)\s+(.+?)(?:\s+(?:to|on)\s+day\s*(\d+))?$/i);
  if (add && trip) {
    const activity = clamp(add[1].replace(/[.!]+$/,''), 200);
    const day = Math.max(1, Math.min(Number(add[2] || 1), Number(trip.days || 1)));
    return { reply:`I can add “${activity}” to Day ${day}. Confirm the proposed change below.`, proposal:{ kind:'add_stop', day_number:day, activity, notes:'Added from the TourInsight assistant.', time:'10:00' } };
  }
  const rem = q.match(/(?:remove|delete)\s+(.+?)(?:\s+(?:from|on)\s+day\s*(\d+))?$/i);
  if (rem && trip) {
    const activity = clamp(rem[1].replace(/[.!]+$/,''), 200); const day = Math.max(1, Number(rem[2] || 1));
    return { reply:`I can remove “${activity}” from the itinerary if it matches a saved stop. Confirm below.`, proposal:{ kind:'remove_stop', day_number:day, activity, notes:'', time:'10:00' } };
  }
  if (/budget|cost|price|money/.test(q) && trip?.budget_total) return { reply:`Your saved planning estimate is ₹${Number(trip.budget_total).toLocaleString('en-IN')}. It is an estimate, not a live fare or booking quote.`, proposal:null };
  if (/emergency|sos|police|ambulance/.test(q)) return { reply:'For an immediate emergency in India call 112. Women helpline: 181; women in distress: 1091; tourist helpline: 1363.', proposal:null };
  if (trip?.destination) return { reply:`I can help with your ${trip.destination} itinerary, budget, saved stops, safety information, or propose adding/removing a stop.`, proposal:null };
  return { reply:'Tell me where you are travelling, or open a saved trip so I can answer with trip context.', proposal:null };
}

async function gemini(payload) {
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const tripJson = payload.tripContext ? JSON.stringify(payload.tripContext).slice(0,6000) : 'null';
  const history = (Array.isArray(payload.history)?payload.history:[]).slice(-8).map((h)=>`${h.role||'user'}: ${clamp(h.text,500)}`).join('\n');
  const prompt = `You are TourInsight AI, a concise practical travel assistant. Use INR for planning estimates. Never invent live flight, hotel or ticket prices.\n\nTrip context: ${tripJson}\nRecent history:\n${history}\nUser: ${clamp(payload.message,1000)}\n\nReturn ONLY valid JSON with this shape: {"reply":"string","proposal_kind":"none|add_stop|remove_stop","day_number":1,"activity":"string","notes":"string","time":"HH:MM"}. For an add request, make a short activity and one-line notes. For remove, use the exact existing activity when possible. If no itinerary change is requested, proposal_kind must be none.`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ contents:[{ parts:[{ text:prompt }] }], generationConfig:{ responseMimeType:'application/json', temperature:0.25 } }) });
  if (!res.ok) throw new Error('AI service unavailable');
  const data = await res.json(); const text = data?.candidates?.[0]?.content?.parts?.map((p)=>p.text||'').join('') || '';
  return JSON.parse(text);
}

export async function chatAssistant(payload) {
  const message = clamp(payload?.message,1000).trim(); if (!message) throw Object.assign(new Error('Message required'), { status:400 });
  let data = null;
  try { data = await gemini(payload); } catch { data = null; }
  if (!data) return fallback(message, payload?.tripContext || null);
  const kind = ['add_stop','remove_stop'].includes(data.proposal_kind) ? data.proposal_kind : 'none';
  const reply = clamp(data.reply || 'How can I help with your trip?',2000);
  if (kind === 'none') return { reply, proposal:null };
  const day = Math.max(1, Number(data.day_number || 1)); const activity = clamp(data.activity,200).trim();
  if (!activity) return { reply, proposal:null };
  const time = /^\d{2}:\d{2}$/.test(String(data.time||'')) ? String(data.time) : '10:00';
  return { reply, proposal:{ kind, day_number:day, activity, notes:clamp(data.notes,500), time } };
}
