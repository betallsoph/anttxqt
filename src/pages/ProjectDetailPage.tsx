import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, Images } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useProjectsData, type CollectionType, formatExternalUrl, sectionLanguageOn } from "@/hooks/useProjectsData";
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



function FadeReadMore({
    id,
    open,
    onToggle,
    children,
    readMore,
    collapsedClass = "max-h-48",
}: {
    id: string;
    open: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
    readMore: string;
    collapsedClass?: string;
}) {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [overflows, setOverflows] = useState(false);

    useEffect(() => {
        const el = bodyRef.current;
        if (!el || open) return;
        const measure = () => {
            setOverflows(el.scrollHeight > el.clientHeight + 8);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [open, children]);

    return (
        <div>
            <div className="relative">
                <div
                    ref={bodyRef}
                    className={open ? undefined : `${collapsedClass} overflow-hidden`}
                >
                    {children}
                </div>
                {!open && overflows && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                )}
            </div>
            {!open && overflows && (
                <button
                    type="button"
                    onClick={() => onToggle(id)}
                    className="mt-1 block w-full py-2 text-center text-sm font-bold text-zinc-500 hover:text-black cursor-pointer"
                >
                    {`${readMore}...`}
                </button>
            )}
        </div>
    );
}

const viLangName: Record<string, string> = {
    ar: "Ả Rập",
    de: "Đức",
    nl: "Hà Lan",
    sv: "Thụy Điển",
    cs: "Séc",
    da: "Đan Mạch",
    es: "Tây Ban Nha",
    fr: "Pháp",
    no: "Na Uy",
    fi: "Phần Lan",
    it: "Ý",
    pt: "Bồ Đào Nha",
    hu: "Hungary",
    el: "Hy Lạp",
};

function extraLangLabel(item: LangItem) {
    const short = viLangName[item.key];
    if (short) return `tiếng ${short}`;
    const stripped = item.name.split(item.flag).join("").replace(/\s+/g, " ").trim();
    return stripped || item.name.trim();
}

function SectionLangChips({
    languages,
    value,
    onChange,
}: {
    languages: readonly LangItem[];
    value: string;
    onChange: (key: string) => void;
}) {
    if (languages.length < 2) {
        const only = languages[0]?.key;
        if (only === "vi") {
            return (
                <p className="min-w-0 text-right text-[11px] sm:text-xs font-medium leading-snug text-zinc-400">
                    *only available in Vietnamese
                </p>
            );
        }
        if (only === "en") {
            return (
                <p className="font-vietnamese min-w-0 text-right text-[11px] sm:text-xs font-medium leading-snug text-zinc-400">
                    *hiện chỉ có bản tiếng Anh
                </p>
            );
        }
        return null;
    }

    const available = new Set(languages.map((item) => item.key));
    const actions: { key: string; label: string; vietnamese: boolean }[] = [];
    const addEnglish = () => {
        if (value !== "en" && available.has("en")) {
            actions.push({ key: "en", label: "switch to English", vietnamese: false });
        }
    };
    const addVietnamese = () => {
        if (value !== "vi" && available.has("vi")) {
            actions.push({ key: "vi", label: "chuyển sang tiếng Việt", vietnamese: true });
        }
    };

    if (value === "en") addVietnamese();
    else if (value === "vi") addEnglish();
    else {
        addEnglish();
        addVietnamese();
    }

    for (const item of languages) {
        if (item.key === "en" || item.key === "vi" || item.key === value) continue;
        actions.push({ key: item.key, label: extraLangLabel(item), vietnamese: item.key in viLangName });
    }

    if (actions.length === 0) return null;

    return (
        <div dir="ltr" className="flex items-center shrink-0 text-[11px] sm:text-xs font-bold leading-none">
            {actions.map((action, index) => (
                <span key={action.key} className="flex items-center">
                    {index > 0 && (
                        <span className="select-none text-zinc-300 pointer-events-none" aria-hidden="true"> | </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onChange(action.key)}
                        className={`cursor-pointer px-3 py-2 text-zinc-400 hover:text-zinc-600 ${action.vietnamese ? "font-vietnamese" : ""}`}
                        style={action.vietnamese ? undefined : { fontFamily: '"Outfit", sans-serif' }}
                    >
                        {action.label}
                    </button>
                </span>
            ))}
        </div>
    );
}

const statusStyles: Record<string, string> = {
    Production: "bg-zinc-50 text-green-500 border-zinc-200",
    Staging: "bg-zinc-50 text-blue-500 border-zinc-200",
    "In Development": "bg-zinc-50 text-red-500 border-zinc-200",
    Prototype: "bg-zinc-50 text-purple-500 border-zinc-200",
    "Planned - Draft": "bg-zinc-50 text-amber-600 border-zinc-200",
    Concept: "bg-zinc-50 text-purple-500 border-zinc-200",
    Retired: "bg-zinc-50 text-pink-400 border-zinc-200",
};

export function ProjectDetailPage({ type }: { type: CollectionType }) {
    const { id } = useParams<{ id: string }>();
    const { projects, loading } = useProjectsData(type);
    const project = projects.find((p) => p.id === id);
    const isPlayground = type === "playground";
    const title = isPlayground ? "Playground item" : "Project";
    const backLink = isPlayground ? "/playground" : "/projects";
    const backLabel = isPlayground ? "playground" : "projects";
    const navigate = useNavigate();
    const [sectionLangs, setSectionLangs] = useState<Record<string, string>>({});
    const [openSection, setOpenSection] = useState<string | null>(null);
    const sectionAnchor = useRef<{ id: string; top: number } | null>(null);

    useEffect(() => {
        setOpenSection(null);
        setSectionLangs({});
    }, [id]);

    const chooseSectionLang = (sectionId: string, next: string) => {
        const section = document.getElementById(`detail-section-${sectionId}`);
        if (section) {
            sectionAnchor.current = { id: sectionId, top: section.getBoundingClientRect().top };
        }
        setSectionLangs((current) => ({ ...current, [sectionId]: next }));
    };

    const toggleSection = (sectionId: string) => {
        const section = document.getElementById(`detail-section-${sectionId}`);
        if (section) {
            sectionAnchor.current = { id: sectionId, top: section.getBoundingClientRect().top };
        }
        setOpenSection((current) => (current === sectionId ? null : sectionId));
    };

    useLayoutEffect(() => {
        const anchor = sectionAnchor.current;
        if (!anchor) return;
        sectionAnchor.current = null;
        const section = document.getElementById(`detail-section-${anchor.id}`);
        if (!section) return;
        const shift = section.getBoundingClientRect().top - anchor.top;
        if (Math.abs(shift) > 1) window.scrollBy(0, shift);
    }, [openSection, sectionLangs]);

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

    const fieldHasContent = (field: string, suffix: string) => {
        const value = project[suffix ? `${field}${suffix}` : field];
        if (Array.isArray(value)) return value.some((item) => typeof item === "string" && item.trim());
        return typeof value === "string" && !!value.trim();
    };

    const languagesFor = (field: string) =>
        langList.filter((item) => {
            if (!sectionLanguageOn(project, field, item.suffix)) return false;
            return fieldHasContent(field, item.suffix);
        });

    const selectedLang = (sectionId: string, languages: readonly LangItem[]) => {
        const chosen = sectionLangs[sectionId];
        if (chosen && languages.some((item) => item.key === chosen)) return chosen;
        return languages[0]?.key ?? "en";
    };

    const stringField = (field: string, suffix: string) => {
        const value = project[suffix ? `${field}${suffix}` : field];
        return typeof value === "string" ? value : "";
    };

    const listField = (field: string, suffix: string) => {
        const value = project[suffix ? `${field}${suffix}` : field];
        if (!Array.isArray(value)) return [];
        return value.filter((item): item is string => typeof item === "string" && !!item.trim());
    };

    const getLabel = (key: string, labelLang = "en") => {
        const labels: Record<string, Record<string, string>> = {
            back: {
                en: `Back to ${backLabel}`,
                vi: `Quay lại trang ${isPlayground ? "Playground" : "dự án"}`,
                ar: `العودة إلى ${isPlayground ? "Playground" : "المشاريع"}`,
            },
            story: {
                en: "The Story Behind",
                vi: "Câu chuyện sản phẩm",
                ar: "القصة وراء المشروع",
            },
            features: {
                en: "Key Features",
                vi: "Tính năng nổi bật",
                ar: "الميزات الرئيسية",
            },
            description: {
                en: "Full Description",
                vi: "Mô tả chi tiết hơn",
                ar: "الوصف الكامل",
            },
            howIBuilt: {
                en: "How I Built It",
                vi: "Cách mình làm",
                ar: "كيف بنيته",
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
            },
            photos: {
                en: "Real photos",
                vi: "Hình ảnh thực tế",
            },
            readMore: {
                en: "read more",
                vi: "xem thêm",
                ar: "اقرأ المزيد",
            },
            showLess: {
                en: "show less",
                vi: "ẩn bớt",
                ar: "عرض أقل",
            },
        };
        return labels[key]?.[labelLang] || labels[key]?.en || "";
    };

    const storyLangs = languagesFor("storyBehind");
    const builtLangs = languagesFor("howIBuilt");
    const featureLangs = languagesFor("keyFeatures");
    const descriptionLangs = languagesFor("fullDescription");
    const storyLang = selectedLang("story", storyLangs);
    const builtLang = selectedLang("built", builtLangs);
    const featureLang = selectedLang("features", featureLangs);
    const descriptionLang = selectedLang("description", descriptionLangs);
    const langItem = (key: string) => langList.find((item) => item.key === key) ?? langList[0];
    const storyItem = langItem(storyLang);
    const builtItem = langItem(builtLang);
    const featureItem = langItem(featureLang);
    const descriptionItem = langItem(descriptionLang);

    const storyBehindText = stringField("storyBehind", storyItem.suffix);
    const keyFeaturesList = listField("keyFeatures", featureItem.suffix);
    const fullDescriptionText = stringField("fullDescription", descriptionItem.suffix);
    const howIBuiltText = stringField("howIBuilt", builtItem.suffix);
    const galleryImages = (project.images ?? []).filter((img) => img.trim());

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
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    {getLabel("back")}
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
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
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
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{project.title}</h1>

                    {/* Status & Quick Links */}
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-4 sm:mb-6">
                        {isPlayground && (
                            <span
                                className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border rounded ${statusStyles[project.status]}`}
                            >
                                {project.status === "Retired" ? "Sunsetting - Retired" : project.status}
                            </span>
                        )}

                        {project.githubUrl && (
                            <a
                                href={formatExternalUrl(project.githubUrl)}
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
                                href={formatExternalUrl(project.liveUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-zinc-50 border border-zinc-200 text-blue-600 rounded hover:bg-zinc-100 transition-colors"
                                title="Visit live website"
                            >
                                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Live
                            </a>
                        )}

                        {galleryImages.length > 0 && (
                            <a
                                href="#detail-gallery"
                                onClick={(event) => {
                                    event.preventDefault();
                                    document.getElementById("detail-gallery")?.scrollIntoView({ behavior: "auto", block: "start" });
                                }}
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-zinc-50 border border-zinc-200 text-blue-600 rounded hover:bg-zinc-100 transition-colors"
                            >
                                <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {getLabel("photos")}
                            </a>
                        )}
                    </div>



                    {/* The Story Behind */}
                    {storyLangs.length > 0 && (
                        <div id="detail-section-story" className={`mb-6 sm:mb-8 ${storyLang === "vi" ? "font-vietnamese" : ""}`} dir={storyItem.dir || "ltr"}>
                            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg sm:text-xl font-bold text-blue-600">{getLabel("story", storyLang)}</h3>
                                <SectionLangChips
                                    languages={storyLangs}
                                    value={storyLang}
                                    onChange={(key) => chooseSectionLang("story", key)}
                                />
                            </div>
                            <FadeReadMore
                                id="story"
                                open={openSection === "story"}
                                onToggle={toggleSection}
                                readMore={getLabel("readMore", storyLang)}
                                collapsedClass="max-h-72"
                            >
                                <div className="space-y-3 sm:space-y-4 font-normal">
                                    {storyBehindText.split(/\n\s*\n/).map((para: string, i: number) => (
                                        <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                            {parseBoldText(para.trim())}
                                        </p>
                                    ))}
                                </div>
                            </FadeReadMore>
                        </div>
                    )}

                    {/* How I Built It */}
                    {builtLangs.length > 0 && (
                        <div id="detail-section-built" className={`mb-6 sm:mb-8 ${builtLang === "vi" ? "font-vietnamese" : ""}`} dir={builtItem.dir || "ltr"}>
                            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg sm:text-xl font-bold text-blue-600">{getLabel("howIBuilt", builtLang)}</h3>
                                <SectionLangChips
                                    languages={builtLangs}
                                    value={builtLang}
                                    onChange={(key) => chooseSectionLang("built", key)}
                                />
                            </div>
                            <FadeReadMore
                                id="built"
                                open={openSection === "built"}
                                onToggle={toggleSection}
                                readMore={getLabel("readMore", builtLang)}
                            >
                                <div className="space-y-3 sm:space-y-4 font-normal">
                                    {howIBuiltText.split(/\n\s*\n/).map((para: string, i: number) => (
                                        <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                            {parseBoldText(para.trim())}
                                        </p>
                                    ))}
                                </div>
                            </FadeReadMore>
                        </div>
                    )}

                    {/* Key Features */}
                    {featureLangs.length > 0 && (
                        <div id="detail-section-features" className={`mb-6 sm:mb-8 ${featureLang === "vi" ? "font-vietnamese" : ""}`} dir={featureItem.dir || "ltr"}>
                            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg sm:text-xl font-bold text-blue-600">{getLabel("features", featureLang)}</h3>
                                <SectionLangChips
                                    languages={featureLangs}
                                    value={featureLang}
                                    onChange={(key) => chooseSectionLang("features", key)}
                                />
                            </div>
                            <FadeReadMore
                                id="features"
                                open={openSection === "features"}
                                onToggle={toggleSection}
                                readMore={getLabel("readMore", featureLang)}
                            >
                                <div className="space-y-2 sm:space-y-3 font-normal">
                                    {keyFeaturesList.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="w-2 h-2 mt-2.5 bg-blue-600 rounded-sm flex-shrink-0 border border-black"></div>
                                            <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">{parseBoldText(feature)}</p>
                                        </div>
                                    ))}
                                </div>
                            </FadeReadMore>
                        </div>
                    )}

                    {/* Full Description */}
                    {descriptionLangs.length > 0 && (
                        <div id="detail-section-description" className={`mb-6 sm:mb-8 ${descriptionLang === "vi" ? "font-vietnamese" : ""}`} dir={descriptionItem.dir || "ltr"}>
                            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg sm:text-xl font-bold text-blue-600">{getLabel("description", descriptionLang)}</h3>
                                <SectionLangChips
                                    languages={descriptionLangs}
                                    value={descriptionLang}
                                    onChange={(key) => chooseSectionLang("description", key)}
                                />
                            </div>
                            <FadeReadMore
                                id="description"
                                open={openSection === "description"}
                                onToggle={toggleSection}
                                readMore={getLabel("readMore", descriptionLang)}
                            >
                                <div className="space-y-3 sm:space-y-4 font-normal">
                                    {fullDescriptionText.split(/\n\s*\n/).map((para: string, i: number) => (
                                        <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                            {parseBoldText(para.trim())}
                                        </p>
                                    ))}
                                </div>
                            </FadeReadMore>
                        </div>
                    )}

                    {/* Meta Section (Roles, Tech Stack, Topics, Links/Explore) */}
                    <div className="pt-6 sm:pt-8 border-t-2 border-zinc-200 mt-6 sm:mt-8 space-y-6">
                        {/* Roles */}
                        {project.roles && project.roles.length > 0 && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                    {getLabel("role")}
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
                                {getLabel("tech")}
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


                        {/* Links — hidden: Live/GitHub already shown in Status & Quick Links above */}
                        {/* {(project.githubUrl || project.liveUrl) && (
                            <div>
                                <h3 className={`text-xs sm:text-sm font-bold text-blue-600 mb-2 ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                                    {getLabel("explore")}
                                </h3>
                                <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                                    {project.githubUrl && (
                                        <a
                                            href={formatExternalUrl(project.githubUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-sm sm:text-base font-bold bg-zinc-100 border border-zinc-300 rounded-lg hover:bg-zinc-200 transition-colors"
                                            title="View code on GitHub"
                                        >
                                            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {getLabel("github")}
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a
                                            href={formatExternalUrl(project.liveUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-sm sm:text-base font-bold bg-zinc-50 border border-zinc-200 text-blue-600 rounded-lg hover:bg-zinc-100 transition-colors"
                                            title="Visit live website"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {getLabel("live")}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </motion.article>

            {/* Gallery */}
            {galleryImages.length > 0 && (
                <motion.section
                    id="detail-gallery"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="scroll-mt-6 border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More & More</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {galleryImages.map((img, index) => (
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
