import React, { createContext, useContext, useState, useEffect } from 'react';
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
    const [rank, setRank] = useState<Rank>('Rookie');
    const [badges, setBadges] = useState<string[]>([]);

    // Load initial state from LocalStorage (fallback)
    useEffect(() => {
        if (!user) {
            const savedPoints = parseInt(localStorage.getItem('weepaa_points') || '0');
            setPoints(savedPoints);
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
                // Rank and Badges are derived from points usually, or stored.
                // Let's rely on the derived logic below for consistency, 
                // but if we store them, we can read them.
                // For now, we only sync points as the source of truth.
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
    useEffect(() => {
        // Calculate Rank based on points
        let newRank: Rank = 'Rookie';
        if (points >= 1000) newRank = 'Legend';
        else if (points >= 100) newRank = 'Pro';

        if (newRank !== rank) {
            setRank(newRank);
        }

        // Award Badges
        const newBadges: string[] = [];
        if (points >= 50) newBadges.push('First 50');
        if (points >= 500) newBadges.push('Road Warrior');
        if (newRank === 'Legend') newBadges.push('Legendary Driver');

        setBadges(newBadges);

        // Persist to LocalStorage if not logged in (or as backup)
        if (!user) {
            localStorage.setItem('weepaa_points', points.toString());
        }
    }, [points, rank, user]);

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

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
