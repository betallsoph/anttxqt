import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { projects } from "./ProjectsPage";

const statusStyles: Record<string, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
};

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const project = projects.find((p) => p.id === id);

    if (!project) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Project not found</h2>
                <Link to="/projects" className="text-blue-500 hover:underline">
                    Back to projects
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to projects
                </Link>
            </motion.div>

            {/* Project Card */}
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary"
            >
                {/* macOS Window Header */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                </div>

                {/* Project Image */}
                <div className="w-full h-40 sm:h-56 border-b-2 border-black overflow-hidden">
                    {project.imageUrl ? (
                        <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 bg-white/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                                    <span className="text-blue-400 text-2xl sm:text-3xl">📷</span>
                                </div>
                                <p className="text-sm sm:text-base text-blue-400 font-medium">Project Image Coming Soon</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{project.title}</h1>

                    {/* Status */}
                    <div className="mb-4 sm:mb-6">
                        <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border rounded-full ${statusStyles[project.status]}`}
                        >
                            {project.status}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="prose max-w-none mb-4 sm:mb-6">
                        <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">
                            {project.fullDescription || project.description}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-500 mb-2">Tech Stack</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {(project.githubUrl || project.liveUrl) && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t-2 border-zinc-200">
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                >
                                    <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    View on GitHub
                                </a>
                            )}
                            {project.liveUrl && (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-300 border-2 border-black rounded-md hover:bg-blue-400 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Visit Website
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </motion.article>
        </div>
    );
}

export default ProjectDetailPage;
