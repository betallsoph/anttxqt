import { motion } from "motion/react";
import { Rocket, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DelayedLink } from "@/components/ui/delayed-link";

export function HomePage() {
    return (
        <div className="space-y-8">
            {/* Hero Section - Left aligned */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold mb-6">Hello!</h2>
                <p className="text-lg text-zinc-700 leading-relaxed">
                    I'm <strong className="text-black">An Tran</strong>, a software developer focused on building reliable and user-focused applications.
                </p>
                <p className="text-lg text-zinc-700 leading-relaxed mt-4">
                    Alongside development, I'm interested in media and digital communication—exploring how content, visuals, and storytelling can enhance the way products are presented and experienced.
                </p>
                <p className="text-lg text-zinc-700 leading-relaxed mt-4">
                    Contact me at{" "}
                    <a href="mailto:hello@anttxqt.dev" className="text-blue-500 font-semibold hover:underline">
                        hello@anttxqt.dev
                    </a>
                    .
                </p>
            </motion.section>

            {/* Featured Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-t-2 border-black pt-8"
            >
                <h2 className="text-xl font-bold mb-4">Products</h2>
                <p className="text-zinc-600 mb-4">
                    Here are some of my production projects. Visit the{" "}
                    <Link to="/projects" className="text-blue-500 font-semibold hover:underline">
                        projects page
                    </Link>{" "}
                    to see more.
                </p>

                <div className="space-y-4">
                    <DelayedLink to="/projects" className="flex items-center gap-4 p-4 border-2 border-black rounded-lg bg-white shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150 group">
                        <div className="w-12 h-12 bg-blue-200 border-2 border-black rounded-lg flex items-center justify-center">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">roomieVerse</h3>
                            <p className="text-sm text-zinc-600">A platform connecting roommates and managing shared living spaces.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </DelayedLink>

                    <DelayedLink to="/projects" className="flex items-center gap-4 p-4 border-2 border-black rounded-lg bg-white shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150 group">
                        <div className="w-12 h-12 bg-blue-200 border-2 border-black rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">ourWarmth</h3>
                            <p className="text-sm text-zinc-600">A digital platform fostering meaningful connections through shared stories.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </DelayedLink>

                    <DelayedLink to="/projects" className="flex items-center gap-4 p-4 border-2 border-black rounded-lg bg-white shadow-secondary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150 group">
                        <div className="w-12 h-12 bg-blue-200 border-2 border-black rounded-lg flex items-center justify-center">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">Rooming House Management</h3>
                            <p className="text-sm text-zinc-600">Comprehensive rooming house management for landlords.</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </DelayedLink>
                </div>
            </motion.section>

            {/* What I Offer Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t-2 border-black pt-8"
            >
                <h2 className="text-xl font-bold mb-4">What I Offer</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border-2 border-black rounded-lg bg-white">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Web Development</span>
                        <span className="text-zinc-500 text-sm">— React, Next.js, TypeScript</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border-2 border-black rounded-lg bg-white">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">UI/UX Design</span>
                        <span className="text-zinc-500 text-sm">— Figma, Design Systems</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border-2 border-black rounded-lg bg-white">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Consulting</span>
                        <span className="text-zinc-500 text-sm">— Architecture, Code Review</span>
                    </div>
                </div>
            </motion.section>

            {/* Links Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border-t-2 border-black pt-8"
            >
                <h2 className="text-xl font-bold mb-4">Links</h2>
                <ul className="space-y-2">
                    <li>
                        <a
                            href="mailto:hello@anttxqt.dev"
                            className="text-blue-500 font-medium hover:underline"
                        >
                            Email
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/anttxqt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 font-medium hover:underline"
                        >
                            GitHub
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://linkedin.com/in/anttxqt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 font-medium hover:underline"
                        >
                            LinkedIn
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://twitter.com/anttxqt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 font-medium hover:underline"
                        >
                            Twitter
                        </a>
                    </li>
                </ul>
            </motion.section>
        </div>
    );
}

export default HomePage;
