import { useState } from 'react';
import { Truck, Loader2, Check, X, ChevronLeft, Package, Ruler } from 'lucide-react';
import { lookupTruckSpecs, type TruckSpecs } from '../services/truckSpecs';
import type { VehicleSpecs } from './VehicleProfile';
import Logo from './Logo';
import heroBg from '../assets/hero_bg.png';

interface VehicleSetupWizardProps {
    onComplete: (specs: VehicleSpecs) => void;
    onClose: () => void;
}

// Common presets for quick selection
const TRUCK_PRESETS = [
    { name: 'Standard 53\' Trailer', height: { ft: 13, in: 6 }, weight: 80000, length: 73 },
    { name: '48\' Flatbed', height: { ft: 13, in: 6 }, weight: 48000, length: 68 },
    { name: 'Box Truck (26\')', height: { ft: 12, in: 0 }, weight: 26000, length: 26 },
    { name: 'Sprinter Van', height: { ft: 9, in: 6 }, weight: 10000, length: 24 },
];

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

    const handlePresetSelect = (preset: typeof TRUCK_PRESETS[0]) => {
        setEditedSpecs({
            height: preset.height,
            weight: preset.weight,
            length: preset.length,
            make: 'Preset',
            model: preset.name,
            axles: 5,
        });
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

    const canClose = step > 1 || editedSpecs !== null;

    const stepLabels = ['Identify', 'Specs', 'Trailer'];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[3000] p-4 hero-bg"
            style={{ backgroundImage: `url(${heroBg})` }}
            role="dialog"
            aria-label="Vehicle Setup Wizard"
        >
            {/* Dark overlay */}
            <div className="hero-overlay" aria-hidden="true" />

            {/* Modal content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-premium max-w-lg w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="gradient-primary p-6 pb-8">
                    <div className="flex justify-between items-start">
                        <Logo size="md" showTagline={false} />
                        {canClose && (
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                aria-label="Close setup wizard"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold font-display text-white mt-4">Vehicle Setup</h2>
                    <p className="text-primary-100 text-sm mt-1">
                        {step === 1 && "Let's identify your truck for safe routing"}
                        {step === 2 && "Confirm your vehicle specifications"}
                        {step === 3 && "One more question about your setup"}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-3 -mt-4 relative z-10">
                    {stepLabels.map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = step === stepNum;
                        const isCompleted = step > stepNum;
                        return (
                            <div key={i} className="flex flex-col items-center">
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                        transition-all duration-300 shadow-lg
                                        ${isCompleted
                                            ? 'bg-success-500 text-white'
                                            : isActive
                                                ? 'bg-white text-primary-600 ring-4 ring-primary-200'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }
                                    `}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                </div>
                                <span className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="p-6 pt-6">
                    {/* Step 1: Make & Model or Preset */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Quick Presets */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Quick Setup
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {TRUCK_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => handlePresetSelect(preset)}
                                            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {preset.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <span className="text-xs text-slate-400 uppercase">or look up your truck</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>

                            {/* Make & Model Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Make
                                    </label>
                                    <input
                                        type="text"
                                        value={make}
                                        onChange={(e) => setMake(e.target.value)}
                                        placeholder="e.g., Freightliner"
                                        className="input-premium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="e.g., Cascadia"
                                        className="input-premium"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLookup}
                                disabled={!make || !model || loading}
                                className="w-full btn-primary btn-touch-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Looking up specs...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="w-5 h-5" />
                                        Look Up Specs
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Confirm Specs */}
                    {step === 2 && editedSpecs && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Ruler className="w-5 h-5 text-primary-500" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Vehicle Dimensions
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {/* Height */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Height</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editedSpecs.height.ft}
                                                onChange={(e) => setEditedSpecs({ ...editedSpecs, height: { ...editedSpecs.height, ft: parseInt(e.target.value) || 0 } })}
                                                className="w-16 px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                                            />
                                            <span className="text-slate-500 text-sm">ft</span>
                                            <input
                                                type="number"
                                                value={editedSpecs.height.in}
                                                onChange={(e) => setEditedSpecs({ ...editedSpecs, height: { ...editedSpecs.height, in: parseInt(e.target.value) || 0 } })}
                                                className="w-16 px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                                            />
                                            <span className="text-slate-500 text-sm">in</span>
                                        </div>
                                    </div>

                                    {/* Weight */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Weight</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editedSpecs.weight}
                                                onChange={(e) => setEditedSpecs({ ...editedSpecs, weight: parseInt(e.target.value) || 0 })}
                                                className="w-28 px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                                            />
                                            <span className="text-slate-500 text-sm">lbs</span>
                                        </div>
                                    </div>

                                    {/* Length */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Length</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editedSpecs.length}
                                                onChange={(e) => setEditedSpecs({ ...editedSpecs, length: parseInt(e.target.value) || 0 })}
                                                className="w-28 px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                                            />
                                            <span className="text-slate-500 text-sm">ft</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="btn-secondary flex-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirmSpecs}
                                    className="btn-primary flex-[2]"
                                >
                                    <Check className="w-5 h-5" />
                                    Looks Good
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Trailer Questions */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            {hasTrailer === null ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Are you pulling a trailer?
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setHasTrailer(true)}
                                            className="btn-primary btn-touch-lg"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => { setHasTrailer(false); handleComplete(); }}
                                            className="btn-secondary btn-touch-lg"
                                        >
                                            No
                                        </button>
                                    </div>
                                </>
                            ) : trailerType === null ? (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            What type of trailer?
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTrailerType('open')}
                                            className="p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-center transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                                <Package className="w-6 h-6 text-accent-600" />
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Open (Flatbed)</span>
                                        </button>
                                        <button
                                            onClick={() => setTrailerType('closed')}
                                            className="p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-center transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                                <Truck className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Closed (Van)</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            Trailer length?
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <input
                                            type="number"
                                            value={trailerLength}
                                            onChange={(e) => setTrailerLength(parseInt(e.target.value) || 53)}
                                            className="w-24 px-4 py-3 text-center text-xl font-bold rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 focus:ring-2 focus:ring-primary-500"
                                        />
                                        <span className="text-lg font-medium text-slate-600 dark:text-slate-400">feet</span>
                                    </div>
                                    <button
                                        onClick={handleComplete}
                                        className="w-full btn-primary btn-touch-lg mt-6"
                                    >
                                        <Check className="w-5 h-5" />
                                        Complete Setup
                                    </button>
                                </>
                            )}

                            {hasTrailer !== null && (
                                <button
                                    onClick={() => {
                                        if (trailerType !== null) setTrailerType(null);
                                        else setHasTrailer(null);
                                    }}
                                    className="w-full btn-ghost"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
