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
        <div className={className}>
            {value ? (
                <div className="relative inline-flex items-center gap-2 px-3 py-2 border-2 border-black rounded-lg bg-zinc-50 pr-8">
                    <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium max-w-[200px] truncate" title={getFileName(value)}>
                        {getFileName(value)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-black cursor-pointer"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="border border-zinc-300 hover:border-black"
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
            {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
        </div>
    );
}
