"use client";

import { useRef } from "react";
import type { MarkerData } from "../bicycles/PinContent";
import Map from "../../components/Map";

type Props = {
    show: boolean;
    newBicycle: Partial<MarkerData>;
    onClose: () => void;
    onSave: () => void;
    onUpdateField: (field: string, value: any) => void;
    onUpdatePosition: (coord: 'lat' | 'lng', value: string) => void;
};

export default function NewBicycleModal({
    show,
    newBicycle,
    onClose,
    onSave,
    onUpdateField,
    onUpdatePosition
}: Props) {
    const markerRef = useRef<any>(null);

    const handleMapReady = async (mapInstance: any, infoWindow: any) => {
        const hasMapId = !!process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

        if (hasMapId) {
            const markerLib = await (window as any).google.maps.importLibrary('marker');
            const { AdvancedMarkerElement, PinElement } = markerLib;

            const pin = new PinElement({
                background: '#e97f38',
                borderColor: '#FFFFFF',
                glyphColor: '#FFFFFF',
            });

            markerRef.current = new AdvancedMarkerElement({
                position: newBicycle.position,
                map: mapInstance,
                content: pin.element,
            });

            mapInstance.addListener('click', (e: any) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                onUpdatePosition('lat', lat.toString());
                onUpdatePosition('lng', lng.toString());

                if (markerRef.current) {
                    markerRef.current.position = { lat, lng };
                }
            });
        } else {
            const MarkerClass = (window as any).google.maps.Marker;

            markerRef.current = new MarkerClass({
                position: newBicycle.position,
                map: mapInstance,
                icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            });

            mapInstance.addListener('click', (e: any) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                onUpdatePosition('lat', lat.toString());
                onUpdatePosition('lng', lng.toString());

                if (markerRef.current) {
                    markerRef.current.setPosition({ lat, lng });
                }
            });
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add New Bicycle Station</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
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
                                        onChange={(e) => onUpdateField("title", e.target.value)}
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
                                        onChange={(e) => onUpdatePosition("lat", e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Longitude</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="form-control"
                                        value={newBicycle.position?.lng || ""}
                                        onChange={(e) => onUpdatePosition("lng", e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Bicycle Type</label>
                                    <select
                                        className="form-select"
                                        value={newBicycle.bicycleType || "electric"}
                                        onChange={(e) => onUpdateField("bicycleType", e.target.value)}
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
                                        onChange={(e) => onUpdateField("pricePerHour", parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Location (Click on map to set)</label>
                                <Map
                                    center={newBicycle.position}
                                    zoom={13}
                                    className="rounded border"
                                    onMapReady={handleMapReady}
                                    style={{ height: '400px', width: '100%' }}
                                />
                                <small className="text-muted">Click on the map to set the bicycle location</small>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={onSave}
                            disabled={!newBicycle.title}
                        >
                            Add Bicycle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
