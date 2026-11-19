import { useState, useEffect, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import {
    type ExploreData,
    type ExploreItem,
    type ExploreStory,
    type ResumeGroup,
    type ResumeVersion,
    defaultExploreData,
    saveExploreData,
} from "@/hooks/useExploreData";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { PdfUpload } from "@/components/ui/pdf-upload";
import { Plus, Trash2, Save, Loader2, X, Eye, EyeOff } from "lucide-react";
import { MoveButtons, swap } from "@/components/ui/move-buttons";

const fieldClass =
    "w-full rounded-md bg-zinc-50 px-3 py-2.5 text-base text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none";
const writingClass = `${fieldClass} min-h-[140px] resize-y`;
const labelClass = "mb-1.5 block text-sm font-medium text-zinc-600";
const entryClass =
    "mt-6 min-w-0 space-y-4 border-t border-zinc-200 pt-6 first:mt-0 first:border-t-0 first:pt-0";
const saveButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 hover:bg-blue-100 active:translate-x-px active:translate-y-px active:shadow-none sm:text-sm";
const textActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline";

function blockTitle(primary?: string, secondary?: string) {
    const title = primary?.trim() || secondary?.trim();
    return title || "Chưa có tên";
}

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
        <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onSave} disabled={saving} className={saveButtonClass}>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            {children}
        </label>
    );
}

function LanguageSwitch({
    value,
    onChange,
}: {
    value: "en" | "vi";
    onChange: (value: "en" | "vi") => void;
}) {
    const optionClass = (active: boolean) =>
        `text-base font-semibold cursor-pointer ${active ? "text-zinc-800 underline underline-offset-4" : "text-zinc-400 hover:text-zinc-700"}`;

    return (
        <div className="flex items-center gap-5">
            <button
                type="button"
                aria-pressed={value === "en"}
                onClick={() => onChange("en")}
                className={optionClass(value === "en")}
            >
                English
            </button>
            <button
                type="button"
                aria-pressed={value === "vi"}
                onClick={() => onChange("vi")}
                className={optionClass(value === "vi")}
            >
                Tiếng Việt
            </button>
        </div>
    );
}

function Entry({
    title,
    index,
    total,
    onMove,
    onRemove,
    children,
}: {
    title: string;
    index: number;
    total: number;
    onMove: (from: number, to: number) => void;
    onRemove: () => void;
    children: ReactNode;
}) {
    return (
        <div className={entryClass}>
            <div className="flex items-start gap-3">
                <div className="shrink-0">
                    <MoveButtons index={index} total={total} onMove={onMove} />
                </div>
                <h3 className="min-w-0 flex-1 break-words pt-0.5 text-lg font-bold text-zinc-800">
                    {title}
                </h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="shrink-0"
                    aria-label={`Xóa ${title}`}
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
            {children}
        </div>
    );
}

