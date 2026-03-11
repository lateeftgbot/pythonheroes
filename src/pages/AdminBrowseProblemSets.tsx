import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Trash2,
    FileText,
    ChevronLeft,
    Search,
    Calendar,
    ArrowRight,
    Edit3,
    BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProblemSet {
    id: string;
    name: string;
    description: string;
    problems: any[];
    updated_at: string;
    created_at: string;
}

const AdminBrowseProblemSets = () => {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [problemSets, setProblemSets] = useState<ProblemSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProblemSets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/problem-sets", {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Email': currentUser?.email || ''
                }
            });
            const data = await response.json();
            if (response.ok) {
                setProblemSets(data);
            } else {
                toast.error(`Error: ${data.error || "Failed to load problem sets"}`);
            }
        } catch (error) {
            console.error("Error fetching problem sets:", error);
            toast.error("An error occurred while connecting to the server");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'master1_vectors')) {
                navigate("/signin", { replace: true });
            } else {
                fetchProblemSets();
            }
        }
    }, [currentUser, authLoading, navigate]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/problem-sets/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Email': currentUser?.email || ''
                }
            });
            if (response.ok) {
                toast.success("Problem set deleted");
                setProblemSets(problemSets.filter(s => s.id !== id));
            } else {
                const data = await response.json();
                toast.error(`Delete failed: ${data.error || "Failed to delete"}`);
            }
        } catch (error) {
            toast.error("An error occurred during deletion");
        }
    };

    const filteredSets = problemSets.filter(s => {
        const name = s.name || "";
        const desc = s.description || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (authLoading || !currentUser) {
        return <div className="h-screen bg-background flex items-center justify-center font-mono text-primary animate-pulse">Authenticating Admin...</div>;
    }

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground font-sans">
            <Navbar />

            <div className="pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Link to="/admin/create-problems" className="p-2 hover:bg-muted rounded-lg transition-colors group">
                                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Problem Set Repository
                                </div>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <BookOpen className="w-10 h-10 text-primary" />
                                Saved Documents
                            </h1>
                            <p className="text-muted-foreground mt-2 font-mono text-xs">
                                Browse and manage your curated coding challenge collections.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pl-10 pr-4 bg-white dark:bg-[#0d0d0d] border border-border rounded-xl text-sm font-mono w-64 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                            <Button className="h-11 font-bold gap-2 rounded-xl" onClick={() => navigate("/admin/create-problems")}>
                                <Plus className="w-5 h-5" /> New Document
                            </Button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-muted/20 border border-border rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredSets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSets.map((s) => {
                                const firstProblem = s.problems?.[0];
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-border hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all group flex flex-col p-6 overflow-hidden relative min-h-[300px] max-h-[500px]"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {firstProblem && (
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                        firstProblem.difficulty === 'Beginner' ? "bg-green-100 text-green-700 border border-green-200" :
                                                            firstProblem.difficulty === 'Intermediate' ? "bg-orange-100 text-orange-700 border border-orange-200" :
                                                                "bg-red-100 text-red-700 border border-red-200"
                                                    )}>
                                                        {firstProblem.difficulty}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg hover:text-primary transition-colors"
                                                        onClick={() => navigate(`/admin/create-problems?id=${s.id}`)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg hover:text-destructive transition-colors"
                                                        onClick={() => handleDelete(s.id, s.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 mb-2">
                                            {s.problems?.map((p: any) => (
                                                <div key={p.id} className="relative pl-4 border-l-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                                                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary/30" />
                                                    <p className="text-sm text-black font-mono whitespace-pre-wrap">
                                                        {p.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-t border-border pt-4">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(s.updated_at).toLocaleDateString()}
                                            </div>
                                            <div className="px-2 py-0.5 rounded bg-muted/50 font-black">
                                                {s.problems?.length || 0} ITEMS
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-dashed border-border">
                            <div className="p-8 bg-muted/20 rounded-full mb-6">
                                <BookOpen className="w-16 h-16 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">No documents found</h2>
                            <p className="text-muted-foreground text-center max-w-sm mb-8 font-mono text-sm italic">
                                {"// Your saved academic problem sets will appear here."}
                            </p>
                            <Button className="rounded-2xl h-12 px-8 font-black gap-2" onClick={() => navigate("/admin/create-problems")}>
                                <Plus className="w-5 h-5" /> Start First Set
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Rainbow Footer Decor */}
            <div className="fixed bottom-0 left-0 h-[8px] w-full bg-gradient-to-r from-[#ff0000] via-[#ff7f00] via-[#ffff00] via-[#00ff00] via-[#0000ff] via-[#4b0082] to-[#8b00ff] animate-gradient-x z-50"></div>
        </div>
    );
};

export default AdminBrowseProblemSets;
