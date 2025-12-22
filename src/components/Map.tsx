import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { POI } from '../services/routing';
import type { FuelPrice } from '../services/fuel';
import type { ParkingStatus } from '../services/parking';
import type { CommunityReport } from '../services/reports';
import { voteReport } from '../services/reports';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

// Fix for default marker icon missing in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// We can create custom icons using L.divIcon with Lucide icons inside
const createCustomIcon = (color: string, type: 'truck' | 'coffee' | 'scale' | 'alert') => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 drop-shadow-md">
      <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2" />
      <circle cx="12" cy="12" r="8" fill="${color}" />
      ${type === 'truck' ? '<path d="M10 17h4V5H2v12h3v0h7v0zM20 17h2v-3.34l-4-5.34V17h2z" fill="white" stroke="none"/>' : ''}
      ${type === 'coffee' ? '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="none" stroke="white"/>' : ''}
      ${type === 'scale' ? '<path d="M12 3v18M6 8h12M6 16h12" fill="none" stroke="white"/>' : ''} 
      ${type === 'alert' ? '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" fill="none" stroke="white"/>' : ''}
    </svg>
  `;

    return L.divIcon({
        className: 'custom-icon',
        html: svg,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const truckIcon = createCustomIcon('#2563eb', 'truck'); // Blue
const restIcon = createCustomIcon('#16a34a', 'coffee'); // Green
const weighIcon = createCustomIcon('#9333ea', 'scale'); // Purple
const alertIcon = createCustomIcon('#dc2626', 'alert'); // Red
const gasIcon = createCustomIcon('#ea580c', 'truck'); // Orange
const scaleIcon = createCustomIcon('#9333ea', 'scale'); // Purple
const parkingIcon = createCustomIcon('#ef4444', 'truck'); // Red for full parking

const getCustomPoiIcon = (type: string) => {
    switch (type) {
        case 'truck-stop': return truckIcon;
        case 'rest-area': return restIcon;
        case 'weigh-station': return weighIcon;
        case 'gas': return gasIcon;
        default: return DefaultIcon;
    }
};

const getCustomReportIcon = (type: string) => {
    switch (type) {
        case 'scale_open': return scaleIcon;
        case 'scale_closed': return scaleIcon;
        case 'parking_full': return parkingIcon;
        default: return alertIcon;
    }
};

interface MapProps {
    routeCoordinates?: [number, number][];
    pois?: POI[];
    currentLocation?: [number, number];
    fuelPrices?: FuelPrice[];
    parkingStatuses?: ParkingStatus[];
    communityReports?: CommunityReport[];
    darkMode?: boolean;
    onReportVerified?: () => void;
}

function MapUpdater({ coordinates, currentLocation }: { coordinates?: [number, number][], currentLocation?: [number, number] }) {
    const map = useMap();

    // Fit bounds to route initially
    useEffect(() => {
        if (coordinates && coordinates.length > 0 && !currentLocation) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map, currentLocation]);

    // Follow current location
    useEffect(() => {
        if (currentLocation) {
            map.setView(currentLocation, 15, { animate: true });
        }
    }, [currentLocation, map]);

    return null;
}

// Helper to split route into traffic segments (mock)
const getTrafficSegments = (coords: [number, number][]) => {
    const segments = [];
    let i = 0;
    while (i < coords.length - 1) {
        // Random length for this segment
        const length = Math.floor(Math.random() * 20) + 5;
        const end = Math.min(i + length, coords.length);
        const segmentCoords = coords.slice(i, end);

        // Ensure connectivity
        if (i > 0) segmentCoords.unshift(coords[i]);

        // Random traffic status
        const rand = Math.random();
        let color = '#22c55e'; // Green
        if (rand > 0.8) color = '#ef4444'; // Red
        else if (rand > 0.6) color = '#f97316'; // Orange

        segments.push({ coordinates: segmentCoords, color });
        i = end - 1;
    }
    return segments;
};

export default function Map({ routeCoordinates, pois, currentLocation, communityReports, fuelPrices, parkingStatuses, darkMode = false, onReportVerified }: MapProps) {
    // Default to center of US or a specific location
    const position: [number, number] = [39.8283, -98.5795];
    const displayPosition = currentLocation || position;

    return (
        <MapContainer center={displayPosition} zoom={4} scrollWheelZoom={true} className="w-full h-full z-0">
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Street">
                    <TileLayer
                        url={darkMode
                            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        }
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            {/* Show start marker if no route and no current location */}
            {
                !routeCoordinates && !currentLocation && (
                    <Marker position={position}>
                        <Popup>
                            Center of the US. <br /> Ready to navigate.
                        </Popup>
                    </Marker>
                )
            }

            {/* Current Location / Truck Marker */}
            {
                currentLocation && (
                    <Marker position={currentLocation} icon={DefaultIcon} zIndexOffset={1000}>
                        <Popup>
                            Current Location
                        </Popup>
                    </Marker>
                )
            }

            {/* Route Line with Traffic Colors */}
            {
                routeCoordinates && routeCoordinates.length > 0 && (
                    <>
                        {/* 
                        For demo purposes, we will split the route into segments and color them.
                        In a real app, we'd get speed data for each segment.
                    */}
                        {getTrafficSegments(routeCoordinates).map((segment, i) => (
                            <Polyline
                                key={i}
                                positions={segment.coordinates}
                                color={segment.color}
                                weight={6}
                                opacity={0.8}
                            />
                        ))}
                        <MapUpdater coordinates={routeCoordinates} currentLocation={currentLocation} />
                    </>
                )
            }

            {/* POI Markers */}
            {
                pois && pois.map((poi) => {
                    const priceInfo = fuelPrices?.find(p => p.poiId === poi.id);

                    return (
                        <Marker key={poi.id} position={poi.location} icon={getCustomPoiIcon(poi.type)}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm">{poi.name}</h3>
                                    <p className="text-xs text-gray-500 capitalize">{poi.type.replace('-', ' ')}</p>

                                    {/* Fuel Price Display */}
                                    {priceInfo && (
                                        <div className={`mt-2 p-1 rounded text-center ${priceInfo.isBestPrice ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}>
                                            <p className="text-xs text-gray-500">Diesel</p>
                                            <p className={`font-bold ${priceInfo.isBestPrice ? 'text-green-700 text-lg' : 'text-gray-800'}`}>
                                                ${priceInfo.price.toFixed(2)}
                                            </p>
                                            {priceInfo.isBestPrice && <p className="text-[10px] text-green-600 font-bold uppercase">Best Price</p>}
                                        </div>
                                    )}

                                    {/* Parking Status Display */}
                                    {parkingStatuses?.find(p => p.poiId === poi.id) && (
                                        <div className="mt-2 border-t pt-1">
                                            {(() => {
                                                const status = parkingStatuses.find(p => p.poiId === poi.id)!;
                                                let color = 'text-green-600';
                                                if (status.status === 'Medium') color = 'text-yellow-600';
                                                if (status.status === 'High' || status.status === 'Full') color = 'text-red-600';

                                                return (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold ${status.status === 'Full' ? 'bg-red-600' : 'bg-blue-600'}`}>P</div>
                                                            <span className={`text-xs font-bold ${color}`}>{status.availableSpots} spots</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 italic">{status.prediction}</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Status Indicator */}
                                    {poi.status && poi.status !== 'unknown' && (
                                        <div className={`mt-1 text-xs font-bold flex items-center gap-1 ${poi.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className={`w-2 h-2 rounded-full ${poi.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {poi.status.toUpperCase()}
                                        </div>
                                    )}

                                    {poi.amenities && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {poi.amenities.map(a => (
                                                <span key={a} className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })
            }

            {/* Community Reports */}
            {
                communityReports && communityReports.map((report) => (
                    <Marker key={report.id} position={report.location} icon={getCustomReportIcon(report.type)}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm capitalize text-red-600">{report.type.replace('_', ' ')}</h3>
                                <p className="text-xs text-gray-500">Reported by Community</p>

                                <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
                                    <span className="text-xs font-bold text-slate-600">Still here?</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                voteReport(report.id, 'up');
                                                if (onReportVerified) onReportVerified();
                                            }}
                                            className="p-1 hover:bg-green-100 rounded text-green-600"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                voteReport(report.id, 'down');
                                                if (onReportVerified) onReportVerified();
                                            }}
                                            className="p-1 hover:bg-red-100 rounded text-red-600"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center mt-1">
                                    <span className={`text-[10px] font-bold ${report.votes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {report.votes > 0 ? '+' : ''}{report.votes} Verified
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))
            }
        </MapContainer >
    );
}
