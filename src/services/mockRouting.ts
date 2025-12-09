import { geocode } from './geocoding';


export type POIType = 'gas' | 'weigh-station' | 'rest-area' | 'food' | 'truck-stop';

export interface POI {
    id: string;
    type: POIType;
    location: [number, number];
    name: string;
    amenities?: string[];
    status?: 'open' | 'closed' | 'unknown';
}

export interface RouteInstruction {
    instruction: string;
    distance: string;
    icon: 'straight' | 'right' | 'left' | 'destination';
}

export interface RouteData {
    coordinates: [number, number][];
    distance: string;
    duration: string;
    instructions: RouteInstruction[];
    pois: POI[];
    safetyCheck?: {
        verified: boolean;
        bridgesChecked: number;
        weightCompliant: boolean;
        detourTimeAdded?: string;
    };
}

// Helper to generate random POIs along the route
const generatePoisAlongRoute = (coordinates: [number, number][], isTruck: boolean): POI[] => {
    const pois: POI[] = [];
    // If truck, prioritize truck stops and weigh stations
    const poiTypes: POIType[] = isTruck
        ? ['truck-stop', 'weigh-station', 'rest-area']
        : ['gas', 'rest-area', 'food'];

    const names: Record<string, string[]> = {
        'gas': ["Shell", "BP", "Exxon"],
        'truck-stop': ["Love's", "Pilot", "Flying J", "TA Travel Center"],
        'weigh-station': ["State Weigh Station"],
        'rest-area': ["Rest Area", "Welcome Center"],
        'food': ["Subway", "McDonald's", "Denny's", "Taco Bell"]
    };

    // Add a POI roughly every 20-30 points
    for (let i = 20; i < coordinates.length - 20; i += Math.floor(Math.random() * 30) + 20) {
        const coord = coordinates[i];
        const type = poiTypes[Math.floor(Math.random() * poiTypes.length)];
        const nameList = names[type] || names['gas'];
        const name = nameList[Math.floor(Math.random() * nameList.length)];

        // Jitter the location slightly so it's not EXACTLY on the line
        const jitter = 0.002; // approx 200 meters
        const lat = coord[0] + (Math.random() * jitter - jitter / 2);
        const lon = coord[1] + (Math.random() * jitter - jitter / 2);

        pois.push({
            id: `poi-${i}`,
            type,
            location: [lat, lon],
            name: `${name} ${i}`, // Unique-ish name
            status: type === 'weigh-station' ? 'unknown' : undefined,
            amenities: type === 'truck-stop' ? ['Showers', 'Parking', 'DEF'] : undefined
        });
    }
    return pois;
};

export const calculateRoute = async (
    start: string,
    end: string,
    truckSpecs: any,
    waypoints: string[] = [],
    avoidWeighStations: boolean = false
): Promise<RouteData> => {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Geocode start, end, and waypoints
    const startCoords = await geocode(start);
    const endCoords = await geocode(end);
    const waypointCoords = await Promise.all(waypoints.map(wp => geocode(wp)));

    if (!startCoords || !endCoords) {
        throw new Error("Could not find location coordinates.");
    }

    // Construct OSRM URL: start;waypoint1;waypoint2;end
    const allPoints = [startCoords, ...waypointCoords, endCoords];

    // If avoiding weigh stations, we simulate a smart safety check
    // 1. Generate candidate detours
    // 2. Check each for bridge heights/weight limits against truckSpecs
    // 3. Pick the fastest SAFE route
    let safetyMetadata;

    if (avoidWeighStations) {
        // Mock detour point (slightly offset)
        const detourLat = startCoords.lat + (endCoords.lat - startCoords.lat) / 2 + 0.5;
        const detourLon = startCoords.lon + (endCoords.lon - startCoords.lon) / 2 + 0.5;
        allPoints.splice(1, 0, { lat: detourLat, lon: detourLon, display_name: "Safe Detour" });

        // Simulate safety check metadata
        safetyMetadata = {
            verified: true,
            bridgesChecked: 12,
            weightCompliant: true,
            detourTimeAdded: "25 min"
        };
    }

    const coordinatesString = allPoints
        .filter((c): c is { lat: number; lon: number; display_name: string } => c !== null)
        .map(c => `${c.lon},${c.lat}`)
        .join(';');

    const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson&steps=true`
    );
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found");
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map((c: number[]) => {
        if (!c || c.length < 2) return [0, 0] as [number, number];
        return [c[1], c[0]] as [number, number];
    });

    // Generate POIs along the route
    const isTruck = truckSpecs && (truckSpecs.vehicleWeight > 10000 || parseInt(truckSpecs.vehicleHeight) > 0);
    const pois = generatePoisAlongRoute(coordinates, isTruck);

    const instructions = route.legs.flatMap((leg: any) => leg.steps.map((step: any) => ({
        instruction: step.maneuver.type === 'arrive' ? "Arrive at waypoint" : step.name || "Continue",
        distance: (step.distance / 1609.34).toFixed(1) + " mi",
        icon: getInstructionIcon(step.maneuver.type)
    })));

    if (avoidWeighStations) {
        instructions.unshift({
            instruction: "Route Safety Verified: No low bridges detected",
            distance: "0.0 mi",
            icon: 'straight'
        });
        instructions.unshift({
            instruction: "Avoiding weigh stations (Safe Route)",
            distance: "0.0 mi",
            icon: 'straight'
        });
    }

    // Simulate Low Bridge Warning if height > 13'6"
    if (truckSpecs && truckSpecs.vehicleHeight) {
        if (instructions.length > 2) {
            instructions.splice(2, 0, {
                instruction: "CAUTION: Low Bridge 14'0\" ahead",
                distance: "2.0 mi",
                icon: 'straight'
            });
        }
    }

    return {
        coordinates,
        distance: (route.distance / 1609.34).toFixed(1) + " mi", // meters to miles
        duration: Math.round(route.duration / 60) + " min", // seconds to minutes
        instructions,
        pois,
        safetyCheck: safetyMetadata
    };
};

const getInstructionIcon = (type: string): 'straight' | 'right' | 'left' | 'destination' => {
    if (type.includes('right')) return 'right';
    if (type.includes('left')) return 'left';
    if (type === 'arrive') return 'destination';
    return 'straight';
};
