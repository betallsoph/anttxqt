import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToR2 } from "@/lib/r2";

interface PdfUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
}

export function PdfUpload({
    value,
    onChange,
    folder = "resumes",
    className = "",
}: PdfUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
            setError("Chỉ chấp nhận file PDF.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // Max 10MB
            setError("File quá lớn (tối đa 10MB).");
            return;
        }

        setUploading(true);
        setError("");
        try {
            const url = await uploadToR2(file, folder);
            onChange(url);
        } catch (err) {
            console.error("R2 Upload Error:", err);
            setError("Upload thất bại. Thử lại.");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const getFileName = (url: string) => {
        try {
            const decoded = decodeURIComponent(url);
            const parts = decoded.split("/");
            const lastPart = parts[parts.length - 1];
            // Remove timestamp prefix e.g. "1712345678-file.pdf"
            return lastPart.replace(/^\d+-/, "");
        } catch {
            return "Resume.pdf";
        }
    };

    return (
        <div className={`min-w-0 max-w-full ${className}`}>
            {value ? (
                <div className="flex w-full min-w-0 items-start gap-2 rounded-md bg-zinc-50 px-3 py-2.5">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <span
                        className="min-w-0 flex-1 break-words text-base font-medium text-zinc-700 [overflow-wrap:anywhere]"
                        title={getFileName(value)}
                    >
                        {getFileName(value)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                        aria-label="Xóa file PDF"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline"
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Đang upload..." : "Chọn file PDF"}
                </Button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                className="hidden"
            />
            {error && <p className="mt-1.5 text-sm font-semibold text-red-600">{error}</p>}
        </div>
    );
}
