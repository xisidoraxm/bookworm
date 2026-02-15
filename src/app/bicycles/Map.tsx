"use client";

import React, { useEffect, useRef } from 'react';
import { generateInfoWindowContent, type MarkerData, type MarkerType } from './PinContent';

type Props = {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  mapId?: string;
  markers?: MarkerData[];
};

declare global {
  interface Window { google?: any }
}

export const DEFAULT_CENTER_BGD = { lat: 44.7866, lng: 20.4489 } as const;

export default function Map({ center = DEFAULT_CENTER_BGD, zoom = 12, className, mapId, markers }: Props) {
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

        if (!markers || markers.length === 0) return;

        const markerData: MarkerData[] = markers;

        const getMarkerIcon = (type: MarkerType = 'bicycle') => {
          const icons: Record<MarkerType, string> = {
            bicycle: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            parking: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          };
          return icons[type];
        };

        if (mapOptions.mapId) {
          const markerLib = await (window as any).google.maps.importLibrary('marker');
          const { AdvancedMarkerElement, PinElement } = markerLib;

          markerData.forEach((data) => {
            const pinColor = {
              bicycle: '#e97f38',
              parking: '#2f53c9',
            }[data.type || 'bicycle'];

            const pin = new PinElement({
              background: pinColor,
              borderColor: '#FFFFFF',
              glyphColor: '#FFFFFF',
            });

            const marker = new AdvancedMarkerElement({
              position: data.position,
              map: mapInstance,
              title: data.title,
              content: pin.element,
            });

            // Add click listener for info window
            marker.addListener('click', () => {
              infoWindow.setContent(generateInfoWindowContent(data));
              infoWindow.open(mapInstance, marker);
            });
          });
        } else {
          const MarkerClass = (window as any).google.maps.Marker || (mapsLib as any).Marker;

          markerData.forEach((data) => {
            const marker = new MarkerClass({
              position: data.position,
              map: mapInstance,
              title: data.title,
              icon: getMarkerIcon(data.type)
            });

            // Add click listener for info window
            marker.addListener('click', () => {
              infoWindow.setContent(generateInfoWindowContent(data));
              infoWindow.open(mapInstance, marker);
            });
          });
        }

      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Google Maps failed to load', err);
      }
    }

    init();

    return () => { mounted = false; };
  }, [center, zoom, markers, mapId]);

  return <div ref={ref} className={className} />;
}
