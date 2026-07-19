import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type ExploreData,
    type ExploreItem,
    defaultExploreData,
    saveExploreData,
} from "@/hooks/useExploreData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { PdfUpload } from "@/components/ui/pdf-upload";
import { Plus, Trash2, Save, Loader2, X, Eye, EyeOff } from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const inputClass =
    "w-full border border-zinc-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all";

function SaveButton({
    saving,
    message,
    onSave,
}: {
    saving: boolean;
    message: string;
    onSave: () => void;
}) {
    return (
        <div className="flex items-center gap-3 pt-4">
            <Button variant="action" onClick={onSave} disabled={saving} size="sm">
                {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            {message && (
                <span
                    className={`text-sm font-bold ${message.includes("thành công") ? "text-green-600" : "text-red-500"}`}
                >
                    {message}
                </span>
            )}
        </div>
    );
}

function ExploreItemListEditor({
    items,
    onChange,
    folder,
    itemLabel,
}: {
    items: ExploreItem[];
    onChange: (items: ExploreItem[]) => void;
    folder: string;
    itemLabel: string;
}) {
    const updateItem = (index: number, updates: Partial<ExploreItem>) => {
        const next = [...items];
        next[index] = { ...next[index], ...updates };
        onChange(next);
    };

    return (
        <div>
            <div className="space-y-3 sm:space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4 space-y-3"
                    >
                        <div className="flex justify-between items-center gap-2">
                            <MoveButtons
                                index={index}
                                total={items.length}
                                onMove={(from, to) => onChange(swap(items, from, to))}
                            />
                            <span className="font-bold text-sm">
                                {itemLabel} {index + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onChange(items.filter((_, i) => i !== index))}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Image (optional)</label>
                            <ImageUpload
                                value={item.imageUrl || ""}
                                onChange={(url) => updateItem(index, { imageUrl: url })}
                                folder={folder}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Title</label>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(index, { title: e.target.value })}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold mb-1">Summary</label>
                                <input
                                    type="text"
                                    value={item.summary}
                                    onChange={(e) => updateItem(index, { summary: e.target.value })}
                                    className={inputClass}
                                    placeholder="1 dòng tóm tắt"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Since (optional)
                                </label>
                                <input
                                    type="text"
                                    value={item.since || ""}
                                    onChange={(e) => updateItem(index, { since: e.target.value })}
                                    className={inputClass}
                                    placeholder="2020, Grade 10..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Story</label>
                            <textarea
                                value={item.story}
                                onChange={(e) => updateItem(index, { story: e.target.value })}
                                className={`${inputClass} min-h-[120px]`}
                                rows={5}
                                placeholder="Câu chuyện đầy đủ..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Tags (optional)</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {(item.tags || []).map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTags = (item.tags || []).filter(
                                                    (_, i) => i !== tagIndex
                                                );
                                                updateItem(index, { tags: newTags });
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
                                placeholder="Nhập tag rồi Enter"
                                className={inputClass}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            updateItem(index, {
                                                tags: [...(item.tags || []), val],
                                            });
                                            e.currentTarget.value = "";
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="action"
                size="sm"
                className="mt-3"
                onClick={() =>
                    onChange([
                        ...items,
                        { title: "", summary: "", story: "" },
                    ])
                }
            >
                <Plus className="w-4 h-4" />
                Thêm {itemLabel.toLowerCase()}
            </Button>
        </div>
    );
}

