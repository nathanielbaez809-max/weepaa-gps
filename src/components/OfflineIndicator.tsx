import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">You are offline. Using cached maps.</span>
        </div>
    );
}
