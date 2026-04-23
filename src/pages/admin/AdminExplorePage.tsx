import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type ExploreData,
    defaultExploreData,
    saveExploreData,
} from "@/hooks/useExploreData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

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
            <Button onClick={onSave} disabled={saving} size="sm">
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

export function AdminExplorePage() {
    const [data, setData] = useState<ExploreData>(defaultExploreData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<Record<string, string>>({});

    useEffect(() => {
        getDoc(doc(db, "siteConfig", "explore"))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setData(snapshot.data() as ExploreData);
                }
            })
            .catch((err) => {
                console.error("Failed to load data:", err);
            })
            .finally(() => setLoading(false));
    }, []);

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
            {/* Intro Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Explore Editor
                </h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6 space-y-4">
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
            </motion.section>

            {/* Achievements Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Achievements
                </h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                        {data.achievements.map((item, index) => (
                            <div
                                key={index}
                                className="border-2 border-black rounded-lg bg-white p-3 sm:p-4 space-y-3"
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
                        variant="ghost"
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
            </motion.section>

            {/* Currently Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Currently
                </h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                        {data.currently.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-2 items-center border-2 border-black rounded-lg bg-white p-2.5 sm:p-3"
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
                        variant="ghost"
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
            </motion.section>

            {/* Stories Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Stories</h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                        {(data.stories || []).map((item, index) => (
                            <div key={index} className="border-2 border-black rounded-lg bg-white p-3 sm:p-4 space-y-3">
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
                                    <label className="block text-sm font-bold mb-1">Date (optional)</label>
                                    <input
                                        type="text"
                                        value={item.date || ""}
                                        onChange={(e) => {
                                            const s = [...(data.stories || [])];
                                            s[index] = { ...item, date: e.target.value };
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
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => setData({ ...data, stories: [...(data.stories || []), { title: "", content: "", date: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm story
                    </Button>
                    <SaveButton saving={saving === "stories"} message={message.stories || ""} onSave={() => handleSave("stories")} />
                </div>
            </motion.section>

            {/* What's Next Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">What's Next</h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                        {(data.whatsNext || []).map((item, index) => (
                            <div key={index} className="border-2 border-black rounded-lg bg-white p-3 sm:p-4 space-y-3">
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
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => setData({ ...data, whatsNext: [...(data.whatsNext || []), { title: "", status: "Planning", description: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm kế hoạch
                    </Button>
                    <SaveButton saving={saving === "whatsNext"} message={message.whatsNext || ""} onSave={() => handleSave("whatsNext")} />
                </div>
            </motion.section>

            {/* More & More Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More & More</h2>
                <div className="border-2 border-black rounded-lg bg-blue-100 shadow-secondary p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                        {(data.moreAndMore || []).map((item, index) => (
                            <div key={index} className="flex gap-2 items-center border-2 border-black rounded-lg bg-white p-2.5 sm:p-3">
                                <MoveButtons
                                    index={index}
                                    total={(data.moreAndMore || []).length}
                                    onMove={(from, to) => setData({ ...data, moreAndMore: swap(data.moreAndMore || [], from, to) })}
                                />
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. Font)"
                                        value={item.label}
                                        onChange={(e) => {
                                            const m = [...(data.moreAndMore || [])];
                                            m[index] = { ...item, label: e.target.value };
                                            setData({ ...data, moreAndMore: m });
                                        }}
                                        className={inputClass}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (e.g. Inter)"
                                        value={item.description || ""}
                                        onChange={(e) => {
                                            const m = [...(data.moreAndMore || [])];
                                            m[index] = { ...item, description: e.target.value };
                                            setData({ ...data, moreAndMore: m });
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setData({ ...data, moreAndMore: (data.moreAndMore || []).filter((_, i) => i !== index) })}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => setData({ ...data, moreAndMore: [...(data.moreAndMore || []), { label: "", description: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm mục
                    </Button>
                    <SaveButton saving={saving === "moreAndMore"} message={message.moreAndMore || ""} onSave={() => handleSave("moreAndMore")} />
                </div>
            </motion.section>
        </div>
    );
}
