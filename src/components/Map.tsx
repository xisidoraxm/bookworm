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
      // Wait for both the ref to be available and Google Maps API to load
      await new Promise<void>((resolve) => {
        const checkReady = () => {
          if (ref.current && 
              (window as any).google && 
              (window as any).google.maps && 
              (window as any).google.maps.importLibrary) {
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      });

      // Double-check that we're still mounted and have a valid ref
      if (!mounted || !ref.current) return;

      try {
        const mapsLib = await (window as any).google.maps.importLibrary('maps');
        const { Map: GMap, InfoWindow } = mapsLib;
        
        if (!ref.current) {
          console.error('Map container element became null during initialization');
          return;
        }

        const mapOptions: any = { center, zoom };
        if (mapId) mapOptions.mapId = mapId;
        else if (process.env.NEXT_PUBLIC_GOOGLE_MAP_ID) mapOptions.mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
        
        const mapInstance = new GMap(ref.current, mapOptions);
        const infoWindow = new InfoWindow();

        if (onMapReady && mounted) {
          onMapReady(mapInstance, infoWindow);
        }

      } catch (err) {
        console.error('Google Maps failed to load', err);
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(init, 100);

    return () => { 
      mounted = false; 
      clearTimeout(timer);
    };
  }, [center, zoom, mapId, onMapReady]);

  return <div ref={ref} className={className} style={style} />;
}
