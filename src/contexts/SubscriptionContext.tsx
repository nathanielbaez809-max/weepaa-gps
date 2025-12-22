import React, { createContext, useContext, useState, useEffect } from 'react';

export type PlanType = 'none' | 'free-trial' | 'standard' | 'premium';

export interface PaymentDetails {
    cardNumber: string;
    expiry: string;
    cvc: string;
    name: string;
}

interface SubscriptionContextType {
    plan: PlanType;
    trialDaysLeft: number;
    startTrial: () => void;
    upgradePlan: (plan: 'standard' | 'premium') => void;
    isPremium: boolean;
    processPayment: (plan: 'standard' | 'premium', paymentDetails: PaymentDetails) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [plan, setPlan] = useState<PlanType>(() => {
        return (localStorage.getItem('weepaa_plan') as PlanType) || 'none';
    });

    const [trialStartDate, setTrialStartDate] = useState<number | null>(() => {
        const stored = localStorage.getItem('weepaa_trial_start');
        return stored ? parseInt(stored) : null;
    });

    const [trialDaysLeft, setTrialDaysLeft] = useState(0);

    useEffect(() => {
        if (plan === 'free-trial' && trialStartDate) {
            const now = Date.now();
            const diff = now - trialStartDate;
            const daysUsed = Math.floor(diff / (1000 * 60 * 60 * 24));
            // Avoid synchronous state update
            const timer = setTimeout(() => setTrialDaysLeft(Math.max(0, 30 - daysUsed)), 0);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setTrialDaysLeft(0), 0);
            return () => clearTimeout(timer);
        }
    }, [plan, trialStartDate]);

    useEffect(() => {
        if (plan === 'free-trial' && trialDaysLeft <= 0) {
            const timer = setTimeout(() => {
                setPlan('none'); // Expired
                localStorage.setItem('weepaa_plan', 'none');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [plan, trialDaysLeft]);

    const startTrial = () => {
        const now = Date.now();
        setPlan('free-trial');
        setTrialStartDate(now);
        localStorage.setItem('weepaa_plan', 'free-trial');
        localStorage.setItem('weepaa_trial_start', now.toString());
    };

    const upgradePlan = (newPlan: 'standard' | 'premium') => {
        setPlan(newPlan);
        localStorage.setItem('weepaa_plan', newPlan);
    };

    const processPayment = async (newPlan: 'standard' | 'premium', paymentDetails: PaymentDetails): Promise<boolean> => {
        // In a real app, this would call Stripe/Backend
        console.log("Processing payment for", newPlan, paymentDetails);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success
        upgradePlan(newPlan);
        return true;
    };

    const isPremium = plan === 'premium' || plan === 'free-trial';

    return (
        <SubscriptionContext.Provider value={{ plan, trialDaysLeft, startTrial, upgradePlan, isPremium, processPayment }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
