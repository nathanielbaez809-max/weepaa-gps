import type { POI } from './routing';

export interface ParkingStatus {
    poiId: string;
    status: 'Low' | 'Medium' | 'High' | 'Full';
    totalSpots: number;
    availableSpots: number;
    prediction: string; // e.g., "Likely full by 8 PM"
}

export const getParkingStatus = async (pois: POI[]): Promise<ParkingStatus[]> => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const parkingPois = pois.filter(p => p.type === 'truck-stop' || p.type === 'rest-area');

    if (parkingPois.length === 0) return [];

    const currentHour = new Date().getHours();

    return parkingPois.map(poi => {
        const totalSpots = Math.floor(Math.random() * 50) + 20; // 20-70 spots

        // Simulate fullness based on time (Fuller at night: 18:00 - 06:00)
        let fullnessFactor = Math.random();
        if (currentHour >= 18 || currentHour < 6) {
            fullnessFactor = Math.max(fullnessFactor, 0.8); // At least 80% full at night
        }

        const occupied = Math.floor(totalSpots * fullnessFactor);
        const available = totalSpots - occupied;

        let status: ParkingStatus['status'] = 'Low';
        if (available === 0) status = 'Full';
        else if (available < 5) status = 'High';
        else if (available < 15) status = 'Medium';

        let prediction = "Spots available";
        if (status === 'High' || status === 'Full') prediction = "Full soon";
        if (currentHour >= 16 && currentHour < 20) prediction = "Filling up fast";

        return {
            poiId: poi.id,
            status,
            totalSpots,
            availableSpots: available,
            prediction
        };
    });
};
