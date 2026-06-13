import { useState } from "react";
import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, Globe, ChevronDown } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useProjectsData, type CollectionType } from "@/hooks/useProjectsData";
import { parseBoldText } from "@/lib/utils";

interface LangItem {
    readonly key: string;
    readonly name: string;
    readonly flag: string;
    readonly suffix: string;
    readonly dir?: "rtl" | "ltr";
}

const langList: readonly LangItem[] = [
    { key: "en", name: "English", flag: "🇺🇸", suffix: "" },
    { key: "vi", name: "Tiếng Việt", flag: "🇻🇳", suffix: "Vi" },
    { key: "ar", name: "العربية (MSA)", flag: "🇸🇦", suffix: "Ar", dir: "rtl" },
    { key: "de", name: "Deutsch", flag: "🇩🇪", suffix: "De" },
    { key: "nl", name: "Nederlands", flag: "🇳🇱", suffix: "Nl" },
    { key: "sv", name: "Svenska", flag: "🇸🇪", suffix: "Sv" },
    { key: "cs", name: "Čeština", flag: "🇨🇿", suffix: "Cs" },
    { key: "da", name: "Dansk", flag: "🇩🇰", suffix: "Da" },
    { key: "es", name: "Español", flag: "🇪🇸", suffix: "Es" },
    { key: "fr", name: "Français", flag: "🇫🇷", suffix: "Fr" },
    { key: "no", name: "Norsk", flag: "🇳🇴", suffix: "No" },
    { key: "fi", name: "Suomi", flag: "🇫🇮", suffix: "Fi" },
    { key: "it", name: "Italiano", flag: "🇮🇹", suffix: "It" },
    { key: "pt", name: "Português", flag: "🇵🇹", suffix: "Pt" },
    { key: "hu", name: "Magyar", flag: "🇭🇺", suffix: "Hu" },
    { key: "el", name: "Ελληνικά", flag: "🇬🇷", suffix: "El" }
];



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
    const [lang, setLang] = useState<string>("en");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const hasTranslationData = (suffix: string) => {
        if (!suffix) return true;
        const titleKey = `title${suffix}`;
        const descKey = `description${suffix}`;
        const storyKey = `storyBehind${suffix}`;
        const fullDescKey = `fullDescription${suffix}`;
        const featuresKey = `keyFeatures${suffix}`;

        return !!(
            project[titleKey]?.trim() ||
            project[descKey]?.trim() ||
            project[storyKey]?.trim() ||
            project[fullDescKey]?.trim() ||
            (project[featuresKey] && project[featuresKey].length > 0)
        );
    };

    const availableLanguages = langList.filter((langItem) => {
        if (langItem.key === "en") return true;
        const showFieldKey = `show${langItem.suffix}`;
        if (!project[showFieldKey]) return false;
        return hasTranslationData(langItem.suffix);
    });

    const getLabel = (key: string) => {
        const labels: Record<string, Record<string, string>> = {
            back: {
                en: `Back to ${backLabel}`,
                vi: `Quay lại trang ${type === "products" ? "sản phẩm" : "dự án"}`,
                ar: `العودة إلى ${type === "products" ? "المنتجات" : "المشاريع"}`,
            },
            story: {
                en: "The Story Behind",
                vi: "Câu chuyện phía sau",
                ar: "القصة وراء المشروع",
            },
            features: {
                en: "Key Features",
                vi: "Tính năng nổi bật",
                ar: "الميزات الرئيسية",
            },
            description: {
                en: "Full Description",
                vi: "Mô tả chi tiết",
                ar: "الوصف الكامل",
            },
            role: {
                en: "Role",
                vi: "Vai trò",
                ar: "الدور",
            },
            tech: {
                en: "Tech Stack",
                vi: "Công nghệ sử dụng",
                ar: "التقنيات المستخدمة",
            },
            explore: {
                en: "Explore",
                vi: "Trải nghiệm",
                ar: "استكشف",
            },
            github: {
                en: "View on GitHub",
                vi: "Xem trên GitHub",
                ar: "عرض على GitHub",
            },
            live: {
                en: "Visit Website",
                vi: "Ghé thăm trang web",
                ar: "زيارة الموقع",
            }
        };
        return labels[key]?.[lang] || labels[key]?.en || "";
    };

    const activeLangItem = langList.find((l) => l.key === lang) || langList[0];
    const suffix = activeLangItem.suffix;
    const isRtl = activeLangItem.dir === "rtl";

    const titleText = (suffix && (project[`title${suffix}`] as string)) || project.title;
    const storyBehindText = (suffix && (project[`storyBehind${suffix}`] as string)) || project.storyBehind;
    const keyFeaturesList = (suffix && (project[`keyFeatures${suffix}`] as string[])) || project.keyFeatures;
    const fullDescriptionText = (suffix && (project[`fullDescription${suffix}`] as string)) || project.fullDescription;

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <button
                    onClick={handleBack}
                    className="group inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                >
                    {getLabel("back")}
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
                    {/* Language Switcher Dropdown */}
                    {availableLanguages.length > 1 && (
                        <div className="relative">
                            {/* Backdrop overlay for closing dropdown */}
                            {isDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-35 cursor-default"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                            )}
                            
                            {/* Trigger Button */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative z-40 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-black bg-white border-2 border-black rounded shadow-secondary hover:bg-zinc-50 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all cursor-pointer select-none"
                            >
                                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                <span>{activeLangItem.name}</span>
                                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {/* Dropdown Options List */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-secondary py-1 z-40 overflow-hidden min-w-[170px]">
                                    {availableLanguages.map((langItem) => {
                                        const isActive = langItem.key === lang;
                                        return (
                                            <button
                                                key={langItem.key}
                                                onClick={() => {
                                                    setLang(langItem.key);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer select-none ${
                                                    isActive 
                                                        ? "bg-blue-300 text-black" 
                                                        : "text-zinc-700 hover:bg-zinc-50 hover:text-black"
                                                }`}
                                            >
                                                <span className="text-sm select-none">{langItem.flag}</span>
                                                <span className="flex-1">{langItem.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                    <h1 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>{titleText}</h1>

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
                            <h3 className={`text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                {getLabel("story")}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {storyBehindText.split(/\n\s*\n/).map((para: string, i: number) => (
                                    <p key={i} className={`text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                        {parseBoldText(para.trim())}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Features */}
                    {keyFeaturesList && keyFeaturesList.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className={`text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                {getLabel("features")}
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                {keyFeaturesList.map((feature: string, index: number) => (
                                    <div key={index} className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                                        <div className="w-2 h-2 mt-2.5 bg-blue-600 rounded-sm flex-shrink-0 border border-black"></div>
                                        <p className={`text-base sm:text-lg text-zinc-700 leading-relaxed ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>{parseBoldText(feature)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full Description */}
                    {fullDescriptionText && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className={`text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                {getLabel("description")}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {fullDescriptionText.split(/\n\s*\n/).map((para: string, i: number) => (
                                    <p key={i} className={`text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
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
                                <h3 className={`text-xs sm:text-sm font-bold text-blue-600 mb-2 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                    {getLabel("role")}
                                </h3>
                                <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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
                            <h3 className={`text-xs sm:text-sm font-bold text-blue-600 mb-2 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                {getLabel("tech")}
                            </h3>
                            <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
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
                                <h3 className={`text-xs sm:text-sm font-bold text-blue-600 mb-2 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                    {getLabel("explore")}
                                </h3>
                                <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {getLabel("github")}
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
                                            {getLabel("live")}
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
                    {getLabel("back")}
                    <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-x-1" />
                </button>
            </motion.div>
        </div>
    );
}

export default ProjectDetailPage;
