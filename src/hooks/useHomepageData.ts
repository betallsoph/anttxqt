import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface HomepageData {
    hero: {
        greeting: string;
        name: string;
        bio: string[];
        email: string;
        avatarUrl?: string;
    };
    products: {
        title: string;
        description: string;
        icon: string;
        link: string;
        imageUrl?: string;
    }[];
    skills: {
        name: string;
        detail: string;
    }[];
    links: {
        label: string;
        url: string;
        iconUrl?: string;
    }[];
}

export const defaultHomepageData: HomepageData = {
    hero: {
        greeting: "Hello!",
        name: "An Tran",
        bio: [
            "I'm a software developer focused on building reliable and user-focused applications.",
            "Alongside development, I'm interested in media and digital communication—exploring how content, visuals, and storytelling can enhance the way products are presented and experienced.",
        ],
        email: "hello@anttxqt.dev",
    },
    products: [
        {
            title: "roomieVerse",
            description: "A platform connecting roommates and managing shared living spaces.",
            icon: "Rocket",
            link: "/projects",
        },
        {
            title: "ourWarmth",
            description: "A digital platform fostering meaningful connections through shared stories.",
            icon: "CheckCircle",
            link: "/projects",
        },
        {
            title: "Rooming House Management",
            description: "Comprehensive rooming house management for landlords.",
            icon: "Rocket",
            link: "/projects",
        },
    ],
    skills: [
        { name: "Web Development", detail: "React, Next.js, TypeScript" },
        { name: "UI/UX Design", detail: "Figma, Design Systems" },
        { name: "Consulting", detail: "Architecture, Code Review" },
    ],
    links: [
        { label: "Email", url: "mailto:hello@anttxqt.dev" },
        { label: "GitHub", url: "https://github.com/anttxqt" },
        { label: "LinkedIn", url: "https://linkedin.com/in/anttxqt" },
        { label: "Twitter", url: "https://twitter.com/anttxqt" },
    ],
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
                    setData(snapshot.data() as HomepageData);
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
    await setDoc(DOCUMENT_REF, data);
}
