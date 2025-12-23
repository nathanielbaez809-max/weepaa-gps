import { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => setShowReconnected(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    // Show reconnected toast
    if (showReconnected) {
        return (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
                <div className="toast toast-success flex items-center gap-3 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800/30">
                    <div className="p-2 bg-success-100 dark:bg-success-900/50 rounded-lg">
                        <Wifi className="w-5 h-5 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-success-800 dark:text-success-300 text-sm">
                            Back Online
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-400">
                            Connection restored
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show offline indicator
    if (!isOnline) {
        return (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
                <div className="toast toast-warning flex items-center gap-3 bg-warning-50 dark:bg-warning-900/30 border border-warning-200 dark:border-warning-800/30">
                    <div className="p-2 bg-warning-100 dark:bg-warning-900/50 rounded-lg animate-pulse">
                        <WifiOff className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-warning-800 dark:text-warning-300 text-sm">
                            You're Offline
                        </p>
                        <p className="text-xs text-warning-600 dark:text-warning-400">
                            Navigation continues with cached data
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <CloudOff className="w-4 h-4 text-warning-400" />
                        <RefreshCw className="w-4 h-4 text-warning-400 animate-spin-slow" />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
