import React, { createContext, useContext, useState, useEffect } from 'react';

export type PlanType = 'none' | 'free-trial' | 'standard' | 'premium';

interface SubscriptionContextType {
    plan: PlanType;
    trialDaysLeft: number;
    startTrial: () => void;
    upgradePlan: (plan: 'standard' | 'premium') => void;
    isPremium: boolean;
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
            const left = 30 - daysUsed;

            if (left <= 0) {
                setPlan('none'); // Expired
                localStorage.setItem('weepaa_plan', 'none');
            } else {
                setTrialDaysLeft(left);
            }
        }
    }, [plan, trialStartDate]);

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

    const isPremium = plan === 'premium' || plan === 'free-trial';

    return (
        <SubscriptionContext.Provider value={{ plan, trialDaysLeft, startTrial, upgradePlan, isPremium }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
