import { motion } from "motion/react";

export function LoadingScreen() {
    return (
        <div className="flex justify-center items-center py-20">
            <motion.svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-blue-500"
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
        </div>
    );
}
