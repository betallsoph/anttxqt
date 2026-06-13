import { useState } from "react";
import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useProjectsData, type CollectionType } from "@/hooks/useProjectsData";
import { parseBoldText } from "@/lib/utils";



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
    const [isVietnamese, setIsVietnamese] = useState(false);

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

    if (!project || project.hidden) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">{title} not found</h2>
                <Link to={backLink} className="text-blue-500 hover:underline">
                    Back to {backLabel}
                </Link>
            </div>
        );
    }

    const hasVietnameseData = !!(
        project.titleVi?.trim() ||
        project.descriptionVi?.trim() ||
        project.storyBehindVi?.trim() ||
        project.fullDescriptionVi?.trim() ||
        (project.keyFeaturesVi && project.keyFeaturesVi.length > 0)
    );

    const titleText = (isVietnamese && project.titleVi) || project.title;
    const storyBehindText = (isVietnamese && project.storyBehindVi) || project.storyBehind;
    const keyFeaturesList = (isVietnamese && project.keyFeaturesVi) || project.keyFeatures;
    const fullDescriptionText = (isVietnamese && project.fullDescriptionVi) || project.fullDescription;

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
                    className="group inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                >
                    {isVietnamese ? `Quay lại trang ${type === "products" ? "sản phẩm" : "dự án"}` : `Back to ${backLabel}`}
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
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                    </div>
                    {/* Language Switcher Link (styled like dive in my story) */}
                    {project.showVi && hasVietnameseData && (
                        <button
                            onClick={() => setIsVietnamese(!isVietnamese)}
                            className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 hover:text-blue-600 hover:underline transition-colors cursor-pointer select-none"
                        >
                            {isVietnamese ? "view english version" : "xem bản tiếng việt"}
                        </button>
                    )}
                </div>

                {/* Project Image */}
                {project.imageUrl && (
                    <div className="w-full h-40 sm:h-56 border-b-2 border-black overflow-hidden bg-zinc-50">
                        <ImageWithLoader
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full"
                            imgClassName="object-contain"
                        />
                    </div>
                )}

                <div className="p-4 sm:p-6">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{titleText}</h1>

                    {/* Status & Quick Links */}
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-4 sm:mb-6">
                        <span
                            className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border rounded ${statusStyles[project.status]}`}
                        >
                            {project.status === "Retired" ? "Sunsetting - Retired" : project.status}
                        </span>

                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-zinc-100 border border-zinc-300 rounded hover:bg-zinc-200 transition-colors"
                                title="View code on GitHub"
                            >
                                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                GitHub
                            </a>
                        )}

                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-blue-50 border border-blue-200 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                title="Visit live website"
                            >
                                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Live
                            </a>
                        )}
                    </div>



                    {/* The Story Behind */}
                    {storyBehindText && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Câu chuyện phía sau" : "The Story Behind"}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {storyBehindText.split(/\n\s*\n/).map((para, i) => (
                                    <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                        {parseBoldText(para.trim())}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Features */}
                    {keyFeaturesList && keyFeaturesList.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Tính năng nổi bật" : "Key Features"}
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                {keyFeaturesList.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2.5 bg-blue-600 rounded-sm flex-shrink-0 border border-black"></div>
                                        <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">{parseBoldText(feature)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full Description */}
                    {fullDescriptionText && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Mô tả chi tiết" : "Full Description"}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {fullDescriptionText.split(/\n\s*\n/).map((para, i) => (
                                    <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                        {parseBoldText(para.trim())}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Section (Roles, Tech Stack, Topics, Links/Explore) */}
                    <div className="pt-6 sm:pt-8 border-t-2 border-zinc-200 mt-6 sm:mt-8 space-y-6">
                        {/* Roles */}
                        {project.roles && project.roles.length > 0 && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                    {isVietnamese ? "Vai trò" : "Role"}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {project.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                {isVietnamese ? "Công nghệ sử dụng" : "Tech Stack"}
                            </h3>
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
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                    {isVietnamese ? "Trải nghiệm" : "Explore"}
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {isVietnamese ? "Xem trên GitHub" : "View on GitHub"}
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
                                            {isVietnamese ? "Ghé thăm trang web" : "Visit Website"}
                                        </a>
                                    )}
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
                    className="group inline-flex items-center gap-2 px-6 py-3 font-bold text-black border-2 border-black rounded-lg bg-blue-300 shadow-secondary active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all duration-200 cursor-pointer"
                >
                    {isVietnamese ? `Quay lại trang ${type === "products" ? "sản phẩm" : "dự án"}` : `Back to ${backLabel}`}
                    <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-x-1" />
                </button>
            </motion.div>
        </div>
    );
}

export default ProjectDetailPage;
