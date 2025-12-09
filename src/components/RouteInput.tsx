import { useState } from 'react';
import { Search, Truck, Navigation, Loader2, Plus, X, Lock } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface RouteInputProps {
    onStartNavigation: (waypoints?: string[], avoidWeighStations?: boolean) => void;
    isLoading: boolean;
}

export default function RouteInput({ onStartNavigation, isLoading }: RouteInputProps) {
    const { isPremium, upgradePlan } = useSubscription();
    const [waypoints, setWaypoints] = useState<string[]>([]);
    const [avoidWeighStations, setAvoidWeighStations] = useState(false);

    const addWaypoint = () => {
        setWaypoints([...waypoints, ""]);
    };

    const removeWaypoint = (index: number) => {
        const newWaypoints = [...waypoints];
        newWaypoints.splice(index, 1);
        setWaypoints(newWaypoints);
    };

    const updateWaypoint = (index: number, value: string) => {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = value;
        setWaypoints(newWaypoints);
    };
    return (
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-xl w-80 max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Truck className="w-6 h-6 text-blue-600" />
                Weepaa Truck GPS
            </h2>

            <div className="space-y-4">
                {/* Route Inputs */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Route</label>
                    <div className="relative">
                        <Navigation className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Start Location"
                            defaultValue="Denver, CO"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Waypoints */}
                    {waypoints.map((wp, index) => (
                        <div key={index} className="relative flex items-center gap-1">
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Add stop"
                                    value={wp}
                                    onChange={(e) => updateWaypoint(index, e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <button onClick={() => removeWaypoint(index)} className="p-2 text-slate-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addWaypoint}
                        className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                    >
                        <Plus className="w-4 h-4" /> Add Stop
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Destination"
                            defaultValue="Kansas City, MO"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Truck Specs */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                    <label className="text-sm font-medium text-slate-600">Truck Specifications</label>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500">Height (ft)</label>
                            <input
                                type="number"
                                placeholder="13.5"
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Weight (lbs)</label>
                            <input
                                type="number"
                                placeholder="80000"
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Length (ft)</label>
                            <input
                                type="number"
                                placeholder="53"
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Width (ft)</label>
                            <input
                                type="number"
                                placeholder="8.5"
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="hazmat" className="rounded text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="hazmat" className="text-sm text-slate-600">Hazmat Load</label>
                    </div>

                    {/* Premium Feature: Weigh Station Avoidance (Premium $150/year only) */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <label htmlFor="avoidWeigh" className={`text-sm font-medium ${!isPremium ? 'text-slate-400' : 'text-slate-700'}`}>
                                Avoid Weigh Stations
                            </label>
                            {!isPremium && <Lock className="w-3 h-3 text-yellow-500" />}
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="avoidWeigh"
                                id="avoidWeigh"
                                checked={avoidWeighStations}
                                onChange={(e) => {
                                    if (!isPremium) {
                                        upgradePlan('premium');
                                        return;
                                    }
                                    setAvoidWeighStations(e.target.checked);
                                }}
                                className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer ${avoidWeighStations ? 'right-0 border-blue-600' : 'left-0 border-slate-300'}`}
                            />
                            <label
                                htmlFor="avoidWeigh"
                                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${avoidWeighStations ? 'bg-blue-600' : 'bg-slate-300'}`}
                            ></label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onStartNavigation(waypoints, avoidWeighStations)}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        "Start Navigation"
                    )}
                </button>
            </div>
        </div>
    );
}
