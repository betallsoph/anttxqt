import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { useExploreData, type ExploreData } from "@/hooks/useExploreData";

type Achievement = ExploreData["achievements"][number];

function AchievementModal({
    item,
    onClose,
}: {
    item: Achievement;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden"
                >
                    {/* Image */}
                    {item.imageUrl && (
                        <div className="w-full h-48 sm:h-56 border-b-2 border-black overflow-hidden">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-base sm:text-lg">
                                        {item.title}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300 font-medium">
                                        {item.date}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                                    {item.issuer}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {item.description && (
                            <p className="text-sm text-zinc-600 leading-relaxed">
                                {item.description}
                            </p>
                        )}

                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-500 font-medium hover:underline"
                            >
                                View credential
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export function ExplorePage() {
    const { data, loading } = useExploreData();
    const [selectedAchievement, setSelectedAchievement] =
        useState<Achievement | null>(null);

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
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Achievements
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                        {data.achievements.map((item, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3 + 0.1 * index,
                                }}
                                onClick={() => setSelectedAchievement(item)}
                                className="w-full flex items-center justify-between p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 group text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded object-cover border border-black flex-shrink-0"
                                        />
                                    )}
                                    <h3 className="font-bold text-sm sm:text-base truncate">
                                        {item.title}
                                    </h3>
                                </div>
                                <span className="text-xs text-zinc-400 flex-shrink-0 ml-3">
                                    {item.date}
                                </span>
                            </motion.button>
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
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Currently
                    </h2>
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

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <AchievementModal
                    item={selectedAchievement}
                    onClose={() => setSelectedAchievement(null)}
                />
            )}
        </div>
    );
}

export default ExplorePage;
