import React from 'react';
import { COUNTRY_DATA, normalizeCountryName } from '@/lib/countryData';

export default function CountryPanel({ country, onUsePlace }) {
  const name = normalizeCountryName(country || '');
  const data = COUNTRY_DATA[name];
  return <aside className="rounded-2xl bg-card p-5 text-card-foreground shadow-2xl sm:p-6">
    <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">TourInsight Starter / Demo Data</div>
    <h3 className="font-heading text-2xl font-semibold">{data?.emoji || '🌍'} {name || 'Choose a country'}</h3>
    {!data ? <div className="mt-5 space-y-4"><p className="text-sm text-muted-foreground">Verified attraction data is not available for this country yet. You can still use the country as your trip destination.</p><button onClick={() => onUsePlace?.(name, name)} className="rounded-xl bg-[#1E6B69] px-4 py-2.5 font-mono text-[10px] uppercase text-white">Use {name} as destination</button></div> :
      <div className="mt-5 space-y-3">{data.places.map(([place, tag, desc]) => <div key={place} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-medium">{place}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-wide text-[#1E6B69]">{tag}</div></div><button onClick={() => onUsePlace?.(place, name)} className="shrink-0 rounded-lg border border-[#1E6B69]/40 px-2.5 py-1.5 font-mono text-[9px] uppercase text-[#1E6B69] hover:bg-[#1E6B69]/10">Use</button></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p></div>)}</div>}
  </aside>;
}
