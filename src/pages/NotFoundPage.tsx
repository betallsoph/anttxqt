import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* 404 Number */}
                <h1 className="text-8xl md:text-9xl font-black text-blue-300 mb-4">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Page Not Found
                </h2>
                <p className="text-zinc-600 mb-8 max-w-md">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-300 border-2 border-black rounded-md font-bold shadow-primary active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all duration-150"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black rounded-md font-bold shadow-primary active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all duration-150"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default NotFoundPage;
