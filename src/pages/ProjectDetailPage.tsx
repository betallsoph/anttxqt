import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, ImageIcon } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useProjectsData, type CollectionType } from "@/hooks/useProjectsData";

const statusStyles: Record<string, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    Staging: "bg-sky-200 text-sky-800 border-sky-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
    Retired: "bg-zinc-200 text-zinc-800 border-zinc-400",
};

export function ProjectDetailPage({ type }: { type: CollectionType }) {
    const { id } = useParams<{ id: string }>();
    const { projects, loading } = useProjectsData(type);
    const project = projects.find((p) => p.id === id);
    const title = type === "products" ? "Product" : "Project";
    const backLink = type === "products" ? "/products" : "/projects";
    const backLabel = type === "products" ? "products" : "projects";
    const navigate = useNavigate();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(backLink);
        }
    };

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">{title} not found</h2>
                <Link to={backLink} className="text-blue-500 hover:underline">
                    Back to {backLabel}
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
                <button
                    onClick={handleBack}
                    className="group inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
                >
                    Back to {backLabel}
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                </button>
            </motion.div>

            {/* Project Card */}
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary"
            >
                {/* macOS Window Header */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                </div>

                {/* Project Image */}
                <div className="w-full h-40 sm:h-56 border-b-2 border-black overflow-hidden bg-zinc-50">
                    {project.imageUrl ? (
                        <ImageWithLoader
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full"
                            imgClassName="object-contain"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 bg-white/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                                </div>
                                <p className="text-sm sm:text-base text-blue-400 font-medium">{title} Image Coming Soon</p>
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
                            className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border rounded ${statusStyles[project.status]}`}
                        >
                            {project.status === "Retired" ? "Sunsetting - Retired" : project.status}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="prose max-w-none mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Description - The Story Behind</h3>
                        <p className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                            {project.fullDescription || project.description}
                        </p>
                    </div>

                    {/* Key Features */}
                    {project.keyFeatures && project.keyFeatures.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Key Features</h3>
                            <div className="space-y-2 sm:space-y-3">
                                {project.keyFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2.5 bg-blue-500 rounded-sm flex-shrink-0 border border-black"></div>
                                        <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Section (Tech Stack, Links, Topics) */}
                    <div className="pt-6 sm:pt-8 border-t-2 border-zinc-200 mt-6 sm:mt-8 space-y-6">
                        {/* Tech Stack */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">Tech Stack</h3>
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
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">Explore</h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
                                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Topics */}
                        {project.topics && project.topics.length > 0 && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">Topic</h3>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {project.topics.map((topic) => (
                                        <span
                                            key={topic}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.article>

            {/* Gallery */}
            {project.images && project.images.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More & More</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {project.images.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                                className="border-2 border-black rounded-lg overflow-hidden bg-white"
                            >
                                <ImageWithLoader
                                    src={img}
                                    alt={`${project.title} screenshot ${index + 1}`}
                                    className="w-full h-auto min-h-[200px]"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Bottom Back Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="pt-4 pb-8 flex justify-center"
            >
                <button
                    onClick={handleBack}
                    className="group inline-flex items-center gap-2 px-6 py-3 font-bold text-black border-2 border-black rounded-lg bg-blue-300 shadow-secondary active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all duration-200"
                >
                    Back to {backLabel}
                    <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-x-1" />
                </button>
            </motion.div>
        </div>
    );
}

export default ProjectDetailPage;
