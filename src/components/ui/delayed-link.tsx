import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DelayedLinkProps {
    to: string;
    delay?: number;
    className?: string;
    children: React.ReactNode;
}

export function DelayedLink({
    to,
    delay = 150,
    className,
    children
}: DelayedLinkProps) {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setTimeout(() => {
            navigate(to);
        }, delay);
    };

    return (
        <a
            href={to}
            onClick={handleClick}
            className={cn(className)}
        >
            {children}
        </a>
    );
}

export default DelayedLink;
