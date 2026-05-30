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


            {/* Experience Section */}
            {data.experiences && data.experiences.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                        Experience
                    </h2>
                    <div className="space-y-5 mt-4 sm:mt-5">
                        {data.experiences
                            .filter((exp) => !exp.hidden)
                            .map((exp, index, arr) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-blue-500">
                                                {exp.role}
                                            </h3>
                                            <p className="text-sm sm:text-base text-zinc-600 font-semibold mt-0.5">
                                                {exp.company}
                                                {exp.location && ` • ${exp.location}`}
                                            </p>
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-zinc-500 self-start sm:self-auto">
                                            {exp.period}
                                        </span>
                                    </div>
                                    {exp.description && exp.description.length > 0 && (
                                        <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-sm sm:text-base text-zinc-700 leading-relaxed pl-1">
                                            {exp.description.map((bullet, bIdx) => (
                                                <li key={bIdx} className="pl-1 -indent-5 ml-5">
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {index < arr.length - 1 && (
                                        <div className="w-full h-[6px] mt-6 mb-2 opacity-15">
                                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <pattern id={`wave-${index}`} width="20" height="6" patternUnits="userSpaceOnUse" viewBox="0 0 20 10">
                                                        <path 
                                                            d="M-5 5 Q0 0 5 5 T15 5 T25 5" 
                                                            fill="none" 
                                                            stroke="black" 
                                                            strokeWidth="2" 
                                                            strokeLinecap="round" 
                                                        />
                                                    </pattern>
                                                </defs>
                                                <rect width="100%" height="100%" fill={`url(#wave-${index})`} />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </motion.section>
            )}

            {/* Links Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
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
