import type { RouteData, RouteInstruction } from './mockRouting';

// OSRM returns geometry as an encoded polyline, but for simplicity in this demo 
// we will request 'geojson' or 'polyline' (default is polyline5).
// We'll use a simple polyline decoder or request geojson. 
// Let's request `geometries=geojson` for easy parsing.

interface OSRMStep {
    geometry: { coordinates: [number, number][] };
    maneuver: {
        type: string;
        modifier?: string;
        location: [number, number];
    };
    name: string;
    duration: number;
    distance: number;
}

interface OSRMLeg {
    steps: OSRMStep[];
    distance: number;
    duration: number;
}

interface OSRMRoute {
    geometry: { coordinates: [number, number][] };
    legs: OSRMLeg[];
    distance: number;
    duration: number;
}

interface OSRMResponse {
    routes: OSRMRoute[];
    code: string;
}

export const getOsrmRoute = async (
    start: [number, number],
    end: [number, number]
): Promise<RouteData | null> => {
    try {
        // OSRM expects "lon,lat"
        const startStr = `${start[1]},${start[0]}`;
        const endStr = `${end[1]},${end[0]}`;

        const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);
        const data: OSRMResponse = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.error("OSRM Error:", data);
            return null;
        }

        const route = data.routes[0];

        // Convert GeoJSON coordinates [lon, lat] to Leaflet [lat, lon]
        const coordinates = route.geometry.coordinates.map(
            (coord) => [coord[1], coord[0]] as [number, number]
        );

        // Format Instructions
        const instructions: RouteInstruction[] = [];
        // let currentDist = 0; // Unused

        route.legs.forEach((leg) => {
            leg.steps.forEach((step) => {
                // Skip "arrive" steps if they are just 0 distance
                if (step.distance === 0 && step.maneuver.type !== 'arrive') return;

                let text = step.maneuver.type;
                if (step.maneuver.modifier) {
                    text += ` ${step.maneuver.modifier}`;
                }
                if (step.name) {
                    text += ` on ${step.name}`;
                }

                // Clean up text
                text = text.replace('turn right', 'Turn right')
                    .replace('turn left', 'Turn left')
                    .replace('new name', 'Continue')
                    .replace('depart', 'Head');

                // Simple icon mapping
                let icon: 'straight' | 'right' | 'left' | 'destination' = 'straight';
                if (step.maneuver.type.includes('right') || step.maneuver.modifier?.includes('right')) icon = 'right';
                if (step.maneuver.type.includes('left') || step.maneuver.modifier?.includes('left')) icon = 'left';
                if (step.maneuver.type === 'arrive') icon = 'destination';

                instructions.push({
                    instruction: text,
                    distance: `${(step.distance / 1609.34).toFixed(1)} mi`, // meters to miles
                    icon: icon
                });
            });
        });

        return {
            coordinates,
            distance: `${(route.distance / 1609.34).toFixed(1)} miles`,
            duration: formatDuration(route.duration),
            instructions,
            pois: [] // We will populate this separately
        };

    } catch (error) {
        console.error("OSRM Request Failed:", error);
        return null;
    }
};

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
}
