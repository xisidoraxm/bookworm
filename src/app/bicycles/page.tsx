"use client";

import styles from "./page.module.css";
import Map from "./Map";
import { useEffect, useMemo } from "react";
import type { MarkerData } from "./PinContent";

// Haversinova formula za racunanje rastojanja izmedju dve tacke na globusu
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Zemljin poluprecnik u metrima
    const fi1 = lat1 * Math.PI / 180;
    const fi2 = lat2 * Math.PI / 180;
    const deltaFi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(deltaFi / 2) * Math.sin(deltaFi / 2) +
        Math.cos(fi1) * Math.cos(fi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

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

    useEffect(() => {
        if (!localStorage.getItem("initialMarkers")) {
            localStorage.setItem("initialMarkers", JSON.stringify(initialMarkers));
        }
    }, [initialMarkers]);

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5">Available bicycles and parkings</h1>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Map className={styles.mapContainer} markers={initialMarkers} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="alert alert-info">
                        <h5>Map Legend:</h5>
                        <ul className="mb-0">
                            <li><span style={{ color: '#e97f38' }}>●</span> Orange - Bicycle Available</li>
                            <li><span style={{ color: '#2f53c9' }}>●</span> Blue - Parking</li>
                        </ul>
                        <small className="text-muted">Click on any marker to see more details</small>
                    </div>
                </div>
            </div>
        </div>
    )
}