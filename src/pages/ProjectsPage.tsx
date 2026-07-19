import { motion } from "motion/react";
import { DelayedLink } from "@/components/ui/delayed-link";
import { ArrowRight, Github, ExternalLink } from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { useProjectsData, type ProjectStatus, type CollectionType, formatExternalUrl } from "@/hooks/useProjectsData";

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-zinc-50 text-green-500 border-zinc-200",
    Staging: "bg-zinc-50 text-blue-500 border-zinc-200",
    "In Development": "bg-zinc-50 text-red-500 border-zinc-200",
    Concept: "bg-zinc-50 text-purple-500 border-zinc-200",
    Retired: "bg-zinc-50 text-pink-400 border-zinc-200",
};



export function ProjectsPage({ type }: { type: CollectionType }) {
    const { projects, loading, error, missing, retry } = useProjectsData(type);
    const visibleProjects = projects.filter((p) => !p.hidden);
    const title = type === "products" ? "Products" : "Projects";
    const itemLabel = type === "products" ? "products" : "projects";
    const subtitle = type === "products"
        ? "Personal software products designed, engineered, and shipped from scratch by myself."
        : "Collaborative projects, team efforts, and organizational works where I contributed my engineering expertise alongside others.";

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    if (error) {
        return <ErrorScreen onRetry={retry} />;
    }

    if (missing) {
        return (
            <ErrorScreen
                title="This content no longer exists"
                message={`The ${itemLabel} list has been removed.`}
            />
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
                    {subtitle}
                </p>
            </motion.section>

            {/* Projects Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="space-y-6"
            >
                {visibleProjects.map((project) => (
                    <div
                        key={project.id}
                        className="relative border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 group"
                    >
                        {/* Stretched Link (overlay) */}
                        <DelayedLink
                            to={`/${type}/${project.id}`}
                            className="absolute inset-0 z-10"
                        >
                            <span className="sr-only">View {project.title} details</span>
                        </DelayedLink>

                        {/* macOS Window Header */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black relative z-20 pointer-events-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                            </div>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>

                        <div className="p-4 sm:p-6 relative z-20 pointer-events-none">
                            {/* Header: Icon + Title */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                {/* Icon — only shown when set */}
                                {project.iconUrl && (
                                    <img 
                                        src={project.iconUrl} 
                                        alt={project.title} 
                                        className="h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[140px] object-contain flex-shrink-0 rounded-lg drop-shadow-[0_2px_5px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform duration-200 pointer-events-auto" 
                                    />
                                )}
                                <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm sm:text-base text-zinc-600 mb-3 sm:mb-4 whitespace-pre-wrap">{project.description}</p>

                            {/* Status & Topics (Responsive: Stacked Left-Aligned on Mobile, Split Balanced on Desktop) */}
                            <div className="mt-auto pt-4 sm:pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                {/* Left Column: Status Badge & Direct Links */}
                                <div className="flex-shrink-0 flex items-center justify-start gap-2.5 sm:gap-3 flex-wrap">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold border rounded ${statusStyles[project.status]}`}
                                    >
                                        {project.status === "Retired" ? "Sunsetting - Retired" : project.status}
                                    </span>

                                    {project.githubUrl && (
                                        <a
                                            href={formatExternalUrl(project.githubUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-zinc-100 border border-zinc-300 rounded hover:bg-zinc-200 transition-colors pointer-events-auto"
                                            title="View code on GitHub"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            GitHub
                                        </a>
                                    )}

                                    {project.liveUrl && (
                                        <a
                                            href={formatExternalUrl(project.liveUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-blue-50 border border-blue-200 text-blue-600 rounded hover:bg-blue-100 transition-colors pointer-events-auto"
                                            title="Visit live website"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Live
                                        </a>
                                    )}
                                </div>

                                {/* Right Column: Roles & Topic Hashtags stacked vertically */}
                                <div className="flex flex-col gap-1.5 sm:gap-2 items-start sm:items-end min-w-0">
                                    {/* Row 1: Role Badges */}
                                    {(project.roles || []).length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start sm:justify-end">
                                            {(project.roles || []).map((role) => (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-blue-100 border border-blue-300 rounded break-words"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Row 2: Topic Hashtags */}
                                    {(project.topics || []).length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end">
                                            {(project.topics || []).map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="text-[10px] sm:text-xs font-medium text-zinc-500 hover:text-black transition-colors duration-200 break-words"
                                                >
                                                    #{topic.toLowerCase().replace(/\s+/g, "-")}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
