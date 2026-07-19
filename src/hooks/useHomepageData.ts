import { useState, useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDocWithRetry } from "@/lib/firestore-utils";
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

export function useHomepageData() {
    const [data, setData] = useState<HomepageData>(defaultHomepageData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [missing, setMissing] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const retry = useCallback(() => {
        setLoading(true);
        setError(null);
        setMissing(false);
        setReloadKey((key) => key + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        getDocWithRetry(DOCUMENT_REF)
            .then((snapshot) => {
                if (cancelled) return;
                if (!snapshot.exists()) {
                    setMissing(true);
                    return;
                }
                setData({ ...defaultHomepageData, ...snapshot.data() } as HomepageData);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Failed to fetch homepage data:", err);
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
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
}
