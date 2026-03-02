import { motion } from "motion/react";
import {
    Rocket,
    CheckCircle,
    Star,
    Zap,
    Heart,
    Code,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DelayedLink } from "@/components/ui/delayed-link";
import { useHomepageData } from "@/hooks/useHomepageData";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    Rocket,
    CheckCircle,
    Star,
    Zap,
    Heart,
    Code,
};

export function HomePage() {
    const { data, loading } = useHomepageData();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Hero Section - Left aligned */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                    {data.hero.greeting}
                </h2>
                {data.hero.bio.map((paragraph, index) => (
                    <p
                        key={index}
                        className={`text-base sm:text-lg text-zinc-700 leading-relaxed ${index > 0 ? "mt-3 sm:mt-4" : ""}`}
                    >
                        {index === 0 ? (
                            <>
                                I'm{" "}
                                <strong className="text-black">
                                    {data.hero.name}
                                </strong>
                                , {paragraph}
                            </>
                        ) : (
                            paragraph
                        )}
                    </p>
                ))}
                <p className="text-base sm:text-lg text-zinc-700 leading-relaxed mt-3 sm:mt-4">
                    Contact me at{" "}
                    <a
                        href={`mailto:${data.hero.email}`}
                        className="text-blue-500 font-semibold hover:underline"
                    >
                        {data.hero.email}
                    </a>
                    .
                </p>
            </motion.section>

            {/* Featured Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-t-2 border-black pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Products
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 mb-3 sm:mb-4">
                    Here are some of my production projects. Visit the{" "}
                    <Link
                        to="/projects"
                        className="text-blue-500 font-semibold hover:underline"
                    >
                        projects page
                    </Link>{" "}
                    to see more.
                </p>

                <div className="space-y-3 sm:space-y-4">
                    {data.products.map((product, index) => {
                        const IconComponent =
                            iconMap[product.icon] || Rocket;
                        return (
                            <DelayedLink
                                key={index}
                                to={product.link}
                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-black rounded-lg bg-white shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150 group"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 border-2 border-black rounded-lg flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base">
                                        {product.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 truncate">
                                        {product.description}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </DelayedLink>
                        );
                    })}
                </div>
            </motion.section>

            {/* What I Offer Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t-2 border-black pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    What I Offer
                </h2>
                <div className="space-y-2 sm:space-y-3">
                    {data.skills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-black rounded-lg bg-white"
                        >
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                            <span className="font-medium text-sm sm:text-base">
                                {skill.name}
                            </span>
                            <span className="text-zinc-500 text-xs sm:text-sm hidden sm:inline">
                                — {skill.detail}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Links Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t-2 border-black pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Links
                </h2>
                <ul className="space-y-2">
                    {data.links.map((link, index) => (
                        <li key={index}>
                            <a
                                href={link.url}
                                target={
                                    link.url.startsWith("mailto:")
                                        ? undefined
                                        : "_blank"
                                }
                                rel={
                                    link.url.startsWith("mailto:")
                                        ? undefined
                                        : "noopener noreferrer"
                                }
                                className="text-blue-500 font-medium hover:underline"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </motion.section>
        </div>
    );
}

export default HomePage;
