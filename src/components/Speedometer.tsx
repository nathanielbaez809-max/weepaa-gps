import { useState } from 'react';
import { Fuel, ChevronUp, ChevronDown } from 'lucide-react';

interface SpeedometerProps {
    currentSpeed: number;
    speedLimit: number;
    fuelEfficiency?: number; // MPG
}

export default function Speedometer({ currentSpeed, speedLimit, fuelEfficiency = 6.8 }: SpeedometerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isSpeeding = currentSpeed > speedLimit;

    // Calculate gauge percentage (0-100) for 270 degree arc
    const maxSpeed = 100;
    const speedPercent = Math.min((currentSpeed / maxSpeed) * 100, 100);

    // SVG arc calculations
    const radius = 70;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Arc spans 270 degrees (3/4 of circle), starting at 135 degrees
    const arcLength = (circumference * 270) / 360;
    const speedArc = (speedPercent / 100) * arcLength;
    const limitArc = ((speedLimit / maxSpeed) * 100 / 100) * arcLength;

    // Needle rotation (starts at -135deg, ends at 135deg for 270 degree sweep)
    const needleRotation = -135 + (speedPercent / 100) * 270;

    return (
        <div className="absolute bottom-4 left-4 z-[1000] animate-fade-in">
            <div className={`
                glass-panel-solid rounded-3xl p-4 transition-all duration-500 ease-out
                ${isExpanded ? 'w-48' : 'w-36'}
            `}>
                {/* Expand/Collapse Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 p-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
                    aria-label={isExpanded ? 'Collapse speedometer' : 'Expand speedometer'}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    )}
                </button>

                <div className="flex items-center gap-3">
                    {/* Main Gauge */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                        {/* SVG Gauge */}
                        <svg className="w-28 h-28 -rotate-[135deg]" viewBox="0 0 160 160">
                            {/* Background arc */}
                            <circle
                                cx="80"
                                cy="80"
                                r={normalizedRadius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={`${arcLength} ${circumference}`}
                                className="text-slate-200 dark:text-slate-700"
                            />

                            {/* Speed limit indicator */}
                            <circle
                                cx="80"
                                cy="80"
                                r={normalizedRadius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeDasharray={`2 ${circumference}`}
                                strokeDashoffset={-limitArc + 2}
                                className="text-warning-500"
                            />

                            {/* Speed arc - gradient effect simulated */}
                            <circle
                                cx="80"
                                cy="80"
                                r={normalizedRadius}
                                fill="none"
                                stroke={isSpeeding ? '#ef4444' : '#3378ff'}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={`${speedArc} ${circumference}`}
                                className={`transition-all duration-300 ${isSpeeding ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_8px_rgba(51,120,255,0.4)]'}`}
                            />
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {/* Needle */}
                            <div
                                className="absolute w-1 h-8 rounded-full origin-bottom transition-transform duration-200"
                                style={{
                                    transform: `translateY(-14px) rotate(${needleRotation}deg)`,
                                    background: isSpeeding
                                        ? 'linear-gradient(to top, #dc2626, #ef4444)'
                                        : 'linear-gradient(to top, #1a56f5, #3378ff)',
                                    boxShadow: isSpeeding
                                        ? '0 0 10px rgba(239, 68, 68, 0.6)'
                                        : '0 0 10px rgba(51, 120, 255, 0.4)',
                                }}
                            />
                            {/* Needle center dot */}
                            <div className={`
                                w-3 h-3 rounded-full z-10
                                ${isSpeeding ? 'bg-danger-500' : 'bg-primary-500'}
                            `} />

                            {/* Speed value */}
                            <div className="mt-2 text-center">
                                <div className={`
                                    text-3xl font-black font-display leading-none transition-colors duration-300
                                    ${isSpeeding ? 'text-danger-500' : 'text-slate-800 dark:text-white'}
                                `}>
                                    {Math.round(currentSpeed)}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    MPH
                                </div>
                            </div>
                        </div>

                        {/* Speeding warning glow */}
                        {isSpeeding && (
                            <div className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
                        )}
                    </div>

                    {/* Side Info - Speed Limit */}
                    <div className="flex flex-col gap-2">
                        {/* Speed Limit Sign */}
                        <div className="flex flex-col items-center justify-center w-14 h-16 bg-white border-2 border-slate-900 dark:border-white rounded-lg shadow-lg">
                            <span className="text-[7px] font-bold uppercase text-slate-900 dark:text-white leading-tight">Speed</span>
                            <span className="text-[7px] font-bold uppercase text-slate-900 dark:text-white leading-tight">Limit</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">{speedLimit}</span>
                        </div>

                        {/* Expanded: Fuel Efficiency */}
                        {isExpanded && (
                            <div className="flex items-center gap-1.5 bg-success-50 dark:bg-success-900/20 px-2 py-1.5 rounded-lg animate-fade-in">
                                <Fuel className="w-4 h-4 text-success-600" />
                                <div>
                                    <div className="text-sm font-bold text-success-700 dark:text-success-400">{fuelEfficiency}</div>
                                    <div className="text-[8px] text-success-600 dark:text-success-500 uppercase">MPG</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Stats Row */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 animate-fade-in">
                        <div className="text-center">
                            <div className="text-lg font-bold text-slate-800 dark:text-white">42.5</div>
                            <div className="text-[9px] uppercase text-slate-500 tracking-wide">Miles Today</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-slate-800 dark:text-white">1:24</div>
                            <div className="text-[9px] uppercase text-slate-500 tracking-wide">Time</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
