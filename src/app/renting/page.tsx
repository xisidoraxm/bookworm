"use client";

import { useState, useEffect, useRef } from "react";
import RentDetailsModal, { type RentalData } from "./RentDetailsModal";
import type { MarkerData } from "../bicycles/PinContent";
import EditBicycleModal from "../locations/EditBicycleModal";
import { calculateDistance, updateParkingAvailableBicycles } from "../utils";

const mockRentals: RentalData[] = [
    {
        id: 1,
        username: "jelica",
        startTime: new Date('2026-02-16T09:30:00'),
        endTime: new Date('2026-02-16T12:15:00'),
        bicycleId: 'bicycle-1',
        status: 'completed',
        returnPicture: '/bicycles/bicyclePic1.jpg',
        note: 'Bicycle returned in good condition. Minor scratch on the left handlebar.'
    },
    {
        id: 2,
        username: "drazen",
        startTime: new Date('2026-02-17T15:45:00'),
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
        status: 'completed',
        returnPicture: '/bicycles/bicyclePic2.jpg',
        note: 'Perfect condition. Cleaned before return.'
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
    const [selectedRental, setSelectedRental] = useState<RentalData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<Partial<MarkerData>>({});
    const [editingBicycleId, setEditingBicycleId] = useState<string | number | null>(null);
    const [storedMarkers, setStoredMarkers] = useState<MarkerData[]>([]);
    const markerRef = useRef<any>(null);

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

        const markers = localStorage.getItem("initialMarkers");
        if (markers) {
            setStoredMarkers(JSON.parse(markers));
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

    const getBicycleTitle = (bicycleId: string | number) => {
        const bicycles = localStorage.getItem("initialMarkers");
        const bicycle = bicycles ? JSON.parse(bicycles).find((marker: any) => marker.id === bicycleId) : null;
        if (bicycle) {
            return <span className="text-capitalize">{bicycle.title}</span>;
        }
        return <span className="badge bg-secondary">Unknown</span>;
    };

    const handleViewReturnState = (rental: RentalData) => {
        setSelectedRental(rental);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRental(null);
    };

    const handleEditBicycle = (bicycleId: string | number) => {
        const bicycle = storedMarkers.find((m: MarkerData) => m.id === bicycleId && m.type === "bicycle");
        if (bicycle) {
            setEditingBicycleId(bicycleId);
            setEditData({
                title: bicycle.title,
                position: { ...bicycle.position },
                bicycleType: bicycle.bicycleType,
                pricePerHour: bicycle.pricePerHour,
                bicycleStatus: bicycle.bicycleStatus,
            });
            setShowEditModal(true);
        }
    };

    const handleSaveBicycle = () => {
        if (editingBicycleId === null) return;

        const allMarkers = JSON.parse(localStorage.getItem("initialMarkers") || "[]");
        const actualIndex = allMarkers.findIndex((m: MarkerData) => m.id === editingBicycleId);

        if (actualIndex !== -1) {
            const parkingPlaces = allMarkers.filter((m: MarkerData) => m.type === "parking");
            const distances = parkingPlaces.map((parking: MarkerData) => ({
                name: parking.title,
                distance: calculateDistance(
                    editData.position!.lat,
                    editData.position!.lng,
                    parking.position.lat,
                    parking.position.lng
                )
            }));

            const closestParkingPlaces = distances
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2);

            allMarkers[actualIndex] = {
                ...allMarkers[actualIndex],
                ...editData,
                closestParkingPlaces,
            };

            updateParkingAvailableBicycles(allMarkers, editingBicycleId, editData.position!);
            localStorage.setItem("initialMarkers", JSON.stringify(allMarkers));
            setStoredMarkers(allMarkers);
        }

        handleCancelEdit();
    };

    const handleCancelEdit = () => {
        setEditingBicycleId(null);
        setEditData({});
        setShowEditModal(false);
    };

    const updateEditData = (field: string, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const updatePosition = (coord: 'lat' | 'lng', value: string) => {
        const newValue = parseFloat(value) || 0;
        setEditData(prev => ({
            ...prev,
            position: {
                ...prev.position!,
                [coord]: newValue
            }
        }));

        if (markerRef.current) {
            const newPos = {
                ...editData.position!,
                [coord]: newValue
            };
            if (markerRef.current.position !== undefined) {
                markerRef.current.position = newPos;
            } else if (markerRef.current.setPosition) {
                markerRef.current.setPosition(newPos);
            }
        }
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
                                    <th scope="col">Bicycle Title</th>
                                    <th scope="col">Start Time</th>
                                    <th scope="col">End Time</th>
                                    <th scope="col">Price/Hour</th>
                                    <th scope="col">Final Price</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Return State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.map((rental) => (
                                    <tr key={rental.id}>
                                        <td>
                                            <strong>{rental.username}</strong>
                                        </td>
                                        <td>
                                            {getBicycleTitle(rental.bicycleId)}
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
                                        <td>
                                            {rental.status === 'completed' && rental.returnPicture ? (
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => handleViewReturnState(rental)}
                                                >
                                                    <i className="bi bi-image"></i> View Details
                                                </button>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <RentDetailsModal
                show={showModal}
                rental={selectedRental}
                onClose={handleCloseModal}
                formatTime={formatTime}
                formatDate={formatDate}
                calculateFinalPrice={calculateFinalPrice}
                getBicycleTitle={getBicycleTitle}
                onEditBicycle={handleEditBicycle}
            />
            <EditBicycleModal
                show={showEditModal}
                editData={editData}
                onClose={handleCancelEdit}
                onSave={handleSaveBicycle}
                onUpdateField={updateEditData}
                onUpdatePosition={updatePosition}
            />
        </div>
    );
}