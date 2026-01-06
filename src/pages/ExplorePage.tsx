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
        <div className="space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold mb-4">Explore</h2>
                <p className="text-zinc-600">
                    A space for thoughts, experiments, and discoveries. More content coming soon.
                </p>
            </motion.section>

            {/* Placeholders */}
            <div className="space-y-4">
                {placeholders.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="border-2 border-dashed border-zinc-300 rounded-lg p-6 bg-zinc-50"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Compass className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-bold text-zinc-400">{item.title}</h3>
                        </div>
                        <p className="text-zinc-400">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default ExplorePage;
