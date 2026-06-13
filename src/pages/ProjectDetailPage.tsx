import { useState } from "react";
import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { LoadingScreen, ImageWithLoader } from "@/components/ui/LoadingScreen";
import { useProjectsData, type CollectionType } from "@/hooks/useProjectsData";
import { parseBoldText } from "@/lib/utils";

interface ProjectTranslation {
    title?: string;
    description?: string;
    storyBehind?: string;
    keyFeatures?: string[];
    fullDescription?: string;
}

const translations: Record<string, ProjectTranslation> = {
    roomieverse: {
        storyBehind: `Mình là một sinh viên chuyển từ Đà Lạt xuống Sài Gòn để học đại học, và phần lớn dự án này xuất phát từ những vấn đề thực tế mà mình gặp phải khi cố gắng tìm một nơi để sống. Tìm một phòng trọ phù hợp vốn đã khó, nhưng việc tìm được những người bạn cùng phòng hòa hợp và quản lý không gian sống chung một cách êm đẹp còn khó hơn rất nhiều.

Ý tưởng về **roomieVerse** nảy ra sau nhiều lần tranh cãi không đáng có về việc chia tiền điện nước hay ai là người đến lượt dọn dẹp vệ sinh. Mình muốn tạo ra một ứng dụng giúp số hóa những trải nghiệm này, biến những quy định ngầm thành các quy trình rõ ràng và tự động để mọi người đều cảm thấy thoải mái và công bằng.`,
        keyFeatures: [
            "**Tìm bạn cùng phòng thông minh:** Hệ thống gợi ý bạn cùng phòng dựa trên thói quen sinh hoạt, giờ giấc và sở thích cá nhân.",
            "**Chia tiền điện nước tự động:** Ghi chép hóa đơn và tự động chia đều hoặc chia theo tỷ lệ thỏa thuận, tích hợp nhắc nhở thanh toán.",
            "**Lịch phân công việc nhà:** Phân chia nhiệm vụ dọn dẹp theo tuần/tháng một cách ngẫu nhiên hoặc xoay vòng công bằng.",
            "**Bảng tin nội bộ:** Nơi lưu trữ các quy định chung của nhà, thông báo khẩn cấp và giao tiếp chung giữa các thành viên."
        ],
        fullDescription: `roomieVerse là một giải pháp toàn diện để cải thiện chất lượng cuộc sống trong các không gian sống chung. Được xây dựng trên nền tảng React và Node.js, ứng dụng cung cấp giao diện trực quan và trải nghiệm người dùng mượt mà.

Với roomieVerse, các vấn đề nhạy cảm như tài chính hay dọn dẹp vệ sinh sẽ được giải quyết một cách minh bạch, giúp giảm thiểu mâu thuẫn và xây dựng một cộng đồng bạn cùng phòng bền vững.`,
    },
    ourwarmth: {
        storyBehind: `Ý tưởng về **Our Warmth** thực sự đã bắt đầu từ rất lâu trước khi mình nộp nó cho cuộc thi Apple Swift Student Challenge 2026 (nơi mà dự án không đạt giải, nhưng quá trình thực hiện đã mang lại cho mình rất nhiều bài học quý giá). Ứng dụng này ra đời từ một sự hối tiếc rất cá nhân.

Vào năm 2023, trên đường đi học về trong một đêm mưa lớn, mình bắt gặp một người đàn ông bị ngã xe máy nằm bên đường. Lúc đó, không có ai dừng lại giúp đỡ chú ấy cả. Mình rất muốn lại gần giúp, nhưng thành thật mà nói, nhìn thấy máu khiến mình vô cùng hoảng sợ và đứng hình. Mình đã quá sợ hãi không dám tiến lại gần. Sự dằn vặt vì đã bỏ đi đêm đó cứ bám lấy mình mãi, nhưng mình không biết làm sao để bù đắp.

Sự dằn vặt đó cuối cùng đã chuyển hóa thành ý tưởng sản phẩm. Mình muốn xây dựng một công cụ để những người gặp tai nạn—hoặc rộng hơn là những hoàn cảnh khó khăn cần thức ăn, quần áo ấm—có thể nhận được sự trợ giúp kịp thời. **Our Warmth** được thiết kế để kết nối những người muốn giúp đỡ với những người cần giúp đỡ, sử dụng những người chứng kiến (những người có thể cảm thấy bất lực hoặc sợ hãi không dám trực tiếp can thiệp giống như mình lúc đó) làm cầu nối. Bạn chỉ cần chụp nhanh một bức ảnh, ghim vị trí và thêm vài thông tin ngắn gọn để các tình nguyện viên địa phương có thể dễ dàng tìm đến hỗ trợ.`,
        keyFeatures: [
            "**Làm mờ khuôn mặt trực tiếp trên thiết bị (On-device Face Blurring):** Sử dụng Apple Vision Framework để tự động phát hiện và làm mờ khuôn mặt ngay trên điện thoại, đảm bảo các bức ảnh nhạy cảm không bao giờ bị lộ ra ngoài trước khi tải lên.",
            "**Bản đồ tương tác (Interactive Map):** Tích hợp MapKit giúp người dùng dễ dàng ghim vị trí để các tình nguyện viên biết chính xác nơi cần đến hỗ trợ.",
            "**Kiến trúc sạch (Clean Architecture):** Áp dụng mô hình MVVM để tách biệt logic nghiệp vụ khỏi giao diện SwiftUI, giữ cho mã nguồn luôn gọn gàng và việc cập nhật bản đồ diễn ra mượt mà.",
            "**iOS 26 - Liquid Glass hoàn toàn mới:** Tuân thủ các nguyên tắc thiết kế mới nhất của Apple (Human Interface Guidelines) và thử nghiệm ngôn ngữ thiết kế Liquid Glass để mang lại trải nghiệm bản địa (native) và hiện đại nhất."
        ],
        fullDescription: `Our Warmth là một ứng dụng iOS bản địa (native) được xây dựng hoàn toàn bằng Swift và SwiftUI. Để quản lý luồng dữ liệu một cách tối ưu, mình đã áp dụng kiến trúc MVVM xuyên suốt dự án.

Thách thức kỹ thuật thú vị nhất của dự án này là xử lý ảnh chụp của người dùng một cách an toàn. Thay vì gửi ảnh thô lên máy chủ backend—vốn tiềm ẩn nhiều rủi ro rò rỉ dữ liệu—mình đã xây dựng luồng xử lý ảnh ngay trên thiết bị bằng Vision Framework của Apple. Bằng cách kết hợp VNDetectFaceRectanglesRequest với các bộ lọc Core Image, ứng dụng sẽ phát hiện khuôn mặt và áp dụng hiệu ứng làm mờ ngay tại chỗ. Điều này đảm bảo rằng các bức ảnh nhạy cảm chưa được che chắn sẽ không bao giờ rời khỏi phần cứng của người dùng.

Đối với tính năng bản đồ cốt lõi, mình đã tích hợp MapKit để hiển thị và quản lý các ghim vị trí. Để giữ cho ứng dụng luôn nhạy bén khi nhận báo cáo mới, mình sử dụng MVVM kết hợp với ObservableObject và thuộc tính @Published để tách biệt logic bản đồ ra khỏi giao diện. Cấu hình này giúp luồng xử lý chính không bị chặn, đảm bảo các chế độ xem SwiftUI hiển thị mượt mà và tự nhiên.

Cuối cùng, để rèn luyện thiết kế giao diện hiện đại, mình đã xây dựng UI theo nguyên tắc Apple Human Interface Guidelines mới nhất của iOS 26. Mình tạo các View Modifier tùy chỉnh để thử nghiệm ngôn ngữ thiết kế Liquid Glass, giúp ứng dụng có cảm giác bản địa và hài hòa trong hệ sinh thái Apple.`,
    },
    "he-thong-quan-ly-nha-tro": {
        description: "Hệ thống quản lý nhà trọ toàn diện dành cho chủ nhà để quản lý phòng, người thuê, hợp đồng và thanh toán một cách hiệu quả.",
        fullDescription: "Hệ thống này giúp chủ nhà số hóa toàn bộ hoạt động kinh doanh nhà trọ của họ. Các tính năng bao gồm quản lý phòng, theo dõi thông tin người thuê, quản lý hợp đồng, tính tiền điện nước, theo dõi thanh toán và báo cáo tài chính. Được xây dựng để đơn giản hóa các công việc vận hành hàng ngày của mô hình kinh doanh nhà trọ.",
    },
    "room-management-system": {
        description: "Giải pháp đặt phòng và quản lý phòng họp cấp doanh nghiệp cho văn phòng, không gian làm việc chung (co-working) và các cơ sở giáo dục.",
        fullDescription: "Hệ thống quản lý phòng họp được thiết kế cho các tổ chức cần quản lý nhiều không gian làm việc. Hệ thống có các tính năng kiểm tra tình trạng phòng trống theo thời gian thực, quản lý đặt phòng, phân bổ tài nguyên và phân tích tần suất sử dụng. Hoàn hảo cho văn phòng, trường đại học và không gian co-working.",
    }
};

