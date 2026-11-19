import { useState, useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import {
    type Project,
    type ProjectStatus,
    type CollectionType,
    defaultPlayground,
    defaultProjectsList,
    saveProjectsData,
    sectionLanguageOn,
    sectionShowKey,
    languageOffered,
    englishHideableFields,
} from "@/hooks/useProjectsData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import {
    Plus,
    Trash2,
    Save,
    Loader2,
    Eye,
    EyeOff,
    Search,
} from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const inputClass =
    "w-full text-base px-3 py-2.5 bg-zinc-50 rounded-md text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none";

const labelClass = "block text-sm font-medium text-zinc-600";
const saveButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 hover:bg-blue-100 active:translate-x-px active:translate-y-px active:shadow-none sm:text-sm";
const textActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline";

const statusOptions: ProjectStatus[] = ["Production", "Staging", "In Development", "Prototype", "Planned - Draft", "Retired"];

const statusTextClass: Record<ProjectStatus, string> = {
    Production: "text-green-700",
    Staging: "text-blue-700",
    "In Development": "text-red-600",
    Prototype: "text-purple-700",
    "Planned - Draft": "text-amber-700",
    Concept: "text-purple-700",
    Retired: "text-pink-600",
};

interface LangItem {
    readonly key: string;
    readonly label: string;
    readonly suffix: string;
    readonly placeholder: string;
    readonly dir?: "rtl" | "ltr";
}

const langList: readonly LangItem[] = [
    { key: "en", label: "🇺🇸 English", suffix: "", placeholder: "English..." },
    { key: "vi", label: "🇻🇳 Tiếng Việt", suffix: "Vi", placeholder: "tiếng Việt..." },
    { key: "ar", label: "🇸🇦 العربية (MSA)", suffix: "Ar", dir: "rtl", placeholder: "باللغة العربية..." },
    { key: "de", label: "🇩🇪 Deutsch", suffix: "De", placeholder: "Deutsch..." },
    { key: "nl", label: "🇳🇱 Nederlands", suffix: "Nl", placeholder: "Nederlands..." },
    { key: "sv", label: "🇸🇪 Svenska", suffix: "Sv", placeholder: "Svenska..." },
    { key: "cs", label: "🇨🇿 Čeština", suffix: "Cs", placeholder: "Čeština..." },
    { key: "da", label: "🇩🇰 Dansk", suffix: "Da", placeholder: "Dansk..." },
    { key: "es", label: "🇪🇸 Español", suffix: "Es", placeholder: "Español..." },
    { key: "fr", label: "🇫🇷 Français", suffix: "Fr", placeholder: "Français..." },
    { key: "no", label: "🇳🇴 Norsk", suffix: "No", placeholder: "Norsk..." },
    { key: "fi", label: "🇫🇮 Suomi", suffix: "Fi", placeholder: "Suomi..." },
    { key: "it", label: "🇮🇹 Italiano", suffix: "It", placeholder: "Italiano..." },
    { key: "pt", label: "🇵🇹 Português", suffix: "Pt", placeholder: "Português..." },
    { key: "hu", label: "🇭🇺 Magyar", suffix: "Hu", placeholder: "Magyar..." },
    { key: "el", label: "🇬🇷 Ελληνικά", suffix: "El", placeholder: "Ελληνικά..." }
];

function SectionHeading({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-bold text-zinc-800">{children}</h3>;
}

function SectionSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={on}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-300 ${
                on ? "bg-green-500" : "bg-zinc-300"
            }`}
        >
            <span
                className={`pointer-events-none mt-0.5 inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    on ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
            />
        </button>
    );
}

function generateId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
}

function listTitle(project: { title?: string; id?: string }): string {
    const title = (project.title || "").trim();
    if (title) return title;
    const id = (project.id || "").trim();
    if (id) return id;
    return "Untitled";
}

