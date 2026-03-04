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
        { label: "Learning", value: "Rust & Systems Programming" },
        { label: "Reading", value: "Designing Data-Intensive Applications" },
        { label: "Building", value: "This portfolio site" },
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
                    setData(snapshot.data() as ExploreData);
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
