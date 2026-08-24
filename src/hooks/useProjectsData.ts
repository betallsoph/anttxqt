import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { doc, setDoc, type DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    getDocWithRetry,
    invalidateCachedDoc,
    isAbortError,
    peekCachedDoc,
} from "@/lib/firestore-utils";
import { useRetryOnVisible } from "@/hooks/useRetryOnVisible";

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
    const docRef = doc(db, "siteConfig", type);
    const cached = peekCachedDoc(docRef);

    const [projects, setProjects] = useState<Project[]>(() => snapshotToProjects(cached));
    const [loading, setLoading] = useState(() => !cached);
    const [error, setError] = useState<string | null>(null);
    const [missing, setMissing] = useState(() => cached !== undefined && !cached.exists());
    const [reloadKey, setReloadKey] = useState(0);

    useLayoutEffect(() => {
        const snapshot = peekCachedDoc(docRef);
        if (snapshot?.exists()) {
            setProjects(snapshotToProjects(snapshot));
            setMissing(false);
            setLoading(false);
        } else if (snapshot) {
            setProjects([]);
            setMissing(true);
            setLoading(false);
        } else {
            setProjects([]);
            setMissing(false);
            setLoading(true);
        }
        setError(null);
    }, [docRef.path]);

    const retry = useCallback(() => {
        invalidateCachedDoc(doc(db, "siteConfig", type));
        setLoading(true);
        setError(null);
        setMissing(false);
        setReloadKey((key) => key + 1);
    }, [type]);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        getDocWithRetry(docRef, {
            signal: controller.signal,
            skipCache: reloadKey > 0,
        })
            .then((snapshot) => {
                if (cancelled) return;
                if (!snapshot.exists()) {
                    setMissing(true);
                    setProjects([]);
                    return;
                }
                setMissing(false);
                setProjects(snapshotToProjects(snapshot));
            })
            .catch((err) => {
                if (cancelled || isAbortError(err)) return;
                console.error(`Failed to fetch ${type}:`, err);
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled && !controller.signal.aborted) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [docRef, type, reloadKey]);

    useRetryOnVisible(error !== null, retry);

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
