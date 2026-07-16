import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    const defaultData = type === "products" ? defaultProducts : defaultProjectsList;
    const [projects, setProjects] = useState<Project[]>(defaultData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const docRef = doc(db, "siteConfig", type);
        getDoc(docRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data.items) {
                        const items = data.items as Project[];
                        // Automatic migration to clean up old mixed data
                        if (type === "projects" && items.some(i => i.id === "roomieverse")) {
                            console.log("Migrating old projects data...");
                            setProjects(defaultProjectsList);
                            setDoc(docRef, { items: defaultProjectsList });
                        } else if (type === "products" && items.length === 0) {
                            setProjects(defaultProducts);
                            setDoc(docRef, { items: defaultProducts });
                        } else {
                            setProjects(items);
                        }
                    } else {
                        setProjects(defaultData);
                    }
                } else {
                    setProjects(defaultData);
                }
            })
            .catch((err) => {
                console.error(`Failed to fetch ${type}:`, err);
                setError(err.message);
                setProjects(defaultData);
            })
            .finally(() => setLoading(false));
    }, [type]);

    return { projects, loading, error };
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
