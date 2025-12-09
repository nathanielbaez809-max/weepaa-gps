import { useGamification } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Star, X, LogOut, LogIn } from 'lucide-react';

interface ProfilePanelProps {
    onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
    const { points, rank, badges } = useGamification();
    const { user, signInWithGoogle, logout } = useAuth();

    // Calculate progress to next rank
    let nextRankPoints = 100;
    let prevRankPoints = 0;
    if (rank === 'Pro') {
        prevRankPoints = 100;
        nextRankPoints = 1000;
    } else if (rank === 'Legend') {
        prevRankPoints = 1000;
        nextRankPoints = 10000; // Cap
    }

    const progress = Math.min(100, Math.max(0, ((points - prevRankPoints) / (nextRankPoints - prevRankPoints)) * 100));

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-[2000] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Driver Profile</h2>
                    {user && <p className="text-xs text-slate-500">{user.email}</p>}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-6 h-6 text-slate-500" />
                </button>
            </div>

            {!user ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign in to save your progress and compete on the leaderboard!</p>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign in with Google
                    </button>
                </div>
            ) : (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={logout}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                        <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                </div>
            )}

            {/* Rank Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                        <Trophy className="w-10 h-10 text-yellow-300" />
                    </div>
                    <h3 className="text-3xl font-bold">{rank}</h3>
                    <p className="text-blue-200 text-sm">Level {Math.floor(points / 100) + 1}</p>

                    <div className="mt-6">
                        <div className="flex justify-between text-xs mb-1 opacity-80">
                            <span>{points} pts</span>
                            <span>{nextRankPoints} pts</span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="mb-6">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-blue-600" />
                    Achievements
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {badges.length > 0 ? badges.map((badge, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight block">{badge}</span>
                        </div>
                    )) : (
                        <p className="col-span-3 text-sm text-slate-400 italic text-center py-4">Start driving to earn badges!</p>
                    )}
                </div>
            </div>

            {/* Leaderboard Teaser */}
            <div className="mt-auto bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Top Contributors</h4>
                <ol className="text-sm space-y-2">
                    <li className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>1. BigRigBob</span>
                        <span className="font-bold text-blue-600">12,450</span>
                    </li>
                    <li className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>2. HighwayStar</span>
                        <span className="font-bold text-blue-600">9,820</span>
                    </li>
                    <li className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>3. DieselDave</span>
                        <span className="font-bold text-blue-600">8,100</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}