const statusStyles: Record<string, string> = {
    Production: "bg-green-200 text-green-800 border-green-400",
    Staging: "bg-sky-200 text-sky-800 border-sky-400",
    "In Development": "bg-amber-200 text-amber-800 border-amber-400",
    Concept: "bg-purple-200 text-purple-800 border-purple-400",
    Retired: "bg-zinc-200 text-zinc-800 border-zinc-400",
};

export function ProjectDetailPage({ type }: { type: CollectionType }) {
    const { id } = useParams<{ id: string }>();
    const { projects, loading } = useProjectsData(type);
    const project = projects.find((p) => p.id === id);
    const title = type === "products" ? "Product" : "Project";
    const backLink = type === "products" ? "/products" : "/projects";
    const backLabel = type === "products" ? "products" : "projects";
    const navigate = useNavigate();
    const [isVietnamese, setIsVietnamese] = useState(false);

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(backLink);
        }
    };

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    if (!project || project.hidden) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">{title} not found</h2>
                <Link to={backLink} className="text-blue-500 hover:underline">
                    Back to {backLabel}
                </Link>
            </div>
        );
    }

    const translation = translations[project.id];
    const titleText = (isVietnamese && (project.titleVi || translation?.title)) || project.title;
    const storyBehindText = (isVietnamese && (project.storyBehindVi || translation?.storyBehind)) || project.storyBehind;
    const keyFeaturesList = (isVietnamese && (project.keyFeaturesVi || translation?.keyFeatures)) || project.keyFeatures;
    const fullDescriptionText = (isVietnamese && (project.fullDescriptionVi || translation?.fullDescription)) || project.fullDescription;

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <button
                    onClick={handleBack}
                    className="group inline-flex items-center gap-2 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                >
                    {isVietnamese ? `Quay lại trang ${type === "products" ? "sản phẩm" : "dự án"}` : `Back to ${backLabel}`}
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                </button>
            </motion.div>

            {/* Project Card */}
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="border-2 border-black rounded-lg bg-white overflow-hidden shadow-secondary"
            >
                {/* macOS Window Header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-zinc-100 border-b-2 border-black">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border border-black"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-black"></div>
                    </div>
                    {/* Language Switcher Link (styled like dive in my story) */}
                    <button
                        onClick={() => setIsVietnamese(!isVietnamese)}
                        className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 hover:text-blue-600 hover:underline transition-colors cursor-pointer select-none"
                    >
                        {isVietnamese ? "view english version" : "xem bản tiếng việt"}
                    </button>
                </div>

                {/* Project Image */}
                {project.imageUrl && (
                    <div className="w-full h-40 sm:h-56 border-b-2 border-black overflow-hidden bg-zinc-50">
                        <ImageWithLoader
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full"
                            imgClassName="object-contain"
                        />
                    </div>
                )}

                <div className="p-4 sm:p-6">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{titleText}</h1>

                    {/* Status & Quick Links */}
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-4 sm:mb-6">
                        <span
                            className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border rounded ${statusStyles[project.status]}`}
                        >
                            {project.status === "Retired" ? "Sunsetting - Retired" : project.status}
                        </span>

                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-zinc-100 border border-zinc-300 rounded hover:bg-zinc-200 transition-colors"
                                title="View code on GitHub"
                            >
                                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                GitHub
                            </a>
                        )}

                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold bg-blue-50 border border-blue-200 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                title="Visit live website"
                            >
                                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Live
                            </a>
                        )}
                    </div>



                    {/* The Story Behind */}
                    {storyBehindText && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Câu chuyện phía sau" : "The Story Behind"}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {storyBehindText.split(/\n\s*\n/).map((para, i) => (
                                    <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                        {parseBoldText(para.trim())}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Features */}
                    {keyFeaturesList && keyFeaturesList.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Tính năng nổi bật" : "Key Features"}
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                {keyFeaturesList.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2.5 bg-blue-600 rounded-sm flex-shrink-0 border border-black"></div>
                                        <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">{parseBoldText(feature)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full Description */}
                    {fullDescriptionText && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                                {isVietnamese ? "Mô tả chi tiết" : "Full Description"}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {fullDescriptionText.split(/\n\s*\n/).map((para, i) => (
                                    <p key={i} className="text-base sm:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                                        {parseBoldText(para.trim())}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Section (Roles, Tech Stack, Topics, Links/Explore) */}
                    <div className="pt-6 sm:pt-8 border-t-2 border-zinc-200 mt-6 sm:mt-8 space-y-6">
                        {/* Roles */}
                        {project.roles && project.roles.length > 0 && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                    {isVietnamese ? "Vai trò" : "Role"}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {project.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                {isVietnamese ? "Công nghệ sử dụng" : "Tech Stack"}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>


                        {/* Links */}
                        {(project.githubUrl || project.liveUrl) && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-blue-600 mb-2">
                                    {isVietnamese ? "Trải nghiệm" : "Explore"}
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {isVietnamese ? "Xem trên GitHub" : "View on GitHub"}
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-zinc-100 border-2 border-black rounded-md hover:bg-zinc-200 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {isVietnamese ? "Ghé thăm trang web" : "Visit Website"}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.article>

            {/* Gallery */}
            {project.images && project.images.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="border-t-2 border-black/20 pt-6 sm:pt-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More & More</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {project.images.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                                className="border-2 border-black rounded-lg overflow-hidden bg-white"
                            >
                                <ImageWithLoader
                                    src={img}
                                    alt={`${project.title} screenshot ${index + 1}`}
                                    className="w-full h-auto min-h-[200px]"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Bottom Back Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="pt-4 pb-8 flex justify-center"
            >
                <button
                    onClick={handleBack}
                    className="group inline-flex items-center gap-2 px-6 py-3 font-bold text-black border-2 border-black rounded-lg bg-blue-300 shadow-secondary active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all duration-200 cursor-pointer"
                >
                    {isVietnamese ? `Quay lại trang ${type === "products" ? "sản phẩm" : "dự án"}` : `Back to ${backLabel}`}
                    <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-x-1" />
                </button>
            </motion.div>
        </div>
    );
}

export default ProjectDetailPage;
