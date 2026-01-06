import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface Post {
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    slug: string;
    category: string;
    categoryColor: string;
}

const posts: Post[] = [
    {
        title: "Building a Design System from Scratch",
        excerpt:
            "Learn how to create a cohesive design system that scales with your application. We'll cover tokens, components, and documentation.",
        date: "Dec 15, 2024",
        readTime: "8 min read",
        slug: "building-design-system",
        category: "Design",
        categoryColor: "bg-pink-200",
    },
    {
        title: "Modern React Patterns in 2024",
        excerpt:
            "Explore the latest React patterns including Server Components, Suspense, and how to structure your applications for success.",
        date: "Nov 28, 2024",
        readTime: "12 min read",
        slug: "modern-react-patterns",
        category: "Development",
        categoryColor: "bg-blue-200",
    },
    {
        title: "The Art of Clean Code",
        excerpt:
            "Writing maintainable code is a skill that takes practice. Here are my top tips for keeping your codebase clean and readable.",
        date: "Nov 10, 2024",
        readTime: "6 min read",
        slug: "art-of-clean-code",
        category: "Best Practices",
        categoryColor: "bg-lime-200",
    },
    {
        title: "Getting Started with TypeScript",
        excerpt:
            "A beginner-friendly guide to TypeScript. Learn the basics, understand the benefits, and start writing type-safe code today.",
        date: "Oct 22, 2024",
        readTime: "10 min read",
        slug: "getting-started-typescript",
        category: "Tutorial",
        categoryColor: "bg-amber-200",
    },
];

export function WritingPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold mb-4">Writing</h2>
                <p className="text-zinc-600">
                    Thoughts, tutorials, and insights about software development, design,
                    and technology.
                </p>
            </motion.section>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map((post, index) => (
                    <motion.article
                        key={post.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="group border-2 border-black rounded-lg bg-white p-6 shadow-secondary hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200 cursor-pointer"
                    >
                        {/* Category */}
                        <div className="mb-3">
                            <span
                                className={`inline-block px-3 py-1 text-xs font-bold ${post.categoryColor} border-2 border-black rounded-full`}
                            >
                                {post.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-zinc-600 mb-4">{post.excerpt}</p>

                        {/* Meta */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </span>
                            </div>

                            <span className="flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:gap-2 transition-all">
                                Read more
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </motion.article>
                ))}
            </div>

            {/* Newsletter */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-2 border-black rounded-lg bg-blue-100 p-6 shadow-secondary"
            >
                <h3 className="text-xl font-bold mb-2">Subscribe to Updates</h3>
                <p className="text-zinc-600 mb-4">
                    Get notified when I publish new articles. No spam, unsubscribe anytime.
                </p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="flex-1 px-4 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button className="px-6 py-2 bg-blue-300 border-2 border-black rounded-md font-bold shadow-secondary hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-200">
                        Subscribe
                    </button>
                </div>
            </motion.section>
        </div>
    );
}

export default WritingPage;
