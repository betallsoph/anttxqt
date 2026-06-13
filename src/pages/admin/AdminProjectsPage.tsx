import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type Project,
    type ProjectStatus,
    type CollectionType,
    defaultProducts,
    defaultProjectsList,
    saveProjectsData,
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
    FolderOpen, 
    Search, 
    SlidersHorizontal,
    Globe
} from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const inputClass =
    "w-full border border-zinc-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all";

const statusOptions: ProjectStatus[] = ["Production", "Staging", "In Development", "Concept", "Retired"];

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-green-50 text-green-800 border-green-200",
    Staging: "bg-sky-50 text-sky-800 border-sky-200",
    "In Development": "bg-amber-50 text-amber-800 border-amber-200",
    Concept: "bg-purple-50 text-purple-800 border-purple-200",
    Retired: "bg-zinc-50 text-zinc-800 border-zinc-200",
};

function generateId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
}

export function AdminProjectsPage({ type }: { type: CollectionType }) {
    const defaultData = type === "products" ? defaultProducts : defaultProjectsList;
    const [projects, setProjects] = useState<Project[]>(defaultData);
    const [loading, setLoading] = useState(true);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [messages, setMessages] = useState<Record<number, string>>({});
    
    // Select state using index of full projects array
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [activeLangTab, setActiveLangTab] = useState<"en" | "vi" | "ar">("en");
    
    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    
    const title = type === "products" ? "Products" : "Projects";
    const itemLabel = type === "products" ? "product" : "project";

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
            setMessages((prev) => ({ ...prev, [index]: "Lỗi: Title không được để trống!" }));
            setTimeout(() => setMessages((prev) => ({ ...prev, [index]: "" })), 4000);
            return;
        }

        if (!finalId) {
            finalId = generateId(finalTitle);
            if (!finalId) {
                setMessages((prev) => ({ ...prev, [index]: "Lỗi: Không thể tự tạo ID từ Title!" }));
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
            setMessages((prev) => ({ ...prev, [index]: "Đã lưu thành công!" }));
        } catch (err) {
            console.error(err);
            setMessages((prev) => ({ ...prev, [index]: "Lỗi khi lưu!" }));
        } finally {
            setSavingIndex(null);
            setTimeout(() => setMessages((prev) => ({ ...prev, [index]: "" })), 3000);
        }
    };

    const updateProject = (index: number, updates: Partial<Project>) => {
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
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Đang tải danh sách {title}...</p>
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
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4"
            >
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">{title} Manager</h2>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                        Danh sách có <span className="font-bold text-zinc-900">{projects.length}</span> {itemLabel}s
                    </p>
                </div>
                <Button
                    size="sm"
                    className="cursor-pointer font-semibold"
                    onClick={() => {
                        const newProject: Project = {
                            id: "",
                            title: "",
                            description: "",
                            status: "Concept",
                            tags: [],
                            keyFeatures: [],
                        };
                        const updated = [...projects, newProject];
                        setProjects(updated);
                        setSelectedIndex(updated.length - 1);
                    }}
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Thêm {itemLabel} mới
                </Button>
            </motion.div>

            {/* Master-Detail Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* 1. Master List Pane (Left Column) */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Search & Filter Controls */}
                    <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 p-4 space-y-3 shadow-sm">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, thẻ tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white border border-zinc-300 rounded-lg px-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="visible">Đang hiển thị</option>
                                <option value="hidden">Đang ẩn</option>
                                {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Master Items Scroll Area */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {filteredProjects.map((proj) => {
                            const isSelected = proj.originalIndex === selectedIndex;
                            return (
                                <div
                                    key={proj.originalIndex}
                                    onClick={() => setSelectedIndex(proj.originalIndex)}
                                    className={`group flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? "bg-zinc-100 border-zinc-400 shadow-sm"
                                            : "bg-white hover:bg-zinc-50/80 border-zinc-200 shadow-sm"
                                    } ${proj.hidden ? "opacity-75" : ""}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        {/* Image Thumbnail Preview */}
                                        {proj.iconUrl ? (
                                            <img
                                                src={proj.iconUrl}
                                                alt=""
                                                className="w-10 h-10 rounded-lg border border-zinc-200 bg-white object-contain flex-shrink-0"
                                            />
                                        ) : proj.imageUrl ? (
                                            <img
                                                src={proj.imageUrl}
                                                alt=""
                                                className="w-10 h-10 rounded-lg border border-zinc-200 bg-white object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                                                <Globe className="w-4 h-4 text-zinc-400" />
                                            </div>
                                        )}
                                        
                                        <div className="truncate flex-1">
                                            <p className="font-semibold text-sm text-zinc-900 truncate">{proj.title || `Chưa đặt tên (${proj.originalIndex + 1})`}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded-full ${statusStyles[proj.status]}`}>
                                                    {proj.status}
                                                </span>
                                                {proj.hidden && (
                                                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                        <EyeOff className="w-3 h-3" /> Ẩn
                                                    </span>
                                                )}
                                                
                                                {/* Language indicator badges */}
                                                <div className="flex items-center gap-1 ml-1 text-[10px] font-medium">
                                                    <span className="text-blue-600 font-semibold">EN</span>
                                                    <span className={`${proj.showVi ? "text-green-600 font-bold" : "text-zinc-300"}`}>VI</span>
                                                    <span className={`${proj.showAr ? "text-purple-600 font-bold" : "text-zinc-300"}`}>AR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Position Re-ordering handle */}
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
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
                            <div className="p-8 text-center border border-dashed border-zinc-200 rounded-xl text-zinc-500 text-sm bg-zinc-50/50">
                                Không tìm thấy {itemLabel} nào.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Detail Editor Pane (Right Column) */}
                <div className="lg:col-span-2">
                    {selectedIndex !== null && projects[selectedIndex] ? (
                        (() => {
                            const project = projects[selectedIndex];
                            const index = selectedIndex;
                            return (
                                <div className="border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
                                    {/* macOS Window Header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/10"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500/10"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500/10"></div>
                                        </div>
                                        <span className="text-xs font-mono font-medium text-zinc-400">
                                            EDITING: {project.title || `Unnamed Product (${index + 1})`}
                                        </span>
                                    </div>

                                    {/* Main Form Fields Container */}
                                    <div className="p-4 sm:p-6 space-y-6">
                                        
                                        {/* Action Bar (Visibility and Delete) */}
                                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => updateProject(index, { hidden: !project.hidden })}
                                                className={`gap-1.5 font-semibold text-xs transition-colors border border-zinc-200 ${
                                                    project.hidden ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                                }`}
                                            >
                                                {project.hidden ? (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        TRẠNG THÁI: ĐANG ẨN
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        TRẠNG THÁI: CÔNG KHAI
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = projects.filter((_, i) => i !== index);
                                                    setProjects(updated);
                                                    setSelectedIndex(updated.length > 0 ? 0 : null);
                                                }}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 text-xs font-semibold"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                XÓA {itemLabel.toUpperCase()}
                                            </Button>
                                        </div>

                                        {/* SECTION A: Images & Media Uploads */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 p-4">
                                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-700">App Icon / Logo</label>
                                                <ImageUpload
                                                    value={project.iconUrl || ""}
                                                    onChange={(url) => updateProject(index, { iconUrl: url })}
                                                    folder="projects"
                                                />
                                                <p className="text-[10px] text-zinc-400 mt-2 font-medium">Hiển thị thu nhỏ ở danh sách công việc chính.</p>
                                            </div>
                                            <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 p-4">
                                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-700">Banner Image</label>
                                                <ImageUpload
                                                    value={project.imageUrl || ""}
                                                    onChange={(url) => updateProject(index, { imageUrl: url })}
                                                    folder="projects"
                                                />
                                                <p className="text-[10px] text-zinc-400 mt-2 font-medium">Bản rộng 16:9 hiển thị ở đầu trang chi tiết.</p>
                                            </div>
                                        </div>

                                        {/* SECTION B: Core Settings (Metadata & Links) */}
                                        <div className="border border-zinc-200 p-4 rounded-xl bg-zinc-50/50 space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Cấu hình liên kết & Metadata</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">ID (URL slug)</label>
                                                    <input
                                                        type="text"
                                                        value={project.id}
                                                        onChange={(e) => updateProject(index, { id: e.target.value })}
                                                        className={inputClass}
                                                        placeholder="project-slug"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Trạng thái (Status)</label>
                                                    <select
                                                        value={project.status}
                                                        onChange={(e) => updateProject(index, { status: e.target.value as ProjectStatus })}
                                                        className={inputClass}
                                                    >
                                                        {statusOptions.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">GitHub URL</label>
                                                    <input
                                                        type="text"
                                                        value={project.githubUrl || ""}
                                                        onChange={(e) => updateProject(index, { githubUrl: e.target.value || undefined })}
                                                        className={inputClass}
                                                        placeholder="https://github.com/..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Live Demo URL</label>
                                                    <input
                                                        type="text"
                                                        value={project.liveUrl || ""}
                                                        onChange={(e) => updateProject(index, { liveUrl: e.target.value || undefined })}
                                                        className={inputClass}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION C: Bilingual & Multilingual Tabbed Translations */}
                                        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                            {/* Tabs Header */}
                                            <div className="flex border-b border-zinc-200 bg-zinc-50">
                                                {(["en", "vi", "ar"] as const).map((lang) => {
                                                    const isTabActive = activeLangTab === lang;
                                                    const tabLabel = lang === "en" ? "🇺🇸 English" : lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇸🇦 العربية (MSA)";
                                                    return (
                                                        <button
                                                            key={lang}
                                                            type="button"
                                                            onClick={() => setActiveLangTab(lang)}
                                                            className={`flex-1 py-2.5 text-xs font-semibold border-r border-zinc-200 last:border-r-0 transition-colors cursor-pointer ${
                                                                isTabActive ? "bg-white text-zinc-900 border-b-2 border-b-zinc-900" : "text-zinc-500 hover:bg-zinc-100/50 hover:text-zinc-700"
                                                            }`}
                                                        >
                                                            {tabLabel}
                                                            {lang === "vi" && project.showVi && <span className="ml-1.5 w-1.5 h-1.5 inline-block bg-green-500 rounded-full" />}
                                                            {lang === "ar" && project.showAr && <span className="ml-1.5 w-1.5 h-1.5 inline-block bg-purple-500 rounded-full" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Tab Panel Content */}
                                            <div className="p-4 bg-white">
                                                {/* English Content */}
                                                {activeLangTab === "en" && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Tiêu đề dự án (Title - EN)</label>
                                                            <input
                                                                type="text"
                                                                value={project.title}
                                                                onChange={(e) => {
                                                                    const updates: Partial<Project> = { title: e.target.value };
                                                                    if (!project.id) {
                                                                        updates.id = generateId(e.target.value);
                                                                    }
                                                                    updateProject(index, updates);
                                                                }}
                                                                className={inputClass}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Mô tả ngắn (Short Description - EN)</label>
                                                            <textarea
                                                                value={project.description}
                                                                onChange={(e) => updateProject(index, { description: e.target.value })}
                                                                className={`${inputClass} min-h-[60px] leading-relaxed`}
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Mô tả chi tiết (Full Description - EN)</label>
                                                            <textarea
                                                                value={project.fullDescription || ""}
                                                                onChange={(e) => updateProject(index, { fullDescription: e.target.value })}
                                                                className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                rows={3}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Câu chuyện phía sau (Story Behind - EN)</label>
                                                            <textarea
                                                                value={project.storyBehind || ""}
                                                                onChange={(e) => updateProject(index, { storyBehind: e.target.value })}
                                                                className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                rows={3}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Tính năng nổi bật (Key Features - EN) (Mỗi dòng một ý)</label>
                                                            <textarea
                                                                value={(project.keyFeatures || []).join("\n")}
                                                                onChange={(e) => {
                                                                    const features = e.target.value.split("\n");
                                                                    updateProject(index, { keyFeatures: features });
                                                                }}
                                                                className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                rows={4}
                                                                placeholder="Feature 1&#10;Feature 2..."
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Vietnamese Content */}
                                                {activeLangTab === "vi" && (
                                                    <div className="space-y-4">
                                                        {/* Vietnamese Enable Toggle */}
                                                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                                                            <div>
                                                                <span className="block text-xs font-bold uppercase text-zinc-700">Kích hoạt bản dịch tiếng Việt</span>
                                                                <span className="block text-[10px] text-zinc-500 font-medium uppercase mt-0.5">Hiển thị tùy chọn chuyển ngôn ngữ ở trang chi tiết</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateProject(index, { showVi: !project.showVi })}
                                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-zinc-200 transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                    project.showVi ? "bg-green-500" : "bg-zinc-200"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                        project.showVi ? "translate-x-5" : "translate-x-0"
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>

                                                        {project.showVi ? (
                                                            <div className="space-y-4 animate-fadeIn">
                                                                <div>
                                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Tiêu đề dự án (Title - VI)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={project.titleVi || ""}
                                                                        onChange={(e) => updateProject(index, { titleVi: e.target.value })}
                                                                        className={inputClass}
                                                                        placeholder="Tiêu đề tiếng Việt..."
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Mô tả ngắn (Short Description - VI)</label>
                                                                    <textarea
                                                                        value={project.descriptionVi || ""}
                                                                        onChange={(e) => updateProject(index, { descriptionVi: e.target.value })}
                                                                        className={`${inputClass} min-h-[60px] leading-relaxed`}
                                                                        rows={2}
                                                                        placeholder="Mô tả ngắn tiếng Việt..."
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Mô tả chi tiết (Full Description - VI)</label>
                                                                    <textarea
                                                                        value={project.fullDescriptionVi || ""}
                                                                        onChange={(e) => updateProject(index, { fullDescriptionVi: e.target.value })}
                                                                        className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                        rows={3}
                                                                        placeholder="Mô tả chi tiết tiếng Việt..."
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Câu chuyện phía sau (Story Behind - VI)</label>
                                                                    <textarea
                                                                        value={project.storyBehindVi || ""}
                                                                        onChange={(e) => updateProject(index, { storyBehindVi: e.target.value })}
                                                                        className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                        rows={3}
                                                                        placeholder="Câu chuyện hậu trường tiếng Việt..."
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Tính năng nổi bật (Key Features - VI) (Mỗi dòng một ý)</label>
                                                                    <textarea
                                                                        value={(project.keyFeaturesVi || []).join("\n")}
                                                                        onChange={(e) => {
                                                                            const features = e.target.value.split("\n");
                                                                            updateProject(index, { keyFeaturesVi: features });
                                                                        }}
                                                                        className={`${inputClass} min-h-[100px] leading-relaxed`}
                                                                        rows={4}
                                                                        placeholder="Tính năng 1&#10;Tính năng 2..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                                                                Bản dịch Tiếng Việt đang TẮT. Kích hoạt ở trên để bắt đầu soạn thảo.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Arabic Content */}
                                                {activeLangTab === "ar" && (
                                                    <div className="space-y-4">
                                                        {/* Arabic Enable Toggle */}
                                                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                                                            <div>
                                                                <span className="block text-xs font-bold uppercase text-zinc-700">Kích hoạt bản dịch tiếng Ả Rập (MSA)</span>
                                                                <span className="block text-[10px] text-zinc-500 font-medium uppercase mt-0.5">Hiển thị tùy chọn chuyển sang tiếng Ả Rập (RTL)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateProject(index, { showAr: !project.showAr })}
                                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-zinc-200 transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                    project.showAr ? "bg-green-500" : "bg-zinc-200"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                        project.showAr ? "translate-x-5" : "translate-x-0"
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>

                                                        {project.showAr ? (
                                                            <div className="space-y-4 animate-fadeIn" dir="rtl">
                                                                <div className="text-right">
                                                                    <label className="block text-xs font-semibold mb-1 uppercase text-right text-zinc-600">العنوان (Title - AR)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={project.titleAr || ""}
                                                                        onChange={(e) => updateProject(index, { titleAr: e.target.value })}
                                                                        className={`${inputClass} text-right`}
                                                                        placeholder="العنوان باللغة العربية..."
                                                                        dir="rtl"
                                                                    />
                                                                </div>

                                                                <div className="text-right">
                                                                    <label className="block text-xs font-semibold mb-1 uppercase text-right text-zinc-600">الوصف القصير (Short Description - AR)</label>
                                                                    <textarea
                                                                        value={project.descriptionAr || ""}
                                                                        onChange={(e) => updateProject(index, { descriptionAr: e.target.value })}
                                                                        className={`${inputClass} min-h-[60px] text-right leading-relaxed`}
                                                                        rows={2}
                                                                        placeholder="الوصف القصير..."
                                                                        dir="rtl"
                                                                    />
                                                                </div>

                                                                <div className="text-right">
                                                                    <label className="block text-xs font-semibold mb-1 uppercase text-right text-zinc-600">الوصف الكامل (Full Description - AR)</label>
                                                                    <textarea
                                                                        value={project.fullDescriptionAr || ""}
                                                                        onChange={(e) => updateProject(index, { fullDescriptionAr: e.target.value })}
                                                                        className={`${inputClass} min-h-[100px] text-right leading-relaxed`}
                                                                        rows={3}
                                                                        placeholder="الوصف الكامل باللغة العربية..."
                                                                        dir="rtl"
                                                                    />
                                                                </div>

                                                                <div className="text-right">
                                                                    <label className="block text-xs font-semibold mb-1 uppercase text-right text-zinc-600">القصة وراء المشروع (Story Behind - AR)</label>
                                                                    <textarea
                                                                        value={project.storyBehindAr || ""}
                                                                        onChange={(e) => updateProject(index, { storyBehindAr: e.target.value })}
                                                                        className={`${inputClass} min-h-[100px] text-right leading-relaxed`}
                                                                        rows={3}
                                                                        placeholder="تفاصيل القصة وراء هذا المشروع..."
                                                                        dir="rtl"
                                                                    />
                                                                </div>

                                                                <div className="text-right">
                                                                    <label className="block text-xs font-semibold mb-1 uppercase text-right text-zinc-600">الميزات الرئيسية (Key Features - AR) (سطر لكل ميزة)</label>
                                                                    <textarea
                                                                        value={(project.keyFeaturesAr || []).join("\n")}
                                                                        onChange={(e) => {
                                                                            const features = e.target.value.split("\n");
                                                                            updateProject(index, { keyFeaturesAr: features });
                                                                        }}
                                                                        className={`${inputClass} min-h-[100px] text-right leading-relaxed`}
                                                                        rows={4}
                                                                        placeholder="الميزة الأولى&#10;الميزة الثانية..."
                                                                        dir="rtl"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                                                                Bản dịch Tiếng Ả Rập đang TẮT. Kích hoạt ở trên để bắt đầu soạn thảo.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* SECTION D: Taxonomy & Classifications (Roles, Topics, Tags) */}
                                        <div className="space-y-4 bg-zinc-50/50 p-4 border border-zinc-200 rounded-xl">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Phân loại & Từ khóa</h3>
                                            
                                            {/* Roles */}
                                            <div>
                                                <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Vai trò / Nhiệm vụ (Roles - Nhãn xanh dương)</label>
                                                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                                    {(project.roles || []).map((role, roleIndex) => (
                                                        <span
                                                            key={roleIndex}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg"
                                                        >
                                                            {role}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newRoles = (project.roles || []).filter((_, i) => i !== roleIndex);
                                                                    updateProject(index, { roles: newRoles });
                                                                }}
                                                                className="hover:text-red-500 font-bold cursor-pointer text-zinc-400"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập role mới rồi nhấn Enter (e.g. Lead Dev, Designer)..."
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

                                            {/* Topics */}
                                            <div>
                                                <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Hashtag chủ đề (Topics - Nhãn xám)</label>
                                                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                                    {(project.topics || []).map((topic, topicIndex) => (
                                                        <span
                                                            key={topicIndex}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-lg"
                                                        >
                                                            #{topic.toLowerCase().replace(/\s+/g, "-")}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTopics = (project.topics || []).filter((_, i) => i !== topicIndex);
                                                                    updateProject(index, { topics: newTopics });
                                                                }}
                                                                className="hover:text-red-500 font-bold cursor-pointer text-zinc-400"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập topic mới rồi nhấn Enter (e.g. automation, education)..."
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

                                            {/* Tags */}
                                            <div>
                                                <label className="block text-xs font-semibold mb-1 text-zinc-600 uppercase">Công nghệ chính (Tags - Nhãn đen)</label>
                                                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                                    {(project.tags || []).map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg"
                                                        >
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(index, tagIndex)}
                                                                className="hover:text-red-500 font-bold cursor-pointer text-zinc-400"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập tag công nghệ rồi nhấn Enter (e.g. React, Docker)..."
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
                                        </div>

                                        {/* SECTION E: Gallery Images Grid */}
                                        <div className="border border-zinc-200 p-4 rounded-xl bg-zinc-50/50 space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-850 border-b border-zinc-100 pb-2">Thư viện ảnh chi tiết (Gallery Images)</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {(project.images || []).map((imgUrl, imgIndex) => (
                                                    <div key={imgIndex} className="border border-zinc-200 rounded-xl bg-white p-3 flex flex-col justify-between">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] font-bold text-zinc-400">ẢNH {imgIndex + 1}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7"
                                                                onClick={() => {
                                                                    const newImages = (project.images || []).filter((__, i) => i !== imgIndex);
                                                                    updateProject(index, { images: newImages });
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
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
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 font-semibold text-xs border border-zinc-200"
                                                onClick={() => {
                                                    updateProject(index, { images: [...(project.images || []), ""] });
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-1.5" />
                                                Thêm ảnh thư viện mới
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sticky Save Footer */}
                                    <div className="flex items-center gap-3 p-4 sm:px-6 sm:py-4 bg-zinc-50 border-t border-zinc-200">
                                        <Button 
                                            onClick={() => handleSave(index)} 
                                            disabled={savingIndex === index} 
                                            size="sm"
                                            className="font-semibold cursor-pointer"
                                        >
                                            {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                                            {savingIndex === index ? "Đang lưu..." : "Lưu thay đổi"}
                                        </Button>
                                        {messages[index] && (
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                                messages[index].includes("thành công") 
                                                    ? "bg-green-50 border-green-200 text-green-700" 
                                                    : "bg-red-50 border-red-200 text-red-700"
                                            }`}>
                                                {messages[index]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl p-6 bg-zinc-50/50 text-zinc-400 text-center">
                            <FolderOpen className="w-10 h-10 mb-2 text-zinc-300 animate-pulse" />
                            <p className="font-semibold text-sm">Chưa có {itemLabel} nào được chọn</p>
                            <p className="text-xs text-zinc-400 mt-1">Chọn một mục từ danh sách bên trái hoặc nhấn nút Thêm mới ở trên.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
