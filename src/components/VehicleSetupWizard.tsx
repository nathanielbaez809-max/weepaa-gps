import { useState } from 'react';
import { Truck, Loader2, Check, X } from 'lucide-react';
import { lookupTruckSpecs, type TruckSpecs } from '../services/truckSpecs';
import type { VehicleSpecs } from './VehicleProfile';

interface VehicleSetupWizardProps {
    onComplete: (specs: VehicleSpecs) => void;
    onClose: () => void;
}

export default function VehicleSetupWizard({ onComplete, onClose }: VehicleSetupWizardProps) {
    const [step, setStep] = useState(1);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [editedSpecs, setEditedSpecs] = useState<TruckSpecs | null>(null);
    const [hasTrailer, setHasTrailer] = useState<boolean | null>(null);
    const [trailerType, setTrailerType] = useState<'open' | 'closed' | null>(null);
    const [trailerLength, setTrailerLength] = useState(53);

    const handleLookup = async () => {
        if (!make || !model) return;

        setLoading(true);
        const specs = await lookupTruckSpecs(make, model);
        setEditedSpecs(specs);
        setLoading(false);
        setStep(2);
    };

    const handleConfirmSpecs = () => {
        setStep(3);
    };

    const handleComplete = () => {
        if (!editedSpecs) return;

        const finalSpecs: VehicleSpecs = {
            height: editedSpecs.height,
            weight: editedSpecs.weight,
            length: hasTrailer ? trailerLength : editedSpecs.length,
            hazmat: 'None'
        };

        onComplete(finalSpecs);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Vehicle Setup</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Step 1: Make & Model */}
                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">Let's start by identifying your truck.</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Make</label>
                            <input
                                type="text"
                                value={make}
                                onChange={(e) => setMake(e.target.value)}
                                placeholder="e.g., Freightliner"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="e.g., Cascadia"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <button
                            onClick={handleLookup}
                            disabled={!make || !model || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Looking up specs...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                )}

                {/* Step 2: Confirm Specs */}
                {step === 2 && editedSpecs && (
                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">I found these specs for your <strong>{make} {model}</strong>. Are they correct?</p>

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Height:</span>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={editedSpecs.height.ft}
                                        onChange={(e) => setEditedSpecs({ ...editedSpecs, height: { ...editedSpecs.height, ft: parseInt(e.target.value) || 0 } })}
                                        className="w-16 px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">ft</span>
                                    <input
                                        type="number"
                                        value={editedSpecs.height.in}
                                        onChange={(e) => setEditedSpecs({ ...editedSpecs, height: { ...editedSpecs.height, in: parseInt(e.target.value) || 0 } })}
                                        className="w-16 px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">in</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Weight:</span>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={editedSpecs.weight}
                                        onChange={(e) => setEditedSpecs({ ...editedSpecs, weight: parseInt(e.target.value) || 0 })}
                                        className="w-24 px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">lbs</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Length:</span>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={editedSpecs.length}
                                        onChange={(e) => setEditedSpecs({ ...editedSpecs, length: parseInt(e.target.value) || 0 })}
                                        className="w-24 px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">ft</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmSpecs}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Check className="w-5 h-5" />
                            Looks Good
                        </button>
                    </div>
                )}

                {/* Step 3: Trailer Questions */}
                {step === 3 && (
                    <div className="space-y-4">
                        {hasTrailer === null ? (
                            <>
                                <p className="text-slate-600 dark:text-slate-300">Are you pulling a trailer?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setHasTrailer(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => { setHasTrailer(false); handleComplete(); }}
                                        className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        No
                                    </button>
                                </div>
                            </>
                        ) : trailerType === null ? (
                            <>
                                <p className="text-slate-600 dark:text-slate-300">What type of trailer?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setTrailerType('open')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Open (Flatbed)
                                    </button>
                                    <button
                                        onClick={() => setTrailerType('closed')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Closed (Van)
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-600 dark:text-slate-300">How long is your trailer?</p>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        value={trailerLength}
                                        onChange={(e) => setTrailerLength(parseInt(e.target.value) || 53)}
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400">feet</span>
                                </div>
                                <button
                                    onClick={handleComplete}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                    Complete Setup
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
