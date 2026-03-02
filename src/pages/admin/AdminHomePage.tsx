import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    type HomepageData,
    defaultHomepageData,
    saveHomepageData,
} from "@/hooks/useHomepageData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

function SaveButton({ saving, message, onSave }: { saving: boolean; message: string; onSave: () => void }) {
    return (
        <div className="flex items-center gap-3">
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
                    setData(snapshot.data() as HomepageData);
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
        <div className="space-y-6">
            {/* Hero Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        {data.hero.bio.map((paragraph, index) => (
                            <div key={index} className="flex gap-2 mb-2">
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
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setData({ ...data, hero: { ...data.hero, bio: [...data.hero.bio, ""] } })
                            }
                        >
                            <Plus className="w-4 h-4" />
                            Thêm đoạn
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <SaveButton saving={saving === "hero"} message={message.hero || ""} onSave={() => handleSave("hero")} />
                </CardFooter>
            </Card>

            {/* Products Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Featured Products (Homepage)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.products.map((product, index) => (
                        <div key={index} className="border-2 border-black rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">Product {index + 1}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setData({ ...data, products: data.products.filter((_, i) => i !== index) });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Image</label>
                                <ImageUpload
                                    value={product.imageUrl || ""}
                                    onChange={(url) => {
                                        const p = [...data.products];
                                        p[index] = { ...product, imageUrl: url };
                                        setData({ ...data, products: p });
                                    }}
                                    folder="products"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={product.title}
                                    onChange={(e) => {
                                        const p = [...data.products];
                                        p[index] = { ...product, title: e.target.value };
                                        setData({ ...data, products: p });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <input
                                    type="text"
                                    value={product.description}
                                    onChange={(e) => {
                                        const p = [...data.products];
                                        p[index] = { ...product, description: e.target.value };
                                        setData({ ...data, products: p });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Icon</label>
                                    <select
                                        value={product.icon}
                                        onChange={(e) => {
                                            const p = [...data.products];
                                            p[index] = { ...product, icon: e.target.value };
                                            setData({ ...data, products: p });
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="Rocket">Rocket</option>
                                        <option value="CheckCircle">CheckCircle</option>
                                        <option value="Star">Star</option>
                                        <option value="Zap">Zap</option>
                                        <option value="Heart">Heart</option>
                                        <option value="Code">Code</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Link</label>
                                    <input
                                        type="text"
                                        value={product.link}
                                        onChange={(e) => {
                                            const p = [...data.products];
                                            p[index] = { ...product, link: e.target.value };
                                            setData({ ...data, products: p });
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            setData({
                                ...data,
                                products: [...data.products, { title: "", description: "", icon: "Rocket", link: "/projects" }],
                            })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm product
                    </Button>
                </CardContent>
                <CardFooter>
                    <SaveButton saving={saving === "products"} message={message.products || ""} onSave={() => handleSave("products")} />
                </CardFooter>
            </Card>

            {/* Skills Section */}
            <Card>
                <CardHeader>
                    <CardTitle>What I Offer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Skill name"
                                    value={skill.name}
                                    onChange={(e) => {
                                        const s = [...data.skills];
                                        s[index] = { ...skill, name: e.target.value };
                                        setData({ ...data, skills: s });
                                    }}
                                    className={inputClass}
                                />
                                <input
                                    type="text"
                                    placeholder="Detail"
                                    value={skill.detail}
                                    onChange={(e) => {
                                        const s = [...data.skills];
                                        s[index] = { ...skill, detail: e.target.value };
                                        setData({ ...data, skills: s });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setData({ ...data, skills: data.skills.filter((_, i) => i !== index) })}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setData({ ...data, skills: [...data.skills, { name: "", detail: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm skill
                    </Button>
                </CardContent>
                <CardFooter>
                    <SaveButton saving={saving === "skills"} message={message.skills || ""} onSave={() => handleSave("skills")} />
                </CardFooter>
            </Card>

            {/* Links Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.links.map((link, index) => (
                        <div key={index} className="space-y-2 border-2 border-black rounded-lg p-3">
                            <div className="flex gap-2 items-start">
                                <div className="flex-1 grid grid-cols-2 gap-2">
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setData({ ...data, links: [...data.links, { label: "", url: "" }] })}
                    >
                        <Plus className="w-4 h-4" />
                        Thêm link
                    </Button>
                </CardContent>
                <CardFooter>
                    <SaveButton saving={saving === "links"} message={message.links || ""} onSave={() => handleSave("links")} />
                </CardFooter>
            </Card>
        </div>
    );
}
