import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ReportType =
    | 'police'
    | 'accident'
    | 'hazard'
    | 'traffic'
    | 'scale_open'
    | 'scale_closed'
    | 'parking_full';

export interface CommunityReport {
    id: string;
    type: ReportType;
    location: [number, number];
    timestamp: number;
    votes: number;
    reporterId: string;
}

const STORAGE_KEY = 'weepaa_reports';
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// --- Mock Implementation (LocalStorage) ---

const mockListeners: ((reports: CommunityReport[]) => void)[] = [];

const getMockReports = (): CommunityReport[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const reports: CommunityReport[] = JSON.parse(stored);
    const now = Date.now();
    return reports.filter(r => (now - r.timestamp) < 2 * 60 * 60 * 1000);
};

const notifyMockListeners = () => {
    const reports = getMockReports();
    mockListeners.forEach(l => l(reports));
};

const addMockReport = (type: ReportType, location: [number, number]): CommunityReport => {
    const newReport: CommunityReport = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        location,
        timestamp: Date.now(),
        votes: 0,
        reporterId: 'current-user'
    };
    const reports = getMockReports();
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    notifyMockListeners();
    return newReport;
};

const voteMockReport = (id: string, vote: 'up' | 'down') => {
    const reports = getMockReports();
    const report = reports.find(r => r.id === id);
    if (report) {
        report.votes += (vote === 'up' ? 1 : -1);
        if (report.votes < -3) {
            const index = reports.indexOf(report);
            reports.splice(index, 1);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        notifyMockListeners();
    }
};

// --- Public API ---

export const subscribeToReports = (callback: (reports: CommunityReport[]) => void) => {
    if (!USE_FIREBASE || !db) {
        mockListeners.push(callback);
        callback(getMockReports());
        return () => {
            const index = mockListeners.indexOf(callback);
            if (index > -1) mockListeners.splice(index, 1);
        };
    }

    // Firebase Real-time Listener
    const q = query(
        collection(db, 'reports'),
        where('timestamp', '>', Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const reports: CommunityReport[] = [];
        snapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as CommunityReport);
        });
        callback(reports);
    }, (error) => {
        console.error("Error fetching reports:", error);
        // Fallback to mock on error
        callback(getMockReports());
    });

    return unsubscribe;
};

export const addReport = async (type: ReportType, location: [number, number]): Promise<void> => {
    if (!USE_FIREBASE || !db) {
        addMockReport(type, location);
        return;
    }

    try {
        await addDoc(collection(db, 'reports'), {
            type,
            location,
            timestamp: Date.now(),
            votes: 0,
            reporterId: 'current-user' // TODO: Use actual auth ID
        });
    } catch (e) {
        console.error("Error adding report:", e);
        addMockReport(type, location); // Fallback
    }
};

export const voteReport = async (id: string, vote: 'up' | 'down') => {
    if (!USE_FIREBASE || !db) {
        voteMockReport(id, vote);
        return;
    }

    try {
        const reportRef = doc(db, 'reports', id);
        await updateDoc(reportRef, {
            votes: increment(vote === 'up' ? 1 : -1)
        });
    } catch (e) {
        console.error("Error voting:", e);
        voteMockReport(id, vote);
    }
};

// Legacy support (optional, but keeping for safety if other files import it)
export const getReports = (): CommunityReport[] => {
    return getMockReports();
};
