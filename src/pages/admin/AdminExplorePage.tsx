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
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

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
                className="border-t-2 border-black pt-6 sm:pt-8"
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
                                <div className="flex justify-between items-center">
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
                className="border-t-2 border-black pt-6 sm:pt-8"
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
                                <div className="flex-1 grid grid-cols-2 gap-2">
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
        </div>
    );
}
