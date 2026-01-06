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
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
                </div>

                <div className="p-6">
                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

                    {/* Status */}
                    <div className="mb-6">
                        <span
                            className={`px-3 py-1 text-sm font-bold border rounded-full ${statusStyles[project.status]}`}
                        >
                            {project.status}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="prose max-w-none mb-6">
                        <p className="text-lg text-zinc-700 leading-relaxed">
                            {project.fullDescription || project.description}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-zinc-500 mb-2">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {(project.githubUrl || project.liveUrl) && (
                        <div className="flex gap-4 pt-4 border-t-2 border-zinc-200">
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                    View on GitHub
                                </a>
                            )}
                            {project.liveUrl && (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-300 border-2 border-black rounded-md hover:bg-blue-400 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
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
