import { motion } from "motion/react";
import { DelayedLink } from "@/components/ui/delayed-link";
import { ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useProjectsData, type ProjectStatus, type CollectionType } from "@/hooks/useProjectsData";

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    Staging: "bg-sky-200 text-sky-800 border-sky-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
};

export function ProjectsPage({ type }: { type: CollectionType }) {
    const { projects, loading } = useProjectsData(type);
    const title = type === "products" ? "Products" : "Projects";
    const itemLabel = type === "products" ? "products" : "projects";

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                <p className="text-zinc-600">
                    Here are some of the {itemLabel} I've worked on. Each one represents a
                    unique challenge and learning experience.
                </p>
            </motion.section>

            {/* Projects Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="space-y-6"
            >
                {projects.map((project) => (
                    <div
                        key={project.id}
                    >
                        <DelayedLink
                            to={`/${type}/${project.id}`}
                            className="block border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 group"
                        >
                            {/* macOS Window Header */}
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {/* Header: Icon + Title */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Icon — only shown when set */}
                                        {project.iconUrl && (
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white border-2 border-black rounded-xl overflow-hidden p-1 sm:p-1.5 shadow-sm">
                                                <img src={project.iconUrl} alt={project.title} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                                    </div>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mt-2 sm:mt-3 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-zinc-600 mb-3 sm:mb-4 whitespace-pre-wrap">{project.description}</p>

                                {/* Status & Topics */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                                    <span
                                        className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold border rounded ${statusStyles[project.status]}`}
                                    >
                                        {project.status}
                                    </span>
                                    {project.topics?.map((topic) => (
                                        <span
                                            key={topic}
                                            className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-blue-100 border border-blue-300 rounded"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </DelayedLink>
                    </div>
                ))}
            </motion.div>

            {/* More Projects */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="text-center py-6 mt-8"
            >
                <p className="text-zinc-600">
                    More {itemLabel} available on{" "}
                    <a
                        href="https://github.com/anttxqt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-500 hover:text-blue-600"
                    >
                        GitHub
                    </a>
                </p>
            </motion.section>
        </div>
    );
}

export default ProjectsPage;
