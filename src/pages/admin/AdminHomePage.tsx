import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type HomepageData,
    defaultHomepageData,
    saveHomepageData,
} from "@/hooks/useHomepageData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

function SaveButton({ saving, message, onSave }: { saving: boolean; message: string; onSave: () => void }) {
    return (
        <div className="flex items-center gap-3 pt-4">
            <Button onClick={onSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            {message && (
                <span className={`text-sm font-bold ${message.includes("thành công") ? "text-green-600" : "text-red-500"}`}>
                    {message}
                </span>
            )}
        </div>
    );
}

export function AdminHomePage() {
    const [data, setData] = useState<HomepageData>(defaultHomepageData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<Record<string, string>>({});

    useEffect(() => {
        getDoc(doc(db, "siteConfig", "homepage"))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setData({ ...defaultHomepageData, ...snapshot.data() } as HomepageData);
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
            await saveHomepageData(data);
            setMessage((prev) => ({ ...prev, [section]: "Đã lưu thành công!" }));
        } catch (err) {
            console.error(err);
            setMessage((prev) => ({ ...prev, [section]: "Lỗi khi lưu." }));
        } finally {
            setSaving(null);
            setTimeout(() => setMessage((prev) => ({ ...prev, [section]: "" })), 3000);
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
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Hero Section</h2>
                <div className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary">
                    {/* macOS Window Header */}
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Avatar</label>
                        <ImageUpload
                            value={data.hero.avatarUrl || ""}
                            onChange={(url) =>
                                setData({ ...data, hero: { ...data.hero, avatarUrl: url } })
                            }
                            folder="avatar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Greeting</label>
                        <input
                            type="text"
                            value={data.hero.greeting}
                            onChange={(e) =>
                                setData({ ...data, hero: { ...data.hero, greeting: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Name</label>
                        <input
                            type="text"
                            value={data.hero.name}
                            onChange={(e) =>
                                setData({ ...data, hero: { ...data.hero, name: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Email</label>
                        <input
                            type="email"
                            value={data.hero.email}
                            onChange={(e) =>
                                setData({ ...data, hero: { ...data.hero, email: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Bio Paragraphs</label>
                        <div className="space-y-2">
                            {data.hero.bio.map((paragraph, index) => (
                                <div key={index} className="flex gap-2">
                                    <textarea
                                        value={paragraph}
                                        onChange={(e) => {
                                            const newBio = [...data.hero.bio];
                                            newBio[index] = e.target.value;
                                            setData({ ...data, hero: { ...data.hero, bio: newBio } });
                                        }}
                                        className={`${inputClass} min-h-[60px]`}
                                        rows={2}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const newBio = data.hero.bio.filter((_, i) => i !== index);
                                            setData({ ...data, hero: { ...data.hero, bio: newBio } });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                                setData({ ...data, hero: { ...data.hero, bio: [...data.hero.bio, ""] } })
                            }
                        >
                            <Plus className="w-4 h-4" />
                            Thêm đoạn
                        </Button>
                    </div>
                    <SaveButton saving={saving === "hero"} message={message.hero || ""} onSave={() => handleSave("hero")} />
                </div>
            </div>
            </motion.section>

            {/* Skills Categories Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Skills</h2>
                <div className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary">
                    {/* macOS Window Header */}
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-3 sm:space-y-4">
                        {data.skillCategories.map((category, catIndex) => (
                            <div key={catIndex} className="border-2 border-black rounded-lg bg-white p-3 sm:p-4 space-y-3">
                                <div className="flex justify-between items-center gap-2">
                                    <MoveButtons
                                        index={catIndex}
                                        total={data.skillCategories.length}
                                        onMove={(from, to) => setData({ ...data, skillCategories: swap(data.skillCategories, from, to) })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Category name"
                                        value={category.name}
                                        onChange={(e) => {
                                            const cats = [...data.skillCategories];
                                            cats[catIndex] = { ...category, name: e.target.value };
                                            setData({ ...data, skillCategories: cats });
                                        }}
                                        className={`${inputClass} font-bold`}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setData({ ...data, skillCategories: data.skillCategories.filter((_, i) => i !== catIndex) })}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {category.items.map((skill, skillIndex) => (
                                        <div key={skillIndex} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 border border-black rounded-lg text-sm">
                                            <input
                                                type="text"
                                                value={skill}
                                                onChange={(e) => {
                                                    const cats = [...data.skillCategories];
                                                    const items = [...category.items];
                                                    items[skillIndex] = e.target.value;
                                                    cats[catIndex] = { ...category, items };
                                                    setData({ ...data, skillCategories: cats });
                                                }}
                                                className="bg-transparent border-none outline-none w-20 text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    const cats = [...data.skillCategories];
                                                    cats[catIndex] = { ...category, items: category.items.filter((_, i) => i !== skillIndex) };
                                                    setData({ ...data, skillCategories: cats });
                                                }}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const cats = [...data.skillCategories];
                                            cats[catIndex] = { ...category, items: [...category.items, ""] };
                                            setData({ ...data, skillCategories: cats });
                                        }}
                                    >
                                        <Plus className="w-3 h-3" />
                                        Tag
                                    </Button>
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
                                skillCategories: [...data.skillCategories, { name: "", items: [] }],
                            })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm category
                    </Button>
                    <SaveButton saving={saving === "skills"} message={message.skills || ""} onSave={() => handleSave("skills")} />
                </div>
            </div>
            </motion.section>



            {/* Links Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Links</h2>
                <div className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary">
                    {/* macOS Window Header */}
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                        {data.links.map((link, index) => (
                            <div key={index} className="border-2 border-black rounded-lg bg-white p-3 space-y-2">
                                <div className="flex gap-2 items-start">
                                    <MoveButtons
                                        index={index}
                                        total={data.links.length}
                                        onMove={(from, to) => setData({ ...data, links: swap(data.links, from, to) })}
                                    />                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Label"
                                            value={link.label}
                                            onChange={(e) => {
                                                const l = [...data.links];
                                                l[index] = { ...link, label: e.target.value };
                                                setData({ ...data, links: l });
                                            }}
                                            className={inputClass}
                                        />
                                        <input
                                            type="text"
                                            placeholder="URL"
                                            value={link.url}
                                            onChange={(e) => {
                                                const l = [...data.links];
                                                l[index] = { ...link, url: e.target.value };
                                                setData({ ...data, links: l });
                                            }}
                                            className={inputClass}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setData({ ...data, links: data.links.filter((_, i) => i !== index) })}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-zinc-500">Icon (optional)</label>
                                    <ImageUpload
                                        value={link.iconUrl || ""}
                                        onChange={(url) => {
                                            const l = [...data.links];
                                            l[index] = { ...link, iconUrl: url };
                                            setData({ ...data, links: l });
                                        }}
                                        folder="icons"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => setData({ ...data, links: [...data.links, { label: "", url: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm link
                    </Button>
                    <SaveButton saving={saving === "links"} message={message.links || ""} onSave={() => handleSave("links")} />
                </div>
            </div>
            </motion.section>
        </div>
    );
}
