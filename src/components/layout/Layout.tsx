import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

export function Layout() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");
    const widthClass = isAdmin ? "max-w-6xl px-6 sm:px-8" : "max-w-2xl px-5 sm:px-6";

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Interactive Grid Background */}
            <InteractiveGridPattern
                className="fixed inset-0 -z-10 opacity-50"
                squaresClassName="hover:fill-blue-200/30"
                width={50}
                height={50}
                squares={[40, 30]}
            />

            {/* Gradient Overlay for better readability */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/60 to-white/80 pointer-events-none" />

            {!isAdmin && <Header />}

            <main className="flex-1">
                <div className={`${widthClass} mx-auto py-6 sm:py-8`}>
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Layout;
