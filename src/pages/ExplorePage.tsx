import { motion } from "motion/react";
import { Compass } from "lucide-react";

const placeholders = [
    {
        title: "Coming Soon",
        description: "New content is on the way. Stay tuned!",
    },
    {
        title: "Coming Soon",
        description: "Exciting things are being prepared.",
    },
    {
        title: "Coming Soon",
        description: "More to explore in the future.",
    },
];

export function ExplorePage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Explore</h2>
                <p className="text-sm sm:text-base text-zinc-600">
                    A space for thoughts, experiments, and discoveries. More content coming soon.
                </p>
            </motion.section>

            {/* Placeholders */}
            <div className="space-y-3 sm:space-y-4">
                {placeholders.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="border-2 border-dashed border-zinc-300 rounded-lg p-4 sm:p-6 bg-zinc-50"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                            <h3 className="text-base sm:text-lg font-bold text-zinc-400">{item.title}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-zinc-400">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default ExplorePage;
