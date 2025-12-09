import { useSubscription } from '../contexts/SubscriptionContext';
import { Check, Star, Shield, Truck } from 'lucide-react';

export default function SubscriptionModal() {
    const { plan, startTrial, upgradePlan } = useSubscription();

    if (plan !== 'none') return null;

    return (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Branding */}
                <div className="bg-blue-600 p-8 text-white md:w-1/3 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Weepaa Truck GPS</h1>
                        <p className="text-blue-100">The Professional's Choice.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6" />
                            <span>Truck-Safe Routing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6" />
                            <span>Smart Parking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Truck className="w-6 h-6" />
                            <span>Weigh Station Avoidance</span>
                        </div>
                    </div>
                    <div className="text-sm text-blue-200 mt-8">
                        Join 50,000+ drivers saving time and money.
                    </div>
                </div>

                {/* Right Side: Plans */}
                <div className="p-8 md:w-2/3">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Choose Your Plan</h2>

                    <div className="grid gap-4">
                        {/* Free Trial */}
                        <button
                            onClick={startTrial}
                            className="w-full p-4 border-2 border-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-blue-600 text-lg">30-Day Free Trial</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">Full access to Weepaa Premium features.</p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
                            </div>
                        </button>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            {/* Standard */}
                            <button
                                onClick={() => upgradePlan('standard')}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 transition-all text-left"
                            >
                                <h3 className="font-bold text-slate-800 dark:text-white">Standard GPS</h3>
                                <div className="text-2xl font-bold mt-2">$75 <span className="text-sm font-normal text-slate-500">/ year</span></div>
                                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Truck Routing</li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Smart Parking</li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Fuel Saver</li>
                                </ul>
                            </button>

                            {/* Premium */}
                            <button
                                onClick={() => upgradePlan('premium')}
                                className="p-4 border-2 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl hover:bg-yellow-50 transition-all text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl">BEST VALUE</div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Weepaa Premium</h3>
                                <div className="text-2xl font-bold mt-2">$150 <span className="text-sm font-normal text-slate-500">/ year</span></div>
                                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> <strong>Everything in Standard</strong></li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> <strong>Weigh Station Avoidance</strong></li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Offline Satellite Maps</li>
                                </ul>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Secure payment processed by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
