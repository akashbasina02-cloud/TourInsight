import React from 'react';
import { computeBudgetBreakdown, fmtRupee } from '@/lib/tripEngine';

export default function BudgetView({ trip, stopsCount }) {
  const b = computeBudgetBreakdown(trip, stopsCount);
  const custom = Number(trip.custom_budget || 0);
  const over = custom > 0 && b.grandTotal > custom;
  const rows = [
    ['Outbound transport', b.outbound == null ? 'Not estimated' : fmtRupee(b.outbound)],
    ['Return transport', b.returnFare == null ? 'Not estimated' : fmtRupee(b.returnFare)],
    ['Accommodation', fmtRupee(b.stayTotal)],
    ['Food', fmtRupee(b.foodTotal)],
    ['Local transport', fmtRupee(b.localTransportTotal)],
    ['Attraction tickets', fmtRupee(b.attractionsTotal)],
    ...(b.guideTotal ? [['Optional guide', fmtRupee(b.guideTotal)]] : []),
    ['Emergency buffer · 8%', fmtRupee(b.emergencyBuffer)],
  ];
  return <section className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-7">
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E6B69]">Planning estimate · INR</div>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-heading text-2xl font-semibold">Trip budget</h2><div className="mt-2 font-heading text-4xl font-semibold">{fmtRupee(b.grandTotal)}</div></div>{custom > 0 ? <div className={`rounded-xl px-4 py-3 text-sm ${over ? 'bg-[#C15B3E]/10 text-[#a94d33]' : 'bg-[#1E6B69]/10 text-[#0f766e]'}`}><div className="font-mono text-[10px] uppercase">Your budget · {fmtRupee(custom)}</div><div className="mt-1 font-semibold">{over ? `${fmtRupee(b.grandTotal - custom)} over budget` : `${fmtRupee(custom - b.grandTotal)} within budget`}</div></div> : null}</div>
    <div className="mt-6 divide-y divide-border">{rows.map(([label,value]) => <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-muted-foreground">{label}</span><strong>{value}</strong></div>)}</div>
    <p className="mt-5 text-xs leading-relaxed text-muted-foreground">These are planning estimates, not live fares or booking prices. TourInsight does not process payments or make bookings.</p>
  </section>;
}
