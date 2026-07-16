import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export const defaultHomepageData: HomepageData = {
    hero: {
// Intentionally empty. This only guarantees the shape when a Firestore doc is
// missing a field — never put real-looking content here. It renders on the live
// site whenever a fetch comes back short, and the admin form can save it as truth.
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

    useEffect(() => {
        getDoc(DOCUMENT_REF)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setData({ ...defaultHomepageData, ...snapshot.data() } as HomepageData);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch homepage data:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
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
