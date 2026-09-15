import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { normalizeCountryName } from '@/lib/countryData';
import { cn } from '@/lib/utils';

const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const SOURCES = [
  'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json',
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
];
export function geometryBbox(geometry) {
  const coords = []; const walk = (v) => Array.isArray(v?.[0]) ? v.forEach(walk) : coords.push(v);
  walk(geometry?.coordinates || []); if (!coords.length) return null;
  return coords.reduce((b, [x,y]) => [Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)], [Infinity,Infinity,-Infinity,-Infinity]);
}
export default function WorldMap({ selectedCountry, onCountrySelect, className }) {
  const hostRef = useRef(null); const mapRef = useRef(null); const dataRef = useRef(null); const [error, setError] = useState('');
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: hostRef.current, style: STYLE, center: [20, 20], zoom: 1.25, minZoom: 1 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right'); mapRef.current = map;
    map.on('load', async () => {
      let geo = null;
      for (const url of SOURCES) { try { const r = await fetch(url); if (r.ok) { geo = await r.json(); break; } } catch { /* try mirror */ } }
      if (!geo) { setError('World map data could not be loaded.'); return; }
      geo.features = (geo.features || []).map((f, i) => ({ ...f, id: i, properties: { ...f.properties, tiName: normalizeCountryName(f.properties?.name || f.properties?.NAME || '') } }));
      dataRef.current = geo;
      map.addSource('countries', { type: 'geojson', data: geo, promoteId: undefined });
      map.addLayer({ id: 'countries-fill', type: 'fill', source: 'countries', paint: { 'fill-color': ['case',['boolean',['feature-state','selected'],false],'#C9A24B','#0D9488'], 'fill-opacity': ['case',['boolean',['feature-state','selected'],false],0.55,0.12] } });
      map.addLayer({ id: 'countries-line', type: 'line', source: 'countries', paint: { 'line-color': '#334155', 'line-width': 0.7 } });
      map.on('mouseenter', 'countries-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'countries-fill', () => { map.getCanvas().style.cursor = ''; });
      map.on('click', 'countries-fill', (e) => { const f = e.features?.[0]; if (f) onCountrySelect?.(f.properties?.tiName || f.properties?.name); });
    });
    return () => { map.remove(); mapRef.current = null; };
  }, [onCountrySelect]);
  useEffect(() => {
    const map = mapRef.current, geo = dataRef.current; if (!map || !geo || !selectedCountry) return;
    const match = geo.features.find((f) => normalizeCountryName(f.properties?.tiName || f.properties?.name) === normalizeCountryName(selectedCountry));
    geo.features.forEach((f) => { try { map.setFeatureState({ source: 'countries', id: f.id }, { selected: f.id === match?.id }); } catch { /* style not ready */ } });
    const box = match ? geometryBbox(match.geometry) : null; if (box && box.every(Number.isFinite)) map.fitBounds([[box[0],box[1]],[box[2],box[3]]], { padding: 40, maxZoom: 5, duration: 700 });
  }, [selectedCountry]);
  return <div className={cn('relative overflow-hidden rounded-2xl border border-border bg-muted', className)}><div ref={hostRef} className="h-full w-full" />{error ? <div className="absolute inset-0 grid place-items-center bg-background/90 p-6 text-center text-sm text-muted-foreground">{error}</div> : null}</div>;
}
