import { motion } from "motion/react";
import { Trophy, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useExploreData } from "@/hooks/useExploreData";

export function ExplorePage() {
    const { data, loading } = useExploreData();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                    {data.intro.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600">
                    {data.intro.description}
                </p>
            </motion.section>

            {/* Achievements */}
            {data.achievements.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="border-t-2 border-black pt-6 sm:pt-8"
                >
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Trophy className="w-5 h-5" />
                        <h2 className="text-lg sm:text-xl font-bold">
                            Achievements
                        </h2>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {data.achievements.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3 + 0.1 * index,
                                }}
                                className="p-3 sm:p-4 border-2 border-black rounded-lg bg-white"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-sm sm:text-base">
                                                {item.title}
                                            </h3>
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300 font-medium">
                                                {item.date}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                                            {item.issuer}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs sm:text-sm text-zinc-600 mt-1.5">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 text-zinc-400 hover:text-blue-500 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Currently */}
            {data.currently.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border-t-2 border-black pt-6 sm:pt-8"
                >
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="text-lg sm:text-xl font-bold">
                            Currently
                        </h2>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {data.currently.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white"
                            >
                                <span className="text-xs sm:text-sm font-bold text-zinc-900 bg-blue-200 px-2 py-0.5 rounded border border-black flex-shrink-0">
                                    {item.label}
                                </span>
                                <span className="text-sm sm:text-base text-zinc-700">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}
        </div>
    );
}

export default ExplorePage;
