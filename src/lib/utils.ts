import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseBoldText(text: string): React.ReactNode {
    if (!text) return "";
    if (!text.includes("**")) return text;
    
    const parts = text.split("**");
    return parts.map((part, i) => {
        if (i % 2 === 1) {
            return React.createElement("strong", { key: i, className: "font-black text-black" }, part);
        }
        return part;
    });
}
