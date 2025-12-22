import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';

export type Rank = 'Rookie' | 'Pro' | 'Legend';

interface GamificationContextType {
    points: number;
    rank: Rank;
    badges: string[];
    addPoints: (amount: number, reason: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Default state
    const [points, setPoints] = useState<number>(0);

    // Load initial state from LocalStorage (fallback)
    useEffect(() => {
        if (!user) {
            const savedPoints = parseInt(localStorage.getItem('weepaa_points') || '0');
            // Avoid synchronous state update
            const timer = setTimeout(() => setPoints(savedPoints), 0);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Sync with Firestore when User is logged in
    useEffect(() => {
        if (!user || !USE_FIREBASE || !db) return;

        const userRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPoints(data.points || 0);
            } else {
                // Create user doc if not exists
                setDoc(userRef, {
                    email: user.email,
                    points: 0,
                    joinedAt: Date.now()
                }, { merge: true });
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Derived State Logic (Rank & Badges)
    const rank = useMemo<Rank>(() => {
        if (points >= 1000) return 'Legend';
        if (points >= 100) return 'Pro';
        return 'Rookie';
    }, [points]);

    const badges = useMemo<string[]>(() => {
        const newBadges: string[] = [];
        if (points >= 50) newBadges.push('First 50');
        if (points >= 500) newBadges.push('Road Warrior');
        if (rank === 'Legend') newBadges.push('Legendary Driver');
        return newBadges;
    }, [points, rank]);

    // Persist to LocalStorage
    useEffect(() => {
        if (!user) {
            localStorage.setItem('weepaa_points', points.toString());
        }
    }, [points, user]);

    const addPoints = async (amount: number, reason: string) => {
        // Optimistic update
        setPoints(prev => prev + amount);
        console.log(`Awarded ${amount} points for: ${reason}`);

        if (user && USE_FIREBASE && db) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    points: increment(amount)
                });
            } catch (e) {
                console.error("Error syncing points to Firestore:", e);
            }
        }
    };

    return (
        <GamificationContext.Provider value={{ points, rank, badges, addPoints }}>
            {children}
        </GamificationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
