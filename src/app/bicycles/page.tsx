"use client";

import styles from "./page.module.css";
import Map from "../../components/Map";
import { useEffect, useMemo, useState } from "react";
import type { MarkerData } from "./PinContent";
import { calculateDistance } from "../utils";
import type { MarkerType } from "./PinContent";
import { generateInfoWindowContent } from "./PinContent";

export default function Bicycles() {
    const parkingPlaces = [
        {
            position: { lat: 44.81487956672314, lng: 20.422241859809755 },
            title: "Parking Arena",
            type: 'parking' as const
        },
        {
            position: { lat: 44.80298919683514, lng: 20.446677362784012 },
            title: "Central Parking",
            type: 'parking' as const
        }
    ];

    const bicycleStations: Omit<MarkerData, 'closestParkingPlaces'>[] = [
        {
            position: { lat: 44.84856995676583, lng: 20.40967915853299 },
            title: "Bicycle Station 1",
            type: 'bicycle' as const,
            bicycleType: 'electric' as const,
            pricePerHour: 2.5,
        },
        {
            position: { lat: 44.800584826050496, lng: 20.500504907469015 },
            title: "Bicycle Station 2",
            type: 'bicycle' as const,
            bicycleType: 'road' as const,
            pricePerHour: 2.0,
        },
        {
            position: { lat: 44.795916081609484, lng: 20.46717487034892 },
            title: "Bicycle Station 3",
            type: 'bicycle' as const,
            bicycleType: 'hybrid' as const,
            pricePerHour: 2.2,
        },
        {
            position: { lat: 44.8087148418751, lng: 20.463538120802955 },
            title: "Bicycle Station 4",
            type: 'bicycle' as const,
            bicycleType: 'hybrid' as const,
            pricePerHour: 2.2,
        }
    ];

    const initialMarkers = useMemo(() => {
        const bicyclesWithParking: MarkerData[] = bicycleStations.map(station => {
            const distances = parkingPlaces.map(parking => ({
                name: parking.title,
                distance: calculateDistance(
                    station.position.lat,
                    station.position.lng,
                    parking.position.lat,
                    parking.position.lng
                )
            }));

            const closestParkingPlaces = distances
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2);

            return {
                ...station,
                closestParkingPlaces
            };
        });

        return [...bicyclesWithParking, ...parkingPlaces];
    }, []);

    const [markers, setMarkers] = useState<MarkerData[]>([]);

    useEffect(() => {
        if (!localStorage.getItem("initialMarkers")) {
            localStorage.setItem("initialMarkers", JSON.stringify(initialMarkers));
            setMarkers(initialMarkers);
        } else {
            const stored = localStorage.getItem("initialMarkers");
            if (stored) {
                setMarkers(JSON.parse(stored));
            }
        }
    }, [initialMarkers]);

    const handleMapReady = async (mapInstance: any, infoWindow: any) => {
        if (!markers || markers.length === 0) return;

        const getMarkerIcon = (type: MarkerType = 'bicycle') => {
            const icons: Record<MarkerType, string> = {
                bicycle: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                parking: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            };
            return icons[type];
        };

        const hasMapId = !!process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

        if (hasMapId) {
            const markerLib = await (window as any).google.maps.importLibrary('marker');
            const { AdvancedMarkerElement, PinElement } = markerLib;

            markers.forEach((data) => {
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

                marker.addListener('click', () => {
                    infoWindow.setContent(generateInfoWindowContent(data));
                    infoWindow.open(mapInstance, marker);
                });
            });
        } else {
            const MarkerClass = (window as any).google.maps.Marker;

            markers.forEach((data) => {
                const marker = new MarkerClass({
                    position: data.position,
                    map: mapInstance,
                    title: data.title,
                    icon: getMarkerIcon(data.type)
                });

                marker.addListener('click', () => {
                    infoWindow.setContent(generateInfoWindowContent(data));
                    infoWindow.open(mapInstance, marker);
                });
            });
        }
    };

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5">Available bicycles and parkings</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Map className={styles.mapContainer} onMapReady={handleMapReady} key={markers.length} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Map Legend</h5>
                            <ul className="list-unstyled mb-2">
                                <li className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ backgroundColor: '#e97f38' }}></span>
                                    Bicycle Available
                                </li>
                                <li className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ backgroundColor: '#2f53c9' }}></span>
                                    Parking
                                </li>
                            </ul>
                            <small className="text-muted">Click on any marker to see more details</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}