import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import {
    type HomepageData,
    defaultHomepageData,
    saveHomepageData,
} from "@/hooks/useHomepageData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const labelClass = "mb-2 block text-sm font-medium text-zinc-600";
const inputClass = "w-full bg-zinc-50 px-4 py-3 text-base text-zinc-700 placeholder:text-zinc-400 rounded-md focus:bg-white focus:outline-none";
const textActionClass = "h-auto px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline";
const saveButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 hover:bg-blue-100 active:translate-x-px active:translate-y-px active:shadow-none sm:text-sm";

function SaveButton({ saving, message, onSave }: { saving: boolean; message: string; onSave: () => void }) {
    return (
        <div className="flex items-center gap-3 pt-2">
            <Button
                variant="ghost"
                onClick={onSave}
                disabled={saving}
                className={saveButtonClass}
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            {message && (
                <span className={`text-sm ${message.includes("thành công") ? "text-green-700" : "text-red-600"}`}>
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
        <div data-tap-zone="plain" className="space-y-16">
            <section className="space-y-5">
                <h2 className="text-xl font-semibold text-zinc-800">Hero</h2>
                <div>
                    <label className={labelClass}>Avatar</label>
                    <ImageUpload
                        value={data.hero.avatarUrl || ""}
                        onChange={(url) =>
                            setData({ ...data, hero: { ...data.hero, avatarUrl: url } })
                        }
                        folder="avatar"
                    />
                </div>
                <div>
                    <label className={labelClass}>Greeting</label>
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
                    <label className={labelClass}>Name</label>
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
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        value={data.hero.email}
                        onChange={(e) =>
                            setData({ ...data, hero: { ...data.hero, email: e.target.value } })
                        }
                        className={inputClass}
                    />
                </div>
                <div className="space-y-3">
                    <label className={labelClass}>Bio Paragraphs</label>
                    {data.hero.bio.map((paragraph, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <textarea
                                value={paragraph}
                                onChange={(e) => {
                                    const newBio = [...data.hero.bio];
                                    newBio[index] = e.target.value;
                                    setData({ ...data, hero: { ...data.hero, bio: newBio } });
                                }}
                                className={`${inputClass} min-h-24`}
                                rows={3}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => {
                                    const newBio = data.hero.bio.filter((_, i) => i !== index);
                                    setData({ ...data, hero: { ...data.hero, bio: newBio } });
                                }}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="ghost"
                        className={textActionClass}
                        onClick={() =>
                            setData({ ...data, hero: { ...data.hero, bio: [...data.hero.bio, ""] } })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm đoạn
                    </Button>
                </div>
                <SaveButton saving={saving === "hero"} message={message.hero || ""} onSave={() => handleSave("hero")} />
            </section>

            <section className="space-y-8">
                <h2 className="text-xl font-semibold text-zinc-800">Experience</h2>
                <div className="space-y-12">
                    {(data.experiences || []).map((exp, index) => (
                        <div key={index} className={`space-y-4 ${exp.hidden ? "opacity-60" : ""}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <MoveButtons
                                        index={index}
                                        total={(data.experiences || []).length}
                                        onMove={(from, to) =>
                                            setData({
                                                ...data,
                                                experiences: swap(data.experiences || [], from, to),
                                            })
                                        }
                                    />
                                    <span className="text-sm font-medium text-zinc-700">
                                        Kinh nghiệm {index + 1}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const list = [...(data.experiences || [])];
                                            list[index] = { ...exp, hidden: !exp.hidden };
                                            setData({ ...data, experiences: list });
                                        }}
                                        title={exp.hidden ? "Hiển thị công việc này" : "Tạm ẩn công việc này"}
                                    >
                                        {exp.hidden ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-700" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                experiences: (data.experiences || []).filter((_, i) => i !== index),
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Vị trí (Role)</label>
                                    <input
                                        type="text"
                                        value={exp.role}
                                        onChange={(e) => {
                                            const list = [...(data.experiences || [])];
                                            list[index] = { ...exp, role: e.target.value };
                                            setData({ ...data, experiences: list });
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Công ty (Company)</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => {
                                            const list = [...(data.experiences || [])];
                                            list[index] = { ...exp, company: e.target.value };
                                            setData({ ...data, experiences: list });
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Thời gian (Period)</label>
                                    <input
                                        type="text"
                                        value={exp.period}
                                        onChange={(e) => {
                                            const list = [...(data.experiences || [])];
                                            list[index] = { ...exp, period: e.target.value };
                                            setData({ ...data, experiences: list });
                                        }}
                                        className={inputClass}
                                        placeholder="e.g. 2024 - Present"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Địa điểm (Location - Tùy chọn)</label>
                                    <input
                                        type="text"
                                        value={exp.location || ""}
                                        onChange={(e) => {
                                            const list = [...(data.experiences || [])];
                                            list[index] = { ...exp, location: e.target.value };
                                            setData({ ...data, experiences: list });
                                        }}
                                        className={inputClass}
                                        placeholder="e.g. Ho Chi Minh City, Vietnam"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Mô tả đóng góp (Mỗi dòng một ý)</label>
                                <textarea
                                    value={(exp.description || []).join("\n")}
                                    onChange={(e) => {
                                        const list = [...(data.experiences || [])];
                                        list[index] = {
                                            ...exp,
                                            description: e.target.value.split("\n"),
                                        };
                                        setData({ ...data, experiences: list });
                                    }}
                                    className={`${inputClass} min-h-28`}
                                    rows={4}
                                    placeholder="Đóng góp kỹ thuật chính..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            experiences: [
                                ...(data.experiences || []),
                                { role: "", company: "", period: "", description: [] },
                            ],
                        })
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm kinh nghiệm
                </Button>
                <SaveButton
                    saving={saving === "experiences"}
                    message={message.experiences || ""}
                    onSave={() => handleSave("experiences")}
                />
            </section>

            <section className="space-y-8">
                <h2 className="text-xl font-semibold text-zinc-800">Tech Stack</h2>
                <div className="space-y-12">
                    {data.skillCategories.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <MoveButtons
                                        index={catIndex}
                                        total={data.skillCategories.length}
                                        onMove={(from, to) => setData({ ...data, skillCategories: swap(data.skillCategories, from, to) })}
                                    />
                                    <span className="text-sm font-medium text-zinc-700">
                                        Category {catIndex + 1}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setData({ ...data, skillCategories: data.skillCategories.filter((_, i) => i !== catIndex) })}
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                            <div>
                                <label className={labelClass}>Name</label>
                                <input
                                    type="text"
                                    placeholder="Category name"
                                    value={category.name}
                                    onChange={(e) => {
                                        const cats = [...data.skillCategories];
                                        cats[catIndex] = { ...category, name: e.target.value };
                                        setData({ ...data, skillCategories: cats });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className={labelClass}>Items</label>
                                {category.items.map((skill, skillIndex) => (
                                    <div key={skillIndex} className="flex items-center gap-3">
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
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const cats = [...data.skillCategories];
                                                cats[catIndex] = { ...category, items: category.items.filter((_, i) => i !== skillIndex) };
                                                setData({ ...data, skillCategories: cats });
                                            }}
                                            className="shrink-0 text-base text-zinc-500 hover:text-red-600"
                                            aria-label="Remove item"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    className={textActionClass}
                                    onClick={() => {
                                        const cats = [...data.skillCategories];
                                        cats[catIndex] = { ...category, items: [...category.items, ""] };
                                        setData({ ...data, skillCategories: cats });
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Tag
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    className={textActionClass}
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
            </section>

            <section className="space-y-8">
                <h2 className="text-xl font-semibold text-zinc-800">Links</h2>
                <div className="space-y-12">
                    {data.links.map((link, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <MoveButtons
                                        index={index}
                                        total={data.links.length}
                                        onMove={(from, to) => setData({ ...data, links: swap(data.links, from, to) })}
                                    />
                                    <span className="text-sm font-medium text-zinc-700">Link {index + 1}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setData({ ...data, links: data.links.filter((_, i) => i !== index) })}
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                            <div>
                                <label className={labelClass}>Label</label>
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
                            </div>
                            <div>
                                <label className={labelClass}>URL</label>
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
                            <div>
                                <label className={labelClass}>Icon (optional)</label>
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
                    className={textActionClass}
                    onClick={() => setData({ ...data, links: [...data.links, { label: "", url: "" }] })}
                >
                    <Plus className="w-4 h-4" />
                    Thêm link
                </Button>
                <SaveButton saving={saving === "links"} message={message.links || ""} onSave={() => handleSave("links")} />
            </section>
        </div>
    );
}
