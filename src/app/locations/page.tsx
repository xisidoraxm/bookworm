"use client";

import { useEffect, useRef, useState } from "react";
import type { MarkerData } from "../bicycles/PinContent";
import { DEFAULT_CENTER_BGD } from "../../components/Map";
import { calculateDistance } from "../utils";
import NewBicycleModal from "./NewBicycleModal";

export default function Locations() {
    const [storedMarkers, setStoredMarkers] = useState<MarkerData[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<MarkerData>>({});
    const [showAddModal, setShowAddModal] = useState(false);
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
            localStorage.setItem("initialMarkers", JSON.stringify(allMarkers));
            setStoredMarkers(allMarkers);
        }

        setEditingIndex(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditData({});
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

        const newMarker: MarkerData = {
            ...newBicycle as MarkerData,
            bicycleStatus,
            closestParkingPlaces,
        };

        allMarkers.push(newMarker);
        localStorage.setItem("initialMarkers", JSON.stringify(allMarkers));
        setStoredMarkers(allMarkers);
        handleCloseModal();
    };

    return (
        <div>
            <div className="row">
                <div className="col-10 offset-1">
                    <div className="d-flex justify-content-between align-items-center mt-5">
                        <h1 className="text-center flex-grow-1">Bicycle Locations</h1>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-10 offset-1">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>Station Name</th>
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
                                            <td>
                                                {editingIndex === index ? (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editData.title || ""}
                                                        onChange={(e) => updateEditData("title", e.target.value)}
                                                    />
                                                ) : (
                                                    marker.title
                                                )}
                                            </td>
                                            <td>
                                                {editingIndex === index ? (
                                                    <div>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            className="form-control form-control-sm mb-1"
                                                            placeholder="Latitude"
                                                            value={editData.position?.lat || ""}
                                                            onChange={(e) => updatePosition("lat", e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            className="form-control form-control-sm"
                                                            placeholder="Longitude"
                                                            value={editData.position?.lng || ""}
                                                            onChange={(e) => updatePosition("lng", e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <small>
                                                        Lat: {marker.position.lat.toFixed(4)}<br />
                                                        Lng: {marker.position.lng.toFixed(4)}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                {editingIndex === index ? (
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={editData.bicycleType || ""}
                                                        onChange={(e) => updateEditData("bicycleType", e.target.value)}
                                                    >
                                                        <option value="electric">Electric</option>
                                                        <option value="road">Road</option>
                                                        <option value="hybrid">Hybrid</option>
                                                    </select>
                                                ) : (
                                                    <span className="badge bg-info text-capitalize">
                                                        {marker.bicycleType}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {editingIndex === index ? (
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="form-control form-control-sm"
                                                        value={editData.pricePerHour || ""}
                                                        onChange={(e) => updateEditData("pricePerHour", parseFloat(e.target.value))}
                                                    />
                                                ) : (
                                                    <strong className="text-success">€{marker.pricePerHour}</strong>
                                                )}
                                            </td>
                                            <td>
                                                {editingIndex === index ? (
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={editData.bicycleStatus || ""}
                                                        onChange={(e) => updateEditData("bicycleStatus", e.target.value)}
                                                    >
                                                        <option value="available">Available</option>
                                                        <option value="in_use">In Use</option>
                                                        <option value="maintenance">Maintenance</option>
                                                    </select>
                                                ) : (
                                                    <span className="badge bg-info text-capitalize">
                                                        {marker.bicycleStatus}
                                                    </span>
                                                )}
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
                                                {editingIndex === index ? (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => handleSave(index)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={handleCancel}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleEdit(index)}
                                                    >
                                                        <i className="bi bi-pencil"></i> Edit
                                                    </button>
                                                )}
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
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Bicycle Station</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Station Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newBicycle.title || ""}
                                                onChange={(e) => updateNewBicycle("title", e.target.value)}
                                                placeholder="e.g., Bicycle Station 5"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Latitude</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="form-control"
                                                value={newBicycle.position?.lat || ""}
                                                onChange={(e) => updateNewPosition("lat", e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Longitude</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="form-control"
                                                value={newBicycle.position?.lng || ""}
                                                onChange={(e) => updateNewPosition("lng", e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Bicycle Type</label>
                                            <select
                                                className="form-select"
                                                value={newBicycle.bicycleType || "electric"}
                                                onChange={(e) => updateNewBicycle("bicycleType", e.target.value)}
                                            >
                                                <option value="electric">Electric</option>
                                                <option value="road">Road</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Price per Hour (€)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="form-control"
                                                value={newBicycle.pricePerHour || ""}
                                                onChange={(e) => updateNewBicycle("pricePerHour", parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Location (Click on map to set)</label>
                                        <div
                                            ref={mapRef}
                                            style={{
                                                height: '400px',
                                                width: '100%',
                                                borderRadius: '8px',
                                                border: '1px solid #dee2e6'
                                            }}
                                        ></div>
                                        <small className="text-muted">Click on the map to set the bicycle location</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleSaveNew}
                                    disabled={!newBicycle.title}
                                >
                                    Add Bicycle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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