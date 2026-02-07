"use client";

import React, { useEffect, useRef } from 'react';

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  mapId?: string; // optional Map ID (for AdvancedMarkerElement)
};

declare global {
  interface Window { google?: any }
}

export const DEFAULT_CENTER_BGD = { lat: 44.7866, lng: 20.4489 } as const;

export default function Map({ center = DEFAULT_CENTER_BGD, zoom = 12, className, mapId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!ref.current) return;

      // Wait for the Google loader to attach importLibrary
      if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.importLibrary) {
        await new Promise<void>((resolve) => {
          const check = () => {
            if ((window as any).google && (window as any).google.maps && (window as any).google.maps.importLibrary) resolve();
            else setTimeout(check, 50);
          };
          check();
        });
      }

      if (!mounted) return;

      try {
        const mapsLib = await (window as any).google.maps.importLibrary('maps');
        const { Map: GMap, Marker } = mapsLib;

        const mapOptions: any = { center, zoom };
        // accept mapId via props or env var
        if (mapId) mapOptions.mapId = mapId;
        else if (process.env.NEXT_PUBLIC_GOOGLE_MAP_ID) mapOptions.mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

        const mapInstance = new GMap(ref.current, mapOptions);

        // Place the marker close to the center (small offset so it's visually separate)
        const markerPos = { lat: center.lat + 0.0005, lng: center.lng + 0.0005 };

        if (mapOptions.mapId) {
          const markerLib = await (window as any).google.maps.importLibrary('marker');
          const { AdvancedMarkerElement } = markerLib;
          new AdvancedMarkerElement({ position: markerPos, map: mapInstance });
        } else {
          // Fallback to the classic Marker constructor if available
          if ((window as any).google && (window as any).google.maps && typeof (window as any).google.maps.Marker === 'function') {
            new (window as any).google.maps.Marker({ position: markerPos, map: mapInstance });
          } else if ((mapsLib as any).Marker) {
            new (mapsLib as any).Marker({ position: markerPos, map: mapInstance });
          } else {
            console.warn('No Marker constructor available');
          }
        }

      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Google Maps failed to load', err);
      }
    }

    init();

    return () => { mounted = false; };
  }, [center, zoom]);

  return <div ref={ref} className={className} />;
}
