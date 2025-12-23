import { useState, useRef, useEffect } from 'react';
import {
    AlertTriangle,
    Car,
    Construction,
    Scale,
    ParkingCircle,
    X,
    Plus,
    Send,
    CheckCircle2
} from 'lucide-react';
import { addReport } from '../services/reports';
import { useAuth } from '../contexts/AuthContext';

interface ReportButtonProps {
    currentLocation?: [number, number];
    onReportAdded?: () => void;
}

type ReportType = 'police' | 'accident' | 'hazard' | 'scale_open' | 'scale_closed' | 'parking_full';

interface ReportOption {
    id: ReportType;
    label: string;
    icon: typeof AlertTriangle;
    color: string;
    bgColor: string;
    description: string;
}

const REPORT_OPTIONS: ReportOption[] = [
    {
        id: 'police',
        label: 'Police',
        icon: Car,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        description: 'Officer spotted ahead'
    },
    {
        id: 'accident',
        label: 'Accident',
        icon: AlertTriangle,
        color: 'text-danger-600 dark:text-danger-400',
        bgColor: 'bg-danger-100 dark:bg-danger-900/30',
        description: 'Crash or incident'
    },
    {
        id: 'hazard',
        label: 'Hazard',
        icon: Construction,
        color: 'text-warning-600 dark:text-warning-400',
        bgColor: 'bg-warning-100 dark:bg-warning-900/30',
        description: 'Road debris or danger'
    },
    {
        id: 'scale_open',
        label: 'Scale Open',
        icon: Scale,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        description: 'Weigh station active'
    },
    {
        id: 'scale_closed',
        label: 'Scale Closed',
        icon: Scale,
        color: 'text-success-600 dark:text-success-400',
        bgColor: 'bg-success-100 dark:bg-success-900/30',
        description: 'Weigh station bypassed'
    },
    {
        id: 'parking_full',
        label: 'Parking Full',
        icon: ParkingCircle,
        color: 'text-accent-600 dark:text-accent-400',
        bgColor: 'bg-accent-100 dark:bg-accent-900/30',
        description: 'No truck spots available'
    },
];

export default function ReportButton({ currentLocation, onReportAdded }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { user } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleReport = async (type: ReportType) => {
        if (!currentLocation) {
            console.error('Location not available');
            return;
        }

        setIsSubmitting(true);

        try {
            await addReport(type, currentLocation, user?.uid);
            setIsOpen(false);
            setShowSuccess(true);
            onReportAdded?.();

            // Hide success after 2 seconds
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to add report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success Toast
    if (showSuccess) {
        return (
            <div className="fixed bottom-24 right-4 z-[1000] animate-fade-in-up">
                <div className="toast toast-success flex items-center gap-3">
                    <div className="p-2 bg-success-100 dark:bg-success-900/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-success-800 dark:text-success-300 text-sm">
                            Report Added
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-400">
                            Thanks for helping the community!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 z-[1000]" ref={menuRef}>
            {/* Report Menu */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-72 glass-panel-solid rounded-2xl p-3 animate-scale-in origin-bottom-right">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Report an Issue</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Close report menu"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {REPORT_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleReport(option.id)}
                                    disabled={isSubmitting || !currentLocation}
                                    className={`
                                        flex flex-col items-center p-3 rounded-xl transition-all
                                        ${option.bgColor} hover:scale-[1.02] active:scale-[0.98]
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        border border-transparent hover:border-current/20
                                        group
                                    `}
                                >
                                    <Icon className={`w-6 h-6 ${option.color} group-hover:scale-110 transition-transform`} />
                                    <span className={`text-xs font-semibold mt-1.5 ${option.color}`}>
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {!currentLocation && (
                        <p className="text-xs text-center text-slate-400 mt-3 italic">
                            Waiting for GPS location...
                        </p>
                    )}
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 rounded-full shadow-xl flex items-center justify-center
                    transition-all duration-300 hover:scale-110 active:scale-95
                    ${isOpen
                        ? 'bg-slate-800 dark:bg-slate-200 rotate-45'
                        : 'gradient-accent shadow-glow-accent'
                    }
                `}
                aria-label={isOpen ? 'Close report menu' : 'Open report menu'}
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <Plus className="w-6 h-6 text-white dark:text-slate-800" />
                ) : (
                    <Send className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
}
