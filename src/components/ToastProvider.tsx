import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timeoutsRef = useRef<Map<string, number>>(new Map());

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = toast.duration ?? 5000;

        setToasts(prev => {
            // Limit to 3 visible toasts
            const newToasts = [...prev, { ...toast, id }];
            if (newToasts.length > 3) {
                const removed = newToasts.shift();
                if (removed) {
                    const timeout = timeoutsRef.current.get(removed.id);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeoutsRef.current.delete(removed.id);
                    }
                }
            }
            return newToasts;
        });

        // Auto-dismiss
        if (duration > 0) {
            const timeout = setTimeout(() => hideToast(id), duration);
            timeoutsRef.current.set(id, timeout);
        }
    }, [hideToast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={hideToast} />
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Container
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [isLeaving, setIsLeaving] = useState(false);

    const handleDismiss = () => {
        setIsLeaving(true);
        setTimeout(() => onDismiss(toast.id), 200);
    };

    const icons = {
        success: CheckCircle,
        warning: AlertTriangle,
        danger: AlertCircle,
        info: Info,
    };

    const colors = {
        success: {
            bg: 'bg-success-50 dark:bg-success-900/30',
            border: 'border-success-200 dark:border-success-800/40',
            icon: 'text-success-600 dark:text-success-400',
            iconBg: 'bg-success-100 dark:bg-success-900/50',
            title: 'text-success-800 dark:text-success-300',
            message: 'text-success-600 dark:text-success-400',
        },
        warning: {
            bg: 'bg-warning-50 dark:bg-warning-900/30',
            border: 'border-warning-200 dark:border-warning-800/40',
            icon: 'text-warning-600 dark:text-warning-400',
            iconBg: 'bg-warning-100 dark:bg-warning-900/50',
            title: 'text-warning-800 dark:text-warning-300',
            message: 'text-warning-600 dark:text-warning-400',
        },
        danger: {
            bg: 'bg-danger-50 dark:bg-danger-900/30',
            border: 'border-danger-200 dark:border-danger-800/40',
            icon: 'text-danger-600 dark:text-danger-400',
            iconBg: 'bg-danger-100 dark:bg-danger-900/50',
            title: 'text-danger-800 dark:text-danger-300',
            message: 'text-danger-600 dark:text-danger-400',
        },
        info: {
            bg: 'bg-primary-50 dark:bg-primary-900/30',
            border: 'border-primary-200 dark:border-primary-800/40',
            icon: 'text-primary-600 dark:text-primary-400',
            iconBg: 'bg-primary-100 dark:bg-primary-900/50',
            title: 'text-primary-800 dark:text-primary-300',
            message: 'text-primary-600 dark:text-primary-400',
        },
    };

    const Icon = icons[toast.type];
    const color = colors[toast.type];

    return (
        <div
            className={`
                pointer-events-auto
                glass-panel-solid rounded-xl px-4 py-3
                flex items-start gap-3 min-w-[320px] max-w-[400px]
                border ${color.border} ${color.bg}
                transition-all duration-200
                ${isLeaving ? 'opacity-0 translate-x-4' : 'animate-slide-in-right'}
            `}
            role="alert"
        >
            <div className={`p-2 rounded-lg ${color.iconBg}`}>
                <Icon className={`w-5 h-5 ${color.icon}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${color.title}`}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p className={`text-xs mt-0.5 ${color.message}`}>
                        {toast.message}
                    </p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className={`text-xs font-semibold mt-2 underline ${color.icon} hover:opacity-80`}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4 text-slate-400" />
            </button>
        </div>
    );
}
