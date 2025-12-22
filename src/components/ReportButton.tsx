import { useState } from 'react';
import { AlertTriangle, ShieldAlert, Construction, Scale, ParkingSquare, Plus } from 'lucide-react';
import { addReport, type ReportType } from '../services/reports';

import { useAuth } from '../contexts/AuthContext';

interface ReportButtonProps {
    currentLocation: [number, number] | undefined;
    onReportAdded: () => void;
}

export default function ReportButton({ currentLocation, onReportAdded }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const handleReport = (type: ReportType) => {
        if (currentLocation) {
            addReport(type, currentLocation, user?.uid);
            onReportAdded();
            setIsOpen(false);
        }
    };

    return (
        <div className="absolute bottom-32 right-4 z-[1000] flex flex-col items-end gap-3">
            {isOpen && (
                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">
                    <button
                        onClick={() => handleReport('police')}
                        className="flex items-center gap-2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        title="Report Police"
                    >
                        <ShieldAlert className="w-6 h-6" />
                        <span className="sr-only">Police</span>
                    </button>

                    <div className="bg-white p-2 rounded-xl shadow-lg flex gap-2">
                        <button onClick={() => handleReport('scale_open')} className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Scale className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-700">Scale Open</span>
                        </button>

                        <button onClick={() => handleReport('scale_closed')} className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Scale className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-700">Scale Closed</span>
                        </button>

                        <button onClick={() => handleReport('parking_full')} className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <ParkingSquare className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-slate-700">Lot Full</span>
                        </button>
                    </div>

                    <button
                        onClick={() => handleReport('accident')}
                        className="flex items-center gap-2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        title="Report Accident"
                    >
                        <AlertTriangle className="w-6 h-6" />
                        <span className="sr-only">Accident</span>
                    </button>
                    <button
                        onClick={() => handleReport('hazard')}
                        className="flex items-center gap-2 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                        title="Report Hazard"
                    >
                        <Construction className="w-6 h-6" />
                        <span className="sr-only">Hazard</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p - 4 rounded - full shadow - xl transition - all duration - 300 ${isOpen ? 'bg-gray-600 rotate-45' : 'bg-orange-500 hover:bg-orange-600'
                    } text - white`}
            >
                {isOpen ? <Plus className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </button>
        </div>
    );
}
