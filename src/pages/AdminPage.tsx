import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import {
    type HomepageData,
    defaultHomepageData,
    saveHomepageData,
} from "@/hooks/useHomepageData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { LogOut, Plus, Trash2, Save, Loader2, ShieldX } from "lucide-react";

const ALLOWED_EMAILS = [
    "hugoddt1234.50@gmail.com",
    "tranthienann228@gmail.com",
    "tranthienan12a1ts2022@gmail.com",
];

function LoginForm() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
            setError("Email không có quyền truy cập.");
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
        } catch {
            setError("Email hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function UnauthorizedView() {
    const { signOut } = useAuth();

    return (
        <div className="max-w-sm mx-auto mt-12 text-center space-y-4">
            <ShieldX className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-xl font-bold">Không có quyền truy cập</h2>
            <p className="text-sm text-zinc-600">
                Tài khoản của bạn không được phép truy cập trang admin.
            </p>
            <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
                Đăng xuất
            </Button>
        </div>
    );
}

const inputClass =
    "w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

function AdminEditor() {
    const { signOut } = useAuth();
    const [data, setData] = useState<HomepageData>(defaultHomepageData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

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

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await saveHomepageData(data);
            setMessage("Đã lưu thành công!");
        } catch (err) {
            console.error(err);
            setMessage("Lỗi khi lưu. Vui lòng thử lại.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </Button>
            </div>

            {/* Hero Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Avatar
                        </label>
                        <ImageUpload
                            value={data.hero.avatarUrl || ""}
                            onChange={(url) =>
                                setData({
                                    ...data,
                                    hero: {
                                        ...data.hero,
                                        avatarUrl: url,
                                    },
                                })
                            }
                            folder="avatar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Greeting
                        </label>
                        <input
                            type="text"
                            value={data.hero.greeting}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    hero: {
                                        ...data.hero,
                                        greeting: e.target.value,
                                    },
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={data.hero.name}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    hero: {
                                        ...data.hero,
                                        name: e.target.value,
                                    },
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.hero.email}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    hero: {
                                        ...data.hero,
                                        email: e.target.value,
                                    },
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Bio Paragraphs
                        </label>
                        {data.hero.bio.map((paragraph, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <textarea
                                    value={paragraph}
                                    onChange={(e) => {
                                        const newBio = [...data.hero.bio];
                                        newBio[index] = e.target.value;
                                        setData({
                                            ...data,
                                            hero: {
                                                ...data.hero,
                                                bio: newBio,
                                            },
                                        });
                                    }}
                                    className={`${inputClass} min-h-[60px]`}
                                    rows={2}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newBio = data.hero.bio.filter(
                                            (_, i) => i !== index
                                        );
                                        setData({
                                            ...data,
                                            hero: {
                                                ...data.hero,
                                                bio: newBio,
                                            },
                                        });
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
                                setData({
                                    ...data,
                                    hero: {
                                        ...data.hero,
                                        bio: [...data.hero.bio, ""],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4" />
                            Thêm đoạn
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.products.map((product, index) => (
                        <div
                            key={index}
                            className="border-2 border-black rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">
                                    Product {index + 1}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newProducts =
                                            data.products.filter(
                                                (_, i) => i !== index
                                            );
                                        setData({
                                            ...data,
                                            products: newProducts,
                                        });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Image
                                </label>
                                <ImageUpload
                                    value={product.imageUrl || ""}
                                    onChange={(url) => {
                                        const newProducts = [...data.products];
                                        newProducts[index] = {
                                            ...product,
                                            imageUrl: url,
                                        };
                                        setData({
                                            ...data,
                                            products: newProducts,
                                        });
                                    }}
                                    folder="products"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={product.title}
                                    onChange={(e) => {
                                        const newProducts = [...data.products];
                                        newProducts[index] = {
                                            ...product,
                                            title: e.target.value,
                                        };
                                        setData({
                                            ...data,
                                            products: newProducts,
                                        });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={product.description}
                                    onChange={(e) => {
                                        const newProducts = [...data.products];
                                        newProducts[index] = {
                                            ...product,
                                            description: e.target.value,
                                        };
                                        setData({
                                            ...data,
                                            products: newProducts,
                                        });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">
                                        Icon
                                    </label>
                                    <select
                                        value={product.icon}
                                        onChange={(e) => {
                                            const newProducts = [
                                                ...data.products,
                                            ];
                                            newProducts[index] = {
                                                ...product,
                                                icon: e.target.value,
                                            };
                                            setData({
                                                ...data,
                                                products: newProducts,
                                            });
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="Rocket">Rocket</option>
                                        <option value="CheckCircle">
                                            CheckCircle
                                        </option>
                                        <option value="Star">Star</option>
                                        <option value="Zap">Zap</option>
                                        <option value="Heart">Heart</option>
                                        <option value="Code">Code</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        value={product.link}
                                        onChange={(e) => {
                                            const newProducts = [
                                                ...data.products,
                                            ];
                                            newProducts[index] = {
                                                ...product,
                                                link: e.target.value,
                                            };
                                            setData({
                                                ...data,
                                                products: newProducts,
                                            });
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
                                products: [
                                    ...data.products,
                                    {
                                        title: "",
                                        description: "",
                                        icon: "Rocket",
                                        link: "/projects",
                                    },
                                ],
                            })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm product
                    </Button>
                </CardContent>
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
                                        const newSkills = [...data.skills];
                                        newSkills[index] = {
                                            ...skill,
                                            name: e.target.value,
                                        };
                                        setData({
                                            ...data,
                                            skills: newSkills,
                                        });
                                    }}
                                    className={inputClass}
                                />
                                <input
                                    type="text"
                                    placeholder="Detail"
                                    value={skill.detail}
                                    onChange={(e) => {
                                        const newSkills = [...data.skills];
                                        newSkills[index] = {
                                            ...skill,
                                            detail: e.target.value,
                                        };
                                        setData({
                                            ...data,
                                            skills: newSkills,
                                        });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const newSkills = data.skills.filter(
                                        (_, i) => i !== index
                                    );
                                    setData({ ...data, skills: newSkills });
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
                            setData({
                                ...data,
                                skills: [
                                    ...data.skills,
                                    { name: "", detail: "" },
                                ],
                            })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm skill
                    </Button>
                </CardContent>
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
                                            const newLinks = [...data.links];
                                            newLinks[index] = {
                                                ...link,
                                                label: e.target.value,
                                            };
                                            setData({
                                                ...data,
                                                links: newLinks,
                                            });
                                        }}
                                        className={inputClass}
                                    />
                                    <input
                                        type="text"
                                        placeholder="URL"
                                        value={link.url}
                                        onChange={(e) => {
                                            const newLinks = [...data.links];
                                            newLinks[index] = {
                                                ...link,
                                                url: e.target.value,
                                            };
                                            setData({
                                                ...data,
                                                links: newLinks,
                                            });
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newLinks = data.links.filter(
                                            (_, i) => i !== index
                                        );
                                        setData({ ...data, links: newLinks });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-zinc-500">
                                    Icon (optional)
                                </label>
                                <ImageUpload
                                    value={link.iconUrl || ""}
                                    onChange={(url) => {
                                        const newLinks = [...data.links];
                                        newLinks[index] = {
                                            ...link,
                                            iconUrl: url,
                                        };
                                        setData({
                                            ...data,
                                            links: newLinks,
                                        });
                                    }}
                                    folder="icons"
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            setData({
                                ...data,
                                links: [
                                    ...data.links,
                                    { label: "", url: "" },
                                ],
                            })
                        }
                    >
                        <Plus className="w-4 h-4" />
                        Thêm link
                    </Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="sticky bottom-4 flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                {message && (
                    <span
                        className={`text-sm font-bold ${
                            message.includes("thành công")
                                ? "text-green-600"
                                : "text-red-500"
                        }`}
                    >
                        {message}
                    </span>
                )}
            </div>
        </div>
    );
}

export function AdminPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <LoginForm />;
    }

    if (!ALLOWED_EMAILS.includes(user.email || "")) {
        return <UnauthorizedView />;
    }

    return <AdminEditor />;
}

export default AdminPage;
