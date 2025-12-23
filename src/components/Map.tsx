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

// Premium SVG icon factory with consistent styling
const createPremiumIcon = (color: string, bgColor: string, iconPath: string, size: number = 40) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${bgColor}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
            <g transform="translate(${size / 4}, ${size / 4})" fill="${color}" stroke="${color}" stroke-width="0">
                ${iconPath}
            </g>
        </svg>
    `;

    return L.divIcon({
        className: 'custom-premium-icon',
        html: svg,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
    });
};

// Icon path definitions (simplified versions of Lucide icons)
const ICON_PATHS = {
    truck: '<path d="M16 3h-8a2 2 0 0 0-2 2v10h2V5h8v6h2V5a2 2 0 0 0-2-2z"/><rect x="1" y="11" width="14" height="6" rx="1"/><circle cx="4.5" cy="17" r="2"/><circle cx="11.5" cy="17" r="2"/>',
    fuel: '<path d="M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18H3z"/><path d="M13 12h4a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8l-4-4"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
    scale: '<path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    parking: '<circle cx="12" cy="12" r="10"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
};

// Color schemes for different POI types
const POI_COLORS = {
    'truck-stop': { bg: '#2563eb', fg: '#ffffff' },   // Primary blue
    'gas': { bg: '#ea580c', fg: '#ffffff' },          // Accent orange
    'rest-area': { bg: '#16a34a', fg: '#ffffff' },    // Success green
    'weigh-station': { bg: '#9333ea', fg: '#ffffff' }, // Purple
    'food': { bg: '#f59e0b', fg: '#ffffff' },         // Warning yellow
};

const REPORT_COLORS = {
    'police': { bg: '#3b82f6', fg: '#ffffff' },
    'accident': { bg: '#ef4444', fg: '#ffffff' },
    'hazard': { bg: '#f59e0b', fg: '#ffffff' },
    'scale_open': { bg: '#9333ea', fg: '#ffffff' },
    'scale_closed': { bg: '#22c55e', fg: '#ffffff' },
    'parking_full': { bg: '#ef4444', fg: '#ffffff' },
};

// Create icons
const getPoiIcon = (type: string) => {
    const colors = POI_COLORS[type as keyof typeof POI_COLORS] || POI_COLORS['gas'];
    let iconPath = ICON_PATHS.fuel;

    switch (type) {
        case 'truck-stop': iconPath = ICON_PATHS.truck; break;
        case 'rest-area': iconPath = ICON_PATHS.coffee; break;
        case 'weigh-station': iconPath = ICON_PATHS.scale; break;
        case 'food': iconPath = ICON_PATHS.coffee; break;
    }

    return createPremiumIcon(colors.fg, colors.bg, iconPath);
};

const getReportIcon = (type: string) => {
    const colors = REPORT_COLORS[type as keyof typeof REPORT_COLORS] || REPORT_COLORS['hazard'];
    const iconPath = type.includes('scale') ? ICON_PATHS.scale :
        type === 'parking_full' ? ICON_PATHS.parking : ICON_PATHS.alert;

    return createPremiumIcon(colors.fg, colors.bg, iconPath);
};

// Current location truck icon
const truckLocationIcon = L.divIcon({
    className: 'truck-location-icon',
    html: `
        <div style="
            width: 48px;
            height: 48px;
            position: relative;
        ">
            <div style="
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, #3378ff, #1a56f5);
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 4px 12px rgba(51, 120, 255, 0.5), 0 0 20px rgba(51, 120, 255, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                    <path d="M15 18H9"/>
                    <path d="M19 18h1a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H15"/>
                    <circle cx="17" cy="18" r="2"/>
                    <circle cx="7" cy="18" r="2"/>
                </svg>
            </div>
            <div style="
                position: absolute;
                inset: -4px;
                border-radius: 50%;
                border: 2px solid rgba(51, 120, 255, 0.5);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
        </div>
        <style>
            @keyframes ping {
                75%, 100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
        </style>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

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

    useEffect(() => {
        if (coordinates && coordinates.length > 0 && !currentLocation) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map, currentLocation]);

    useEffect(() => {
        if (currentLocation) {
            map.setView(currentLocation, 15, { animate: true });
        }
    }, [currentLocation, map]);

    return null;
}

// Traffic segment generator with improved colors
const getTrafficSegments = (coords: [number, number][]) => {
    const segments = [];
    let i = 0;
    while (i < coords.length - 1) {
        const length = Math.floor(Math.random() * 20) + 5;
        const end = Math.min(i + length, coords.length);
        const segmentCoords = coords.slice(i, end);

        if (i > 0) segmentCoords.unshift(coords[i]);

        const rand = Math.random();
        let color = '#22c55e'; // Green - flowing
        if (rand > 0.85) color = '#dc2626'; // Red - heavy
        else if (rand > 0.7) color = '#f97316'; // Orange - moderate
        else if (rand > 0.5) color = '#84cc16'; // Light green - light

        segments.push({ coordinates: segmentCoords, color });
        i = end - 1;
    }
    return segments;
};

export default function Map({ routeCoordinates, pois, currentLocation, communityReports, fuelPrices, parkingStatuses, darkMode = false, onReportVerified }: MapProps) {
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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            {/* Default center marker when not navigating */}
            {!routeCoordinates && !currentLocation && (
                <Marker position={position}>
                    <Popup>
                        <div className="text-center p-2">
                            <p className="font-bold text-slate-800">Ready to Navigate</p>
                            <p className="text-sm text-slate-500">Enter your route to begin</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Current Location / Truck Marker */}
            {currentLocation && (
                <Marker position={currentLocation} icon={truckLocationIcon} zIndexOffset={1000}>
                    <Popup>
                        <div className="text-center p-2">
                            <p className="font-bold text-primary-600">Your Location</p>
                            <p className="text-sm text-slate-500">
                                {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Route with Traffic Colors */}
            {routeCoordinates && routeCoordinates.length > 0 && (
                <>
                    {/* Route shadow for depth */}
                    <Polyline
                        positions={routeCoordinates}
                        color="#1e293b"
                        weight={10}
                        opacity={0.2}
                    />

                    {/* Traffic segments */}
                    {getTrafficSegments(routeCoordinates).map((segment, i) => (
                        <Polyline
                            key={i}
                            positions={segment.coordinates}
                            color={segment.color}
                            weight={6}
                            opacity={0.9}
                        />
                    ))}

                    <MapUpdater coordinates={routeCoordinates} currentLocation={currentLocation} />
                </>
            )}

            {/* POI Markers */}
            {pois && pois.map((poi) => {
                const priceInfo = fuelPrices?.find(p => p.poiId === poi.id);
                const parkingInfo = parkingStatuses?.find(p => p.poiId === poi.id);

                return (
                    <Marker key={poi.id} position={poi.location} icon={getPoiIcon(poi.type)}>
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-slate-800 text-base">{poi.name}</h3>
                                <p className="text-xs text-slate-500 capitalize mb-2">
                                    {poi.type.replace('-', ' ')}
                                </p>

                                {/* Fuel Price */}
                                {priceInfo && (
                                    <div className={`p-2 rounded-lg mb-2 ${priceInfo.isBestPrice
                                        ? 'bg-success-50 border border-success-200'
                                        : 'bg-slate-50 border border-slate-200'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Diesel</span>
                                            {priceInfo.isBestPrice && (
                                                <span className="text-[10px] font-bold text-success-600 uppercase">Best Price</span>
                                            )}
                                        </div>
                                        <p className={`text-xl font-bold ${priceInfo.isBestPrice ? 'text-success-600' : 'text-slate-800'}`}>
                                            ${priceInfo.price.toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                {/* Parking Status */}
                                {parkingInfo && (
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${parkingInfo.status === 'Full' ? 'bg-danger-500' : 'bg-primary-500'
                                                }`}>
                                                P
                                            </div>
                                            <span className={`text-sm font-bold ${parkingInfo.status === 'Full' ? 'text-danger-600' : 'text-success-600'
                                                }`}>
                                                {parkingInfo.availableSpots} spots
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{parkingInfo.prediction}</span>
                                    </div>
                                )}

                                {/* Status */}
                                {poi.status && poi.status !== 'unknown' && (
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${poi.status === 'open' ? 'text-success-600' : 'text-danger-600'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${poi.status === 'open' ? 'bg-success-500' : 'bg-danger-500'
                                            }`} />
                                        {poi.status.toUpperCase()}
                                    </div>
                                )}

                                {/* Amenities */}
                                {poi.amenities && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {poi.amenities.map(a => (
                                            <span key={a} className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Community Reports */}
            {communityReports && communityReports.map((report) => (
                <Marker key={report.id} position={report.location} icon={getReportIcon(report.type)}>
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-danger-600 capitalize text-base">
                                {report.type.replace('_', ' ')}
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">Reported by community</p>

                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-xs font-semibold text-slate-600">Still there?</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            voteReport(report.id, 'up');
                                            if (onReportVerified) onReportVerified();
                                        }}
                                        className="p-1.5 hover:bg-success-50 rounded-lg text-success-600 transition-colors"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            voteReport(report.id, 'down');
                                            if (onReportVerified) onReportVerified();
                                        }}
                                        className="p-1.5 hover:bg-danger-50 rounded-lg text-danger-600 transition-colors"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mt-2">
                                <span className={`text-xs font-bold ${report.votes >= 0 ? 'text-success-600' : 'text-danger-600'
                                    }`}>
                                    {report.votes > 0 ? '+' : ''}{report.votes} votes
                                </span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
