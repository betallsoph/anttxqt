import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ExploreData {
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
    currently: [
        { label: "Learning", value: "Golang Programming, DevOps" },
        { label: "Reading", value: "None" },
        { label: "Building", value: "This portfolio site, roomieVerse" },
    ],
    favourites: [
        { label: "Rust", description: "Systems programming & performance" },
        { label: "Design Systems", description: "Typography, spacing, consistency" },
        { label: "Cloud Native", description: "Serverless, edge computing" },
        { label: "Open Source", description: "Building in public" },
    ],
    stories: [
        {
            title: "How I got into programming",
            content: "It all started with a curiosity about how websites work. I remember spending hours inspecting page sources and trying to understand HTML tags. That curiosity eventually turned into a passion that shapes my everyday life.",
            date: "2024",
        },
    ],
    whatsNext: [
        { title: "Learn Rust deeply", description: "Systems programming & building CLI tools", status: "In Progress" },
        { title: "Contribute to open source", description: "Give back to the community", status: "Planning" },
        { title: "Launch roomieVerse v2", description: "Complete redesign with new features", status: "Planning" },
    ],
    moreAndMore: [
        { label: "Favourite font", description: "Inter — clean, modern, versatile" },
        { label: "Coffee order", description: "Iced oat latte, no sugar" },
        { label: "IDE", description: "VS Code with Catppuccin theme" },
        { label: "Keyboard", description: "Still looking for the perfect one" },
    ],
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
    await setDoc(DOCUMENT_REF, data);
}
