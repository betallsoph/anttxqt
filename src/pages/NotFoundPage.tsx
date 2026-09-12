import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="w-full">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Text */}
                    <div className="text-center md:text-left order-2 md:order-1">
                        <h1 className="text-[140px] md:text-[220px] font-black text-blue-300 leading-none mb-6">
                            404
                        </h1>
                        <h2 className="text-4xl font-black text-black mb-4">
                            Well, this one's lost.
                        </h2>
                        <p className="text-lg text-zinc-700 font-medium mb-8">
                            There's nothing at this address. Either it moved, or it never existed. Here's the way back.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-300 border-2 border-black rounded-lg font-bold shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
                            >
                                <Home className="w-5 h-5" />
                                Back to home
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-black rounded-lg font-bold shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Go back
                            </button>
                        </div>
                    </div>

                    {/* Illustration */}
                    <div className="flex justify-center order-1 md:order-2">
                        <img
                            src="/assets/error/404.png"
                            alt="Lost person with map"
                            className="w-full max-w-md h-auto"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default NotFoundPage;
