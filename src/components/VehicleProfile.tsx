import { useState, useEffect } from 'react';
import { Truck, X, Save } from 'lucide-react';

export interface VehicleSpecs {
    height: { ft: number; in: number };
    weight: number; // lbs
    length: number; // ft
    hazmat: 'None' | 'Explosive' | 'Gas' | 'Flammable' | 'Combustible' | 'Poison' | 'Radioactive' | 'Corrosive';
}

interface VehicleProfileProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (specs: VehicleSpecs) => void;
    initialSpecs?: VehicleSpecs;
}

export default function VehicleProfile({ isOpen, onClose, onSave, initialSpecs }: VehicleProfileProps) {
    const [specs, setSpecs] = useState<VehicleSpecs>({
        height: { ft: 13, in: 6 },
        weight: 80000,
        length: 53,
        hazmat: 'None'
    });

    useEffect(() => {
        if (initialSpecs) {
            const timer = setTimeout(() => setSpecs(initialSpecs), 0);
            return () => clearTimeout(timer);
        }
    }, [initialSpecs]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(specs);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-blue-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Truck className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Vehicle Profile</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Height */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={specs.height.ft}
                                        onChange={e => setSpecs({ ...specs, height: { ...specs.height, ft: parseInt(e.target.value) || 0 } })}
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500">ft</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={specs.height.in}
                                        onChange={e => setSpecs({ ...specs, height: { ...specs.height, in: parseInt(e.target.value) || 0 } })}
                                        className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500">in</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weight & Length */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (lbs)</label>
                            <input
                                type="number"
                                value={specs.weight}
                                onChange={e => setSpecs({ ...specs, weight: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Length (ft)</label>
                            <input
                                type="number"
                                value={specs.length}
                                onChange={e => setSpecs({ ...specs, length: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Hazmat */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hazmat Type</label>
                        <select
                            value={specs.hazmat}
                            onChange={e => setSpecs({ ...specs, hazmat: e.target.value as VehicleSpecs['hazmat'] })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        >
                            {['None', 'Explosive', 'Gas', 'Flammable', 'Combustible', 'Poison', 'Radioactive', 'Corrosive'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Save className="w-5 h-5" />
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