export function AdminExplorePage() {
    const [data, setData] = useState<ExploreData>(defaultExploreData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<Record<string, string>>({});

    useEffect(() => {
        getDoc(doc(db, "siteConfig", "explore"))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setData({ ...defaultExploreData, ...snapshot.data() } as ExploreData);
                }
            })
            .catch((err) => {
                console.error("Failed to load data:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const isSectionHidden = (sectionName: string) => {
        return (data.hiddenSections || []).includes(sectionName);
    };

    const toggleSectionHidden = (sectionName: string) => {
        const hiddenList = data.hiddenSections || [];
        const next = hiddenList.includes(sectionName)
            ? hiddenList.filter((s) => s !== sectionName)
            : [...hiddenList, sectionName];
        setData({ ...data, hiddenSections: next });
    };

    const handleSave = async (section: string) => {
        setSaving(section);
        setMessage((prev) => ({ ...prev, [section]: "" }));
        try {
            await saveExploreData(data);
            setMessage((prev) => ({
                ...prev,
                [section]: "Đã lưu thành công!",
            }));
        } catch (err) {
            console.error(err);
            setMessage((prev) => ({ ...prev, [section]: "Lỗi khi lưu." }));
        } finally {
            setSaving(null);
            setTimeout(
                () => setMessage((prev) => ({ ...prev, [section]: "" })),
                3000
            );
        }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Column 1: Intro, Favourites, Achievements, Beyond Code */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Intro Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                            Explore Editor
                        </h2>
                        <div className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary">
                            {/* macOS Window Header */}
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.intro.title}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            intro: {
                                                ...data.intro,
                                                title: e.target.value,
                                            },
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.intro.description}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            intro: {
                                                ...data.intro,
                                                description: e.target.value,
                                            },
                                        })
                                    }
                                    className={`${inputClass} min-h-[60px]`}
                                    rows={2}
                                />
                            </div>
                            <SaveButton
                                saving={saving === "intro"}
                                message={message.intro || ""}
                                onSave={() => handleSave("intro")}
                            />
                        </div>
                    </div>
                    </motion.section>

                    {/* Favourites Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Favourites</h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("favourites") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("favourites") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("favourites")}
                                        title={isSectionHidden("favourites") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("favourites") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-2 sm:space-y-3">
                                {(data.favourites || []).map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center border border-zinc-200 rounded-lg bg-zinc-50/50 p-2.5 sm:p-3">
                                        <MoveButtons
                                            index={index}
                                            total={(data.favourites || []).length}
                                            onMove={(from, to) => setData({ ...data, favourites: swap(data.favourites || [], from, to) })}
                                        />
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                value={item.label}
                                                onChange={(e) => {
                                                    const f = [...(data.favourites || [])];
                                                    f[index] = { ...item, label: e.target.value };
                                                    setData({ ...data, favourites: f });
                                                }}
                                                className={inputClass}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description (optional)"
                                                value={item.description || ""}
                                                onChange={(e) => {
                                                    const f = [...(data.favourites || [])];
                                                    f[index] = { ...item, description: e.target.value };
                                                    setData({ ...data, favourites: f });
                                                }}
                                                className={inputClass}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setData({ ...data, favourites: (data.favourites || []).filter((_, i) => i !== index) })}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() => setData({ ...data, favourites: [...(data.favourites || []), { label: "", description: "" }] })}
                            >
                                <Plus className="w-4 h-4" />
                                Thêm favourite
                            </Button>
                            <SaveButton saving={saving === "favourites"} message={message.favourites || ""} onSave={() => handleSave("favourites")} />
                        </div>
                    </div>
                    </motion.section>

                    {/* Achievements Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                            Achievements
                        </h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("achievements") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("achievements") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("achievements")}
                                        title={isSectionHidden("achievements") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("achievements") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-3 sm:space-y-4">
                                {data.achievements.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <MoveButtons
                                                index={index}
                                                total={data.achievements.length}
                                                onMove={(from, to) => setData({ ...data, achievements: swap(data.achievements, from, to) })}
                                            />
                                            <span className="font-bold text-sm">
                                                Achievement {index + 1}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setData({
                                                        ...data,
                                                        achievements:
                                                            data.achievements.filter(
                                                                (_, i) => i !== index
                                                            ),
                                                    })
                                                }
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">
                                                Image
                                            </label>
                                            <ImageUpload
                                                value={item.imageUrl || ""}
                                                onChange={(url) => {
                                                    const a = [...data.achievements];
                                                    a[index] = {
                                                        ...item,
                                                        imageUrl: url,
                                                    };
                                                    setData({
                                                        ...data,
                                                        achievements: a,
                                                    });
                                                }}
                                                folder="achievements"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const a = [...data.achievements];
                                                    a[index] = {
                                                        ...item,
                                                        title: e.target.value,
                                                    };
                                                    setData({
                                                        ...data,
                                                        achievements: a,
                                                    });
                                                }}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">
                                                    Issuer
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.issuer}
                                                    onChange={(e) => {
                                                        const a = [
                                                            ...data.achievements,
                                                        ];
                                                        a[index] = {
                                                            ...item,
                                                            issuer: e.target.value,
                                                        };
                                                        setData({
                                                            ...data,
                                                            achievements: a,
                                                        });
                                                    }}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">
                                                    Date
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.date}
                                                    onChange={(e) => {
                                                        const a = [
                                                            ...data.achievements,
                                                        ];
                                                        a[index] = {
                                                            ...item,
                                                            date: e.target.value,
                                                        };
                                                        setData({
                                                            ...data,
                                                            achievements: a,
                                                        });
                                                    }}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">
                                                Description (optional)
                                            </label>
                                            <textarea
                                                value={item.description || ""}
                                                onChange={(e) => {
                                                    const a = [...data.achievements];
                                                    a[index] = {
                                                        ...item,
                                                        description: e.target.value,
                                                    };
                                                    setData({
                                                        ...data,
                                                        achievements: a,
                                                    });
                                                }}
                                                className={`${inputClass} min-h-[60px]`}
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">
                                                URL (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(e) => {
                                                    const a = [...data.achievements];
                                                    a[index] = {
                                                        ...item,
                                                        url: e.target.value,
                                                    };
                                                    setData({
                                                        ...data,
                                                        achievements: a,
                                                    });
                                                }}
                                                className={inputClass}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() =>
                                    setData({
                                        ...data,
                                        achievements: [
                                            ...data.achievements,
                                            {
                                                title: "",
                                                issuer: "",
                                                date: "",
                                                description: "",
                                            },
                                        ],
                                    })
                                }
                            >
                                <Plus className="w-4 h-4" />
                                Thêm achievement
                            </Button>
                            <SaveButton
                                saving={saving === "achievements"}
                                message={message.achievements || ""}
                                onSave={() => handleSave("achievements")}
                            />
                        </div>
                    </div>
                    </motion.section>

                    {/* Beyond Code Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                            Skills Beyond Code
                        </h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("beyondCode") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("beyondCode") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("beyondCode")}
                                        title={isSectionHidden("beyondCode") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("beyondCode") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <ExploreItemListEditor
                                items={data.beyondCode || []}
                                onChange={(items) => setData({ ...data, beyondCode: items })}
                                folder="beyond-code"
                                itemLabel="Item"
                            />
                            <SaveButton
                                saving={saving === "beyondCode"}
                                message={message.beyondCode || ""}
                                onSave={() => handleSave("beyondCode")}
                            />
                        </div>
                    </div>
                    </motion.section>
                </div>

                {/* Column 2: Currently, More & More, Stories, What's Next */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Currently Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                            Currently
                        </h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("currently") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("currently") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("currently")}
                                        title={isSectionHidden("currently") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("currently") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-2 sm:space-y-3">
                                {data.currently.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-2 items-center border border-zinc-200 rounded-lg bg-zinc-50/50 p-2.5 sm:p-3"
                                    >
                                        <MoveButtons
                                            index={index}
                                            total={data.currently.length}
                                            onMove={(from, to) => setData({ ...data, currently: swap(data.currently, from, to) })}
                                        />                                <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Label (e.g. Learning)"
                                                value={item.label}
                                                onChange={(e) => {
                                                    const c = [...data.currently];
                                                    c[index] = {
                                                        ...item,
                                                        label: e.target.value,
                                                    };
                                                    setData({
                                                        ...data,
                                                        currently: c,
                                                    });
                                                }}
                                                className={inputClass}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={item.value}
                                                onChange={(e) => {
                                                    const c = [...data.currently];
                                                    c[index] = {
                                                        ...item,
                                                        value: e.target.value,
                                                    };
                                                    setData({
                                                        ...data,
                                                        currently: c,
                                                    });
                                                }}
                                                className={inputClass}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setData({
                                                    ...data,
                                                    currently: data.currently.filter(
                                                        (_, i) => i !== index
                                                    ),
                                                })
                                            }
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() =>
                                    setData({
                                        ...data,
                                        currently: [
                                            ...data.currently,
                                            { label: "", value: "" },
                                        ],
                                    })
                                }
                            >
                                <Plus className="w-4 h-4" />
                                Thêm mục
                            </Button>
                            <SaveButton
                                saving={saving === "currently"}
                                message={message.currently || ""}
                                onSave={() => handleSave("currently")}
                            />
                        </div>
                    </div>
                    </motion.section>

                    {/* More & More Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">My Resumés</h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("moreAndMore") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("moreAndMore") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("moreAndMore")}
                                        title={isSectionHidden("moreAndMore") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("moreAndMore") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-6">
                            <div className="space-y-4 sm:space-y-6">
                                {(data.resumes || []).map((group, groupIndex) => (
                                    <div key={groupIndex} className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4 space-y-4">
                                        <div className="flex justify-between items-center gap-2">
                                            <MoveButtons
                                                index={groupIndex}
                                                total={(data.resumes || []).length}
                                                onMove={(from, to) => setData({ ...data, resumes: swap(data.resumes || [], from, to) })}
                                            />
                                            <span className="font-bold text-sm">
                                                Nhóm CV {groupIndex + 1}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setData({ ...data, resumes: (data.resumes || []).filter((_, i) => i !== groupIndex) })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Tên nhóm CV (e.g. Software Developer CV)</label>
                                                <input
                                                    type="text"
                                                    value={group.name}
                                                    onChange={(e) => {
                                                        const r = [...(data.resumes || [])];
                                                        r[groupIndex] = { ...group, name: e.target.value };
                                                        setData({ ...data, resumes: r });
                                                    }}
                                                    className={inputClass}
                                                    placeholder="Tên nhóm CV"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Mô tả (e.g. English version, Tiếng Việt...)</label>
                                                <input
                                                    type="text"
                                                    value={group.description || ""}
                                                    onChange={(e) => {
                                                        const r = [...(data.resumes || [])];
                                                        r[groupIndex] = { ...group, description: e.target.value };
                                                        setData({ ...data, resumes: r });
                                                    }}
                                                    className={inputClass}
                                                    placeholder="Mô tả nhóm CV"
                                                />
                                            </div>
                                        </div>

                                        {/* Versions list */}
                                        <div className="space-y-3 pt-2 pl-4 border-l-2 border-zinc-200">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Các phiên bản CV</h4>
                                            
                                            <div className="space-y-3">
                                                {(group.versions || []).map((ver, verIndex) => (
                                                    <div key={verIndex} className="flex gap-2 items-center border border-zinc-200 rounded bg-white p-2.5">
                                                        <MoveButtons
                                                            index={verIndex}
                                                            total={(group.versions || []).length}
                                                            onMove={(from, to) => {
                                                                const r = [...(data.resumes || [])];
                                                                r[groupIndex] = {
                                                                    ...group,
                                                                    versions: swap(group.versions || [], from, to)
                                                                };
                                                                setData({ ...data, resumes: r });
                                                            }}
                                                        />
                                                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 mb-1">Tên phiên bản (e.g. 07/2026)</label>
                                                                <input
                                                                    type="text"
                                                                    value={ver.versionName}
                                                                    onChange={(e) => {
                                                                        const r = [...(data.resumes || [])];
                                                                        const versions = [...(group.versions || [])];
                                                                        versions[verIndex] = { ...ver, versionName: e.target.value };
                                                                        r[groupIndex] = { ...group, versions };
                                                                        setData({ ...data, resumes: r });
                                                                    }}
                                                                    className={inputClass}
                                                                    placeholder="e.g. 07/2026"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 mb-1">File PDF (R2)</label>
                                                                <PdfUpload
                                                                    value={ver.url}
                                                                    onChange={(url) => {
                                                                        const r = [...(data.resumes || [])];
                                                                        const versions = [...(group.versions || [])];
                                                                        versions[verIndex] = { ...ver, url };
                                                                        r[groupIndex] = { ...group, versions };
                                                                        setData({ ...data, resumes: r });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                const r = [...(data.resumes || [])];
                                                                r[groupIndex] = {
                                                                    ...group,
                                                                    versions: (group.versions || []).filter((_, i) => i !== verIndex)
                                                                };
                                                                setData({ ...data, resumes: r });
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                variant="action"
                                                size="sm"
                                                onClick={() => {
                                                    const r = [...(data.resumes || [])];
                                                    r[groupIndex] = {
                                                        ...group,
                                                        versions: [...(group.versions || []), { versionName: "", url: "" }]
                                                    };
                                                    setData({ ...data, resumes: r });
                                                }}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Thêm phiên bản
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() => setData({ ...data, resumes: [...(data.resumes || []), { name: "", description: "", versions: [] }] })}
                            >
                                <Plus className="w-4 h-4" />
                                Thêm nhóm CV
                            </Button>
                            <SaveButton saving={saving === "moreAndMore"} message={message.moreAndMore || ""} onSave={() => handleSave("moreAndMore")} />
                        </div>
                    </div>
                    </motion.section>

                    {/* Stories Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Stories</h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("stories") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("stories") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("stories")}
                                        title={isSectionHidden("stories") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("stories") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-3 sm:space-y-4">
                                {(data.stories || []).map((item, index) => (
                                    <div key={index} className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4 space-y-3">
                                        <div className="flex justify-between items-center gap-2">
                                            <MoveButtons
                                                index={index}
                                                total={(data.stories || []).length}
                                                onMove={(from, to) => setData({ ...data, stories: swap(data.stories || [], from, to) })}
                                            />
                                            <span className="font-bold text-sm">Story {index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setData({ ...data, stories: (data.stories || []).filter((_, i) => i !== index) })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const s = [...(data.stories || [])];
                                                    s[index] = { ...item, title: e.target.value };
                                                    setData({ ...data, stories: s });
                                                }}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Content</label>
                                            <textarea
                                                value={item.content}
                                                onChange={(e) => {
                                                    const s = [...(data.stories || [])];
                                                    s[index] = { ...item, content: e.target.value };
                                                    setData({ ...data, stories: s });
                                                }}
                                                className={`${inputClass} min-h-[100px]`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Topics / Hashtags (optional)</label>
                                            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                                {(item.topics || []).map((topic, topicIndex) => (
                                                    <span
                                                        key={topicIndex}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-lg"
                                                    >
                                                        #{topic.toLowerCase().replace(/\s+/g, "-")}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const s = [...(data.stories || [])];
                                                                s[index] = { ...item, topics: (item.topics || []).filter((_, i) => i !== topicIndex) };
                                                                setData({ ...data, stories: s });
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
                                                placeholder="Enter new topic and press Enter (e.g. growth, lessons)..."
                                                className={inputClass}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val) {
                                                            const cur = item.topics || [];
                                                            if (!cur.includes(val)) {
                                                                const s = [...(data.stories || [])];
                                                                s[index] = { ...item, topics: [...cur, val] };
                                                                setData({ ...data, stories: s });
                                                            }
                                                            e.currentTarget.value = "";
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() => setData({ ...data, stories: [...(data.stories || []), { title: "", content: "", topics: [] }] })}
                            >
                                <Plus className="w-4 h-4" />
                                Thêm story
                            </Button>
                            <SaveButton saving={saving === "stories"} message={message.stories || ""} onSave={() => handleSave("stories")} />
                        </div>
                    </div>
                    </motion.section>

                    {/* What's Next Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">What's Next</h2>
                        <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("whatsNext") ? "opacity-75 bg-zinc-50" : ""}`}>
                            {/* macOS Window Header */}
                            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isSectionHidden("whatsNext") && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                            <EyeOff className="w-3 h-3" />
                                            Đang ẩn phân mục
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 p-0 hover:bg-zinc-200"
                                        onClick={() => toggleSectionHidden("whatsNext")}
                                        title={isSectionHidden("whatsNext") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                                    >
                                        {isSectionHidden("whatsNext") ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-3 sm:space-y-4">
                                {(data.whatsNext || []).map((item, index) => (
                                    <div key={index} className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4 space-y-3">
                                        <div className="flex justify-between items-center gap-2">
                                            <MoveButtons
                                                index={index}
                                                total={(data.whatsNext || []).length}
                                                onMove={(from, to) => setData({ ...data, whatsNext: swap(data.whatsNext || [], from, to) })}
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const w = [...(data.whatsNext || [])];
                                                        w[index] = { ...item, title: e.target.value };
                                                        setData({ ...data, whatsNext: w });
                                                    }}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setData({ ...data, whatsNext: (data.whatsNext || []).filter((_, i) => i !== index) })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-bold mb-1 text-zinc-500">Status</label>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => {
                                                        const w = [...(data.whatsNext || [])];
                                                        w[index] = { ...item, status: e.target.value as any };
                                                        setData({ ...data, whatsNext: w });
                                                    }}
                                                    className={inputClass}
                                                >
                                                    <option value="Planning">Planning</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Done">Done</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1 text-zinc-500">Description (optional)</label>
                                                <input
                                                    type="text"
                                                    value={item.description || ""}
                                                    onChange={(e) => {
                                                        const w = [...(data.whatsNext || [])];
                                                        w[index] = { ...item, description: e.target.value };
                                                        setData({ ...data, whatsNext: w });
                                                    }}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="action"
                                size="sm"
                                className="mt-3"
                                onClick={() => setData({ ...data, whatsNext: [...(data.whatsNext || []), { title: "", status: "Planning", description: "" }] })}
                            >
                                <Plus className="w-4 h-4" />
                                Thêm kế hoạch
                            </Button>
                            <SaveButton saving={saving === "whatsNext"} message={message.whatsNext || ""} onSave={() => handleSave("whatsNext")} />
                        </div>
                    </div>
                    </motion.section>
                </div>
            </div>

            {/* If You're Reading Closely Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    If You're Reading Closely
                </h2>
                <div className={`border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary transition-all duration-200 ${isSectionHidden("readingClosely") ? "opacity-75 bg-zinc-50" : ""}`}>
                    {/* macOS Window Header */}
                    <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSectionHidden("readingClosely") && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-zinc-300 bg-zinc-100 text-zinc-500 rounded">
                                    <EyeOff className="w-3 h-3" />
                                    Đang ẩn phân mục
                                </span>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 p-0 hover:bg-zinc-200"
                                onClick={() => toggleSectionHidden("readingClosely")}
                                title={isSectionHidden("readingClosely") ? "Hiển thị phân mục này ngoài trang chủ" : "Tạm ẩn phân mục này khỏi trang chủ"}
                            >
                                {isSectionHidden("readingClosely") ? (
                                    <EyeOff className="w-4 h-4 text-zinc-400" />
                                ) : (
                                    <Eye className="w-4 h-4 text-zinc-700" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Lead paragraph (optional)
                        </label>
                        <textarea
                            value={data.readingCloselyIntro || ""}
                            onChange={(e) =>
                                setData({ ...data, readingCloselyIntro: e.target.value })
                            }
                            className={`${inputClass} min-h-[80px]`}
                            rows={3}
                            placeholder="2-3 câu giới thiệu cho người đọc kỹ..."
                        />
                    </div>

                    <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-bold text-blue-600 mb-3">
                            Impact / People
                        </h3>
                        <ExploreItemListEditor
                            items={data.impactPeople || []}
                            onChange={(items) => setData({ ...data, impactPeople: items })}
                            folder="impact-people"
                            itemLabel="Story"
                        />
                    </div>

                    <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-bold text-blue-600 mb-3">
                            Lessons / Failed
                        </h3>
                        <ExploreItemListEditor
                            items={data.lessonsFailed || []}
                            onChange={(items) => setData({ ...data, lessonsFailed: items })}
                            folder="lessons-failed"
                            itemLabel="Lesson"
                        />
                    </div>

                    <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-bold text-blue-600 mb-3">
                            Off the Record
                        </h3>
                        <ExploreItemListEditor
                            items={data.offTheRecord || []}
                            onChange={(items) => setData({ ...data, offTheRecord: items })}
                            folder="off-the-record"
                            itemLabel="Note"
                        />
                    </div>

                    <SaveButton
                        saving={saving === "readingClosely"}
                        message={message.readingClosely || ""}
                        onSave={() => handleSave("readingClosely")}
                    />
                </div>
            </div>
            </motion.section>
        </div>
    );
}
