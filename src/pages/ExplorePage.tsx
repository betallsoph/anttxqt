import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "motion/react";
import { X, ExternalLink, ArrowRight, ChevronDown } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { useExploreData, type ExploreData, type ExploreItem, type ResumeGroup, type ResumeVersion } from "@/hooks/useExploreData";
import { formatExternalUrl } from "@/hooks/useProjectsData";

type Achievement = ExploreData["achievements"][number];
type Story = ExploreData["stories"][number];

function ComingSoon() {
    return (
        <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-zinc-400 font-medium">Coming soon</p>
        </div>
    );
}

function StoryList({
    items,
    action,
    onOpen,
}: {
    items: { title: string }[];
    action: string;
    onOpen: (index: number) => void;
}) {
    if (items.length === 0) return <ComingSoon />;

    return (
        <div className="border-t-2 border-black/10">
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => onOpen(index)}
                    className="w-full flex items-center justify-between py-3.5 sm:py-4 border-b-2 border-black/10 hover:border-black transition-colors duration-200 group text-left cursor-pointer"
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <span className="text-xs sm:text-sm font-mono text-zinc-400 font-bold flex-shrink-0 w-6">
                            {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-blue-500 transition-colors">
                            {item.title}
                        </h3>
                    </div>
                    <div className="relative flex items-center justify-end text-xs font-bold text-zinc-400 ml-3 flex-shrink-0 w-36 h-5 overflow-hidden">
                        <ArrowRight className="absolute right-[114px] w-4 h-4 text-zinc-400 transition-all duration-300 ease-out group-hover:text-blue-500 group-hover:translate-x-[114px]" />
                        <span className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:translate-x-8 text-right">
                            {action}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}

function resumeSlug(name: string) {
    const slug = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || "resume";
}

function resumeFileName(url: string) {
    const last = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
    return last.replace(/^\d+-/, "") || "resume.pdf";
}

function resumeFileSlug(url: string) {
    const last = decodeURIComponent(url.split("?")[0].split("/").pop() || "");
    const bare = last.replace(/^\d+-/, "").replace(/\.pdf$/i, "");
    return bare ? resumeSlug(bare) : "";
}

const previewButtonClass =
    "group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-black border-2 border-black rounded-lg shadow-[1px_1px_0_#000] active:translate-y-px active:translate-x-px active:shadow-none transition-all duration-200 cursor-pointer";

function resumePreviewSrc(href: string): string | null {
    const bucket = import.meta.env.VITE_R2_PUBLIC_URL;
    if (!bucket) return null;
    try {
        const file = new URL(href);
        const origin = new URL(bucket);
        if (file.origin !== origin.origin) return null;
        return `/pdf-proxy${file.pathname}${file.search}`;
    } catch {
        return null;
    }
}

function ResumePreviewModal({
    title,
    url,
    onClose,
}: {
    title: string;
    url: string;
    onClose: () => void;
}) {
    const href = formatExternalUrl(url);
    const downloadHref = href ? resumePreviewSrc(href) ?? href : undefined;
    const stageRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        const pages = pagesRef.current;
        const stage = stageRef.current;
        if (!href || !pages || !stage) return;

        const src = resumePreviewSrc(href);
        if (!src) {
            setStatus("error");
            return;
        }

        let cancelled = false;
        const renders: { cancel: () => void }[] = [];
        let destroyTask: (() => Promise<void>) | null = null;
        setStatus("loading");
        setPageCount(0);
        setCurrentPage(1);
        pages.replaceChildren();

        (async () => {
            const pdfjs = await import("pdfjs-dist");
            const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
            pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

            const task = pdfjs.getDocument({ url: src });
            destroyTask = () => task.destroy();
            const pdf = await task.promise;
            if (cancelled) return;

            const pageWidth = Math.max(280, stage.clientWidth - 16);
            for (let index = 1; index <= pdf.numPages; index += 1) {
                if (cancelled) return;
                const page = await pdf.getPage(index);
                const base = page.getViewport({ scale: 1 });
                const viewport = page.getViewport({ scale: pageWidth / base.width });
                const canvas = document.createElement("canvas");
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.floor(viewport.width * dpr);
                canvas.height = Math.floor(viewport.height * dpr);
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;
                canvas.className = "block max-w-full h-auto bg-white";

                const sheet = document.createElement("div");
                sheet.dataset.page = String(index);
                sheet.hidden = index !== 1;
                sheet.className = "border-2 border-black bg-white";
                sheet.appendChild(canvas);
                pages.appendChild(sheet);

                const render = page.render({
                    canvas,
                    viewport,
                    transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
                });
                renders.push(render);
                await render.promise;
            }
            if (!cancelled) {
                setPageCount(pdf.numPages);
                setStatus("ready");
            }
        })().catch((error: unknown) => {
            if (cancelled) return;
            console.error(error);
            setStatus("error");
        });

        return () => {
            cancelled = true;
            renders.forEach((render) => render.cancel());
            void destroyTask?.();
        };
    }, [href]);

    useEffect(() => {
        const pages = pagesRef.current;
        if (!pages) return;
        pages.querySelectorAll<HTMLElement>("[data-page]").forEach((sheet) => {
            sheet.hidden = sheet.dataset.page !== String(currentPage);
        });
    }, [currentPage, status]);

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
                onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex h-[min(94vh,980px)] w-full max-w-5xl flex-col bg-white border-2 border-black rounded-lg overflow-hidden"
                >
                    <div className="shrink-0 flex items-center justify-between gap-3 border-b-2 border-black px-3 py-1.5">
                        <h3 className="font-bold text-sm truncate min-w-0">{title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                            {href && (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${previewButtonClass} bg-blue-100`}
                                >
                                    Open in a new tab
                                    <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:translate-x-1" />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${previewButtonClass} bg-white`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div ref={stageRef} className="min-h-0 flex-1 overflow-auto bg-zinc-100">
                        <div className="flex min-h-full flex-col items-center px-2 py-2">
                            <div ref={pagesRef} className="flex w-full flex-col items-center" />
                            {status === "loading" && (
                                <p className="my-auto text-sm font-medium text-zinc-500">Đang mở…</p>
                            )}
                            {status === "error" && (
                                <p className="my-auto text-sm font-medium text-zinc-500">Không mở được bản xem trước.</p>
                            )}
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-between gap-3 border-t-2 border-black px-3 py-1.5">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-zinc-700 shrink-0">page:</span>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: pageCount }, (_, index) => {
                                    const page = index + 1;
                                    const selected = page === currentPage;
                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-6 h-6 rounded-full border-2 border-black text-[11px] font-bold cursor-pointer ${
                                                selected
                                                    ? "bg-blue-300 text-black"
                                                    : "bg-zinc-200 text-zinc-500"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 min-w-0">
                            <p className="font-vietnamese text-[11px] sm:text-xs font-medium text-blue-500 leading-snug text-right">
                                *Để xem các liên kết trong CV, bạn chọn xem bằng trang mới ở trên hoặc tải về nha.
                            </p>
                            {downloadHref && (
                                <a
                                    href={downloadHref}
                                    download={resumeFileName(href || downloadHref)}
                                    className={`${previewButtonClass} bg-white shrink-0`}
                                >
                                    Download
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body,
    );
}

function ResumeGroupRow({
    group,
    onOpen,
}: {
    group: ResumeGroup;
    onOpen: (version: ResumeVersion) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const newest = group.versions?.[0];
    const older = group.versions?.slice(1) || [];

    const openPreview = (version: ResumeVersion) => {
        if (!version?.url) return;
        onOpen(version);
    };

    return (
        <>
        <div
            role={newest ? "button" : undefined}
            tabIndex={newest ? 0 : undefined}
            onClick={newest ? () => openPreview(newest) : undefined}
            onKeyDown={
                newest
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openPreview(newest);
                          }
                      }
                    : undefined
            }
            className={`border-2 border-black rounded-lg bg-white p-3.5 sm:p-4 space-y-3 transition-colors ${
                newest ? "hover:bg-blue-50 cursor-pointer" : ""
            }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h4 className="font-bold text-sm sm:text-base text-zinc-950">{group.name}</h4>
                    {group.description && (
                        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{group.description}</p>
                    )}
                    {newest ? (
                        <p className="text-xs text-zinc-400 mt-0.5">nhấn vào để xem</p>
                    ) : (
                        <p className="text-xs text-zinc-400 italic mt-0.5">Chưa có file</p>
                    )}
                </div>

                {older.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-100 border-2 border-black rounded text-zinc-900 cursor-pointer"
                        >
                            {expanded ? "Hide history" : `History (${older.length})`}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                )}
            </div>

            {expanded && older.length > 0 && (
                <div
                    className="pt-3 border-t-2 border-dashed border-black/20 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Older Versions</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {older.map((ver, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => openPreview(ver)}
                                className="flex items-center justify-between p-2 text-xs border-2 border-black rounded bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
                            >
                                <span className="font-semibold">ver {ver.versionName}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </>
    );
}

function ExploreItemModal({
    item,
    onClose,
}: {
    item: ExploreItem;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-black/40" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-auto max-w-3xl min-w-[300px] sm:min-w-[500px] max-h-[90vh] flex flex-col bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden"
                >
                    {item.imageUrl && (
                        <div className="flex-1 shrink min-h-0 w-full border-b-2 border-black bg-white flex items-center justify-center">
                            <ImageWithLoader
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full max-h-[70vh]"
                                imgClassName="object-contain"
                            />
                        </div>
                    )}

                    <div className="shrink-0 w-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 max-h-[70vh]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="font-bold text-lg sm:text-2xl">
                                    {item.title}
                                </h3>
                                {item.since && (
                                    <div className="mt-1.5">
                                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-300 font-medium">
                                            since {item.since}
                                        </span>
                                    </div>
                                )}
                                {item.summary && (
                                    <p className="text-sm sm:text-base text-zinc-500 mt-1">
                                        {item.summary}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {item.story && (
                            <div className="space-y-2 pt-1">
                                <h4 className="text-xs sm:text-sm font-bold text-blue-600">
                                    The Backstory
                                </h4>
                                <div className="space-y-3">
                                    {item.story.split("\n").map((paragraph, idx) => {
                                        if (!paragraph.trim()) {
                                            return <div key={idx} className="h-2" />;
                                        }
                                        return (
                                            <p key={idx} className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                                                {paragraph}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function StoryModal({
    story,
    onClose,
}: {
    story: Story;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-black/40" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-auto max-w-3xl min-w-[300px] sm:min-w-[500px] max-h-[90vh] flex flex-col bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden"
                >
                    <div className="shrink-0 w-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 max-h-[80vh]">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-lg sm:text-2xl min-w-0">
                                {story.title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {story.content && (
                            <div className="space-y-3 pt-1">
                                {story.content.split("\n").map((paragraph, idx) => {
                                    if (!paragraph.trim()) {
                                        return <div key={idx} className="h-2" />;
                                    }
                                    return (
                                        <p key={idx} className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    );
                                })}
                            </div>
                        )}

                        {story.topics && story.topics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                                {story.topics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="text-[10px] sm:text-xs font-medium text-zinc-500 hover:text-black transition-colors duration-200 break-words"
                                    >
                                        #{topic.toLowerCase().replace(/\s+/g, "-")}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function ExploreGrid({
    items,
    onSelect,
}: {
    items: ExploreItem[];
    onSelect: (item: ExploreItem) => void;
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(item)}
                    className="text-left border-2 border-black rounded-lg bg-white p-3 sm:p-4 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex flex-col"
                >
                    <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-1">
                        {item.title}
                    </h3>
                    {item.summary && (
                        <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 mb-2 flex-1">
                            {item.summary}
                        </p>
                    )}
                    {item.since && (
                        <span className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-auto">
                            since {item.since}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

function AchievementModal({
    item,
    onClose,
}: {
    item: Achievement;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-auto max-w-3xl min-w-[300px] sm:min-w-[500px] max-h-[90vh] flex flex-col bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden"
                >
                    {/* Image */}
                    {item.imageUrl && (
                        <div className="flex-1 shrink min-h-0 w-full border-b-2 border-black bg-white flex items-center justify-center">
                            <ImageWithLoader
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full max-h-[70vh]"
                                imgClassName="object-contain"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="shrink-0 w-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 max-h-[70vh]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-lg sm:text-2xl">
                                        {item.title}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-300 font-medium">
                                        {item.date}
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-zinc-500 mt-1">
                                    {item.issuer}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {item.description && (
                            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                {item.description}
                            </p>
                        )}

                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-500 font-medium hover:underline"
                            >
                                View credential
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function CollapsibleMoreSection({
    data,
    isSectionHidden,
    setSelectedExploreItem,
}: {
    data: ExploreData;
    isSectionHidden: (sectionName: string) => boolean;
    setSelectedExploreItem: (item: ExploreItem) => void;
}) {
    const [isMoreExpanded, setIsMoreExpanded] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const containerRef = useRef<HTMLButtonElement>(null);
    const isInView = useInView(containerRef, {
        once: false,
        margin: "0px 0px -120px 0px"
    });

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="space-y-6 sm:space-y-8"
        >
            <button
                ref={containerRef}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                onClick={() => setIsMoreExpanded(!isMoreExpanded)}
                className="w-full flex items-center justify-between text-left border-b-2 border-black pb-2 mb-4 group cursor-pointer focus:outline-none"
            >
                <span className="relative isolate inline-block">
                    <span className="text-xl sm:text-2xl font-bold">
                        More & More
                    </span>
                    <svg
                        viewBox="0 0 100 12"
                        preserveAspectRatio="none"
                        className="absolute bottom-0.5 left-0 right-0 h-[75%] w-full -z-10 pointer-events-none"
                    >
                        <motion.path
                            d="M 1,5 C 30,3 70,3 99,5 C 70,9 30,9 5,10 C 35,10 70,9 95,8"
                            fill="none"
                            stroke="rgba(191, 219, 254, 0.8)"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: isInView ? 1 : 0 }}
                            transition={{ duration: 0.85, ease: [0.47, 0, 0.745, 0.715], delay: isInView ? 0.15 : 0 }}
                        />
                    </svg>
                </span>
                <motion.div
                    animate={{
                        rotate: isButtonHovered
                            ? (isMoreExpanded ? [180, 160, 200, 160, 200, 170, 190, 180] : [0, -20, 20, -20, 20, -10, 10, 0])
                            : (isMoreExpanded ? 180 : 0),
                        color: isButtonHovered ? "#2563eb" : "#71717a"
                    }}
                    transition={{
                        rotate: {
                            duration: isButtonHovered ? 0.6 : 0.35,
                            ease: "easeInOut"
                        },
                        color: {
                            duration: 0.2
                        }
                    }}
                    className="flex items-center justify-center"
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </button>
            
            <motion.div
                initial={false}
                animate={{
                    height: isMoreExpanded ? "auto" : 0,
                    opacity: isMoreExpanded ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
            >
                <div className="space-y-6 divide-y divide-black/10">
                    {/* Currently — tạm ẩn, mở lại khi có nội dung
                    {!isSectionHidden("currently") && (
                        <div className="space-y-3 pt-6 first:pt-0">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900">Currently</h3>
                            {data.currently.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                    {data.currently.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white"
                                        >
                                            <span className="text-xs sm:text-sm font-bold text-zinc-900 bg-blue-200 px-2 py-0.5 rounded border border-black flex-shrink-0">
                                                {item.label}
                                            </span>
                                            <span className="text-sm sm:text-base text-zinc-700">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ComingSoon />
                            )}
                        </div>
                    )}
                    */}

                    {/* Favourites */}
                    {!isSectionHidden("favourites") && (
                        <div className="space-y-3 pt-6 first:pt-0">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900">Favourites</h3>
                            {data.favourites && data.favourites.length > 0 ? (
                                <div className="space-y-1.5">
                                    {data.favourites.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 sm:gap-3 py-1"
                                        >
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            <div className="min-w-0">
                                                <span className="font-medium text-sm sm:text-base text-zinc-900">
                                                    {item.label}
                                                </span>
                                                {item.description && (
                                                    <span className="text-zinc-500 text-xs sm:text-sm hidden sm:inline">
                                                        {" "}— {item.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ComingSoon />
                            )}
                        </div>
                    )}

                    {/* What's Next — tạm ẩn, mở lại khi có nội dung
                    {!isSectionHidden("whatsNext") && (
                        <div className="space-y-3 pt-6 first:pt-0">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900">What's Next</h3>
                            {data.whatsNext && data.whatsNext.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.whatsNext.map((item, index) => (
                                        <div key={index} className="border-2 border-black rounded-lg bg-white p-3 sm:p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm sm:text-base">{item.title}</h4>
                                                <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 border rounded ${
                                                    item.status === 'Done' ? 'bg-green-200 border-green-400 text-green-800' :
                                                    item.status === 'In Progress' ? 'bg-blue-200 border-blue-400 text-blue-800' :
                                                    'bg-zinc-100 border-zinc-300 text-zinc-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            {item.description && <p className="text-xs sm:text-sm text-zinc-500 whitespace-pre-wrap">{item.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ComingSoon />
                            )}
                        </div>
                    )}
                    */}

                    {/* If You're Reading Closely */}
                    {!isSectionHidden("readingClosely") && (
                        <div className="space-y-3 pt-6 first:pt-0">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900">If You're Reading Closely</h3>
                            {data.readingCloselyIntro && (
                                <p className="text-sm sm:text-base text-zinc-600 whitespace-pre-wrap mb-4 italic">
                                    {data.readingCloselyIntro}
                                </p>
                            )}
                            <div className="space-y-5 sm:space-y-6">
                                {/* Impact / People */}
                                <div>
                                    <h4 className="text-sm sm:text-base font-bold text-blue-600 mb-2 sm:mb-3">
                                        Impact / People
                                    </h4>
                                    {data.impactPeople && data.impactPeople.length > 0 ? (
                                        <ExploreGrid
                                            items={data.impactPeople}
                                            onSelect={setSelectedExploreItem}
                                        />
                                    ) : (
                                        <ComingSoon />
                                    )}
                                </div>

                                {/* Lessons / Failed */}
                                <div>
                                    <h4 className="text-sm sm:text-base font-bold text-blue-600 mb-2 sm:mb-3">
                                        Lessons / Failed
                                    </h4>
                                    {data.lessonsFailed && data.lessonsFailed.length > 0 ? (
                                        <ExploreGrid
                                            items={data.lessonsFailed}
                                            onSelect={setSelectedExploreItem}
                                        />
                                    ) : (
                                        <ComingSoon />
                                    )}
                                </div>

                                {/* Off the Record */}
                                <div>
                                    <h4 className="text-sm sm:text-base font-bold text-blue-600 mb-2 sm:mb-3">
                                        Off the Record
                                    </h4>
                                    {data.offTheRecord && data.offTheRecord.length > 0 ? (
                                        <ExploreGrid
                                            items={data.offTheRecord}
                                            onSelect={setSelectedExploreItem}
                                        />
                                    ) : (
                                        <ComingSoon />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.section>
    );
}

export function ExplorePage() {
    const { data, loading, error, missing, retry } = useExploreData();
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedAchievement, setSelectedAchievement] =
        useState<Achievement | null>(null);
    const [selectedExploreItem, setSelectedExploreItem] =
        useState<ExploreItem | null>(null);
    const [selectedStory, setSelectedStory] =
        useState<Story | null>(null);


    const isSectionHidden = (sectionName: string) => {
        return (data.hiddenSections || []).includes(sectionName);
    };

    const requestedVersion = searchParams.get("version");
    let resumeGroup: ResumeGroup | undefined;
    let resumeVersion: ResumeVersion | undefined;
    if (slug) {
        for (const group of data.resumes || []) {
            const file = group.versions?.find(
                (version) => version.url && resumeFileSlug(version.url) === slug,
            );
            if (file) {
                resumeGroup = group;
                resumeVersion = file;
                break;
            }
        }
        if (!resumeVersion) {
            resumeGroup = (data.resumes || []).find((group) => resumeSlug(group.name) === slug);
            resumeVersion = requestedVersion
                ? resumeGroup?.versions?.find((version) => version.versionName === requestedVersion)
                : resumeGroup?.versions?.[0];
            if (!resumeVersion?.url) resumeVersion = resumeGroup?.versions?.[0];
        }
    }
    const isNewest = Boolean(
        resumeGroup && resumeVersion?.url && resumeGroup.versions?.[0]?.url === resumeVersion.url,
    );
    const resumePreview = resumeGroup && resumeVersion?.url
        ? {
            title: !isNewest && resumeVersion.versionName
                ? `${resumeGroup.name} — ver ${resumeVersion.versionName}`
                : resumeGroup.name,
            url: resumeVersion.url,
        }
        : null;

    const openResume = (_group: ResumeGroup, version: ResumeVersion) => {
        const fileSlug = version.url ? resumeFileSlug(version.url) : "";
        if (!fileSlug) return;
        navigate(`/explore/resume/${fileSlug}`);
    };

    const closeResume = () => {
        navigate("/explore", { replace: true });
    };

    useEffect(() => {
        if (loading || error || missing || !slug) return;
        if (!resumeVersion?.url) {
            navigate("/explore", { replace: true });
            return;
        }
        const fileSlug = resumeFileSlug(resumeVersion.url);
        if (fileSlug && fileSlug !== slug) {
            navigate(`/explore/resume/${fileSlug}`, { replace: true });
        }
    }, [loading, error, missing, slug, resumeVersion?.url, navigate]);

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    if (error) {
        return <ErrorScreen onRetry={retry} />;
    }

    if (missing) {
        return (
            <ErrorScreen
                title="This content no longer exists"
                message="The Explore page has been removed."
            />
        );
    }

    return (
        <div className="space-y-12 sm:space-y-16">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                    {data.intro.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 whitespace-pre-wrap">
                    {data.intro.description}
                </p>
            </motion.section>

            {/* Coding Stories */}
            {!isSectionHidden("stories") && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Coding Stories
                    </h2>
                    <StoryList
                        items={data.stories || []}
                        action="read the story"
                        onOpen={(index) => setSelectedStory(data.stories[index])}
                    />
                </motion.section>
            )}

            {/* Beyond Code Stories */}
            {!isSectionHidden("beyondCode") && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Beyond Code Stories
                    </h2>
                    <StoryList
                        items={data.beyondCode || []}
                        action="dive into my story"
                        onOpen={(index) => setSelectedExploreItem(data.beyondCode[index])}
                    />
                </motion.section>
            )}

            {/* Personal Stories */}
            {!isSectionHidden("personalStories") && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Personal Stories
                    </h2>
                    <StoryList
                        items={data.personalStories || []}
                        action="read the story"
                        onOpen={(index) => setSelectedStory(data.personalStories[index])}
                    />
                </motion.section>
            )}

            {/* My Resumé */}
            {!isSectionHidden("moreAndMore") && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        My Resumé
                    </h2>
                    {data.resumes && data.resumes.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {data.resumes.map((group, index) => (
                                <ResumeGroupRow
                                    key={index}
                                    group={group}
                                    onOpen={(version) => openResume(group, version)}
                                />
                            ))}
                        </div>
                    ) : (
                        <ComingSoon />
                    )}
                </motion.section>
            )}

            {/* Achievements */}
            {data.achievements.length > 0 && !isSectionHidden("achievements") && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Achievements
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                        {data.achievements.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedAchievement(item)}
                                className="w-full flex items-center justify-between p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white transition-all duration-200 group text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-blue-500 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                                <div className="relative flex items-center justify-end text-xs font-bold text-zinc-400 ml-3 flex-shrink-0 w-16 h-5 overflow-hidden">
                                    <ArrowRight className="absolute -left-6 opacity-0 w-4 h-4 text-zinc-400 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:text-blue-500 group-hover:translate-x-[72px]" />
                                    <span className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:translate-x-8 text-right">
                                        {item.date}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* More & More Grouped Section */}
            {(!isSectionHidden("favourites") || !isSectionHidden("readingClosely")) && (
                <CollapsibleMoreSection
                    data={data}
                    isSectionHidden={isSectionHidden}
                    setSelectedExploreItem={setSelectedExploreItem}
                />
            )}

            {resumePreview && (
                <ResumePreviewModal
                    key={resumePreview.url}
                    title={resumePreview.title}
                    url={resumePreview.url}
                    onClose={closeResume}
                />
            )}

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <AchievementModal
                    item={selectedAchievement}
                    onClose={() => setSelectedAchievement(null)}
                />
            )}

            {/* Explore Item Detail Modal */}
            {selectedExploreItem && (
                <ExploreItemModal
                    item={selectedExploreItem}
                    onClose={() => setSelectedExploreItem(null)}
                />
            )}

            {/* Story Detail Modal */}
            {selectedStory && (
                <StoryModal
                    story={selectedStory}
                    onClose={() => setSelectedStory(null)}
                />
            )}
        </div>
    );
}

export default ExplorePage;
