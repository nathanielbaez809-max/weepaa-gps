import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
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

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('processing');
        setErrorMsg('');

        try {
            // Mock Validation
            if (cardNumber.replace(/\s/g, '').length < 16) {
                throw new Error('Invalid card number.');
            }

            if (plan !== 'standard' && plan !== 'premium') {
                throw new Error('Invalid plan selected.');
            }

            await processPayment(plan, { cardNumber, expiry, cvc, name });

            // Success
            setStatus('success');
            setTimeout(() => {
                onSuccess();
            }, 1500); // Show success state briefly
        } catch (err: unknown) {
            setStatus('error');
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg('Payment failed');
            }
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-[2100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-green-500/20">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Verified!</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your subscription to <strong>{plan.toUpperCase()}</strong> is now active.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-6 h-6" />
                </button>

                <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Secure Payment
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Total due: <span className="font-bold text-slate-800 dark:text-slate-200">${amount}.00</span></p>
                </div>

                <form onSubmit={handlePayment} className="p-6 space-y-4">
                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700 dark:text-slate-200"
                                required
                            />
                            <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                maxLength={5}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700 dark:text-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVC</label>
                            <input
                                type="text"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                maxLength={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700 dark:text-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'processing'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'processing' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying Payment...
                            </>
                        ) : (
                            <>
                                Pay ${amount}.00
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            Payments are SSL encrypted and secure.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
