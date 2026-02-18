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
            id: 'parking-1',
            position: { lat: 44.81487956672314, lng: 20.422241859809755 },
            title: "Parking Arena",
            type: 'parking' as const,
            availableBicycles: ["bicycle-7"]
        },
        {
            id: 'parking-2',
            position: { lat: 44.80298919683514, lng: 20.446677362784012 },
            title: "Central Parking",
            type: 'parking' as const,
            availableBicycles: ["bicycle-5", "bicycle-6"]
        }
    ];

    const bicycleStations: Omit<MarkerData, 'closestParkingPlaces'>[] = [
        {
            id: 'bicycle-1',
            position: { lat: 44.84856995676583, lng: 20.40967915853299 },
            title: "E-Bike 1",
            type: 'bicycle' as const,
            bicycleType: 'electric' as const,
            pricePerHour: 2.5,
            bicycleStatus: 'available' as const
        },
        {
            id: 'bicycle-2',
            position: { lat: 44.800584826050496, lng: 20.500504907469015 },
            title: "Road Bike 2",
            type: 'bicycle' as const,
            bicycleType: 'road' as const,
            pricePerHour: 2.0,
            bicycleStatus: 'in_use' as const
        },
        {
            id: 'bicycle-3',
            position: { lat: 44.795916081609484, lng: 20.46717487034892 },
            title: "Hybrid Bike 3",
            type: 'bicycle' as const,
            bicycleType: 'hybrid' as const,
            pricePerHour: 2.2,
            bicycleStatus: 'maintenance' as const
        },
        {
            id: 'bicycle-4',
            position: { lat: 44.8087148418751, lng: 20.463538120802955 },
            title: "Hybrid Bike 4",
            type: 'bicycle' as const,
            bicycleType: 'hybrid' as const,
            pricePerHour: 2.2,
            bicycleStatus: 'available' as const
        },
        {
            id: 'bicycle-5',
            position: { lat: 44.80298919683514, lng: 20.446677362784012 },
            title: "Central Hybrid 1",
            type: 'bicycle' as const,
            bicycleType: 'hybrid' as const,
            pricePerHour: 2.2,
            bicycleStatus: 'available' as const
        },
        {
            id: 'bicycle-6',
            position: { lat: 44.80298919683514, lng: 20.446677362784012 },
            title: "Central E-Bike 1",
            type: 'bicycle' as const,
            bicycleType: 'electric' as const,
            pricePerHour: 2.5,
            bicycleStatus: 'available' as const
        },
        {
            id: 'bicycle-7',
            position: {  lat: 44.81487956672314, lng: 20.422241859809755 },
            title: "Road Bike 7",
            type: 'bicycle' as const,
            bicycleType: 'road' as const,
            pricePerHour: 2.0,
            bicycleStatus: 'available' as const
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

        const bicyclesInParking = new Set<string | number>();
        markers.forEach((marker) => {
            if (marker.type === 'parking' && marker.availableBicycles) {
                marker.availableBicycles.forEach(bikeId => bicyclesInParking.add(bikeId));
            }
        });

        const visibleMarkers = markers.filter((marker) => {
            if (marker.type === 'bicycle' && bicyclesInParking.has(marker.id)) {
                return false;
            }
            return true;
        });

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

            visibleMarkers.forEach((data) => {
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

            visibleMarkers.forEach((data) => {
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
                                    Bicycle (not at parking)
                                </li>
                                <li className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ backgroundColor: '#2f53c9' }}></span>
                                    Parking (with available bicycles)
                                </li>
                            </ul>
                            <small className="text-muted">Click on parking markers to see available bicycles. Bicycles at parking locations are shown only as parking pins.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}