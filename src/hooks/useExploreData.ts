import { doc, setDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { invalidateCachedDoc } from "@/lib/firestore-utils";
import { useFirestoreSnapshot } from "@/hooks/useFirestoreSnapshot";

export interface ExploreItem {
    title: string;
    summary: string;
    story: string;
    since?: string;
    imageUrl?: string;
    tags?: string[];
}

export interface ResumeVersion {
    versionName: string;
    url: string;
}

export interface ResumeGroup {
    name: string;
    description?: string;
    versions: ResumeVersion[];
}

export interface ExploreData {
    hiddenSections?: string[];
    intro: {
        title: string;
        description: string;
    };
    achievements: {
        title: string;
        issuer: string;
        date: string;
        description?: string;
        url?: string;
        imageUrl?: string;
    }[];
    currently: {
        label: string;
        value: string;
    }[];
    favourites: {
        label: string;
        description?: string;
    }[];
    beyondCode: ExploreItem[];
    stories: {
        title: string;
        content: string;
        topics?: string[];
    }[];
    whatsNext: {
        title: string;
        description?: string;
        status: "Planning" | "In Progress" | "Done";
    }[];
    readingCloselyIntro?: string;
    impactPeople: ExploreItem[];
    lessonsFailed: ExploreItem[];
    offTheRecord: ExploreItem[];
    moreAndMore: {
        label: string;
        description?: string;
        url?: string;
    }[];
    resumes?: ResumeGroup[];
}

// Intentionally empty. This only guarantees the shape when a Firestore doc is
// missing a field — never put real-looking content here. It renders on the live
// site whenever a fetch comes back short, and the admin form can save it as truth.
export const defaultExploreData: ExploreData = {
    intro: {
        title: "",
        description: "",
    },
    achievements: [],
    currently: [],
    favourites: [],
    beyondCode: [],
    stories: [],
    whatsNext: [],
    impactPeople: [],
    lessonsFailed: [],
    offTheRecord: [],
    moreAndMore: [],
    resumes: [],
};

const DOCUMENT_REF = doc(db, "siteConfig", "explore");

function snapshotToExploreData(snapshot: DocumentSnapshot | undefined): ExploreData {
    if (!snapshot?.exists()) return defaultExploreData;
    return { ...defaultExploreData, ...snapshot.data() } as ExploreData;
}

export function useExploreData() {
    const { snapshot, loading, error, retry } = useFirestoreSnapshot(DOCUMENT_REF);
    const missing = snapshot !== undefined && !snapshot.exists();
    const data = snapshotToExploreData(snapshot);

    return { data, loading, error, missing, retry };
}

export async function saveExploreData(data: ExploreData) {
    const cleaned = JSON.parse(JSON.stringify(data));
    await setDoc(DOCUMENT_REF, cleaned);
    invalidateCachedDoc(DOCUMENT_REF);
}
