"use client";

import { useState, useEffect } from "react";

type RentalData = {
    id: number;
    username: string;
    startTime: Date;
    endTime: Date | null;
    bicycleId: string | number;
    status: 'active' | 'completed';
}

const mockRentals: RentalData[] = [
    {
        id: 1,
        username: "jelica",
        startTime: new Date('2026-02-16T09:30:00'),
        endTime: new Date('2026-02-16T12:15:00'),
        bicycleId: 'bicycle-1',
        status: 'completed'
    },
    {
        id: 2,
        username: "drazen",
        startTime: new Date('2026-02-16T10:45:00'),
        endTime: null,
        bicycleId: 'bicycle-2',
        status: 'active'
    },
    {
        id: 3,
        username: "isidora",
        startTime: new Date('2026-02-16T08:00:00'),
        endTime: new Date('2026-02-16T10:30:00'),
        bicycleId: 'bicycle-3',
        status: 'completed'
    },
    {
        id: 4,
        username: "milica",
        startTime: new Date('2026-02-16T11:20:00'),
        endTime: null,
        bicycleId: 'bicycle-4',
        status: 'active'
    }
];

export default function Renting() {
    const [rentals, setRentals] = useState<RentalData[]>([]);

    useEffect(() => {
        if (!localStorage.getItem("mockRentals")) {
            localStorage.setItem("mockRentals", JSON.stringify(mockRentals));
            setRentals(mockRentals);
        } else {
            const stored = localStorage.getItem("mockRentals");
            if (stored) {
                const parsedRentals = JSON.parse(stored).map((rental: any) => ({
                    ...rental,
                    startTime: new Date(rental.startTime),
                    endTime: rental.endTime ? new Date(rental.endTime) : null
                }));
                setRentals(parsedRentals);
            }
        }
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getPricePerHour = (bicycleId: string | number) => {
        const bicycles = localStorage.getItem("initialMarkers");
        const bicycle = bicycles ? JSON.parse(bicycles).find((marker: any) => marker.id === bicycleId) : null;
        return bicycle ? bicycle.pricePerHour : 0;
    };

    const calculateFinalPrice = (rental: RentalData) => {
        const pricePerHour = getPricePerHour(rental.bicycleId);
        if (rental.status === 'completed' && rental.endTime) {
            const hours = (rental.endTime.getTime() - rental.startTime.getTime()) / (1000 * 60 * 60);
            return (hours * pricePerHour).toFixed(2);
        } else {
            const now = new Date();
            const hours = (now.getTime() - rental.startTime.getTime()) / (1000 * 60 * 60);
            return (hours * pricePerHour).toFixed(2);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return <span className="badge bg-success">Active</span>;
        }
        return <span className="badge bg-secondary">Completed</span>;
    };

    const getBicycleTypeBadge = (bicycleId: string | number) => {
        const bicycles = localStorage.getItem("initialMarkers");
        const bicycle = bicycles ? JSON.parse(bicycles).find((marker: any) => marker.id === bicycleId) : null;
        if (bicycle) {
            const badgeColors: any = {
                electric: 'bg-warning',
                road: 'bg-info', 
                hybrid: 'bg-primary'
            };
            const bgClass = badgeColors[bicycle.bicycleType] || 'bg-info';
            return <span className={`badge ${bgClass} text-capitalize`}>{bicycle.bicycleType}</span>;
        }
        return <span className="badge bg-secondary">Unknown</span>;
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5 mb-4">Bicycle Rental Overview</h1>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-10 offset-1">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Username</th>
                                    <th scope="col">Bicycle Type</th>
                                    <th scope="col">Start Time</th>
                                    <th scope="col">End Time</th>
                                    <th scope="col">Price/Hour</th>
                                    <th scope="col">Final Price</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.map((rental) => (
                                    <tr key={rental.id}>
                                        <td>
                                            <strong>{rental.username}</strong>
                                        </td>
                                        <td>
                                            {getBicycleTypeBadge(rental.bicycleId)}
                                        </td>
                                        <td>
                                            <div>
                                                <div>{formatTime(rental.startTime)}</div>
                                                <small className="text-muted">{formatDate(rental.startTime)}</small>
                                            </div>
                                        </td>
                                        <td>
                                            {rental.endTime ? (
                                                <div>
                                                    <div>{formatTime(rental.endTime)}</div>
                                                    <small className="text-muted">{formatDate(rental.endTime)}</small>
                                                </div>
                                            ) : (
                                                <span className="text-info fst-italic">In Progress</span>
                                            )}
                                        </td>
                                        <td>
                                            <strong className="text-success">€{getPricePerHour(rental.bicycleId).toFixed(2)}</strong>
                                        </td>
                                        <td>
                                            <strong className="text-success">€{calculateFinalPrice(rental)}</strong>
                                            {rental.status === 'active' && (
                                                <small className="text-muted d-block">(ongoing)</small>
                                            )}
                                        </td>
                                        <td>
                                            {getStatusBadge(rental.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}