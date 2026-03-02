import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToR2 } from "@/lib/r2";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    folder = "images",
    className = "",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Chỉ chấp nhận file ảnh.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File quá lớn (tối đa 5MB).");
            return;
        }

        setUploading(true);
        setError("");
        try {
            const url = await uploadToR2(file, folder);
            onChange(url);
        } catch {
            setError("Upload thất bại. Thử lại.");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className={className}>
            {value ? (
                <div className="relative inline-block">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-black"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-black"
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
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Đang upload..." : "Chọn ảnh"}
                </Button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
