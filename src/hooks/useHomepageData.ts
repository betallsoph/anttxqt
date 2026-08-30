import { doc, setDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { invalidateCachedDoc } from "@/lib/firestore-utils";
import { useFirestoreSnapshot } from "@/hooks/useFirestoreSnapshot";

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
    const { snapshot, loading, error, retry } = useFirestoreSnapshot(DOCUMENT_REF);
    const missing = snapshot !== undefined && !snapshot.exists();
    const data = snapshotToHomepageData(snapshot);

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
