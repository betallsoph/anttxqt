import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    getDocWithRetry,
    invalidateCachedDoc,
    isAbortError,
    peekCachedDoc,
} from "@/lib/firestore-utils";
import { useRetryOnVisible } from "@/hooks/useRetryOnVisible";

export interface Experience {
    role: string;
    company: string;
    period: string;
    location?: string;
    description?: string[];
    hidden?: boolean;
}

export interface HomepageData {
    hero: {
        greeting: string;
        name: string;
        bio: string[];
        email: string;
        avatarUrl?: string;
    };
    skillCategories: {
        name: string;
        items: string[];
    }[];
    links: {
        label: string;
        url: string;
        iconUrl?: string;
    }[];
    experiences?: Experience[];
}

// Intentionally empty. This only guarantees the shape when a Firestore doc is
// missing a field — never put real-looking content here. It renders on the live
// site whenever a fetch comes back short, and the admin form can save it as truth.
export const defaultHomepageData: HomepageData = {
    hero: {
        greeting: "",
        name: "",
        bio: [],
        email: "",
    },
    skillCategories: [],
    links: [],
    experiences: [],
};

const DOCUMENT_REF = doc(db, "siteConfig", "homepage");

function snapshotToHomepageData(snapshot: DocumentSnapshot | undefined): HomepageData {
    if (!snapshot?.exists()) return defaultHomepageData;
    return { ...defaultHomepageData, ...snapshot.data() } as HomepageData;
}

export function useHomepageData() {
    const cached = peekCachedDoc(DOCUMENT_REF);
    const [data, setData] = useState<HomepageData>(() => snapshotToHomepageData(cached));
    const [loading, setLoading] = useState(() => !cached);
    const [error, setError] = useState<string | null>(null);
    const [missing, setMissing] = useState(() => cached !== undefined && !cached.exists());
    const [reloadKey, setReloadKey] = useState(0);

    const retry = useCallback(() => {
        invalidateCachedDoc(DOCUMENT_REF);
        setLoading(true);
        setError(null);
        setMissing(false);
        setReloadKey((key) => key + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        getDocWithRetry(DOCUMENT_REF, {
            signal: controller.signal,
            skipCache: reloadKey > 0,
        })
            .then((snapshot) => {
                if (cancelled) return;
                if (!snapshot.exists()) {
                    setMissing(true);
                    return;
                }
                setMissing(false);
                setData(snapshotToHomepageData(snapshot));
            })
            .catch((err) => {
                if (cancelled || isAbortError(err)) return;
                console.error("Failed to fetch homepage data:", err);
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled && !controller.signal.aborted) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [reloadKey]);

    useRetryOnVisible(error !== null, retry);

    return { data, loading, error, missing, retry };
}

export async function saveHomepageData(data: HomepageData) {
    const cleaned = JSON.parse(JSON.stringify(data));

    // Clean up empty lines from experience descriptions
    if (cleaned.experiences) {
        cleaned.experiences = cleaned.experiences.map((exp: any) => {
            if (exp.description) {
                exp.description = exp.description.filter((line: string) => line.trim() !== "");
            }
            return exp;
        });
    }

    await setDoc(DOCUMENT_REF, cleaned);
    invalidateCachedDoc(DOCUMENT_REF);
}
