import { useGamification } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Star, X, LogOut, LogIn, TrendingUp, Crown, Zap, Target, Award } from 'lucide-react';

interface ProfilePanelProps {
    onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
    const { points, rank, badges } = useGamification();
    const { user, signInWithGoogle, logout } = useAuth();

    // Calculate progress to next rank
    let nextRankPoints = 100;
    let prevRankPoints = 0;
    let nextRank = 'Pro';

    if (rank === 'Pro') {
        prevRankPoints = 100;
        nextRankPoints = 1000;
        nextRank = 'Legend';
    } else if (rank === 'Legend') {
        prevRankPoints = 1000;
        nextRankPoints = 10000;
        nextRank = 'Champion';
    }

    const progress = Math.min(100, Math.max(0, ((points - prevRankPoints) / (nextRankPoints - prevRankPoints)) * 100));
    const pointsToNext = nextRankPoints - points;

    // Rank colors
    const rankColors = {
        Rookie: { bg: 'from-slate-400 to-slate-600', icon: Target },
        Pro: { bg: 'from-primary-500 to-primary-700', icon: Zap },
        Legend: { bg: 'from-warning-400 to-warning-600', icon: Crown },
    };

    const currentRankStyle = rankColors[rank] || rankColors.Rookie;
    const RankIcon = currentRankStyle.icon;

    // Sample badges with icons
    const allBadges = [
        { id: 'first_50', name: 'First 50', icon: Star, unlocked: points >= 50, requirement: '50 points' },
        { id: 'road_warrior', name: 'Road Warrior', icon: TrendingUp, unlocked: points >= 500, requirement: '500 points' },
        { id: 'legendary', name: 'Legend Status', icon: Crown, unlocked: rank === 'Legend', requirement: 'Reach Legend' },
        { id: 'reporter', name: 'Community Reporter', icon: Award, unlocked: badges.includes('Community Reporter'), requirement: '10 reports' },
        { id: 'fuel_saver', name: 'Fuel Saver', icon: Zap, unlocked: badges.includes('Fuel Saver'), requirement: 'Save $100' },
        { id: 'perfect_week', name: 'Perfect Week', icon: Target, unlocked: badges.includes('Perfect Week'), requirement: '7-day streak' },
    ];

    return (
        <div
            className="fixed inset-y-0 right-0 w-[340px] z-[2000] animate-slide-in-right"
            role="dialog"
            aria-label="Driver Profile"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="h-full bg-white dark:bg-slate-900 shadow-premium flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
                                Driver Profile
                            </h2>
                            {user && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {user.email}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Close profile panel"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                    {/* Sign In Prompt (if not logged in) */}
                    {!user && (
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 p-5 rounded-2xl border border-primary-200 dark:border-primary-800/30 animate-fade-in">
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 text-center">
                                Sign in to save your progress and compete on the leaderboard!
                            </p>
                            <button
                                onClick={signInWithGoogle}
                                className="w-full btn-primary"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign in with Google
                            </button>
                        </div>
                    )}

                    {/* Rank Card */}
                    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${currentRankStyle.bg} text-white shadow-xl`}>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-32 h-32" />
                        </div>

                        <div className="relative z-10">
                            {/* Rank Badge */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <RankIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black font-display">{rank}</h3>
                                    <p className="text-white/80 text-sm font-medium">
                                        Level {Math.floor(points / 100) + 1}
                                    </p>
                                </div>
                            </div>

                            {/* Points Display */}
                            <div className="mt-5 text-center">
                                <div className="text-4xl font-black font-display">{points.toLocaleString()}</div>
                                <div className="text-white/70 text-sm font-medium">Total Points</div>
                            </div>

                            {/* Progress to Next Rank */}
                            <div className="mt-5">
                                <div className="flex justify-between text-xs font-medium mb-2">
                                    <span className="text-white/80">{pointsToNext.toLocaleString()} pts to {nextRank}</span>
                                    <span className="text-white/80">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Medal className="w-5 h-5 text-primary-500" />
                            Achievements
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {allBadges.map((badge) => {
                                const BadgeIcon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className={`
                                            flex flex-col items-center p-3 rounded-xl text-center transition-all
                                            ${badge.unlocked
                                                ? 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/30'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 opacity-50'
                                            }
                                        `}
                                        title={badge.unlocked ? `Unlocked: ${badge.name}` : `Locked: ${badge.requirement}`}
                                    >
                                        <BadgeIcon
                                            className={`w-6 h-6 mb-1.5 ${badge.unlocked
                                                ? 'text-warning-500'
                                                : 'text-slate-400 dark:text-slate-500'
                                                }`}
                                        />
                                        <span className={`text-[10px] font-semibold leading-tight ${badge.unlocked
                                            ? 'text-slate-700 dark:text-slate-300'
                                            : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                            {badge.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leaderboard Teaser */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-warning-500" />
                            Top Contributors
                        </h4>
                        <ol className="space-y-2">
                            {[
                                { rank: 1, name: 'BigRigBob', points: 12450, isYou: false },
                                { rank: 2, name: 'HighwayStar', points: 9820, isYou: false },
                                { rank: 3, name: 'DieselDave', points: 8100, isYou: false },
                            ].map((entry) => (
                                <li
                                    key={entry.rank}
                                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${entry.isYou
                                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/30'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${entry.rank === 1
                                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400'
                                            : entry.rank === 2
                                                ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            }`}>
                                            {entry.rank}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {entry.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                        {entry.points.toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Sign Out Button (if logged in) */}
                    {user && (
                        <button
                            onClick={logout}
                            className="w-full btn-ghost text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Weepaa Truck GPS • Version 1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
