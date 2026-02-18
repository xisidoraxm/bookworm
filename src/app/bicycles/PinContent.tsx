"use client";

export type MarkerType = 'bicycle' | 'parking';
type BicycleType = 'electric' | 'road' | 'hybrid';
type BicycleStatus = 'available' | 'in_use' | 'maintenance' | 'temporary_unavailable';

export type MarkerData = {
  id: string | number;
  position: { lat: number; lng: number };
  title: string;
  type?: MarkerType;
  animated?: boolean;
  bicycleType?: BicycleType;
  pricePerHour?: number;
  bicycleStatus?: BicycleStatus;
  closestParkingPlaces?: { name: string; distance: number }[];
  availableBicycles?: string[];
};

function generateBicycleContent(data: MarkerData): string {
  return `
    <div class="infoWindow">
      <h4 class="infoWindowTitle">${data.title}</h4>
      <div class="infoWindowSection">
        <strong class="infoWindowLabel">Location:</strong>
        <div class="infoWindowLocation">
          Lat: ${data.position.lat.toFixed(4)}, Lng: ${data.position.lng.toFixed(4)}
        </div>
      </div>
      ${data.bicycleType ? `
        <div class="infoWindowSection">
          <strong class="infoWindowLabel">Bicycle Type:</strong>
          <span class="infoWindowValue"> ${data.bicycleType}</span>
        </div>
      ` : ''}
      ${data.bicycleStatus ? `
        <div class="infoWindowSection">
          <strong class="infoWindowLabel">Bicycle Status:</strong>
          <span class="infoWindowValue"> ${data.bicycleStatus}</span>
        </div>
      ` : ''}
      ${data.pricePerHour !== undefined ? `
        <div class="infoWindowSection">
          <strong class="infoWindowLabel">Price:</strong>
          <span class="infoWindowPrice"> €${data.pricePerHour}/hour</span>
        </div>
      ` : ''}
      ${data.closestParkingPlaces && data.closestParkingPlaces.length > 0 ? `
        <div class="infoWindowSection">
          <strong class="infoWindowLabel">Closest Parking:</strong>
          <ul class="infoWindowList">
            ${data.closestParkingPlaces.map(place => `<li class="infoWindowListItem">${place.name} - ${place.distance}m</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

function generateParkingContent(data: MarkerData): string {
  const storedMarkers = localStorage.getItem("initialMarkers");
  const allMarkers: MarkerData[] = storedMarkers ? JSON.parse(storedMarkers) : [];
  
  const availableBikes = data.availableBicycles
    ? data.availableBicycles
        .map(bikeId => allMarkers.find(m => m.id === bikeId && m.type === 'bicycle'))
        .filter(bike => bike !== undefined)
    : [];

  return `
    <div class="infoWindow">
      <h4 class="infoWindowTitle">${data.title}</h4>
      <div class="infoWindowSection">
        <strong class="infoWindowLabel">Location:</strong>
        <div class="infoWindowLocation">
          Lat: ${data.position.lat.toFixed(4)}, Lng: ${data.position.lng.toFixed(4)}
        </div>
      </div>
      ${availableBikes.length > 0 ? `
        <div class="infoWindowSection">
          <strong class="infoWindowLabel">Available Bicycles:</strong>
          <ul class="infoWindowList">
            ${availableBikes.map(bike => `
              <li class="infoWindowListItem">
                <strong>${bike!.title}</strong> - ${bike!.bicycleType} (€${bike!.pricePerHour}/hour)
              </li>
            `).join('')}
          </ul>
        </div>
      ` : `
        <div class="infoWindowSection">
          <span class="infoWindowValue">No bicycles available at this parking</span>
        </div>
      `}
    </div>
  `;
}

export function generateInfoWindowContent(data: MarkerData): string {
  const isBicycle = data.type === 'bicycle';
  return isBicycle ? generateBicycleContent(data) : generateParkingContent(data);
}