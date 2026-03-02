import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type Project,
    type ProjectStatus,
    defaultProjects,
    saveProjectsData,
} from "@/hooks/useProjectsData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

const statusOptions: ProjectStatus[] = ["Production", "In Development", "Concept"];

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{projects.length} projects</p>
            </div>

            {projects.map((project, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                                {project.title || `Project ${index + 1}`}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Image */}
                        <div>
                            <label className="block text-sm font-bold mb-1">Image</label>
                            <ImageUpload
                                value={project.imageUrl || ""}
                                onChange={(url) => updateProject(index, { imageUrl: url })}
                                folder="projects"
                            />
                        </div>

                        {/* ID + Title */}
                        <div className="grid grid-cols-2 gap-3">
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

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold mb-1">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {project.tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded-full"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index, tagIndex)}
                                            className="hover:text-red-500"
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
                        <div className="grid grid-cols-2 gap-3">
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
                    </CardContent>
                    <CardFooter>
                        <div className="flex items-center gap-3">
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
                    </CardFooter>
                </Card>
            ))}

            <Button
                variant="ghost"
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
        </div>
    );
}
