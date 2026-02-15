// Haversinova formula za racunanje rastojanja izmedju dve tacke na globusu
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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