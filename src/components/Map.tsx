"use client";

import React, { useEffect, useRef } from 'react';

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  mapId?: string;
  onMapReady?: (mapInstance: any, infoWindow: any) => void;
  style?: React.CSSProperties;
};

declare global {
  interface Window { google?: any }
}

export const DEFAULT_CENTER_BGD = { lat: 44.7866, lng: 20.4489 } as const;

export default function Map({ center = DEFAULT_CENTER_BGD, zoom = 12, className, mapId, onMapReady, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!ref.current) return;
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
        const { Map: GMap, InfoWindow } = mapsLib;
        const mapOptions: any = { center, zoom };
        if (mapId) mapOptions.mapId = mapId;
        else if (process.env.NEXT_PUBLIC_GOOGLE_MAP_ID) mapOptions.mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
        const mapInstance = new GMap(ref.current, mapOptions);
        const infoWindow = new InfoWindow();

        if (onMapReady) {
          onMapReady(mapInstance, infoWindow);
        }

      } catch (err) {
        console.error('Google Maps failed to load', err);
      }
    }

    init();

    return () => { mounted = false; };
  }, [center, zoom, mapId, onMapReady]);

  return <div ref={ref} className={className} style={style} />;
}
