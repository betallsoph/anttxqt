import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTapBounce } from "@/hooks/useTapBounce";
import { ALLOWED_ADMIN_EMAILS } from "@/lib/admin-config";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const navItems = [
    { to: "/admin/home", label: "Home" },
    { to: "/admin/projects", label: "Projects" },
    { to: "/admin/playground", label: "Playground" },
    { to: "/admin/explore", label: "Explore" },
    { to: "/admin/notes", label: "Notes" },
    { to: "/admin/planner", label: "Planner" },
];

const fieldClass = "w-full bg-zinc-50 px-4 py-3 text-base text-zinc-700 rounded-md focus:bg-white focus:outline-none";
const saveButtonClass =
    "inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-100 px-4 py-3 text-base font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-50";

function LoginForm() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
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
        <div data-tap-zone="plain" className="max-w-md text-zinc-700">
            <h1 className="text-2xl font-semibold text-zinc-800">Admin Login</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-600" htmlFor="admin-email">
                        Email
                    </label>
                    <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass}
                        required
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-600" htmlFor="admin-password">
                        Password
                    </label>
                    <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={fieldClass}
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className={saveButtonClass}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}

export function AdminLayout() {
    const { user, loading, signOut } = useAuth();
    useTapBounce(Boolean(user));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <LoginForm />;
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(user.email || "")) {
        return (
            <div data-tap-zone="plain" className="max-w-md space-y-3 text-zinc-700">
                <h1 className="text-2xl font-semibold text-zinc-800">Không có quyền truy cập</h1>
                <p className="text-base text-zinc-600">
                    Tài khoản của bạn không được phép truy cập trang admin.
                </p>
                <button type="button" onClick={signOut} className="text-base text-zinc-700">
                    Đăng xuất
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 text-zinc-700">
            <header data-tap-zone="plain" className="space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h1 className="text-2xl font-semibold text-zinc-800">Admin</h1>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span>{user.email}</span>
                        <button type="button" onClick={signOut} className="text-zinc-700">
                            Đăng xuất
                        </button>
                    </div>
                </div>
                <nav aria-label="Admin sections">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {navItems.map(({ to, label }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        cn(
                                            "text-base",
                                            isActive
                                                ? "font-medium text-zinc-800"
                                                : "text-zinc-500 hover:text-zinc-800"
                                        )
                                    }
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>
            <Outlet />
        </div>
    );
}
