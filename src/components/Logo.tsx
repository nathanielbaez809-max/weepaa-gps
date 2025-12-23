import { Truck } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    showTagline?: boolean;
    animated?: boolean;
    className?: string;
}

export default function Logo({
    size = 'md',
    showText = true,
    showTagline = true,
    animated = true,
    className = ''
}: LogoProps) {
    const sizes = {
        sm: {
            icon: 'w-5 h-5',
            iconContainer: 'p-1.5',
            text: 'text-lg',
            tagline: 'text-[8px]',
            gap: 'gap-1.5',
            glow: 'blur-md',
        },
        md: {
            icon: 'w-6 h-6',
            iconContainer: 'p-2',
            text: 'text-xl',
            tagline: 'text-[9px]',
            gap: 'gap-2',
            glow: 'blur-lg',
        },
        lg: {
            icon: 'w-8 h-8',
            iconContainer: 'p-2.5',
            text: 'text-2xl',
            tagline: 'text-[10px]',
            gap: 'gap-2.5',
            glow: 'blur-xl',
        },
        xl: {
            icon: 'w-10 h-10',
            iconContainer: 'p-3',
            text: 'text-3xl',
            tagline: 'text-xs',
            gap: 'gap-3',
            glow: 'blur-2xl',
        },
    };

    const s = sizes[size];

    return (
        <div className={`flex items-center ${s.gap} ${className}`}>
            {/* Icon with glow effect */}
            <div className="relative">
                {/* Glow backdrop */}
                <div
                    className={`absolute inset-0 bg-primary-500 ${s.glow} opacity-40 rounded-full scale-110`}
                    aria-hidden="true"
                />

                {/* Icon container */}
                <div
                    className={`
                        relative ${s.iconContainer} rounded-xl shadow-lg
                        bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700
                        ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}
                    `}
                >
                    <Truck
                        className={`${s.icon} text-white ${animated ? 'animate-truck-drive' : ''}`}
                        strokeWidth={2.5}
                    />
                </div>
            </div>

            {/* Text content */}
            {showText && (
                <div className="flex flex-col leading-none">
                    {/* Brand name with gradient */}
                    <span
                        className={`
                            ${s.text} font-black font-display tracking-tight
                            bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 
                            dark:from-primary-400 dark:via-primary-300 dark:to-primary-500
                            bg-clip-text text-transparent
                            ${animated ? 'hover:from-primary-500 hover:to-primary-600 transition-all duration-500' : ''}
                        `}
                    >
                        Weepaa
                    </span>

                    {/* Tagline */}
                    {showTagline && (
                        <span
                            className={`
                                ${s.tagline} uppercase tracking-[0.2em] font-semibold
                                text-slate-500 dark:text-slate-400
                            `}
                        >
                            Truck GPS
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact logo variant for tight spaces
export function LogoIcon({ className = '' }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-0 bg-primary-500 blur-lg opacity-40 rounded-full scale-110" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-lg">
                <Truck className="w-6 h-6 text-white animate-truck-drive" strokeWidth={2.5} />
            </div>
        </div>
    );
}
