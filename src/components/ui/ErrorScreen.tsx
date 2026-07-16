import { Link } from "react-router-dom";

interface ErrorScreenProps {
    title?: string;
    message?: string;
    // Omit to show a "Back home" link instead of a retry button.
    onRetry?: () => void;
}

const actionClass =
    "mt-2 inline-block px-4 py-2 font-bold text-black border-2 border-black rounded-lg bg-white shadow-secondary active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150";

export function ErrorScreen({ onRetry, title, message }: ErrorScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h2 className="text-xl sm:text-2xl font-bold">
                {title ?? "Couldn't load this page"}
            </h2>
            <p className="max-w-md text-sm sm:text-base text-zinc-600">
                {message ?? "The server took too long to respond. Check your connection and try again."}
            </p>
            {onRetry ? (
                <button type="button" onClick={onRetry} className={actionClass}>
                    Try again
                </button>
            ) : (
                <Link to="/" className={actionClass}>
                    Back home
                </Link>
            )}
        </div>
    );
}

export default ErrorScreen;
