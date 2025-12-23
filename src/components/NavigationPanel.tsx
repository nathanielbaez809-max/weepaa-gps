import { ArrowRight, ArrowLeft, ArrowUp, MapPin, ShieldCheck, Clock, Ruler, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { RouteData, RouteInstruction } from '../services/routing';
import { useState } from 'react';

interface NavigationPanelProps {
    instructions: RouteInstruction[];
    distance: string;
    duration: string;
    onClose: () => void;
    routeData: RouteData;
}

export default function NavigationPanel({ instructions, distance, duration, onClose, routeData }: NavigationPanelProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    const getIcon = (type: string, size: 'lg' | 'sm' = 'lg') => {
        const iconClass = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
        switch (type) {
            case 'right': return <ArrowRight className={iconClass} />;
            case 'left': return <ArrowLeft className={iconClass} />;
            case 'destination': return <MapPin className={iconClass} />;
            default: return <ArrowUp className={iconClass} />;
        }
    };

    // Calculate ETA
    const eta = new Date();
    const durationParts = duration.match(/(\d+)\s*hr\s*(\d+)\s*min/);
    if (durationParts) {
        eta.setHours(eta.getHours() + parseInt(durationParts[1]));
        eta.setMinutes(eta.getMinutes() + parseInt(durationParts[2]));
    } else {
        const minMatch = duration.match(/(\d+)\s*min/);
        if (minMatch) eta.setMinutes(eta.getMinutes() + parseInt(minMatch[1]));
    }
    const etaString = eta.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <div className={`
            absolute top-4 left-4 z-[1000] 
            glass-panel-solid rounded-2xl shadow-premium
            w-[380px] max-h-[85vh] flex flex-col
            transition-all duration-500 ease-out animate-slide-in-left
            ${isMinimized ? 'max-h-[200px]' : ''}
        `}>
            {/* Header with minimize toggle */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    <span className="text-sm font-medium">
                        {isMinimized ? 'Show Details' : 'Hide Details'}
                    </span>
                </button>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded-lg transition-colors group"
                    aria-label="End navigation"
                >
                    <X className="w-5 h-5 text-slate-400 group-hover:text-danger-500 transition-colors" />
                </button>
            </div>

            {/* Safety Check Badge */}
            {routeData.safetyCheck && !isMinimized && (
                <div className="mx-4 mt-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/30 rounded-xl p-3 flex items-start gap-3 animate-fade-in">
                    <div className="p-1.5 bg-success-100 dark:bg-success-900/40 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-success-800 dark:text-success-300">Route Safety Verified</h3>
                        <p className="text-xs text-success-700 dark:text-success-400 mt-0.5">
                            Checked {routeData.safetyCheck.bridgesChecked} bridges • Height & Weight compliant
                        </p>
                        {routeData.safetyCheck.detourTimeAdded && (
                            <p className="text-xs text-success-600 dark:text-success-500 mt-1 font-medium">
                                🛣️ Optimized detour: +{routeData.safetyCheck.detourTimeAdded}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Next Instruction Card */}
            <div className="m-4 nav-instruction rounded-2xl p-5 animate-fade-in-up">
                <div className="flex items-start gap-4">
                    {/* Direction Icon */}
                    <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {instructions.length > 0 && getIcon(instructions[0].icon)}
                    </div>

                    {/* Instruction Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-black font-display tracking-tight">
                                {instructions.length > 0 ? instructions[0].distance : '0 ft'}
                            </h2>
                        </div>
                        <p className="text-lg font-medium opacity-90 leading-tight mt-1 truncate">
                            {instructions.length > 0 ? instructions[0].instruction : 'Arrived'}
                        </p>
                    </div>
                </div>

                {/* Lane Guidance */}
                <div className="mt-5 flex gap-1.5 justify-center">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={`
                                w-9 h-12 rounded-lg flex items-center justify-center
                                border-2 transition-all duration-300
                                ${i === 3
                                    ? 'bg-white text-primary-600 border-white scale-110 shadow-lg'
                                    : 'border-white/40 text-white/60 hover:border-white/60'
                                }
                            `}
                        >
                            <ArrowUp className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Trip Info Bar */}
            <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
                <div className="stat-card items-center">
                    <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    <div className="stat-value text-xl">{duration}</div>
                    <div className="stat-label text-[10px]">Duration</div>
                </div>
                <div className="stat-card items-center">
                    <Ruler className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    <div className="stat-value text-xl">{distance}</div>
                    <div className="stat-label text-[10px]">Distance</div>
                </div>
                <div className="stat-card items-center bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/30">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase">ETA</span>
                    <div className="stat-value text-xl text-primary-700 dark:text-primary-300">{etaString}</div>
                    <div className="stat-label text-[10px]text-primary-500">Arrival</div>
                </div>
            </div>

            {/* Upcoming Instructions List */}
            {!isMinimized && (
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-thin">
                    {instructions.slice(1).map((instruction, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex-shrink-0 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {getIcon(instruction.icon, 'sm')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight truncate">
                                    {instruction.instruction}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                    {instruction.distance}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* End Navigation Button */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <button
                    onClick={onClose}
                    className="w-full btn-danger"
                    aria-label="End navigation"
                >
                    End Navigation
                </button>
            </div>
        </div>
    );
}
