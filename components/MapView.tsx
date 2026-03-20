'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Activity } from '@/types';

interface MapViewProps {
  activities: Activity[];
  center: [number, number];
  hoveredActivity?: Activity | null;
  alternativeActivities?: Activity[];
  previewedAlt?: Activity | null;
}

function normalizeLngLat(coords: [number, number]): [number, number] | null {
  const [a, b] = coords;
  if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return [a, b];
  if (Math.abs(b) <= 180 && Math.abs(a) <= 90) return [b, a];
  return null;
}

type MarkerEntry = {
  el: HTMLElement;
  coords: [number, number];
  kind: 'main' | 'alt';
  marker: maplibregl.Marker;
};

function applyMarkerStyle(el: HTMLElement, kind: 'main' | 'alt', active: boolean) {
  const isAlt = kind === 'alt';
  el.style.width      = active ? '42px' : (isAlt ? '30px' : '32px');
  el.style.height     = active ? '42px' : (isAlt ? '30px' : '32px');
  el.style.background = isAlt
    ? (active ? '#0F766E' : '#0D9488')
    : (active ? '#1C1917' : '#E8573A');
  el.style.fontSize   = active ? '14px' : '11px';
  el.style.opacity    = isAlt && !active ? '0.82' : '1';
  el.style.boxShadow  = active
    ? `0 0 0 4px ${isAlt ? 'rgba(13,148,136,0.25)' : 'rgba(28,25,23,0.2)'}, 0 6px 20px rgba(0,0,0,0.3)`
    : `0 2px 8px ${isAlt ? 'rgba(13,148,136,0.35)' : 'rgba(232,87,58,0.35)'}`;
  el.style.zIndex     = active ? '20' : (isAlt ? '5' : '1');
  el.style.transform  = active ? 'scale(1.12)' : 'scale(1)';
}

function buildMarkerEl(label: string, kind: 'main' | 'alt', active: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText =
    'border:2.5px solid white;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;' +
    'color:white;font-weight:700;cursor:pointer;' +
    'transition:width 0.18s ease,height 0.18s ease,background 0.18s ease,box-shadow 0.18s ease,transform 0.18s ease,opacity 0.18s ease;';
  el.innerText = label;
  applyMarkerStyle(el, kind, active);
  return el;
}

export default function MapView({
  activities,
  center,
  hoveredActivity,
  alternativeActivities = [],
  previewedAlt,
}: MapViewProps) {
  const mapContainer  = useRef<HTMLDivElement>(null);
  const map           = useRef<maplibregl.Map | null>(null);
  const markerMap     = useRef<Map<string, MarkerEntry>>(new Map());
  // Store pending state so effects that fire before the map is ready
  // can be replayed once it initialises
  const pendingCenter = useRef<[number, number] | null>(null);
  const mapReady      = useRef(false);

  // ── Init map lazily via IntersectionObserver ───────────────────────────────
  // The map only boots when the container enters the viewport.
  // This prevents MapLibre (~1.8MB of JS) from blocking the main thread
  // during the initial page load / itinerary render.
  useEffect(() => {
    if (!mapContainer.current) return;

    const container = mapContainer.current;

    const initMap = () => {
      if (map.current) return; // already initialised

      const safeCenter = normalizeLngLat(center) ?? [0, 0];

      const tilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      const style = tilerKey
        ? `https://api.maptiler.com/maps/streets/style.json?key=${tilerKey}`
        : 'https://demotiles.maplibre.org/style.json';

      map.current = new maplibregl.Map({
        container,
        style,
        center: safeCenter,
        zoom: 12,
      });

      map.current.on('error', (e) => {
        if (map.current && (e.error as { status?: number })?.status === 401) {
          map.current.setStyle('https://demotiles.maplibre.org/style.json');
        }
      });

      // Once the map style is loaded, mark it ready and apply any
      // state (markers, center) that arrived before init completed
      map.current.on('load', () => {
        mapReady.current = true;

        // Fly to the latest center if it changed while map was loading
        if (pendingCenter.current) {
          map.current!.flyTo({ center: pendingCenter.current, zoom: 12, duration: 800 });
          pendingCenter.current = null;
        }
      });
    };

    // Use IntersectionObserver if available (all modern browsers)
    // Fall back to immediate init for environments that don't support it
    if (typeof IntersectionObserver === 'undefined') {
      initMap();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          initMap();
          observer.disconnect(); // only need to fire once
        }
      },
      {
        // Start loading slightly before the map enters view
        // so it's ready by the time the user sees it
        rootMargin: '200px',
        threshold: 0,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      map.current?.remove();
      map.current = null;
      mapReady.current = false;
    };
  }, []);

  // ── Re-centre when center prop updates ────────────────────────────────────
  useEffect(() => {
    const safeCenter = normalizeLngLat(center);
    if (!safeCenter || (safeCenter[0] === 0 && safeCenter[1] === 0)) return;

    if (map.current && mapReady.current) {
      map.current.flyTo({ center: safeCenter, zoom: 12, duration: 800 });
    } else {
      // Map not ready yet — store so we can apply it on load
      pendingCenter.current = safeCenter;
    }
  }, [center]);

  // ── Rebuild markers when activity list or alternatives change ──────────────
  useEffect(() => {
    if (!map.current || !mapReady.current) return;

    markerMap.current.forEach(({ marker }) => marker.remove());
    markerMap.current.clear();

    const place = (activity: Activity, index: number, kind: 'main' | 'alt') => {
      if (!activity.coordinates) return;
      const coords = normalizeLngLat(activity.coordinates);
      if (!coords) return;

      const active = hoveredActivity?.title === activity.title || previewedAlt?.title === activity.title;
      const el     = buildMarkerEl(String(index + 1), kind, active);

      const accentColor = kind === 'alt' ? '#0D9488' : '#E8573A';
      const popupHTML =
        `<div style="padding:10px 12px;min-width:160px;">` +
        `<p style="font-size:13px;font-weight:600;margin:0 0 4px;color:#1C1917;">${activity.title}</p>` +
        `<p style="font-size:11px;color:${accentColor};margin:0;">📍 ${activity.location}</p>` +
        (kind === 'alt' ? `<p style="font-size:10px;color:#6B5C52;margin:4px 0 0;font-style:italic;">Alternative option</p>` : '') +
        `</div>`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHTML))
        .addTo(map.current!);

      markerMap.current.set(activity.title, { el, coords, kind, marker });
    };

    activities.forEach((a, i) => place(a, i, 'main'));
    alternativeActivities.forEach((a, i) => place(a, i, 'alt'));
  }, [activities, alternativeActivities]);

  // ── Hover / preview: direct DOM mutation — zero re-render ─────────────────
  useEffect(() => {
    markerMap.current.forEach(({ el, kind }, title) => {
      const active = hoveredActivity?.title === title || previewedAlt?.title === title;
      applyMarkerStyle(el, kind, active);
    });

    const flyTarget = previewedAlt ?? hoveredActivity;
    if (flyTarget) {
      const entry = markerMap.current.get(flyTarget.title);
      if (entry && map.current && mapReady.current) {
        map.current.flyTo({ center: entry.coords, zoom: 14, duration: 450, essential: true });
      }
    }
  }, [hoveredActivity, previewedAlt]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
