import { useState } from 'react';
import { Search, Navigation, Loader2, Plus, X, Lock, MapPin, CornerDownRight, Sparkles } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import Logo from './Logo';

interface RouteInputProps {
    onStartNavigation: (waypoints?: string[], avoidWeighStations?: boolean) => void;
    isLoading: boolean;
}

export default function RouteInput({ onStartNavigation, isLoading }: RouteInputProps) {
    const { isPremium, upgradePlan } = useSubscription();
    const [waypoints, setWaypoints] = useState<string[]>([]);
    const [avoidWeighStations, setAvoidWeighStations] = useState(false);
    const [startLocation, setStartLocation] = useState('Denver, CO');
    const [destination, setDestination] = useState('Kansas City, MO');

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
        <div className="absolute top-4 left-4 z-[1000] w-[360px] max-h-[90vh] animate-fade-in-up">
            <div className="glass-panel-solid rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="gradient-primary p-4 pb-6">
                    <Logo size="md" showTagline={true} />
                    <p className="text-primary-100 text-sm mt-2">Professional truck navigation</p>
                </div>

                {/* Route Form */}
                <div className="p-4 space-y-4 -mt-3">
                    {/* Start Location */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Starting Point
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-success-100 dark:bg-success-900/30 rounded-full">
                                <Navigation className="w-4 h-4 text-success-600 dark:text-success-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter start location"
                                value={startLocation}
                                onChange={(e) => setStartLocation(e.target.value)}
                                className="input-premium pl-12 group-hover:border-primary-300 dark:group-hover:border-primary-700"
                            />
                        </div>
                    </div>

                    {/* Waypoints */}
                    {waypoints.length > 0 && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3" />
                                Stops
                            </label>
                            {waypoints.map((wp, index) => (
                                <div key={index} className="relative flex items-center gap-2 animate-fade-in">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-accent-500 ring-2 ring-accent-200 dark:ring-accent-800" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Stop ${index + 1}`}
                                            value={wp}
                                            onChange={(e) => updateWaypoint(index, e.target.value)}
                                            className="input-premium pl-10 text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeWaypoint(index)}
                                        className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                                        aria-label={`Remove stop ${index + 1}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Stop Button */}
                    <button
                        onClick={addWaypoint}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors border border-dashed border-primary-300 dark:border-primary-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Stop
                    </button>

                    {/* Destination */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Destination
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-danger-100 dark:bg-danger-900/30 rounded-full">
                                <MapPin className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="input-premium pl-12 group-hover:border-primary-300 dark:group-hover:border-primary-700"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

                    {/* Premium Feature: Weigh Station Avoidance */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPremium ? 'bg-warning-100 dark:bg-warning-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <Sparkles className={`w-5 h-5 ${isPremium ? 'text-warning-600 dark:text-warning-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${!isPremium ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        Avoid Weigh Stations
                                    </span>
                                    {!isPremium && <Lock className="w-3 h-3 text-warning-500" />}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {isPremium ? 'Route around open scales' : 'Premium feature'}
                                </span>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => {
                                if (!isPremium) {
                                    upgradePlan('premium');
                                    return;
                                }
                                setAvoidWeighStations(!avoidWeighStations);
                            }}
                            className={`
                                relative w-12 h-7 rounded-full transition-all duration-300 
                                ${avoidWeighStations && isPremium
                                    ? 'bg-primary-500 shadow-glow'
                                    : 'bg-slate-300 dark:bg-slate-600'
                                }
                            `}
                            role="switch"
                            aria-checked={avoidWeighStations}
                            aria-label="Toggle weigh station avoidance"
                        >
                            <div
                                className={`
                                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-md
                                    transition-all duration-300
                                    ${avoidWeighStations && isPremium ? 'left-6' : 'left-1'}
                                `}
                            />
                        </button>
                    </div>

                    {/* Start Navigation Button */}
                    <button
                        onClick={() => onStartNavigation(waypoints, avoidWeighStations && isPremium)}
                        disabled={isLoading || !startLocation || !destination}
                        className="w-full btn-primary btn-touch-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Calculating Safe Route...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>Start Navigation</span>
                            </>
                        )}
                    </button>

                    {/* Quick Info */}
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                        Routes optimized for commercial vehicles
                    </p>
                </div>
            </div>
        </div>
    );
}
