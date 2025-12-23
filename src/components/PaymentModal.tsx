import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, X, Shield, Sparkles } from 'lucide-react';
import { useSubscription, type PlanType } from '../contexts/SubscriptionContext';

interface PaymentModalProps {
    plan: PlanType;
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ plan, amount, onClose, onSuccess }: PaymentModalProps) {
    const { processPayment } = useSubscription();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2);
        }
        return v;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('processing');
        setErrorMsg('');

        try {
            // Mock Validation
            if (cardNumber.replace(/\s/g, '').length < 16) {
                throw new Error('Please enter a valid 16-digit card number.');
            }

            if (plan !== 'standard' && plan !== 'premium') {
                throw new Error('Invalid plan selected.');
            }

            await processPayment(plan, { cardNumber, expiry, cvc, name });

            // Success
            setStatus('success');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: unknown) {
            setStatus('error');
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg('Payment failed. Please try again.');
            }
        }
    };

    // Success State
    if (status === 'success') {
        return (
            <div
                className="fixed inset-0 z-[2100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                role="dialog"
                aria-label="Payment successful"
            >
                <div className="glass-panel-solid rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-10 h-10 text-success-600 dark:text-success-400" />
                    </div>
                    <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mb-2">
                        Welcome to {plan === 'premium' ? 'Premium' : 'Standard'}!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your subscription is now active. Enjoy all the features!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-success-600 dark:text-success-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Unlocking features...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[2100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && status !== 'processing' && onClose()}
            role="dialog"
            aria-label="Payment form"
        >
            <div className="glass-panel-solid rounded-3xl max-w-md w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="gradient-primary p-6 relative">
                    <button
                        onClick={onClose}
                        disabled={status === 'processing'}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Close payment modal"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
                            <p className="text-primary-100 text-sm">
                                {plan === 'premium' ? 'Weepaa Premium' : 'Standard GPS'} • ${amount}/year
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handlePayment} className="p-6 space-y-4">
                    {/* Error Message */}
                    {status === 'error' && (
                        <div className="flex items-start gap-3 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/40 rounded-xl animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-danger-800 dark:text-danger-300 text-sm">
                                    Payment Error
                                </p>
                                <p className="text-xs text-danger-600 dark:text-danger-400">
                                    {errorMsg}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Card Number */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Card Number
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                className="input-premium pl-12 font-mono tracking-wider"
                                required
                                disabled={status === 'processing'}
                            />
                        </div>
                    </div>

                    {/* Expiry and CVC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Expiry
                            </label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                className="input-premium font-mono text-center"
                                required
                                disabled={status === 'processing'}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                CVC
                            </label>
                            <input
                                type="text"
                                placeholder="•••"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                maxLength={3}
                                className="input-premium font-mono text-center"
                                required
                                disabled={status === 'processing'}
                            />
                        </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-premium"
                            required
                            disabled={status === 'processing'}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={status === 'processing'}
                        className="w-full btn-primary btn-touch-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'processing' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Pay ${amount}.00
                            </>
                        )}
                    </button>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Shield className="w-4 h-4" />
                            <span>SSL Secure</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Lock className="w-4 h-4" />
                            <span>256-bit Encryption</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
