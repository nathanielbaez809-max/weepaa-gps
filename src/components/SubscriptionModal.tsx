import { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Check, Star, Shield, Truck, Zap, MapPin, Fuel, ChevronRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import Logo from './Logo';
import heroBg from '../assets/hero_bg.png';

export default function SubscriptionModal() {
    const { plan, startTrial } = useSubscription();
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium' | null>(null);

    if (plan !== 'none') return null;

    if (selectedPlan) {
        return (
            <PaymentModal
                plan={selectedPlan}
                amount={selectedPlan === 'standard' ? 75 : 150}
                onClose={() => setSelectedPlan(null)}
                onSuccess={() => setSelectedPlan(null)}
            />
        );
    }

    const features = {
        standard: [
            { icon: Truck, text: 'Truck-Safe Routing', description: 'Height, weight, hazmat' },
            { icon: MapPin, text: 'Smart Parking', description: 'Real-time availability' },
            { icon: Fuel, text: 'Fuel Finder', description: 'Cheapest diesel prices' },
        ],
        premium: [
            { icon: Zap, text: 'Weigh Station Avoidance', description: 'Bypass open scales', highlight: true },
            { icon: Shield, text: 'Offline Satellite Maps', description: 'Navigate without signal' },
            { icon: Star, text: 'Priority Support', description: '24/7 driver assistance' },
        ],
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 hero-bg"
            style={{ backgroundImage: `url(${heroBg})` }}
            role="dialog"
            aria-label="Choose your subscription plan"
        >
            {/* Dark overlay */}
            <div className="hero-overlay" aria-hidden="true" />

            {/* Modal content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-premium max-w-4xl w-full overflow-hidden animate-scale-in">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side: Branding */}
                    <div className="gradient-hero p-8 lg:w-2/5 flex flex-col justify-between text-white">
                        <div>
                            <Logo size="lg" showTagline={false} className="mb-6" />
                            <h1 className="text-3xl font-bold font-display mb-3">
                                The Professional's<br />Choice
                            </h1>
                            <p className="text-primary-100 text-sm leading-relaxed">
                                Join 50,000+ truck drivers who trust Weepaa for safe, efficient navigation every day.
                            </p>
                        </div>

                        <div className="space-y-4 mt-8">
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Height & weight compliant routes</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Real-time truck parking availability</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Fuel className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Save on fuel with price alerts</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold"
                                        >
                                            {['JD', 'MK', 'RL', 'TB'][i - 1]}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-white/80 ml-2">
                                    <strong>4.9★</strong> from 12,000+ reviews
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Plans */}
                    <div className="p-8 lg:w-3/5">
                        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white mb-6">
                            Choose Your Plan
                        </h2>

                        <div className="space-y-4">
                            {/* Free Trial - Highlighted */}
                            <button
                                onClick={startTrial}
                                className="w-full p-5 rounded-2xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all group text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary-500 rounded-xl text-white">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-primary-700 dark:text-primary-400 text-lg">
                                                    30-Day Free Trial
                                                </h3>
                                                <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                    Most Popular
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Full access to all Premium features
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>

                            {/* Plan Cards */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Standard Plan */}
                                <button
                                    onClick={() => setSelectedPlan('standard')}
                                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all text-left group"
                                >
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Standard GPS</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-black font-display text-slate-900 dark:text-white">$75</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">/year</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">~$6.25/month</p>

                                    <ul className="mt-4 space-y-2.5">
                                        {features.standard.map((feature, i) => {

                                            return (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            {feature.text}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </button>

                                {/* Premium Plan - Highlighted */}
                                <button
                                    onClick={() => setSelectedPlan('premium')}
                                    className="relative p-5 rounded-2xl border-2 border-warning-400 bg-gradient-to-br from-warning-50 to-white dark:from-warning-900/20 dark:to-slate-900 hover:shadow-xl transition-all text-left group overflow-hidden"
                                >
                                    {/* Best Value Badge */}
                                    <div className="absolute top-0 right-0 bg-warning-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl">
                                        BEST VALUE
                                    </div>

                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Weepaa Premium</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-black font-display text-slate-900 dark:text-white">$150</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">/year</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">~$12.50/month</p>

                                    <ul className="mt-4 space-y-2.5">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                                                Everything in Standard
                                            </span>
                                        </li>
                                        {features.premium.map((feature, i) => {

                                            return (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                                                    <span className={`text-sm font-medium ${feature.highlight
                                                        ? 'text-warning-700 dark:text-warning-400'
                                                        : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" />
                                    <span>SSL Secure</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4" />
                                    <span>Cancel Anytime</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4" />
                                    <span>Money-Back Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
