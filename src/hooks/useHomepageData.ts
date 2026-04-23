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
    skillCategories: {
        name: string;
        items: string[];
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
        name: "An T. Tran",
        bio: [
            "I'm a software developer focused on building reliable and user-focused applications.",
            "Alongside development, I'm interested in media and digital communication—exploring how content, visuals, and storytelling can enhance the way products are presented and experienced.",
        ],
        email: "hello@anttxqt.dev",
    },
    skillCategories: [
        {
            name: "Frontend",
            items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        },
        {
            name: "Backend",
            items: ["Node.js", "PostgreSQL", "Firebase", "REST APIs"],
        },
        {
            name: "Design & Tools",
            items: ["Figma", "Git", "Docker", "Vercel"],
        },
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
                    setData({ ...defaultHomepageData, ...snapshot.data() } as HomepageData);
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
