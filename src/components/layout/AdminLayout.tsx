import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion } from "motion/react";
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-sm mx-auto"
        >
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
                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đăng nhập"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-sm mx-auto text-center space-y-4"
            >
                <div className="w-16 h-16 mx-auto bg-red-100 border-2 border-black rounded-lg flex items-center justify-center">
                    <ShieldX className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold">Không có quyền truy cập</h2>
                <p className="text-sm text-zinc-600">
                    Tài khoản của bạn không được phép truy cập trang admin.
                </p>
                <Button variant="noShadow" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Admin Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Admin Panel</h2>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{user.email}</span>
                    <span className="text-zinc-300">|</span>
                    <button
                        onClick={signOut}
                        className="text-blue-500 font-medium hover:underline"
                    >
                        Đăng xuất
                    </button>
                </div>
            </motion.section>

            {/* Admin Nav — styled like skill items */}
            <motion.nav
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex gap-2 sm:gap-3"
            >
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold border-2 border-black rounded-lg transition-all duration-150 ${
                                isActive
                                    ? "bg-blue-300 shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                                    : "bg-white hover:bg-blue-100"
                            }`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
            </motion.nav>

            {/* Section Divider */}
            <div className="border-t-2 border-black"></div>

            {/* Page Content */}
            <Outlet />
        </div>
    );
}
