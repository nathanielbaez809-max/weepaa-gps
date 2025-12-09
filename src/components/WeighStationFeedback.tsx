import { useState } from 'react';
import { Truck, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface WeighStationFeedbackProps {
    currentLocation?: [number, number];
    onFeedback?: (status: 'ok' | 'not-ok') => void;
}

export default function WeighStationFeedback({ currentLocation, onFeedback }: WeighStationFeedbackProps) {
    const [showPrompt, setShowPrompt] = useState(false);

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

        if (onFeedback) {
            onFeedback(status);
        }

        setShowPrompt(false);
    };

    return (
        <>
            {/* Floating Blue Truck Button */}
            <button
                onClick={() => setShowPrompt(true)}
                className="fixed bottom-6 right-6 z-[1500] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-bounce"
                title="Weigh Station Feedback"
            >
                <Truck className="w-6 h-6" />
            </button>

            {/* Feedback Prompt */}
            {showPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weigh Station Status</h3>
                            <button onClick={() => setShowPrompt(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Did you pass the weigh station without issues?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleFeedback('ok')}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
                            >
                                <ThumbsUp className="w-6 h-6" />
                                OK
                            </button>
                            <button
                                onClick={() => handleFeedback('not-ok')}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-lg flex flex-col items-center gap-2 transition-colors"
                            >
                                <ThumbsDown className="w-6 h-6" />
                                Not OK
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-4">
                            Your feedback helps improve routing for all drivers.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
