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
}

export type CollectionType = "products" | "projects";

export const defaultProducts: Project[] = [
    {
        id: "roomieverse",
        title: "roomieVerse",
        description: "A platform connecting roommates and helping them manage shared living spaces. Features include expense splitting, task management, and community building.",
        fullDescription: "roomieVerse is a comprehensive platform designed to make shared living easier and more enjoyable. It provides tools for expense splitting, task management, house rules, and community building among roommates. The app helps reduce conflicts and improve communication in shared living spaces.",
        status: "Production",
        tags: ["React", "Node.js", "MongoDB"],
        liveUrl: "https://roomieverse.app",
    },
    {
        id: "ourwarmth",
        title: "ourWarmth",
        description: "A digital platform fostering meaningful connections and spreading warmth through shared stories and experiences.",
        fullDescription: "ourWarmth is a platform that brings people together through storytelling and shared experiences. It's designed to create meaningful connections in an increasingly digital world, allowing users to share moments of warmth and kindness.",
        status: "In Development",
        tags: ["Next.js", "TypeScript", "Prisma"],
        githubUrl: "https://github.com/anttxqt/ourwarmth",
    },
    {
        id: "ecopoint",
        title: "ecoPoint",
        description: "An innovative solution for tracking and rewarding eco-friendly behaviors. Gamifying sustainability to make positive environmental impact fun and engaging.",
        fullDescription: "ecoPoint is a concept app that gamifies sustainability. Users can track their eco-friendly behaviors, earn points, and compete with friends to make positive environmental impact. The goal is to make sustainability fun and accessible to everyone.",
        status: "Concept",
        tags: ["Mobile", "Sustainability", "Gamification"],
    },
    {
        id: "hindsight",
        title: "HindSight",
        description: "A retrospective analysis tool helping teams learn from past projects and improve future outcomes.",
        fullDescription: "HindSight is designed to help teams conduct effective retrospectives and post-mortems. It provides structured templates, analytics on recurring issues, and actionable insights to continuously improve team performance and project outcomes.",
        status: "Concept",
        tags: ["Analytics", "Team Collaboration", "Learning"],
    },
    {
        id: "electronics-rewind",
        title: "Electronics Rewind Platform",
        description: "A marketplace for refurbished electronics, promoting sustainability and affordable technology access.",
        fullDescription: "Electronics Rewind Platform connects sellers of refurbished electronics with eco-conscious buyers. The platform includes quality verification, warranty management, and a trade-in program to extend the lifecycle of electronic devices and reduce e-waste.",
        status: "Concept",
        tags: ["Marketplace", "E-commerce", "Sustainability"],
    },
    {
        id: "southern-echoes",
        title: "The Southern Echoes",
        description: "A digital platform preserving and sharing the rich cultural heritage and stories of Southern Vietnam.",
        fullDescription: "The Southern Echoes is a cultural preservation project that documents stories, traditions, music, and history from Southern Vietnam. It features audio recordings, visual archives, and interactive storytelling to connect generations.",
        status: "Concept",
        tags: ["Culture", "Heritage", "Storytelling"],
    },
    {
        id: "99percent-ai-labs",
        title: "99percent-from-AI Labs",
        description: "An experimental lab exploring AI-assisted development and automation of software workflows.",
        fullDescription: "99percent-from-AI Labs is a research initiative exploring how AI can handle 99% of repetitive coding tasks. We experiment with AI pair programming, automated testing, and intelligent code generation to push the boundaries of developer productivity.",
        status: "Concept",
        tags: ["AI", "Research", "Automation"],
    },
    {
        id: "moms-flavor",
        title: "Moms Flavor",
        description: "A recipe sharing platform celebrating home-cooked meals and family recipes passed down through generations.",
        fullDescription: "Moms Flavor is a heartfelt platform where families can preserve, share, and discover cherished recipes. It features video tutorials, ingredient scaling, meal planning, and a community of home cooks celebrating the warmth of family cooking.",
        status: "Concept",
        tags: ["Food", "Community", "Family"],
    },
];

export const defaultProjectsList: Project[] = [
    {
        id: "he-thong-quan-ly-nha-tro",
        title: "rooming house Management",
        description: "A comprehensive rooming house management system for landlords to manage rooms, tenants, contracts, and payments efficiently.",
        fullDescription: "This system helps landlords digitize their rooming house operations. Features include room management, tenant information tracking, contract management, utility billing, payment tracking, and financial reporting. Built to simplify the daily operations of running a rooming house business.",
        status: "In Development",
        tags: ["React", "Node.js", "PostgreSQL"],
    },
    {
        id: "room-management-system",
        title: "The Room Management System",
        description: "An enterprise-grade room booking and management solution for offices, co-working spaces, and educational institutions.",
        fullDescription: "The Room Management System is designed for organizations that need to manage multiple rooms and spaces. It features real-time availability checking, booking management, resource allocation, and usage analytics. Perfect for offices, universities, and co-working spaces.",
        status: "Concept",
        tags: ["Enterprise", "SaaS", "Booking System"],
    },
];

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
        if (project.keyFeatures) {
            project.keyFeatures = project.keyFeatures.filter((f: string) => f.trim() !== "");
        }
        if (project.keyFeaturesVi) {
            project.keyFeaturesVi = project.keyFeaturesVi.filter((f: string) => f.trim() !== "");
        }
        return project;
    });
    
    await setDoc(doc(db, "siteConfig", type), { items: processed });
}
