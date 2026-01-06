import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Home", path: "/" },
    { label: "Projects", path: "/projects" },
    { label: "Explore", path: "/explore" },
];

export function Header() {
    return (
        <header className="w-full py-6 sm:py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                {/* Avatar */}
                <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-3 sm:border-4 border-black shadow-primary overflow-hidden bg-blue-200">
                        <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-black">
                            AT
                        </div>
                    </div>
                </div>

                {/* Name - centered */}
                <h1 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 text-center">An Tran</h1>

                {/* Navigation - centered */}
                <nav className="flex items-center justify-center gap-3 sm:gap-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "text-sm sm:text-base font-medium transition-all duration-200",
                                    isActive
                                        ? "text-black font-semibold"
                                        : "text-zinc-500 hover:text-black"
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}

export default Header;
