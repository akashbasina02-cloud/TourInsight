import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';

const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const DEFAULT = { lat: 17.385, lon: 78.4867 };
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

export default function TripMap({ stops = [], center, routeLabel = 'Route', className }) {
  const hostRef = useRef(null); const mapRef = useRef(null); const markersRef = useRef([]); const [routeState, setRouteState] = useState('idle');
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const c = center || DEFAULT;
    const map = new maplibregl.Map({ container: hostRef.current, style: STYLE, center: [c.lon, c.lat], zoom: 11 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => { markersRef.current.forEach((m) => m.remove()); map.remove(); mapRef.current = null; };
  }, [center]);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const render = async () => {
      markersRef.current.forEach((m) => m.remove()); markersRef.current = [];
      const mapped = stops.filter((s) => s.lat != null && s.lon != null);
      if (!mapped.length) { if (center) map.easeTo({ center: [center.lon, center.lat], zoom: 11 }); return; }
      const bounds = new maplibregl.LngLatBounds();
      mapped.forEach((s, i) => {
        const el = document.createElement('div'); el.className = 'stop-marker'; el.textContent = String(i + 1);
        const popup = new maplibregl.Popup({ offset: 18 }).setHTML(`<strong>${esc(s.activity)}</strong><br><small>${esc(s.time || '')}</small>`);
        const marker = new maplibregl.Marker({ element: el }).setLngLat([s.lon, s.lat]).setPopup(popup).addTo(map);
        markersRef.current.push(marker); bounds.extend([s.lon, s.lat]);
      });
      if (mapped.length > 1) map.fitBounds(bounds, { padding: 55, maxZoom: 13 }); else map.easeTo({ center: [mapped[0].lon, mapped[0].lat], zoom: 12 });
      const sourceId = 'trip-route';
      const setLine = (coords) => {
        const data = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} };
        if (map.getSource(sourceId)) map.getSource(sourceId).setData(data); else {
          map.addSource(sourceId, { type: 'geojson', data });
          map.addLayer({ id: sourceId, type: 'line', source: sourceId, paint: { 'line-color': '#C9A24B', 'line-width': 5, 'line-opacity': 0.9 } });
        }
      };
      if (mapped.length < 2) return;
      setRouteState('loading');
      try {
        const coords = mapped.map((s) => `${s.lon},${s.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
        const data = await res.json();
        const line = data?.routes?.[0]?.geometry?.coordinates;
        if (line?.length) { if (map.isStyleLoaded()) setLine(line); else map.once('load', () => setLine(line)); setRouteState('ok'); }
        else throw new Error('no route');
      } catch {
        const line = mapped.map((s) => [s.lon, s.lat]); if (map.isStyleLoaded()) setLine(line); else map.once('load', () => setLine(line)); setRouteState('unavailable');
      }
    };
    if (map.isStyleLoaded()) render(); else map.once('load', render);
  }, [stops, center]);
  return <div className={cn('relative overflow-hidden rounded-2xl border border-border bg-muted', className)}>
    <div ref={hostRef} className="h-full w-full" />
    <div className="absolute bottom-3 left-3 rounded-lg bg-[#0F172A]/85 px-3 py-2 font-mono text-[10px] text-white shadow-lg">{routeLabel} · {routeState === 'loading' ? 'routing…' : routeState === 'unavailable' ? 'straight-line fallback' : 'driving route'}</div>
  </div>;
}
