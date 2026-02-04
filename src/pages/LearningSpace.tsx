import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, Link as LinkIcon, ExternalLink, Download, ArrowLeft, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import IDEComponent from "@/components/IDEComponent";

interface Material {
    _id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    category: string;
    created_by: string;
    created_at: string;
    is_published: boolean;
}

const LearningSpace = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [view, setView] = useState<"materials" | "ide">("materials");
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, isLoading, navigate]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch("/api/learning/materials");
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
            }
        } catch (error) {
            console.error("Failed to fetch materials:", error);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf':
            case 'document':
                return <FileText className="w-5 h-5" />;
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'link':
                return <LinkIcon className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'pdf':
                return "text-red-500 bg-red-500/10 border-red-500/20";
            case 'video':
                return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case 'link':
                return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 'document':
                return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            default:
                return "text-primary bg-primary/10 border-primary/20";
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const handleCodeNow = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setView("ide");
            setIsTransitioning(false);
        }, 500);
    };

    const handleBackToLearning = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setView("materials");
            setIsTransitioning(false);
        }, 500);
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            <Navbar />

            <main className="pt-24 pb-16 relative">
                <div className="container mx-auto px-4 relative min-h-[calc(100vh-200px)]">
                    {/* Materials View Container */}
                    <div className={`transition-all duration-500 ease-in-out ${view === "materials"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-full absolute inset-x-0 pointer-events-none"
                        }`}>
                        {/* Header */}
                        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Learning Space</h1>
                                    </div>
                                    <p className="font-mono text-primary text-xs sm:text-sm mt-1">{"// Course materials & resources"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleCodeNow}
                                    variant="outline"
                                    className="font-mono text-xs sm:text-sm transition-all shadow-sm bg-green-600 text-white hover:bg-green-500 border-green-600"
                                >
                                    <Code2 className="w-4 h-4 mr-2" />
                                    Code Now
                                </Button>

                                {user.role === 'admin' && (
                                    <Button
                                        onClick={() => navigate("/admin/materials")}
                                        className="bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs sm:text-sm border-primary/20"
                                    >
                                        Manage Materials
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Materials Grid (Moved inside its own container) */}
                        {isLoadingMaterials ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="glass-card rounded-xl p-12 text-center">
                                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">No Materials Yet</h3>
                                <p className="text-muted-foreground font-mono text-sm">
                                    {"// Materials will appear here when posted by admin"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materials.map((material) => (
                                    <div
                                        key={material._id}
                                        className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                                    >
                                        {/* Type Badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getTypeColor(material.type)}`}>
                                                {getTypeIcon(material.type)}
                                                <span className="text-xs font-mono uppercase">{material.type}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
                                            {material.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                            {material.description || "No description provided"}
                                        </p>

                                        {/* Category */}
                                        {material.category && (
                                            <div className="mb-4">
                                                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                                    {material.category}
                                                </span>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {formatDate(material.created_at)}
                                            </span>
                                            <a
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs font-mono text-primary hover:underline"
                                            >
                                                {material.type === 'pdf' || material.type === 'document' ? (
                                                    <><Download className="w-4 h-4" />Download</>
                                                ) : (
                                                    <><ExternalLink className="w-4 h-4" />Open</>
                                                )}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* IDE View Container */}
                    <div className={`transition-all duration-500 ease-in-out ${view === "ide"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-full absolute inset-x-0 pointer-events-none top-0"
                        }`}>
                        <IDEComponent onBackToLearning={handleBackToLearning} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LearningSpace;