export function AdminProjectsPage({ type }: { type: CollectionType }) {
    const defaultData = type === "playground" ? defaultPlayground : defaultProjectsList;
    const [projects, setProjects] = useState<Project[]>(defaultData);
    const [loading, setLoading] = useState(true);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [messages, setMessages] = useState<Record<number, string>>({});

    // Select state using index of full projects array
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [activeLangTab, setActiveLangTab] = useState<string>("en");

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const title = type === "playground" ? "Playground" : "Projects";
    const itemLabel = type === "playground" ? "experiment" : "project";
    const otherType: CollectionType = type === "playground" ? "projects" : "playground";
    const otherLabel = otherType === "playground" ? "Playground" : "Projects";

    async function moveToOther(index: number) {
        const item = projects[index];
        if (!item?.id?.trim()) {
            setMessages((m) => ({ ...m, [index]: "Item phải có ID trước khi chuyển." }));
            return;
        }
        if (!confirm(`Chuyển "${item.title || item.id}" sang ${otherLabel}?`)) return;

        setSavingIndex(index);
        try {
            const snap = await getDoc(doc(db, "siteConfig", otherType));
            const targetItems: Project[] =
                snap.exists() && Array.isArray(snap.data().items) ? (snap.data().items as Project[]) : [];

            if (targetItems.some((p) => p.id === item.id)) {
                setMessages((m) => ({ ...m, [index]: `Bên ${otherLabel} đã có ID "${item.id}".` }));
                return;
            }

            await saveProjectsData(otherType, [...targetItems, item]);

            const remaining = projects.filter((_, i) => i !== index);
            await saveProjectsData(type, remaining);

            setProjects(remaining);
            setSelectedIndex(remaining.length > 0 ? 0 : null);
        } catch (err) {
            console.error("Move failed:", err);
            setMessages((m) => ({ ...m, [index]: "Chuyển thất bại. Kiểm tra lại trước khi thử lần nữa." }));
        } finally {
            setSavingIndex(null);
        }
    }

    useEffect(() => {
        setLoading(true);
        getDoc(doc(db, "siteConfig", type))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data.items) {
                        setProjects(data.items as Project[]);
                        setSelectedIndex(data.items.length > 0 ? 0 : null);
                    } else {
                        setProjects(defaultData);
                        setSelectedIndex(defaultData.length > 0 ? 0 : null);
                    }
                } else {
                    setProjects(defaultData);
                    setSelectedIndex(defaultData.length > 0 ? 0 : null);
                }
            })
            .catch((err) => {
                console.error(`Failed to load ${type}:`, err);
            })
            .finally(() => setLoading(false));
    }, [type]);

    const handleSave = async (index: number) => {
        const project = projects[index];
        const finalTitle = (project.title || "").trim();
        let finalId = (project.id || "").trim();

        if (!finalTitle) {
            setMessages((prev) => ({ ...prev, [index]: "Error: Title cannot be empty!" }));
            setTimeout(() => setMessages((prev) => ({ ...prev, [index]: "" })), 4000);
            return;
        }

        if (!finalId) {
            finalId = generateId(finalTitle);
            if (!finalId) {
                setMessages((prev) => ({ ...prev, [index]: "Error: Cannot auto-generate ID from Title!" }));
                setTimeout(() => setMessages((prev) => ({ ...prev, [index]: "" })), 4000);
                return;
            }
            const newProjects = [...projects];
            newProjects[index] = { ...newProjects[index], id: finalId };
            setProjects(newProjects);
            projects[index].id = finalId;
        }

        setSavingIndex(index);
        setMessages((prev) => ({ ...prev, [index]: "" }));
        try {
            await saveProjectsData(type, projects);
            setMessages((prev) => ({ ...prev, [index]: "Saved successfully!" }));
        } catch (err) {
            console.error(err);
            setMessages((prev) => ({ ...prev, [index]: "Error saving!" }));
        } finally {
            setSavingIndex(null);
            setTimeout(() => setMessages((prev) => ({ ...prev, [index]: "" })), 3000);
        }
    };

    const updateProject = (index: number, updates: any) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], ...updates };
        setProjects(newProjects);
    };

    const addTag = (index: number, tag: string) => {
        if (!tag.trim()) return;
        const newProjects = [...projects];
        const currentTags = newProjects[index].tags || [];
        if (!currentTags.includes(tag.trim())) {
            newProjects[index] = {
                ...newProjects[index],
                tags: [...currentTags, tag.trim()],
            };
            setProjects(newProjects);
        }
    };

    const removeTag = (projectIndex: number, tagIndex: number) => {
        const newProjects = [...projects];
        newProjects[projectIndex] = {
            ...newProjects[projectIndex],
            tags: newProjects[projectIndex].tags.filter((_, i) => i !== tagIndex),
        };
        setProjects(newProjects);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-500" />
                    <p className="text-base text-zinc-600">Loading {title}…</p>
                </div>
            </div>
        );
    }

    const filteredProjects = projects
        .map((p, idx) => ({ ...p, originalIndex: idx }))
        .filter((proj) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !query ||
                proj.title.toLowerCase().includes(query) ||
                (proj.description || "").toLowerCase().includes(query) ||
                (proj.tags || []).some((t) => t.toLowerCase().includes(query)) ||
                (proj.id || "").toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "visible" && !proj.hidden) ||
                (statusFilter === "hidden" && proj.hidden) ||
                proj.status === statusFilter;

            return matchesQuery && matchesStatus;
        });

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800">{title}</h2>
                    <p className="text-base text-zinc-600 mt-1">
                        <span className="font-semibold text-zinc-700">{projects.length}</span> {itemLabel}s
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() => {
                        const newProject: Project = {
                            id: "",
                            title: "",
                            description: "",
                            status: "Planned - Draft",
                            tags: [],
                            keyFeatures: [],
                        };
                        const updated = [...projects, newProject];
                        setProjects(updated);
                        setSelectedIndex(updated.length - 1);
                    }}
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add new {itemLabel}
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] gap-10 items-start">
                <div className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={labelClass} htmlFor={`${type}-search`}>Search</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    id={`${type}-search`}
                                    type="text"
                                    placeholder="Title, tags, or id"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-base pl-10 pr-3 py-2.5 bg-zinc-50 rounded-md text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass} htmlFor={`${type}-status-filter`}>Status</label>
                            <select
                                id={`${type}-status-filter`}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={inputClass}
                            >
                                <option value="all">All statuses</option>
                                <option value="visible">Visible</option>
                                <option value="hidden">Hidden</option>
                                {[...statusOptions, "Concept" as const].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className="text-sm text-zinc-600">
                        {filteredProjects.length} shown
                    </p>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {filteredProjects.map((proj) => {
                            const isSelected = proj.originalIndex === selectedIndex;
                            return (
                                <div
                                    key={proj.originalIndex}
                                    onClick={() => setSelectedIndex(proj.originalIndex)}
                                    className={`flex items-start gap-3 px-2 py-3 cursor-pointer rounded-md ${
                                        isSelected ? "bg-zinc-100" : "hover:bg-zinc-50"
                                    } ${proj.hidden ? "opacity-70" : ""}`}
                                >
                                    {(proj.iconUrl || proj.imageUrl) && (
                                        <img
                                            src={proj.iconUrl || proj.imageUrl}
                                            alt=""
                                            className={`h-12 w-12 shrink-0 rounded-md bg-zinc-100 ${proj.iconUrl ? "object-contain" : "object-cover"}`}
                                        />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-semibold text-zinc-800">
                                            {listTitle(proj)}
                                        </p>
                                        <p className={`mt-0.5 text-sm font-medium ${statusTextClass[proj.status] ?? "text-zinc-700"}`}>
                                            {proj.status || "No status"}
                                            {proj.hidden ? <span className="font-normal text-zinc-500"> · Hidden</span> : null}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        <MoveButtons
                                            index={proj.originalIndex}
                                            total={projects.length}
                                            onMove={(from, to) => {
                                                const nextProjects = swap(projects, from, to);
                                                setProjects(nextProjects);
                                                if (from === selectedIndex) {
                                                    setSelectedIndex(to);
                                                } else if (to === selectedIndex) {
                                                    setSelectedIndex(from);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {filteredProjects.length === 0 && (
                            <p className="py-8 text-base text-zinc-500">No {itemLabel}s found.</p>
                        )}
                    </div>
                </div>

                <div>
                    {selectedIndex !== null && projects[selectedIndex] ? (
                        (() => {
                            const project = projects[selectedIndex];
                            const index = selectedIndex;
                            return (
                                <div className="space-y-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-800">{listTitle(project)}</h2>
                                        <p className="mt-1 text-base text-zinc-600">
                                            <span className={statusTextClass[project.status] ?? "text-zinc-700"}>{project.status}</span>
                                            {project.hidden ? " · Hidden" : " · Public"}
                                        </p>
                                    </div>

                                    <section className="space-y-5">
                                        <SectionHeading>Status and links</SectionHeading>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => updateProject(index, { hidden: !project.hidden })}
                                            >
                                                {project.hidden ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4" />
                                                        Hidden
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        Public
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => moveToOther(index)}
                                                disabled={savingIndex === index}
                                                title={`Chuyển item này sang ${otherLabel}`}
                                            >
                                                Move to {otherLabel}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = projects.filter((_, i) => i !== index);
                                                    setProjects(updated);
                                                    setSelectedIndex(updated.length > 0 ? 0 : null);
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete {itemLabel}
                                            </Button>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>ID (URL slug)</label>
                                            <input
                                                type="text"
                                                value={project.id}
                                                onChange={(e) => updateProject(index, { id: e.target.value })}
                                                className={inputClass}
                                                placeholder="project-slug"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Status</label>
                                            <select
                                                value={project.status}
                                                onChange={(e) => updateProject(index, { status: e.target.value as ProjectStatus })}
                                                className={inputClass}
                                            >
                                                { (project.status === "Concept" ? ["Concept" as ProjectStatus, ...statusOptions] : statusOptions).map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>GitHub URL</label>
                                            <input
                                                type="text"
                                                value={project.githubUrl || ""}
                                                onChange={(e) => updateProject(index, { githubUrl: e.target.value || undefined })}
                                                className={inputClass}
                                                placeholder="https://github.com/..."
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Live Demo URL</label>
                                            <input
                                                type="text"
                                                value={project.liveUrl || ""}
                                                onChange={(e) => updateProject(index, { liveUrl: e.target.value || undefined })}
                                                className={inputClass}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </section>

                                    <section className="space-y-5">
                                        <SectionHeading>Images</SectionHeading>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-1.5">
                                                <label className={labelClass}>App Icon / Logo</label>
                                                <ImageUpload
                                                    value={project.iconUrl || ""}
                                                    onChange={(url) => updateProject(index, { iconUrl: url })}
                                                    folder="projects"
                                                />
                                                <p className="text-sm text-zinc-500">Thumbnail shown in the main list.</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={labelClass}>Banner Image</label>
                                                <ImageUpload
                                                    value={project.imageUrl || ""}
                                                    onChange={(url) => updateProject(index, { imageUrl: url })}
                                                    folder="projects"
                                                />
                                                <p className="text-sm text-zinc-500">16:9 banner shown at the top of the detail page.</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-5">
                                        <SectionHeading>Translations</SectionHeading>

                                        <div className="flex flex-wrap gap-2">
                                            {langList.map((lang) => {
                                                const isTabActive = activeLangTab === lang.key;
                                                const suffix = lang.suffix;
                                                let dotColor = "bg-green-500";
                                                if (lang.key === "ar") dotColor = "bg-purple-500";
                                                else if (lang.key !== "vi" && lang.key !== "en") dotColor = "bg-blue-500";

                                                return (
                                                    <button
                                                        key={lang.key}
                                                        type="button"
                                                        onClick={() => setActiveLangTab(lang.key)}
                                                        aria-pressed={isTabActive}
                                                        className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold cursor-pointer ${
                                                            isTabActive ? "bg-zinc-100 text-zinc-800" : "text-zinc-600 hover:bg-zinc-50"
                                                        }`}
                                                    >
                                                        {lang.label}
                                                        {suffix && languageOffered(project, suffix) && (
                                                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {langList.map((lang) => {
                                            if (activeLangTab !== lang.key) return null;

                                            const suffix = lang.suffix;
                                            const titleKey = `title${suffix}`;
                                            const descKey = `description${suffix}`;
                                            const align = lang.dir === "rtl" ? "text-right" : "";
                                            const row = lang.dir === "rtl" ? "flex-row-reverse" : "";
                                            const sectionField = (field: string, label: string, editor: ReactNode) => {
                                                const on = sectionLanguageOn(project, field, suffix);
                                                return (
                                                    <div className={`space-y-1.5 ${align}`}>
                                                        <div className={`flex items-center justify-between gap-3 ${row}`}>
                                                            <label className={`${labelClass} ${align}`}>
                                                                {label} ({lang.key.toUpperCase()})
                                                            </label>
                                                            {(suffix || englishHideableFields.has(field)) && (
                                                                <span className={`inline-flex items-center gap-2 ${row}`}>
                                                                    <span className="text-sm text-zinc-600">{on ? "On site" : "Off site"}</span>
                                                                    <SectionSwitch
                                                                        on={on}
                                                                        onClick={() => updateProject(index, { [sectionShowKey(field, suffix)]: !on })}
                                                                    />
                                                                </span>
                                                            )}
                                                        </div>
                                                        {editor}
                                                    </div>
                                                );
                                            };

                                            return (
                                                <div key={lang.key} className="space-y-5" dir={lang.dir || "ltr"}>
                                                    <div className={`space-y-1.5 ${align}`}>
                                                        <label className={`${labelClass} ${align}`}>
                                                            Title ({lang.key.toUpperCase()})
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={project[titleKey] || ""}
                                                            onChange={(e) => {
                                                                const updates: any = { [titleKey]: e.target.value };
                                                                if (lang.key === "en" && !project.id) {
                                                                    updates.id = generateId(e.target.value);
                                                                }
                                                                updateProject(index, updates);
                                                            }}
                                                            className={`${inputClass} ${align}`}
                                                            placeholder={`Title in ${lang.label.split(" ").slice(1).join(" ")}...`}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    </div>

                                                    <div className={`space-y-1.5 ${align}`}>
                                                        <label className={`${labelClass} ${align}`}>
                                                            Short Description ({lang.key.toUpperCase()})
                                                        </label>
                                                        <textarea
                                                            value={project[descKey] || ""}
                                                            onChange={(e) => updateProject(index, { [descKey]: e.target.value })}
                                                            className={`${inputClass} min-h-[96px] leading-relaxed resize-y ${align}`}
                                                            rows={3}
                                                            placeholder={`Short description in ${lang.label.split(" ").slice(1).join(" ")}...`}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    </div>

                                                    {sectionField("fullDescription", "Full Description", (
                                                        <textarea
                                                            value={project[`fullDescription${suffix}`] || ""}
                                                            onChange={(e) => updateProject(index, { [`fullDescription${suffix}`]: e.target.value })}
                                                            className={`${inputClass} min-h-[140px] leading-relaxed resize-y ${align}`}
                                                            rows={6}
                                                            placeholder={`Full description in ${lang.label.split(" ").slice(1).join(" ")}...`}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    ))}

                                                    {sectionField("storyBehind", "Story Behind", (
                                                        <textarea
                                                            value={project[`storyBehind${suffix}`] || ""}
                                                            onChange={(e) => updateProject(index, { [`storyBehind${suffix}`]: e.target.value })}
                                                            className={`${inputClass} min-h-[140px] leading-relaxed resize-y ${align}`}
                                                            rows={6}
                                                            placeholder={`The story behind in ${lang.label.split(" ").slice(1).join(" ")}...`}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    ))}

                                                    {sectionField("howIBuilt", "How I Built It", (
                                                        <textarea
                                                            value={project[`howIBuilt${suffix}`] || ""}
                                                            onChange={(e) => updateProject(index, { [`howIBuilt${suffix}`]: e.target.value })}
                                                            className={`${inputClass} min-h-[140px] leading-relaxed resize-y ${align}`}
                                                            rows={6}
                                                            placeholder={`How it was built in ${lang.label.split(" ").slice(1).join(" ")}...`}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    ))}

                                                    {sectionField("keyFeatures", "Key Features (One per line)", (
                                                        <textarea
                                                            value={(project[`keyFeatures${suffix}`] || []).join("\n")}
                                                            onChange={(e) => updateProject(index, { [`keyFeatures${suffix}`]: e.target.value.split("\n") })}
                                                            className={`${inputClass} min-h-[140px] leading-relaxed resize-y ${align}`}
                                                            rows={6}
                                                            placeholder={"Feature 1\nFeature 2..."}
                                                            dir={lang.dir || "ltr"}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </section>

                                    <section className="space-y-5">
                                        <SectionHeading>Taxonomy</SectionHeading>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Roles / Job Types (Blue label)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(project.roles || []).map((role, roleIndex) => (
                                                    <span
                                                        key={roleIndex}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-800 rounded-md"
                                                    >
                                                        {role}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newRoles = (project.roles || []).filter((_, i) => i !== roleIndex);
                                                                updateProject(index, { roles: newRoles });
                                                            }}
                                                            className="text-base leading-none text-zinc-500 hover:text-red-600 cursor-pointer"
                                                            aria-label={`Remove ${role}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter a role and press Enter"
                                                className={inputClass}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val) {
                                                            const cur = project.roles || [];
                                                            if (!cur.includes(val)) {
                                                                updateProject(index, { roles: [...cur, val] });
                                                            }
                                                            e.currentTarget.value = "";
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Topics / Hashtags (Gray label)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(project.topics || []).map((topic, topicIndex) => (
                                                    <span
                                                        key={topicIndex}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium bg-zinc-100 text-zinc-700 rounded-md"
                                                    >
                                                        #{topic.toLowerCase().replace(/\s+/g, "-")}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newTopics = (project.topics || []).filter((_, i) => i !== topicIndex);
                                                                updateProject(index, { topics: newTopics });
                                                            }}
                                                            className="text-base leading-none text-zinc-500 hover:text-red-600 cursor-pointer"
                                                            aria-label={`Remove ${topic}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter a topic and press Enter"
                                                className={inputClass}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val) {
                                                            const cur = project.topics || [];
                                                            if (!cur.includes(val)) {
                                                                updateProject(index, { topics: [...cur, val] });
                                                            }
                                                            e.currentTarget.value = "";
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Tech Stack / Tags (Black label)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(project.tags || []).map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-semibold bg-zinc-200 text-zinc-800 rounded-md"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(index, tagIndex)}
                                                            className="text-base leading-none text-zinc-500 hover:text-red-600 cursor-pointer"
                                                            aria-label={`Remove ${tag}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter a tag and press Enter"
                                                className={inputClass}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addTag(index, e.currentTarget.value);
                                                        e.currentTarget.value = "";
                                                    }
                                                }}
                                            />
                                        </div>
                                    </section>

                                    <section className="space-y-5">
                                        <SectionHeading>Gallery</SectionHeading>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {(project.images || []).map((imgUrl, imgIndex) => (
                                                <div key={imgIndex} className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className={labelClass}>Image {imgIndex + 1}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                const newImages = (project.images || []).filter((__, i) => i !== imgIndex);
                                                                updateProject(index, { images: newImages });
                                                            }}
                                                            aria-label={`Remove image ${imgIndex + 1}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <ImageUpload
                                                        value={imgUrl || ""}
                                                        onChange={(url) => {
                                                            const newImages = [...(project.images || [])];
                                                            newImages[imgIndex] = url;
                                                            updateProject(index, { images: newImages });
                                                        }}
                                                        folder="projects"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {(project.images || []).length === 0 && (
                                            <p className="text-base text-zinc-500">No gallery images yet.</p>
                                        )}

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className={textActionClass}
                                            onClick={() => {
                                                updateProject(index, { images: [...(project.images || []), ""] });
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-1.5" />
                                            Add new gallery image
                                        </Button>
                                    </section>

                                    <div className="sticky bottom-0 flex items-center gap-3 bg-white/95 py-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleSave(index)}
                                            disabled={savingIndex === index}
                                            className={saveButtonClass}
                                        >
                                            {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                                            {savingIndex === index ? "Saving..." : "Save changes"}
                                        </Button>
                                        {messages[index] && (
                                            <span className={`text-sm font-semibold ${
                                                messages[index].includes("successfully")
                                                    ? "text-green-700"
                                                    : "text-red-600"
                                            }`}>
                                                {messages[index]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="py-16">
                            <p className="text-lg font-bold text-zinc-800">No {itemLabel} selected</p>
                            <p className="mt-1 text-base text-zinc-600">Choose one from the list, or add a new {itemLabel}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
