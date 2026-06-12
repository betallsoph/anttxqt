import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ExploreItem {
    title: string;
    summary: string;
    story: string;
    since?: string;
    imageUrl?: string;
    tags?: string[];
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
        date?: string;
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
    }[];
}

export const defaultExploreData: ExploreData = {
    intro: {
        title: "Explore",
        description:
            "A space for thoughts, experiments, and discoveries beyond projects.",
    },
    achievements: [
        {
            title: "Dean's List",
            issuer: "RMIT University",
            date: "2024",
            description:
                "Recognized for outstanding academic performance.",
        },
        {
            title: "First Place — Hackathon",
            issuer: "RMIT Hackathon 2024",
            date: "2024",
            description:
                "Won first place with a real-time collaboration tool.",
        },
        {
            title: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services",
            date: "2023",
            description:
                "Foundational cloud computing certification.",
            url: "https://aws.amazon.com/certification/",
        },
    ],
    currently: [],
    favourites: [
        { label: "Rust", description: "Systems programming & performance" },
        { label: "Design Systems", description: "Typography, spacing, consistency" },
        { label: "Cloud Native", description: "Serverless, edge computing" },
        { label: "Open Source", description: "Building in public" },
    ],
    beyondCode: [
        {
            title: "Marathon Running",
            summary: "Training for endurance and discipline.",
            story: "Running long distances is my way of clearing my mind, building mental resilience, and maintaining peak physical condition. It has taught me the value of consistency, pacing, and incremental progress, which directly applies to how I tackle complex engineering projects.",
            since: "2024",
            tags: ["Endurance", "Fitness"]
        },
        {
            title: "Landscape Photography",
            summary: "Capturing light, perspectives, and visual stories.",
            story: "Photography is my main creative outlet outside of programming. Playing with cameras, lenses, and editing tools keeps my creative instincts sharp. It trains my eyes for composition, lighting, and detail, which directly influences my UI/UX design work.",
            since: "2023",
            tags: ["Creative", "Art"]
        }
    ],
    stories: [],
    whatsNext: [],
    impactPeople: [],
    lessonsFailed: [],
    offTheRecord: [],
    moreAndMore: [],
};

const DOCUMENT_REF = doc(db, "siteConfig", "explore");

export function useExploreData() {
    const [data, setData] = useState<ExploreData>(defaultExploreData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDoc(DOCUMENT_REF)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setData({ ...defaultExploreData, ...snapshot.data() } as ExploreData);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch explore data:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}

export async function saveExploreData(data: ExploreData) {
    const cleaned = JSON.parse(JSON.stringify(data));
    await setDoc(DOCUMENT_REF, cleaned);
}
