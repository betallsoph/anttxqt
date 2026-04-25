import { motion } from "motion/react";
import { useState } from "react";

export function LoadingSpinner({ size = 64, className = "" }: { size?: number, className?: string }) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`text-blue-500 ${className}`}
        >
            <circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-20"
            />
            <motion.circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDasharray: "150", strokeDashoffset: "150" }}
                animate={{ strokeDashoffset: ["150", "0", "-150"] }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </motion.svg>
    );
}

export function LoadingScreen() {
    return (
        <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
        </div>
    );
}

export function ImageWithLoader({ src, alt, className, imgClassName = "object-cover" }: { src: string, alt: string, className?: string, imgClassName?: string }) {
    const [loaded, setLoaded] = useState(false);
    
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                    <LoadingSpinner size={32} />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`w-full h-full transition-opacity duration-300 ${imgClassName} ${loaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
}
