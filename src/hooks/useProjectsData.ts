import { useMemo } from "react";
import { doc, setDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { invalidateCachedDoc } from "@/lib/firestore-utils";
import { useFirestoreSnapshot } from "@/hooks/useFirestoreSnapshot";

export type ProjectStatus = "Production" | "Staging" | "In Development" | "Concept" | "Retired";

export interface Project {
    id: string;
    hidden?: boolean;
    title: string;
    description: string;
    fullDescription?: string;
    storyBehind?: string;
    howIBuilt?: string;
    status: ProjectStatus;
    tags: string[];
    topics?: string[];
    roles?: string[];
    keyFeatures?: string[];
    githubUrl?: string;
    liveUrl?: string;
    iconUrl?: string; // Small app icon or logo
    imageUrl?: string; // Wide banner image
    images?: string[]; // Gallery images
    // Vietnamese translation fields (written manually by admin)
    titleVi?: string;
    descriptionVi?: string;
    storyBehindVi?: string;
    keyFeaturesVi?: string[];
    fullDescriptionVi?: string;
    howIBuiltVi?: string;
    showVi?: boolean;
    // Arabic translation fields (written manually by admin)
    titleAr?: string;
    descriptionAr?: string;
    storyBehindAr?: string;
    keyFeaturesAr?: string[];
    fullDescriptionAr?: string;
    howIBuiltAr?: string;
    showAr?: boolean;
    // Index signature for dynamic multilingual support
    [key: string]: any;
}


export type CollectionType = "products" | "projects";

// Intentionally empty. The admin form loads these when a doc is missing, so
// anything left here can be saved into Firestore as if it were real. Keep empty.
export const formatExternalUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
};

export const defaultProducts: Project[] = [];

export const defaultProjectsList: Project[] = [];

function snapshotToProjects(snapshot: DocumentSnapshot | undefined): Project[] {
    if (!snapshot?.exists()) return [];
    const items = snapshot.data().items;
    return Array.isArray(items) ? (items as Project[]) : [];
}

export function useProjectsData(type: CollectionType) {
    const docRef = useMemo(() => doc(db, "siteConfig", type), [type]);
    const { snapshot, loading, error, retry } = useFirestoreSnapshot(docRef);
    const missing = snapshot !== undefined && !snapshot.exists();
    const projects = snapshotToProjects(snapshot);

    return { projects, loading, error, missing, retry };
}

export async function saveProjectsData(type: CollectionType, projects: Project[]) {
    const cleaned = JSON.parse(JSON.stringify(projects));

    const processed = cleaned.map((project: any) => {
        // Filter out empty lines in all keyFeatures array fields dynamically
        Object.keys(project).forEach((key) => {
            if (key.startsWith("keyFeatures") && Array.isArray(project[key])) {
                project[key] = project[key].filter((f: any) => typeof f === "string" && f.trim() !== "");
            }
        });
        return project;
    });

    const docRef = doc(db, "siteConfig", type);
    await setDoc(docRef, { items: processed });
    invalidateCachedDoc(docRef);
}
