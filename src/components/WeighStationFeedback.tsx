import { useState } from 'react';
import { Truck, ThumbsUp, ThumbsDown, X, Scale, CheckCircle, XCircle } from 'lucide-react';

interface WeighStationFeedbackProps {
    currentLocation?: [number, number];
    onFeedback?: (status: 'ok' | 'not-ok') => void;
}

export default function WeighStationFeedback({ currentLocation, onFeedback }: WeighStationFeedbackProps) {
    const [showPrompt, setShowPrompt] = useState(false);
    const [submittedStatus, setSubmittedStatus] = useState<'ok' | 'not-ok' | null>(null);

    const handleFeedback = (status: 'ok' | 'not-ok') => {
        // Save to localStorage with current location
        const feedback = {
            status,
            timestamp: Date.now(),
            location: currentLocation ? {
                lat: currentLocation[0],
                lon: currentLocation[1]
            } : null
        };

        const existing = JSON.parse(localStorage.getItem('weigh_station_feedback') || '[]');
        existing.push(feedback);
        localStorage.setItem('weigh_station_feedback', JSON.stringify(existing));

        setSubmittedStatus(status);

        if (onFeedback) {
            onFeedback(status);
        }

        // Auto-close after showing confirmation
        setTimeout(() => {
            setShowPrompt(false);
            setSubmittedStatus(null);
        }, 1500);
    };

    return (
        <>
            {/* Floating Truck Button */}
            <button
                onClick={() => setShowPrompt(true)}
                className={`
                    fixed bottom-32 right-4 z-[1500] 
                    w-14 h-14 rounded-full shadow-xl
                    flex items-center justify-center
                    transition-all duration-300 hover:scale-110 active:scale-95
                    gradient-primary shadow-glow
                `}
                aria-label="Report weigh station status"
            >
                <div className="relative">
                    <Truck className="w-6 h-6 text-white animate-truck-drive" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning-400 rounded-full border-2 border-white animate-pulse" />
                </div>
            </button>

            {/* Feedback Modal */}
            {showPrompt && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowPrompt(false)}
                    role="dialog"
                    aria-label="Weigh station feedback"
                >
                    <div className="glass-panel-solid rounded-3xl max-w-sm w-full p-6 animate-scale-in">
                        {submittedStatus ? (
                            // Success State
                            <div className="text-center py-4 animate-fade-in">
                                <div className={`
                                    w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center
                                    ${submittedStatus === 'ok'
                                        ? 'bg-success-100 dark:bg-success-900/30'
                                        : 'bg-warning-100 dark:bg-warning-900/30'
                                    }
                                `}>
                                    {submittedStatus === 'ok' ? (
                                        <CheckCircle className="w-8 h-8 text-success-600" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-warning-600" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    Thanks for the feedback!
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    This helps improve routing for all drivers
                                </p>
                            </div>
                        ) : (
                            // Prompt State
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                            <Scale className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                                Weigh Station
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Report your experience
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPrompt(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 mb-6">
                                    Did you pass the weigh station without issues?
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleFeedback('ok')}
                                        className="group p-4 rounded-2xl border-2 border-success-200 dark:border-success-800/40 bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/40 hover:border-success-300 dark:hover:border-success-700 transition-all"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-success-100 dark:bg-success-900/50 rounded-xl group-hover:scale-110 transition-transform">
                                                <ThumbsUp className="w-6 h-6 text-success-600 dark:text-success-400" />
                                            </div>
                                            <span className="font-bold text-success-700 dark:text-success-400">
                                                All Good
                                            </span>
                                            <span className="text-xs text-success-600/70 dark:text-success-500">
                                                Passed fine
                                            </span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleFeedback('not-ok')}
                                        className="group p-4 rounded-2xl border-2 border-danger-200 dark:border-danger-800/40 bg-danger-50 dark:bg-danger-900/20 hover:bg-danger-100 dark:hover:bg-danger-900/40 hover:border-danger-300 dark:hover:border-danger-700 transition-all"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-danger-100 dark:bg-danger-900/50 rounded-xl group-hover:scale-110 transition-transform">
                                                <ThumbsDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                                            </div>
                                            <span className="font-bold text-danger-700 dark:text-danger-400">
                                                Had Issues
                                            </span>
                                            <span className="text-xs text-danger-600/70 dark:text-danger-500">
                                                Was detained
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-5">
                                    Your feedback helps improve routing for all drivers
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
