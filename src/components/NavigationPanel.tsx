import { ArrowRight, ArrowLeft, ArrowUp, MapPin, ShieldCheck } from 'lucide-react';
import type { RouteData, RouteInstruction } from '../services/routing';

interface NavigationPanelProps {
    instructions: RouteInstruction[];
    distance: string;
    duration: string;
    onClose: () => void;
    routeData: RouteData;
}

export default function NavigationPanel({ instructions, distance, duration, onClose, routeData }: NavigationPanelProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'right': return <ArrowRight className="w-12 h-12" />;
            case 'left': return <ArrowLeft className="w-12 h-12" />;
            case 'destination': return <MapPin className="w-12 h-12" />;
            default: return <ArrowUp className="w-12 h-12" />;
        }
    };

    return (

        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl w-96 max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Safety Check Badge */}
            {routeData.safetyCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-green-800">Route Safety Verified</h3>
                        <p className="text-xs text-green-700 mt-1">
                            Checked {routeData.safetyCheck.bridgesChecked} bridges. Height & Weight compliant.
                        </p>
                        {routeData.safetyCheck.detourTimeAdded && (
                            <p className="text-xs text-green-600 mt-1 italic">
                                Optimized detour adds only {routeData.safetyCheck.detourTimeAdded}.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Next Instruction */}
            <div className="bg-blue-600 rounded-xl p-4 text-white mb-4 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                        {instructions.length > 0 && getIcon(instructions[0].icon)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold">{instructions.length > 0 ? instructions[0].distance : '0 ft'}</h2>
                        <p className="text-lg font-medium opacity-90 leading-tight">
                            {instructions.length > 0 ? instructions[0].instruction : 'Arrived'}
                        </p>
                    </div>
                </div>

                {/* Mock Lane Guidance */}
                <div className="mt-4 flex gap-1 justify-center opacity-80">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-8 h-10 border-2 border-white/50 rounded flex items-center justify-center ${i === 3 ? 'bg-white text-blue-600' : ''}`}>
                            <ArrowUp className="w-4 h-4" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Trip Info */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{duration}</h3>
                    <p className="text-base text-slate-500 dark:text-slate-400">{distance}</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-gray-500 uppercase">Truck Limit</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-white border-2 border-slate-800 dark:border-white rounded px-2 inline-block">
                        65
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {instructions.slice(1).map((instruction, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-400 dark:text-gray-500">
                            {getIcon(instruction.icon)}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{instruction.instruction}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{instruction.distance}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                className="mt-4 w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors"
            >
                End Navigation
            </button>
        </div>
    );
}
