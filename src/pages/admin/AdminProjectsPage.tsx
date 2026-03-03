import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type Project,
    type ProjectStatus,
    defaultProjects,
    saveProjectsData,
} from "@/hooks/useProjectsData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

const statusOptions: ProjectStatus[] = ["Production", "Staging", "In Development", "Concept"];

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    Staging: "bg-sky-200 text-sky-800 border-sky-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
};

function generateId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
}

export function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(defaultProjects);
    const [loading, setLoading] = useState(true);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [messages, setMessages] = useState<Record<number, string>>({});

    useEffect(() => {
        getDoc(doc(db, "siteConfig", "projects"))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data.items) {
                        setProjects(data.items as Project[]);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load projects:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (index: number) => {
        setSavingIndex(index);
        setMessages((prev) => ({ ...prev, [index]: "" }));
        try {
            await saveProjectsData(projects);
            setMessages((prev) => ({ ...prev, [index]: "Đã lưu!" }));
        } catch (err) {
            console.error(err);
            setMessages((prev) => ({ ...prev, [index]: "Lỗi!" }));
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
        newProjects[index] = {
            ...newProjects[index],
            tags: [...newProjects[index].tags, tag.trim()],
        };
        setProjects(newProjects);
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
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between"
            >
                <p className="text-sm text-zinc-600">
                    <span className="font-bold">{projects.length}</span> projects
                </p>
                <Button
                    variant="noShadow"
                    size="sm"
                    onClick={() =>
                        setProjects([
                            ...projects,
                            {
                                id: "",
                                title: "",
                                description: "",
                                status: "Concept",
                                tags: [],
                            },
                        ])
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm project
                </Button>
            </motion.div>

            {/* Project Cards */}
            {projects.map((project, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 5) }}
                >
                    <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h3 className="text-base sm:text-lg font-bold">
                                    {project.title || `Project ${index + 1}`}
                                </h3>
                                {project.status && (
                                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold border rounded-full ${statusStyles[project.status]}`}>
                                        {project.status}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>

                        {/* Card Content */}
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                            {/* Image */}
                            <div className="border-2 border-black rounded-lg bg-white p-3">
                                <label className="block text-sm font-bold mb-1">Image</label>
                                <ImageUpload
                                    value={project.imageUrl || ""}
                                    onChange={(url) => updateProject(index, { imageUrl: url })}
                                    folder="projects"
                                />
                            </div>

                            {/* ID + Title */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">ID (URL slug)</label>
                                    <input
                                        type="text"
                                        value={project.id}
                                        onChange={(e) => updateProject(index, { id: e.target.value })}
                                        className={inputClass}
                                        placeholder="project-slug"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Title</label>
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
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    value={project.description}
                                    onChange={(e) => updateProject(index, { description: e.target.value })}
                                    className={`${inputClass} min-h-[60px]`}
                                    rows={2}
                                />
                            </div>

                            {/* Full Description */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Full Description</label>
                                <textarea
                                    value={project.fullDescription || ""}
                                    onChange={(e) => updateProject(index, { fullDescription: e.target.value })}
                                    className={`${inputClass} min-h-[80px]`}
                                    rows={3}
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Status</label>
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

                            {/* Topics */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Topics</label>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                                    {(project.topics || []).map((topic, topicIndex) => (
                                        <span
                                            key={topicIndex}
                                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-blue-100 border border-blue-300 rounded-full"
                                        >
                                            {topic}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newTopics = (project.topics || []).filter((_, i) => i !== topicIndex);
                                                    updateProject(index, { topics: newTopics });
                                                }}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập topic rồi Enter"
                                    className={inputClass}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                updateProject(index, { topics: [...(project.topics || []), val] });
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Tags</label>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                                    {project.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded-full"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(index, tagIndex)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập tag rồi Enter"
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

                            {/* URLs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">GitHub URL</label>
                                    <input
                                        type="text"
                                        value={project.githubUrl || ""}
                                        onChange={(e) => updateProject(index, { githubUrl: e.target.value || undefined })}
                                        className={inputClass}
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Live URL</label>
                                    <input
                                        type="text"
                                        value={project.liveUrl || ""}
                                        onChange={(e) => updateProject(index, { liveUrl: e.target.value || undefined })}
                                        className={inputClass}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Gallery Images</label>
                                <div className="space-y-2">
                                    {(project.images || []).map((_, imgIndex) => (
                                        <div key={imgIndex} className="border-2 border-black rounded-lg bg-white p-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-zinc-500">Ảnh {imgIndex + 1}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newImages = (project.images || []).filter((__, i) => i !== imgIndex);
                                                        updateProject(index, { images: newImages });
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <ImageUpload
                                                value={(project.images || [])[imgIndex] || ""}
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
                                    className="mt-2"
                                    onClick={() => {
                                        updateProject(index, { images: [...(project.images || []), ""] });
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Thêm ảnh
                                </Button>
                            </div>

                            {/* Save */}
                            <div className="flex items-center gap-3 pt-2 border-t-2 border-black/10">
                                <Button onClick={() => handleSave(index)} disabled={savingIndex === index} size="sm">
                                    {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {savingIndex === index ? "Đang lưu..." : "Lưu"}
                                </Button>
                                {messages[index] && (
                                    <span className={`text-sm font-bold ${messages[index].includes("lưu") ? "text-green-600" : "text-red-500"}`}>
                                        {messages[index]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Bottom Add Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t-2 border-black pt-6 sm:pt-8"
            >
                <Button
                    variant="noShadow"
                    onClick={() =>
                        setProjects([
                            ...projects,
                            {
                                id: "",
                                title: "",
                                description: "",
                                status: "Concept",
                                tags: [],
                            },
                        ])
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm project mới
                </Button>
            </motion.div>
        </div>
    );
}
