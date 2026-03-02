import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogOut, Loader2, ShieldX, Home, FolderOpen, Compass } from "lucide-react";

const ALLOWED_EMAILS = [
    "hugoddt1234.50@gmail.com",
    "tranthienann228@gmail.com",
    "tranthienan12a1ts2022@gmail.com",
];

const navItems = [
    { to: "/admin/home", label: "Home", icon: Home },
    { to: "/admin/projects", label: "Projects", icon: FolderOpen },
    { to: "/admin/explore", label: "Explore", icon: Compass },
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
                            <label className="block text-sm font-bold mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đăng nhập"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export function AdminLayout() {
    const { user, loading, signOut } = useAuth();

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

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 hidden sm:inline">{user.email}</span>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </Button>
                </div>
            </div>

            {/* Admin Nav */}
            <nav className="flex gap-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 border-black rounded-lg transition-all ${
                                isActive
                                    ? "bg-blue-300 shadow-secondary"
                                    : "bg-white hover:bg-blue-100"
                            }`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Page Content */}
            <Outlet />
        </div>
    );
}