function KeywordField({
    label,
    placeholder,
    values,
    format,
    onRemove,
    onAdd,
}: {
    label: string;
    placeholder: string;
    values: string[];
    format?: (value: string) => string;
    onRemove: (index: number) => void;
    onAdd: (value: string) => void | false;
}) {
    return (
        <div>
            <div className={labelClass}>{label}</div>
            {values.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {values.map((value, index) => (
                        <span
                            key={`${value}-${index}`}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-800"
                        >
                            {format ? format(value) : value}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-zinc-500 hover:text-red-600"
                                aria-label={`Xóa ${value}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <input
                type="text"
                placeholder={placeholder}
                className={fieldClass}
                onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (!val) return;
                    if (onAdd(val) !== false) e.currentTarget.value = "";
                }}
            />
        </div>
    );
}

function ExploreItemCard({
    item,
    index,
    total,
    folder,
    onUpdate,
    onMove,
    onRemove,
}: {
    item: ExploreItem;
    index: number;
    total: number;
    folder: string;
    onUpdate: (updates: Partial<ExploreItem>) => void;
    onMove: (from: number, to: number) => void;
    onRemove: () => void;
}) {
    const [lang, setLang] = useState<"en" | "vi">("en");
    const heading =
        lang === "vi"
            ? blockTitle(item.titleVi, item.title)
            : blockTitle(item.title, item.titleVi);

    return (
        <Entry title={heading} index={index} total={total} onMove={onMove} onRemove={onRemove}>
            <div>
                <div className={labelClass}>Image (optional)</div>
                <ImageUpload
                    value={item.imageUrl || ""}
                    onChange={(url) => onUpdate({ imageUrl: url })}
                    folder={folder}
                />
            </div>

            <LanguageSwitch value={lang} onChange={setLang} />

            {lang === "en" ? (
                <div className="space-y-4">
                    <Field label="Title">
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            className={fieldClass}
                        />
                    </Field>
                    <Field label="Summary">
                        <input
                            type="text"
                            value={item.summary}
                            onChange={(e) => onUpdate({ summary: e.target.value })}
                            className={fieldClass}
                            placeholder="1 dòng tóm tắt"
                        />
                    </Field>
                    <Field label="Story">
                        <textarea
                            value={item.story}
                            onChange={(e) => onUpdate({ story: e.target.value })}
                            className={writingClass}
                            rows={6}
                            placeholder="Câu chuyện đầy đủ..."
                        />
                    </Field>
                </div>
            ) : (
                <div className="space-y-4">
                    <Field label="Title">
                        <input
                            type="text"
                            value={item.titleVi || ""}
                            onChange={(e) => onUpdate({ titleVi: e.target.value })}
                            className={fieldClass}
                        />
                    </Field>
                    <Field label="Summary">
                        <input
                            type="text"
                            value={item.summaryVi || ""}
                            onChange={(e) => onUpdate({ summaryVi: e.target.value })}
                            className={fieldClass}
                            placeholder="1 dòng tóm tắt"
                        />
                    </Field>
                    <Field label="Story">
                        <textarea
                            value={item.storyVi || ""}
                            onChange={(e) => onUpdate({ storyVi: e.target.value })}
                            className={writingClass}
                            rows={6}
                            placeholder="Câu chuyện đầy đủ..."
                        />
                    </Field>
                </div>
            )}

            <Field label="Since (optional)">
                <input
                    type="text"
                    value={item.since || ""}
                    onChange={(e) => onUpdate({ since: e.target.value })}
                    className={fieldClass}
                    placeholder="2020, Grade 10..."
                />
            </Field>

            <KeywordField
                label="Tags (optional)"
                placeholder="Nhập tag rồi Enter"
                values={item.tags || []}
                onRemove={(tagIndex) =>
                    onUpdate({ tags: (item.tags || []).filter((_, i) => i !== tagIndex) })
                }
                onAdd={(val) => onUpdate({ tags: [...(item.tags || []), val] })}
            />
        </Entry>
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
        <div className="space-y-4">
            {items.length > 0 && (
                <div>
                    {items.map((item, index) => (
                        <ExploreItemCard
                            key={index}
                            item={item}
                            index={index}
                            total={items.length}
                            folder={folder}
                            onUpdate={(updates) => updateItem(index, updates)}
                            onMove={(from, to) => onChange(swap(items, from, to))}
                            onRemove={() => onChange(items.filter((_, i) => i !== index))}
                        />
                    ))}
                </div>
            )}
            <Button
                type="button"
                variant="ghost"
                className={textActionClass}
                onClick={() => onChange([...items, { title: "", summary: "", story: "" }])}
            >
                <Plus className="w-4 h-4" />
                Thêm {itemLabel.toLowerCase()}
            </Button>
        </div>
    );
}

function ExploreStoryCard({
    item,
    index,
    total,
    onUpdate,
    onMove,
    onRemove,
}: {
    item: ExploreStory;
    index: number;
    total: number;
    onUpdate: (next: ExploreStory) => void;
    onMove: (from: number, to: number) => void;
    onRemove: () => void;
}) {
    const [lang, setLang] = useState<"en" | "vi">("en");
    const heading =
        lang === "vi"
            ? blockTitle(item.titleVi, item.title)
            : blockTitle(item.title, item.titleVi);

    return (
        <Entry title={heading} index={index} total={total} onMove={onMove} onRemove={onRemove}>
            <LanguageSwitch value={lang} onChange={setLang} />
            {lang === "en" ? (
                <div className="space-y-4">
                    <Field label="Title">
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                            className={fieldClass}
                        />
                    </Field>
                    <Field label="Content">
                        <textarea
                            value={item.content}
                            onChange={(e) => onUpdate({ ...item, content: e.target.value })}
                            className={writingClass}
                            rows={6}
                        />
                    </Field>
                </div>
            ) : (
                <div className="space-y-4">
                    <Field label="Title">
                        <input
                            type="text"
                            value={item.titleVi || ""}
                            onChange={(e) => onUpdate({ ...item, titleVi: e.target.value })}
                            className={fieldClass}
                        />
                    </Field>
                    <Field label="Content">
                        <textarea
                            value={item.contentVi || ""}
                            onChange={(e) => onUpdate({ ...item, contentVi: e.target.value })}
                            className={writingClass}
                            rows={6}
                        />
                    </Field>
                </div>
            )}
            <KeywordField
                label="Topics / Hashtags (optional)"
                placeholder="Enter new topic and press Enter (e.g. growth, lessons)..."
                values={item.topics || []}
                format={(topic) => `#${topic.toLowerCase().replace(/\s+/g, "-")}`}
                onRemove={(topicIndex) =>
                    onUpdate({
                        ...item,
                        topics: (item.topics || []).filter((_, i) => i !== topicIndex),
                    })
                }
                onAdd={(val) => {
                    if ((item.topics || []).includes(val)) return false;
                    onUpdate({ ...item, topics: [...(item.topics || []), val] });
                }}
            />
        </Entry>
    );
}

function StoryListEditor({
    items,
    onChange,
}: {
    items: ExploreStory[];
    onChange: (items: ExploreStory[]) => void;
}) {
    const update = (index: number, next: ExploreStory) => {
        const copy = [...items];
        copy[index] = next;
        onChange(copy);
    };

    return (
        <div className="space-y-4">
            {items.length > 0 && (
                <div>
                    {items.map((item, index) => (
                        <ExploreStoryCard
                            key={index}
                            item={item}
                            index={index}
                            total={items.length}
                            onUpdate={(next) => update(index, next)}
                            onMove={(from, to) => onChange(swap(items, from, to))}
                            onRemove={() => onChange(items.filter((_, i) => i !== index))}
                        />
                    ))}
                </div>
            )}
            <Button
                type="button"
                variant="ghost"
                className={textActionClass}
                onClick={() => onChange([...items, { title: "", content: "", topics: [] }])}
            >
                <Plus className="w-4 h-4" />
                Thêm story
            </Button>
        </div>
    );
}

function ResumeGroupEditor({
    group,
    index,
    total,
    onChange,
    onMove,
    onRemove,
}: {
    group: ResumeGroup;
    index: number;
    total: number;
    onChange: (next: ResumeGroup) => void;
    onMove: (from: number, to: number) => void;
    onRemove: () => void;
}) {
    const versions = group.versions || [];

    const updateVersion = (versionIndex: number, updates: Partial<ResumeVersion>) => {
        const nextVersions = [...versions];
        nextVersions[versionIndex] = { ...nextVersions[versionIndex], ...updates };
        onChange({ ...group, versions: nextVersions });
    };

    return (
        <Entry
            title={blockTitle(group.name)}
            index={index}
            total={total}
            onMove={onMove}
            onRemove={onRemove}
        >
            <Field label="Tên nhóm CV (e.g. Software Developer CV)">
                <input
                    type="text"
                    value={group.name}
                    onChange={(e) => onChange({ ...group, name: e.target.value })}
                    className={fieldClass}
                    placeholder="Tên nhóm CV"
                />
            </Field>
            <Field label="Mô tả (e.g. English version, Tiếng Việt...)">
                <input
                    type="text"
                    value={group.description || ""}
                    onChange={(e) => onChange({ ...group, description: e.target.value })}
                    className={fieldClass}
                    placeholder="Mô tả nhóm CV"
                />
            </Field>

            <div className="space-y-4">
                <h4 className="text-base font-semibold text-zinc-800">Các phiên bản CV</h4>
                {versions.length > 0 && (
                    <div>
                        {versions.map((ver, verIndex) => (
                            <Entry
                                key={verIndex}
                                title={blockTitle(ver.versionName)}
                                index={verIndex}
                                total={versions.length}
                                onMove={(from, to) =>
                                    onChange({ ...group, versions: swap(versions, from, to) })
                                }
                                onRemove={() =>
                                    onChange({
                                        ...group,
                                        versions: versions.filter((_, i) => i !== verIndex),
                                    })
                                }
                            >
                                <Field label="Tên phiên bản (e.g. 07/2026)">
                                    <input
                                        type="text"
                                        value={ver.versionName}
                                        onChange={(e) =>
                                            updateVersion(verIndex, { versionName: e.target.value })
                                        }
                                        className={fieldClass}
                                        placeholder="e.g. 07/2026"
                                    />
                                </Field>
                                <div>
                                    <div className={labelClass}>File PDF (R2)</div>
                                    <PdfUpload
                                        value={ver.url}
                                        onChange={(url) => updateVersion(verIndex, { url })}
                                    />
                                </div>
                            </Entry>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        onChange({
                            ...group,
                            versions: [...versions, { versionName: "", url: "" }],
                        })
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm phiên bản
                </Button>
            </div>
        </Entry>
    );
}

function EditorSection({
    title,
    hidden = false,
    onToggleHidden,
    children,
}: {
    title: string;
    hidden?: boolean;
    onToggleHidden?: () => void;
    children: ReactNode;
}) {
    return (
        <section className="space-y-6 py-10 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-zinc-800">{title}</h2>
                {onToggleHidden && (
                    <button
                        type="button"
                        onClick={onToggleHidden}
                        title={
                            hidden
                                ? "Hiển thị phân mục này ngoài trang chủ"
                                : "Tạm ẩn phân mục này khỏi trang chủ"
                        }
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600"
                    >
                        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {hidden ? "Đang ẩn phân mục" : "Ẩn khỏi trang"}
                    </button>
                )}
            </div>
            {children}
        </section>
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

    const favourites = data.favourites || [];
    const resumes = data.resumes || [];
    const whatsNext = data.whatsNext || [];

    return (
        <div data-tap-zone="plain" className="divide-y divide-zinc-200">
            <EditorSection title="Explore Editor">
                <Field label="Title">
                    <input
                        type="text"
                        value={data.intro.title}
                        onChange={(e) =>
                            setData({
                                ...data,
                                intro: { ...data.intro, title: e.target.value },
                            })
                        }
                        className={fieldClass}
                    />
                </Field>
                <Field label="Description">
                    <textarea
                        value={data.intro.description}
                        onChange={(e) =>
                            setData({
                                ...data,
                                intro: { ...data.intro, description: e.target.value },
                            })
                        }
                        className={writingClass}
                        rows={6}
                    />
                </Field>
                <SaveButton
                    saving={saving === "intro"}
                    message={message.intro || ""}
                    onSave={() => handleSave("intro")}
                />
            </EditorSection>

            <EditorSection
                title="Favourites"
                hidden={isSectionHidden("favourites")}
                onToggleHidden={() => toggleSectionHidden("favourites")}
            >
                {favourites.length > 0 && (
                    <div>
                        {favourites.map((item, index) => (
                            <Entry
                                key={index}
                                title={blockTitle(item.label)}
                                index={index}
                                total={favourites.length}
                                onMove={(from, to) =>
                                    setData({ ...data, favourites: swap(favourites, from, to) })
                                }
                                onRemove={() =>
                                    setData({
                                        ...data,
                                        favourites: favourites.filter((_, i) => i !== index),
                                    })
                                }
                            >
                                <Field label="Label">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => {
                                            const next = [...favourites];
                                            next[index] = { ...item, label: e.target.value };
                                            setData({ ...data, favourites: next });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Description (optional)">
                                    <input
                                        type="text"
                                        value={item.description || ""}
                                        onChange={(e) => {
                                            const next = [...favourites];
                                            next[index] = { ...item, description: e.target.value };
                                            setData({ ...data, favourites: next });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                            </Entry>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            favourites: [...favourites, { label: "", description: "" }],
                        })
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm favourite
                </Button>
                <SaveButton
                    saving={saving === "favourites"}
                    message={message.favourites || ""}
                    onSave={() => handleSave("favourites")}
                />
            </EditorSection>

            <EditorSection
                title="Coding Stories"
                hidden={isSectionHidden("stories")}
                onToggleHidden={() => toggleSectionHidden("stories")}
            >
                <StoryListEditor
                    items={data.stories || []}
                    onChange={(items) => setData({ ...data, stories: items })}
                />
                <SaveButton
                    saving={saving === "stories"}
                    message={message.stories || ""}
                    onSave={() => handleSave("stories")}
                />
            </EditorSection>

            <EditorSection
                title="Beyond Code Stories"
                hidden={isSectionHidden("beyondCode")}
                onToggleHidden={() => toggleSectionHidden("beyondCode")}
            >
                <Field label="Description">
                    <textarea
                        value={data.beyondCodeIntro || ""}
                        onChange={(e) => setData({ ...data, beyondCodeIntro: e.target.value })}
                        className={writingClass}
                        rows={6}
                    />
                </Field>
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
            </EditorSection>

            <EditorSection
                title="Personal Stories"
                hidden={isSectionHidden("personalStories")}
                onToggleHidden={() => toggleSectionHidden("personalStories")}
            >
                <Field label="Description">
                    <textarea
                        value={data.personalStoriesIntro || ""}
                        onChange={(e) => setData({ ...data, personalStoriesIntro: e.target.value })}
                        className={writingClass}
                        rows={6}
                    />
                </Field>
                <StoryListEditor
                    items={data.personalStories || []}
                    onChange={(items) => setData({ ...data, personalStories: items })}
                />
                <SaveButton
                    saving={saving === "personalStories"}
                    message={message.personalStories || ""}
                    onSave={() => handleSave("personalStories")}
                />
            </EditorSection>

            <EditorSection
                title="Achievements"
                hidden={isSectionHidden("achievements")}
                onToggleHidden={() => toggleSectionHidden("achievements")}
            >
                {data.achievements.length > 0 && (
                    <div>
                        {data.achievements.map((item, index) => (
                            <Entry
                                key={index}
                                title={blockTitle(item.title)}
                                index={index}
                                total={data.achievements.length}
                                onMove={(from, to) =>
                                    setData({
                                        ...data,
                                        achievements: swap(data.achievements, from, to),
                                    })
                                }
                                onRemove={() =>
                                    setData({
                                        ...data,
                                        achievements: data.achievements.filter((_, i) => i !== index),
                                    })
                                }
                            >
                                <div>
                                    <div className={labelClass}>Image</div>
                                    <ImageUpload
                                        value={item.imageUrl || ""}
                                        onChange={(url) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = { ...item, imageUrl: url };
                                            setData({ ...data, achievements });
                                        }}
                                        folder="achievements"
                                    />
                                </div>
                                <Field label="Title">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = { ...item, title: e.target.value };
                                            setData({ ...data, achievements });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Issuer">
                                    <input
                                        type="text"
                                        value={item.issuer}
                                        onChange={(e) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = { ...item, issuer: e.target.value };
                                            setData({ ...data, achievements });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Date">
                                    <input
                                        type="text"
                                        value={item.date}
                                        onChange={(e) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = { ...item, date: e.target.value };
                                            setData({ ...data, achievements });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Description (optional)">
                                    <textarea
                                        value={item.description || ""}
                                        onChange={(e) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = {
                                                ...item,
                                                description: e.target.value,
                                            };
                                            setData({ ...data, achievements });
                                        }}
                                        className={writingClass}
                                        rows={6}
                                    />
                                </Field>
                                <Field label="URL (optional)">
                                    <input
                                        type="text"
                                        value={item.url || ""}
                                        onChange={(e) => {
                                            const achievements = [...data.achievements];
                                            achievements[index] = { ...item, url: e.target.value };
                                            setData({ ...data, achievements });
                                        }}
                                        className={fieldClass}
                                        placeholder="https://..."
                                    />
                                </Field>
                            </Entry>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            achievements: [
                                ...data.achievements,
                                { title: "", issuer: "", date: "", description: "" },
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
            </EditorSection>

            <EditorSection
                title="Currently"
                hidden={isSectionHidden("currently")}
                onToggleHidden={() => toggleSectionHidden("currently")}
            >
                {data.currently.length > 0 && (
                    <div>
                        {data.currently.map((item, index) => (
                            <Entry
                                key={index}
                                title={blockTitle(item.label)}
                                index={index}
                                total={data.currently.length}
                                onMove={(from, to) =>
                                    setData({ ...data, currently: swap(data.currently, from, to) })
                                }
                                onRemove={() =>
                                    setData({
                                        ...data,
                                        currently: data.currently.filter((_, i) => i !== index),
                                    })
                                }
                            >
                                <Field label="Label">
                                    <input
                                        type="text"
                                        placeholder="e.g. Learning"
                                        value={item.label}
                                        onChange={(e) => {
                                            const currently = [...data.currently];
                                            currently[index] = { ...item, label: e.target.value };
                                            setData({ ...data, currently });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Value">
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => {
                                            const currently = [...data.currently];
                                            currently[index] = { ...item, value: e.target.value };
                                            setData({ ...data, currently });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                            </Entry>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            currently: [...data.currently, { label: "", value: "" }],
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
            </EditorSection>

            <EditorSection
                title="My Resumés"
                hidden={isSectionHidden("moreAndMore")}
                onToggleHidden={() => toggleSectionHidden("moreAndMore")}
            >
                {resumes.length > 0 && (
                    <div>
                        {resumes.map((group, groupIndex) => (
                            <ResumeGroupEditor
                                key={groupIndex}
                                group={group}
                                index={groupIndex}
                                total={resumes.length}
                                onChange={(next) => {
                                    const nextResumes = [...resumes];
                                    nextResumes[groupIndex] = next;
                                    setData({ ...data, resumes: nextResumes });
                                }}
                                onMove={(from, to) =>
                                    setData({ ...data, resumes: swap(resumes, from, to) })
                                }
                                onRemove={() =>
                                    setData({
                                        ...data,
                                        resumes: resumes.filter((_, i) => i !== groupIndex),
                                    })
                                }
                            />
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            resumes: [...resumes, { name: "", description: "", versions: [] }],
                        })
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm nhóm CV
                </Button>
                <SaveButton
                    saving={saving === "moreAndMore"}
                    message={message.moreAndMore || ""}
                    onSave={() => handleSave("moreAndMore")}
                />
            </EditorSection>

            <EditorSection
                title="What's Next"
                hidden={isSectionHidden("whatsNext")}
                onToggleHidden={() => toggleSectionHidden("whatsNext")}
            >
                {whatsNext.length > 0 && (
                    <div>
                        {whatsNext.map((item, index) => (
                            <Entry
                                key={index}
                                title={blockTitle(item.title)}
                                index={index}
                                total={whatsNext.length}
                                onMove={(from, to) =>
                                    setData({ ...data, whatsNext: swap(whatsNext, from, to) })
                                }
                                onRemove={() =>
                                    setData({
                                        ...data,
                                        whatsNext: whatsNext.filter((_, i) => i !== index),
                                    })
                                }
                            >
                                <Field label="Title">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            const next = [...whatsNext];
                                            next[index] = { ...item, title: e.target.value };
                                            setData({ ...data, whatsNext: next });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                                <Field label="Status">
                                    <select
                                        value={item.status}
                                        onChange={(e) => {
                                            const next = [...whatsNext];
                                            next[index] = {
                                                ...item,
                                                status: e.target.value as ExploreData["whatsNext"][number]["status"],
                                            };
                                            setData({ ...data, whatsNext: next });
                                        }}
                                        className={fieldClass}
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </Field>
                                <Field label="Description (optional)">
                                    <input
                                        type="text"
                                        value={item.description || ""}
                                        onChange={(e) => {
                                            const next = [...whatsNext];
                                            next[index] = { ...item, description: e.target.value };
                                            setData({ ...data, whatsNext: next });
                                        }}
                                        className={fieldClass}
                                    />
                                </Field>
                            </Entry>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className={textActionClass}
                    onClick={() =>
                        setData({
                            ...data,
                            whatsNext: [
                                ...whatsNext,
                                { title: "", status: "Planning", description: "" },
                            ],
                        })
                    }
                >
                    <Plus className="w-4 h-4" />
                    Thêm kế hoạch
                </Button>
                <SaveButton
                    saving={saving === "whatsNext"}
                    message={message.whatsNext || ""}
                    onSave={() => handleSave("whatsNext")}
                />
            </EditorSection>

            <EditorSection
                title="If You're Reading Closely"
                hidden={isSectionHidden("readingClosely")}
                onToggleHidden={() => toggleSectionHidden("readingClosely")}
            >
                <div className="divide-y divide-zinc-200">
                    <div className="pb-8">
                        <Field label="Lead paragraph (optional)">
                            <textarea
                                value={data.readingCloselyIntro || ""}
                                onChange={(e) =>
                                    setData({ ...data, readingCloselyIntro: e.target.value })
                                }
                                className={writingClass}
                                rows={6}
                                placeholder="2-3 câu giới thiệu cho người đọc kỹ..."
                            />
                        </Field>
                    </div>
                    <div className="space-y-5 py-8">
                        <h3 className="text-xl font-bold text-zinc-800">Impact / People</h3>
                        <ExploreItemListEditor
                            items={data.impactPeople || []}
                            onChange={(items) => setData({ ...data, impactPeople: items })}
                            folder="impact-people"
                            itemLabel="Story"
                        />
                    </div>
                    <div className="space-y-5 py-8">
                        <h3 className="text-xl font-bold text-zinc-800">Lessons / Failed</h3>
                        <ExploreItemListEditor
                            items={data.lessonsFailed || []}
                            onChange={(items) => setData({ ...data, lessonsFailed: items })}
                            folder="lessons-failed"
                            itemLabel="Lesson"
                        />
                    </div>
                    <div className="space-y-5 pt-8">
                        <h3 className="text-xl font-bold text-zinc-800">Off the Record</h3>
                        <ExploreItemListEditor
                            items={data.offTheRecord || []}
                            onChange={(items) => setData({ ...data, offTheRecord: items })}
                            folder="off-the-record"
                            itemLabel="Note"
                        />
                    </div>
                </div>
                <SaveButton
                    saving={saving === "readingClosely"}
                    message={message.readingClosely || ""}
                    onSave={() => handleSave("readingClosely")}
                />
            </EditorSection>
        </div>
    );
}
