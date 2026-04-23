import { ChevronUp, ChevronDown } from "lucide-react";

export function swap<T>(arr: T[], i: number, j: number): T[] {
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
}

export function MoveButtons({
    index,
    total,
    onMove,
}: {
    index: number;
    total: number;
    onMove: (from: number, to: number) => void;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <button
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                className="w-6 h-5 flex items-center justify-center rounded hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
                disabled={index === total - 1}
                onClick={() => onMove(index, index + 1)}
                className="w-6 h-5 flex items-center justify-center rounded hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronDown className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
