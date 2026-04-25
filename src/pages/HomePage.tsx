import { motion } from "motion/react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useHomepageData } from "@/hooks/useHomepageData";

export function HomePage() {
    const { data, loading } = useHomepageData();

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Hero Section - Left aligned */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
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

            {/* Skills Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Skills
                </h2>
                <div className="space-y-3 sm:space-y-4">
                    {data.skillCategories.map((category, index) => (
                        <div key={index}>
                            <h3 className="text-xs sm:text-sm font-bold text-blue-500 mb-1.5 sm:mb-2">
                                {category.name}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {category.items.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-white border-2 border-black rounded-lg"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>


            {/* Links Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="border-t-2 border-black/20 pt-6 sm:pt-8"
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
