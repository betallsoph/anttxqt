import { useState, useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDocWithRetry } from "@/lib/firestore-utils";
import { useRetryOnVisible } from "@/hooks/useRetryOnVisible";

export type ProjectStatus = "Production" | "Staging" | "In Development" | "Concept" | "Retired";

export interface Project {
    id: string;
    hidden?: boolean;
    title: string;
    description: string;
    fullDescription?: string;
    storyBehind?: string;
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
    showVi?: boolean;
    // Arabic translation fields (written manually by admin)
    titleAr?: string;
    descriptionAr?: string;
    storyBehindAr?: string;
    keyFeaturesAr?: string[];
    fullDescriptionAr?: string;
    showAr?: boolean;
    // Index signature for dynamic multilingual support
    [key: string]: any;
}


export type CollectionType = "products" | "projects";

// Intentionally empty. The admin form loads these when a doc is missing, so
// anything left here can be saved into Firestore as if it were real. Keep empty.
export const defaultProducts: Project[] = [];

export const defaultProjectsList: Project[] = [];

export function useProjectsData(type: CollectionType) {
    const [projects, setProjects] = useState<Project[]>([]);
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

        getDocWithRetry(doc(db, "siteConfig", type))
            .then((snapshot) => {
                if (cancelled) return;
                if (!snapshot.exists()) {
                    setMissing(true);
                    return;
                }
                const items = snapshot.data().items;
                setProjects(Array.isArray(items) ? (items as Project[]) : []);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error(`Failed to fetch ${type}:`, err);
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [type, reloadKey]);

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
    
    await setDoc(doc(db, "siteConfig", type), { items: processed });
}
