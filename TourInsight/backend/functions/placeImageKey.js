export function buildPlaceKey(place, city, state, country) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  return [norm(place), norm(city), norm(state), norm(country)].filter(Boolean).join('|');
}
export function buildQueryChain(place, city, state, country) {
  const clean = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 90);
  const p = clean(place), c = clean(city), st = clean(state), co = clean(country);
  const uniq = (parts) => [...new Set(parts.filter(Boolean))];
  const chain = [uniq([p,c,st,co]).join(' '), uniq([p,c]).join(' '), uniq([p,st]).join(' '), c ? uniq([c,st,co]).join(' ') : null];
  return [...new Set(chain.filter((q) => q && q.trim().length > 1))];
}
