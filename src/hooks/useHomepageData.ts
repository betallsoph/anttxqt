import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Experience {
    role: string;
    company: string;
    period: string;
    location?: string;
    description?: string[];
    hidden?: boolean;
}

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
    experiences?: Experience[];
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
    experiences: [
        {
            role: "Software Developer Intern",
            company: "FPT Software",
            period: "2024 - Present",
            location: "Ho Chi Minh City, Vietnam",
            description: [
                "Collaborated with senior engineers to implement new core features for a web-based document collaboration platform.",
                "Optimized database queries and API endpoints, improving load times by 20% across key dashboards.",
                "Participated in Agile sprint planning, daily standups, and rigorous team code reviews."
            ],
            hidden: false
        },
        {
            role: "Frontend Developer",
            company: "RMIT FinTech Club",
            period: "2023 - 2024",
            location: "RMIT University Vietnam",
            description: [
                "Designed and engineered interactive financial tools and landing pages to promote campus fintech initiatives.",
                "Styled modern responsive user interfaces from scratch using custom CSS layouts and utility classes.",
                "Integrated state management and unified API fetching patterns for real-time portfolio dashboards."
            ],
            hidden: false
        }
    ]
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
