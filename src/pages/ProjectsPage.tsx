import { motion } from "motion/react";
import { DelayedLink } from "@/components/ui/delayed-link";
import { ArrowRight } from "lucide-react";

type ProjectStatus = "Production" | "In Development" | "Concept";

export interface Project {
    id: string;
    title: string;
    description: string;
    fullDescription?: string;
    status: ProjectStatus;
    tags: string[];
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string; // Project screenshot/thumbnail
}

const statusStyles: Record<ProjectStatus, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
};

export const projects: Project[] = [
    {
        id: "roomieverse",
        title: "roomieVerse",
        description:
            "A platform connecting roommates and helping them manage shared living spaces. Features include expense splitting, task management, and community building.",
        fullDescription:
            "roomieVerse is a comprehensive platform designed to make shared living easier and more enjoyable. It provides tools for expense splitting, task management, house rules, and community building among roommates. The app helps reduce conflicts and improve communication in shared living spaces.",
        status: "Production",
        tags: ["React", "Node.js", "MongoDB"],
        liveUrl: "https://roomieverse.app",
    },
    {
        id: "ourwarmth",
        title: "ourWarmth",
        description:
            "A digital platform fostering meaningful connections and spreading warmth through shared stories and experiences.",
        fullDescription:
            "ourWarmth is a platform that brings people together through storytelling and shared experiences. It's designed to create meaningful connections in an increasingly digital world, allowing users to share moments of warmth and kindness.",
        status: "In Development",
        tags: ["Next.js", "TypeScript", "Prisma"],
        githubUrl: "https://github.com/anttxqt/ourwarmth",
    },
    {
        id: "ecopoint",
        title: "ecoPoint",
        description:
            "An innovative solution for tracking and rewarding eco-friendly behaviors. Gamifying sustainability to make positive environmental impact fun and engaging.",
        fullDescription:
            "ecoPoint is a concept app that gamifies sustainability. Users can track their eco-friendly behaviors, earn points, and compete with friends to make positive environmental impact. The goal is to make sustainability fun and accessible to everyone.",
        status: "Concept",
        tags: ["Mobile", "Sustainability", "Gamification"],
    },
    {
        id: "he-thong-quan-ly-nha-tro",
        title: "rooming house Management",
        description:
            "A comprehensive rooming house management system for landlords to manage rooms, tenants, contracts, and payments efficiently.",
        fullDescription:
            "This system helps landlords digitize their rooming house operations. Features include room management, tenant information tracking, contract management, utility billing, payment tracking, and financial reporting. Built to simplify the daily operations of running a rooming house business.",
        status: "In Development",
        tags: ["React", "Node.js", "PostgreSQL"],
    },
    {
        id: "room-management-system",
        title: "The Room Management System",
        description:
            "An enterprise-grade room booking and management solution for offices, co-working spaces, and educational institutions.",
        fullDescription:
            "The Room Management System is designed for organizations that need to manage multiple rooms and spaces. It features real-time availability checking, booking management, resource allocation, and usage analytics. Perfect for offices, universities, and co-working spaces.",
        status: "Concept",
        tags: ["Enterprise", "SaaS", "Booking System"],
    },
    {
        id: "hindsight",
        title: "HindSight",
        description:
            "A retrospective analysis tool helping teams learn from past projects and improve future outcomes.",
        fullDescription:
            "HindSight is designed to help teams conduct effective retrospectives and post-mortems. It provides structured templates, analytics on recurring issues, and actionable insights to continuously improve team performance and project outcomes.",
        status: "Concept",
        tags: ["Analytics", "Team Collaboration", "Learning"],
    },
    {
        id: "electronics-rewind",
        title: "Electronics Rewind Platform",
        description:
            "A marketplace for refurbished electronics, promoting sustainability and affordable technology access.",
        fullDescription:
            "Electronics Rewind Platform connects sellers of refurbished electronics with eco-conscious buyers. The platform includes quality verification, warranty management, and a trade-in program to extend the lifecycle of electronic devices and reduce e-waste.",
        status: "Concept",
        tags: ["Marketplace", "E-commerce", "Sustainability"],
    },
    {
        id: "southern-echoes",
        title: "The Southern Echoes",
        description:
            "A digital platform preserving and sharing the rich cultural heritage and stories of Southern Vietnam.",
        fullDescription:
            "The Southern Echoes is a cultural preservation project that documents stories, traditions, music, and history from Southern Vietnam. It features audio recordings, visual archives, and interactive storytelling to connect generations.",
        status: "Concept",
        tags: ["Culture", "Heritage", "Storytelling"],
    },
    {
        id: "99percent-ai-labs",
        title: "99percent-from-AI Labs",
        description:
            "An experimental lab exploring AI-assisted development and automation of software workflows.",
        fullDescription:
            "99percent-from-AI Labs is a research initiative exploring how AI can handle 99% of repetitive coding tasks. We experiment with AI pair programming, automated testing, and intelligent code generation to push the boundaries of developer productivity.",
        status: "Concept",
        tags: ["AI", "Research", "Automation"],
    },
    {
        id: "moms-flavor",
        title: "Moms Flavor",
        description:
            "A recipe sharing platform celebrating home-cooked meals and family recipes passed down through generations.",
        fullDescription:
            "Moms Flavor is a heartfelt platform where families can preserve, share, and discover cherished recipes. It features video tutorials, ingredient scaling, meal planning, and a community of home cooks celebrating the warmth of family cooking.",
        status: "Concept",
        tags: ["Food", "Community", "Family"],
    },
];

export function ProjectsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold mb-4">Projects</h2>
                <p className="text-zinc-600">
                    Here are some of the projects I've worked on. Each one represents a
                    unique challenge and learning experience.
                </p>
            </motion.section>

            {/* Projects Grid */}
            <div className="space-y-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                        <DelayedLink
                            to={`/projects/${project.id}`}
                            className="block border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 group"
                        >
                            {/* macOS Window Header */}
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                            </div>

                            {/* Project Image */}
                            <div className="w-full h-32 sm:h-40 border-b-2 border-black overflow-hidden">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-white/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                                                <span className="text-blue-400 text-xl sm:text-2xl">📷</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-blue-400 font-medium">Image Coming Soon</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 sm:p-6">
                                {/* Title */}
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-zinc-600 mb-3 sm:mb-4 line-clamp-2">{project.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-zinc-100 border border-zinc-300 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold border rounded-full ${statusStyles[project.status]}`}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </DelayedLink>
                    </motion.div>
                ))}
            </div>

            {/* More Projects */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center py-6 border-t-2 border-black mt-8"
            >
                <p className="text-zinc-600">
                    More projects available on{" "}
                    <a
                        href="https://github.com/anttxqt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-500 hover:text-blue-600"
                    >
                        GitHub
                    </a>
                </p>
            </motion.section>
        </div>
    );
}

export default ProjectsPage;
