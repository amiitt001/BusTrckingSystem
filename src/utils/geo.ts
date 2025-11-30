// College Location (Destination)
export const COLLEGE_LOCATION = { lat: 28.4744, lng: 77.5040 };

// Known Bus Stops
export const BUS_STOPS = [
    { id: 1, name: "Pari Chowk", lat: 28.4644, lng: 77.5140 },
    { id: 2, name: "Alpha 1", lat: 28.4844, lng: 77.5240 },
    { id: 3, name: "Delta 1", lat: 28.4944, lng: 77.5340 },
    { id: 4, name: "Gamma 2", lat: 28.4700, lng: 77.5100 },
];

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Formats duration in minutes to a readable string.
 */
export function formatDuration(minutes: number): string {
    if (minutes < 1) return "Arriving now";
    return `${Math.ceil(minutes)} mins`;
}
