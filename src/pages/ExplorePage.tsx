import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useExploreData, type ExploreData } from "@/hooks/useExploreData";

type Achievement = ExploreData["achievements"][number];

function ComingSoon() {
    return (
        <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-zinc-400 font-medium">Coming soon</p>
        </div>
    );
}

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
                    className="relative w-auto max-w-3xl min-w-[300px] sm:min-w-[500px] max-h-[90vh] flex flex-col bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden"
                >
                    {/* Image */}
                    {item.imageUrl && (
                        <div className="flex-1 shrink min-h-0 w-full border-b-2 border-black bg-white flex items-center justify-center">
                            <ImageWithLoader
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full max-h-[70vh]"
                                imgClassName="object-contain"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="shrink-0 w-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 max-h-[50vh]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-base sm:text-lg">
                                        {item.title}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-300 font-medium">
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
                            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
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
            <LoadingScreen />
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                    {data.intro.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 whitespace-pre-wrap">
                    {data.intro.description}
                </p>
            </motion.section>

            {/* Favourites Section */}
            {data.favourites && data.favourites.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Favourites
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                        {data.favourites.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white"
                            >
                                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                <div className="min-w-0">
                                    <span className="font-medium text-sm sm:text-base">
                                        {item.label}
                                    </span>
                                    {item.description && (
                                        <span className="text-zinc-500 text-xs sm:text-sm hidden sm:inline">
                                            {" "}— {item.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Achievements */}
            {data.achievements.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Achievements
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                        {data.achievements.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedAchievement(item)}
                                className="w-full flex items-center justify-between p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 group text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base truncate">
                                        {item.title}
                                    </h3>
                                </div>
                                <span className="text-xs text-zinc-400 flex-shrink-0 ml-3">
                                    {item.date}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Currently */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Currently
                </h2>
                {data.currently.length > 0 ? (
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
                ) : (
                    <ComingSoon />
                )}
            </motion.section>



            {/* Stories */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Stories</h2>
                {data.stories && data.stories.length > 0 ? (
                    <div className="space-y-4">
                        {data.stories.map((story, index) => (
                            <div key={index} className="border-2 border-black rounded-lg bg-white p-4 sm:p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{story.title}</h3>
                                    {story.date && <span className="text-xs text-zinc-500 font-medium">{story.date}</span>}
                                </div>
                                <p className="text-sm sm:text-base text-zinc-700 whitespace-pre-wrap">{story.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ComingSoon />
                )}
            </motion.section>

            {/* What's Next */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">What's Next</h2>
                {data.whatsNext && data.whatsNext.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.whatsNext.map((item, index) => (
                            <div key={index} className="border-2 border-black rounded-lg bg-white p-3 sm:p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm sm:text-base">{item.title}</h3>
                                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 border rounded ${
                                        item.status === 'Done' ? 'bg-green-200 border-green-400 text-green-800' :
                                        item.status === 'In Progress' ? 'bg-blue-200 border-blue-400 text-blue-800' :
                                        'bg-zinc-100 border-zinc-300 text-zinc-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                {item.description && <p className="text-xs sm:text-sm text-zinc-500 whitespace-pre-wrap">{item.description}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <ComingSoon />
                )}
            </motion.section>

            {/* More & More */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.085 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More & More</h2>
                {data.moreAndMore && data.moreAndMore.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                        {data.moreAndMore.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white"
                            >
                                <span className="text-xs sm:text-sm font-bold text-zinc-900 bg-emerald-200 px-2 py-0.5 rounded border border-black flex-shrink-0">
                                    {item.label}
                                </span>
                                {item.description && (
                                    <span className="text-sm sm:text-base text-zinc-700">
                                        {item.description}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <ComingSoon />
                )}
            </motion.section>

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
