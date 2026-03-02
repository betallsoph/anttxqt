import { motion } from "motion/react";
import { DelayedLink } from "@/components/ui/delayed-link";
import { ArrowRight, ImageIcon, Loader2 } from "lucide-react";
import { useProjectsData, type ProjectStatus } from "@/hooks/useProjectsData";

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    Staging: "bg-sky-200 text-sky-800 border-sky-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
};

export function ProjectsPage() {
    const { projects, loading } = useProjectsData();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold mb-4">Projects</h2>
                <p className="text-zinc-600">
                    Here are some of the projects I've worked on. Each one represents a
                    unique challenge and learning experience.
                </p>
            </motion.section>

            {/* Projects Grid */}
            <div className="space-y-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                        <DelayedLink
                            to={`/projects/${project.id}`}
                            className="block border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 group"
                        >
                            {/* macOS Window Header */}
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                            </div>

                            {/* Project Image */}
                            <div className="w-full h-32 sm:h-40 border-b-2 border-black overflow-hidden bg-zinc-50">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-white/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                                            </div>
                                            <p className="text-xs sm:text-sm text-blue-400 font-medium">Image Coming Soon</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 sm:p-6">
                                {/* Title */}
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-zinc-600 mb-3 sm:mb-4 line-clamp-2">{project.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold border rounded-full ${statusStyles[project.status]}`}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </DelayedLink>
                    </motion.div>
                ))}
            </div>

            {/* More Projects */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center py-6 border-t-2 border-black mt-8"
            >
                <p className="text-zinc-600">
                    More projects available on{" "}
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
