import type { POI } from './routing';

export interface FuelPrice {
    poiId: string;
    price: number; // e.g. 3.45
    currency: string;
    isBestPrice: boolean;
}

export const getFuelPrices = async (pois: POI[]): Promise<FuelPrice[]> => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const fuelPois = pois.filter(p => p.type === 'gas' || p.type === 'truck-stop');

    if (fuelPois.length === 0) return [];

    // Generate random prices between $3.20 and $4.50
    const prices: FuelPrice[] = fuelPois.map(poi => ({
        poiId: poi.id,
        price: parseFloat((3.20 + Math.random() * 1.30).toFixed(2)),
        currency: 'USD',
        isBestPrice: false
    }));

    // Find best price
    const minPrice = Math.min(...prices.map(p => p.price));
    prices.forEach(p => {
        if (p.price === minPrice) p.isBestPrice = true;
    });

    return prices;
};
