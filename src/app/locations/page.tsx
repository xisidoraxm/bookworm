"use client";

import { useEffect, useRef, useState } from "react";
import type { MarkerData } from "../bicycles/PinContent";
import { DEFAULT_CENTER_BGD } from "../../components/Map";
import { calculateDistance, updateParkingAvailableBicycles } from "../utils";
import NewBicycleModal from "./NewBicycleModal";
import EditBicycleModal from "./EditBicycleModal";

export default function Locations() {
    const [storedMarkers, setStoredMarkers] = useState<MarkerData[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<MarkerData>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newBicycle, setNewBicycle] = useState<Partial<MarkerData>>({
        title: "",
        position: { lat: DEFAULT_CENTER_BGD.lat, lng: DEFAULT_CENTER_BGD.lng },
        type: "bicycle",
        bicycleType: "electric",
        pricePerHour: 2.0,
        bicycleStatus: "available",
    });

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("initialMarkers");
        if (stored) {
            setStoredMarkers(JSON.parse(stored));
        }
    }, []);

    const bicycleMarkers = storedMarkers.filter((marker) => marker.type === "bicycle");

    const handleEdit = (index: number) => {
        const marker = bicycleMarkers[index];
        setEditingIndex(index);
        setEditData({
            title: marker.title,
            position: { ...marker.position },
            bicycleType: marker.bicycleType,
            pricePerHour: marker.pricePerHour,
            bicycleStatus: marker.bicycleStatus,
        });
        setShowEditModal(true);
    };

    const handleSave = (index: number) => {
        const allMarkers = JSON.parse(localStorage.getItem("initialMarkers") || "[]");
        const currentBicycle = bicycleMarkers[index];
        const actualIndex = allMarkers.findIndex((m: MarkerData) =>
            m.type === "bicycle" &&
            m.title === currentBicycle.title &&
            m.position.lat === currentBicycle.position.lat &&
            m.position.lng === currentBicycle.position.lng
        );

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

            const bicycleId = allMarkers[actualIndex].id;
            updateParkingAvailableBicycles(allMarkers, bicycleId, editData.position!);

            localStorage.setItem("initialMarkers", JSON.stringify(allMarkers));
            setStoredMarkers(allMarkers);
        }

        setEditingIndex(null);
        setEditData({});
        setShowEditModal(false);
    };

    const handleCancel = () => {
        setEditingIndex(null);
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

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setNewBicycle({
            title: "",
            position: { lat: DEFAULT_CENTER_BGD.lat, lng: DEFAULT_CENTER_BGD.lng },
            type: "bicycle",
            bicycleType: "electric",
            pricePerHour: 2.0,
            bicycleStatus: "available",
        });
        mapInstanceRef.current = null;
        markerRef.current = null;
    };

    const updateNewBicycle = (field: string, value: any) => {
        setNewBicycle(prev => ({ ...prev, [field]: value }));
    };

    const updateNewPosition = (coord: 'lat' | 'lng', value: string) => {
        const newValue = parseFloat(value) || 0;
        setNewBicycle(prev => ({
            ...prev,
            position: {
                ...prev.position!,
                [coord]: newValue
            }
        }));

        if (markerRef.current) {
            const newPos = {
                ...newBicycle.position!,
                [coord]: newValue
            };
            if (markerRef.current.position !== undefined) {
                markerRef.current.position = newPos;
            } else if (markerRef.current.setPosition) {
                markerRef.current.setPosition(newPos);
            }
        }
    };

    const handleSaveNew = () => {
        const allMarkers = JSON.parse(localStorage.getItem("initialMarkers") || "[]");
        const parkingPlaces = allMarkers.filter((m: MarkerData) => m.type === "parking");
        const bicycleStatus = 'available' as const;
        const distances = parkingPlaces.map((parking: MarkerData) => ({
            name: parking.title,
            distance: calculateDistance(
                newBicycle.position!.lat,
                newBicycle.position!.lng,
                parking.position.lat,
                parking.position.lng
            )
        }));

        const closestParkingPlaces = distances
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 2);

        const maxId = Math.max(
            ...allMarkers
                .filter((m: MarkerData) => m.type === 'bicycle' && typeof m.id === 'string' && m.id.startsWith('bicycle-'))
                .map((m: MarkerData) => parseInt((m.id as string).split('-')[1]) || 0),
            0
        );
        const newId = `bicycle-${maxId + 1}`;

        const newMarker: MarkerData = {
            ...newBicycle as MarkerData,
            id: newId,
            bicycleStatus,
            closestParkingPlaces,
        };

        allMarkers.push(newMarker);
        updateParkingAvailableBicycles(allMarkers, newId, newBicycle.position!);
        localStorage.setItem("initialMarkers", JSON.stringify(allMarkers));
        setStoredMarkers(allMarkers);
        handleCloseModal();
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5 mb-4">Bicycle Locations</h1>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-10 offset-1">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>Bicycle Title</th>
                                    <th>Location</th>
                                    <th>Bicycle Type</th>
                                    <th>Price/Hour</th>
                                    <th>Bicycle Status</th>
                                    <th>Closest Parking</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bicycleMarkers.length > 0 ? (
                                    bicycleMarkers.map((marker, index) => (
                                        <tr key={index}>
                                            <td>{marker.title}</td>
                                            <td>
                                                <small>
                                                    Lat: {marker.position.lat.toFixed(4)}<br />
                                                    Lng: {marker.position.lng.toFixed(4)}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge bg-info text-capitalize">
                                                    {marker.bicycleType}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className="text-success">€{marker.pricePerHour}</strong>
                                            </td>
                                            <td>
                                                <span className="badge bg-info text-capitalize">
                                                    {marker.bicycleStatus}
                                                </span>
                                            </td>
                                            <td>
                                                {marker.closestParkingPlaces && marker.closestParkingPlaces.length > 0 ? (
                                                    <ul className="list-unstyled mb-0">
                                                        {marker.closestParkingPlaces.map((place, idx) => (
                                                            <li key={idx}>
                                                                <small>{place.name} - {place.distance}m</small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <small className="text-muted">N/A</small>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleEdit(index)}
                                                >
                                                    <i className="bi bi-pencil"></i> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted">
                                            No bicycle locations found. Please visit the bicycles page first.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-10 offset-1">
                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-success"
                            onClick={handleAddNew}
                        >
                            <i className="bi bi-plus-circle"></i> Add New Bicycle
                        </button>
                    </div>
                </div>
            </div>
            <EditBicycleModal
                show={showEditModal}
                editData={editData}
                onClose={handleCancel}
                onSave={() => handleSave(editingIndex!)}
                onUpdateField={updateEditData}
                onUpdatePosition={updatePosition}
            />
            <NewBicycleModal
                show={showAddModal}
                newBicycle={newBicycle}
                onClose={handleCloseModal}
                onSave={handleSaveNew}
                onUpdateField={updateNewBicycle}
                onUpdatePosition={updateNewPosition}
            />
        </div>
    );
}