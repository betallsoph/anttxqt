import { motion } from "motion/react";
import { Compass } from "lucide-react";

const placeholders = [
    {
        title: "Coming Soon",
        description: "Editor cho Explore page sẽ được thêm vào đây.",
    },
    {
        title: "Coming Soon",
        description: "Nội dung mới đang được chuẩn bị.",
    },
    {
        title: "Coming Soon",
        description: "Nhiều tính năng hơn trong tương lai.",
    },
];

export function AdminExplorePage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Explore Editor</h2>
                <p className="text-sm sm:text-base text-zinc-600">
                    Explore page chưa có nội dung để chỉnh sửa. Sẽ sớm được cập nhật.
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
