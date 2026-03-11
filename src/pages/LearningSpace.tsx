import { useEffect, useState, useMemo, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, Link as LinkIcon, ExternalLink, Download, ArrowLeft, Code2, PlusCircle, Layout, Search, XCircle, Library, Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import IDEComponent from "@/components/IDEComponent";
import TypewriterFooter from "@/components/TypewriterFooter";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";


interface Material {
    _id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    raw_text?: string;
    category: string;
    created_by: string;
    created_at: string;
    is_published: boolean;
    document_settings?: {
        pageSize: string;
        marginSize: string;
        margins?: { top: string; bottom: string; left: string; right: string; };
    };
}

const PAGE_DIMENSIONS: Record<string, any> = {
    a4: { width: "lg:w-[210mm]", minHeight: "min-h-[297mm]", heightVal: "297mm", dimLabel: "21.0 x 29.7 cm" },
    a3: { width: "lg:w-[297mm]", minHeight: "min-h-[420mm]", heightVal: "420mm", dimLabel: "29.7 x 42.0 cm" },
    a5: { width: "lg:w-[148mm]", minHeight: "min-h-[210mm]", heightVal: "210mm", dimLabel: "14.8 x 21.0 cm" },
    letter: { width: "lg:w-[8.5in]", minHeight: "min-h-[11in]", heightVal: "11in", dimLabel: "8.5 x 11.0 in" },
    legal: { width: "lg:w-[8.5in]", minHeight: "min-h-[14in]", heightVal: "14in", dimLabel: "8.5 x 14.0 in" },
    executive: { width: "lg:w-[7.25in]", minHeight: "min-h-[10.5in]", heightVal: "10.5in", dimLabel: "7.25 x 10.5 in" },
    b5: { width: "lg:w-[176mm]", minHeight: "min-h-[250mm]", heightVal: "250mm", dimLabel: "17.6 x 25.0 cm" },
    tabloid: { width: "lg:w-[11in]", minHeight: "min-h-[17in]", heightVal: "17in", dimLabel: "11.0 x 17.0 in" },
};

const formatMargin = (val: string | undefined): string => {
    if (!val) return '1in';
    const trimmed = val.trim();
    if (/^\d*(\.\d+)?$/.test(trimmed)) return `${trimmed}in`;
    return trimmed;
};

const LearningSpace = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [view, setView] = useState<"materials" | "ide" | "courses">("materials");
    const [courseTab, setCourseTab] = useState<"courses" | "catalog" | "registered">("courses");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
    const [activeDashboardMaterial, setActiveDashboardMaterial] = useState<Material | null>(null);
    const [readingProgress, setReadingProgress] = useState(0);
    const courseScrollRef = useRef<HTMLDivElement>(null);

    // Registration State (Persistent)
    const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
    const [isRegistering, setIsRegistering] = useState(false);

    // Scroll Position Tracking
    const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
    const scrollSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);
    const [initialScrollPos, setInitialScrollPos] = useState(0);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, isLoading, navigate]);

    useEffect(() => {
        if (location.state?.tab === "registered") {
            setView("courses");
            setCourseTab("registered");
        }
        if (location.state?.view && location.state?.materialId) {
            setView(location.state.view);
            // Search for the material in the list
            const material = materials.find(m => m._id === location.state.materialId);
            if (material) {
                setActiveDashboardMaterial(material);
            }
        }
    }, [location.state, materials]);

    // Restore scroll position when material changes
    useEffect(() => {
        const restoreScrollPosition = async () => {
            if (!courseScrollRef.current || !activeDashboardMaterial || !user?.email) return;

            // Hide content during restoration to prevent flash
            setIsRestoringScroll(true);

            try {
                // Fetch saved scroll position from database
                const response = await fetch(
                    `http://localhost:5000/api/learning/scroll-position/${activeDashboardMaterial._id}?email=${encodeURIComponent(user.email)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const savedPosition = data.scroll_position || 0;
                    setInitialScrollPos(savedPosition);
                    // Small delay to allow render
                    setTimeout(() => setIsRestoringScroll(false), 100);
                } else {
                    setInitialScrollPos(0);
                    setIsRestoringScroll(false);
                }
            } catch (error) {
                console.error('Failed to restore scroll position:', error);
                if (courseScrollRef.current) {
                    courseScrollRef.current.scrollTop = 0;
                }
                setIsRestoringScroll(false);
            }
        };

        restoreScrollPosition();
    }, [activeDashboardMaterial?._id, user?.email]);

    // Save scroll position to database (debounced)
    const saveScrollPosition = async (materialId: string, scrollPercentage: number) => {
        if (!user?.email) return;

        try {
            await fetch('http://localhost:5000/api/learning/scroll-position', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    material_id: materialId,
                    scroll_position: scrollPercentage
                })
            });
        } catch (error) {
            console.error('Failed to save scroll position:', error);
        }
    };

    // Reading Progress Tracker with Scroll Position Saving
    useEffect(() => {
        const el = courseScrollRef.current;
        if (!el || !activeDashboardMaterial) { setReadingProgress(0); return; }

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const maxScroll = scrollHeight - clientHeight;
            const progress = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 100;
            setReadingProgress(progress);

            // Debounced save: wait 2 seconds after user stops scrolling
            if (scrollSaveTimerRef.current) {
                clearTimeout(scrollSaveTimerRef.current);
            }

            scrollSaveTimerRef.current = setTimeout(() => {
                saveScrollPosition(activeDashboardMaterial._id, progress);
                setScrollPositions(prev => ({
                    ...prev,
                    [activeDashboardMaterial._id]: progress
                }));
            }, 2000);
        };

        el.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => {
            el.removeEventListener('scroll', handleScroll);
            if (scrollSaveTimerRef.current) {
                clearTimeout(scrollSaveTimerRef.current);
            }
        };
    }, [activeDashboardMaterial, user?.email]);

    // Fetch Enrolled Materials from Database
    useEffect(() => {
        const fetchEnrolled = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`http://localhost:5000/api/learning/enrolled/${user.email}`);
                if (res.ok) {
                    const data = await res.json();
                    setRegisteredIds(new Set(data));
                }
            } catch (error) {
                console.error("Failed to fetch enrolled materials:", error);
            }
        };
        fetchEnrolled();
    }, [user?.email]);

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

    // Segmentation Logic
    const rawMaterials = useMemo(() => materials.filter(m => m.type === 'document'), [materials]);
    const binaryMaterials = useMemo(() => materials.filter(m => m.type !== 'document'), [materials]);
    const registeredMaterials = useMemo(() => materials.filter(m => registeredIds.has(m._id)), [materials, registeredIds]);

    // Active Lists with Search
    const activeRawList = useMemo(() => {
        if (!searchQuery.trim()) return rawMaterials;
        const q = searchQuery.toLowerCase();
        return rawMaterials.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q)
        );
    }, [rawMaterials, searchQuery]);

    const activeBinaryList = useMemo(() => {
        if (!searchQuery.trim()) return binaryMaterials;
        const q = searchQuery.toLowerCase();
        return binaryMaterials.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q)
        );
    }, [binaryMaterials, searchQuery]);

    const activeRegisteredList = useMemo(() => {
        if (!searchQuery.trim()) return registeredMaterials;
        const q = searchQuery.toLowerCase();
        return registeredMaterials.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q)
        );
    }, [registeredMaterials, searchQuery]);

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
                return "text-red-400 bg-red-400/10 border-red-400/20";
            case 'video':
                return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            case 'link':
                return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case 'document':
                return "text-orange-400 bg-orange-400/10 border-orange-400/20";
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

    const handleOpenCourses = () => {
        setView("courses");
        setCourseTab("courses");
        setActiveDashboardMaterial(null);
    };

    const handleOpenCatalog = () => {
        setView("courses");
        setCourseTab("catalog");
        setActiveDashboardMaterial(null);
    };

    const handleOpenRegistered = () => {
        setView("courses");
        setCourseTab("registered");
        setActiveDashboardMaterial(null);
    };

    const handleBackToLearning = () => {
        setView("materials");
        // We no longer clear activeDashboardMaterial here to allow returning to the material being read
    };

    const handleBackToList = () => {
        setActiveDashboardMaterial(null);
    };

    const handleRegister = async (id: string) => {
        if (!user?.email) return;
        setIsRegistering(true);
        try {
            const res = await fetch(`http://localhost:5000/api/learning/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, material_id: id })
            });

            if (res.ok) {
                // Ensure UI updates immediately
                setRegisteredIds(prev => new Set([...prev, id]));
            } else {
                const err = await res.json();
                console.error("Enrolment failed:", err.error);
            }
        } catch (error) {
            console.error("Enrolment error:", error);
        } finally {
            setIsRegistering(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-900 overflow-hidden flex flex-col text-white">
            <Navbar />

            <main className="flex-1 pt-16 relative flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 flex min-h-0 gap-0">
                    {/* Sidebar */}
                    <div className="hidden lg:flex flex-col w-56 bg-slate-800 border-r border-slate-700/50 p-4 h-full overflow-y-auto shrink-0 scrollbar-hide">
                        <div className="mb-6">
                            <h3 className="font-mono text-[9px] text-emerald-500 mb-2 uppercase tracking-widest opacity-70">{"// Statistics"}</h3>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[10px] text-slate-400 font-mono">Academy</span>
                                    <span className="text-lg font-bold text-white">{rawMaterials.length}</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">Catalog</span>
                                    <span className="text-lg font-bold text-white">{binaryMaterials.length}</span>
                                </div>
                                <div className="flex items-baseline justify-between mt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">Enrolled</span>
                                    <span className="text-lg font-bold text-emerald-500">{registeredIds.size}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="font-mono text-[9px] text-muted-foreground mb-2 uppercase tracking-widest opacity-70">{"// Navigation"}</h3>
                            <div
                                onClick={handleBackToLearning}
                                className={cn(
                                    "p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2",
                                    view === "materials" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm" : "border-transparent hover:bg-slate-700/50 text-slate-300"
                                )}
                            >
                                <Layout className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Main Dashboard</span>
                            </div>
                            <div
                                onClick={handleOpenCourses}
                                className={cn(
                                    "p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2",
                                    view === "courses" && courseTab === "courses" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm" : "border-transparent hover:bg-slate-700/50 text-slate-300"
                                )}
                            >
                                <Library className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Academy Courses</span>
                            </div>
                            <div
                                onClick={handleOpenCatalog}
                                className={cn(
                                    "p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2",
                                    view === "courses" && courseTab === "catalog" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm" : "border-transparent hover:bg-slate-700/50 text-slate-300"
                                )}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Resource Catalog</span>
                            </div>
                            <div
                                onClick={handleOpenRegistered}
                                className={cn(
                                    "p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2",
                                    view === "courses" && courseTab === "registered" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm" : "border-transparent hover:bg-slate-700/50 text-slate-300"
                                )}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Registered Hub</span>
                            </div>

                            {/* Registered Courses List in Sidebar */}
                            {registeredMaterials.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex justify-center mb-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-center">
                                            Enrolled Courses
                                        </h4>
                                    </div>
                                    <div className="space-y-1.5">
                                        {registeredMaterials.map((material) => (
                                            <div
                                                key={`sidebar-${material._id}`}
                                                onClick={() => {
                                                    setActiveDashboardMaterial(material);
                                                    setView('materials');
                                                }}
                                                className="group flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-emerald-500/5 cursor-pointer transition-all border border-transparent hover:border-emerald-500/15 hover:shadow-sm"
                                            >
                                                <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 shrink-0 transition-colors")} />
                                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-white truncate transition-colors flex-1">
                                                    {material.title}
                                                </span>
                                                <span className={cn(
                                                    "text-[9px] font-black font-mono shrink-0 px-1.5 py-0.5 rounded-full",
                                                    activeDashboardMaterial?._id === material._id
                                                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                                                        : "text-slate-500 bg-slate-700/50"
                                                )}>
                                                    {activeDashboardMaterial?._id === material._id ? `${readingProgress}%` : "0%"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 opacity-40">
                            <div className="p-3 rounded-xl bg-slate-700/20 border border-slate-700/50">
                                <p className="text-[9px] font-mono text-slate-500 leading-tight">
                                    {"// status_check: active\n// layer: persistent"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        {/* Landing View Container (Main Dashboard) */}
                        <div className={cn(
                            "transition-all duration-500 ease-in-out flex flex-col h-full",
                            view === "materials" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
                        )}>
                            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide">
                                <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md px-5 py-4 sm:px-10 sm:py-6 lg:px-16 border-b border-white/5">
                                    <div className="flex items-center gap-3 sm:gap-6 shrink-0 -ml-1 sm:-ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate("/dashboard")}
                                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"
                                        >
                                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </Button>

                                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <h1 className="text-sm sm:text-2xl font-black tracking-tight truncate max-w-[120px] sm:max-w-none text-white">
                                                        {activeDashboardMaterial ? activeDashboardMaterial.title : "Your Personal Library"}
                                                    </h1>
                                                    {activeDashboardMaterial && (
                                                        <span className="text-[9px] sm:text-xs font-black font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2.5 py-0.5 rounded-full">{readingProgress}%</span>
                                                    )}
                                                </div>
                                                <div className="hidden sm:flex items-center gap-2 mt-0.5">
                                                    <span className="font-mono text-emerald-500 text-[10px] opacity-70">
                                                        {activeDashboardMaterial ? `// viewing: ${activeDashboardMaterial.type}` : "// active_library: ready"}
                                                    </span>
                                                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Long Horizontal Progress Bar */}
                                        {activeDashboardMaterial && (
                                            <div className="hidden sm:flex items-center gap-3 flex-1 mx-4 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-inner">
                                                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600 shadow-sm">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                                                        style={{ width: `${readingProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
                                            {activeDashboardMaterial && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleBackToList}
                                                    className="h-7 px-2.5 sm:h-10 sm:px-6 border-border font-black text-[8px] sm:text-[10px] tracking-widest rounded-lg sm:rounded-xl uppercase hover:bg-muted/50"
                                                >
                                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                    Library
                                                </Button>
                                            )}
                                            <Button
                                                onClick={handleCodeNow}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg h-7 px-2.5 sm:h-10 sm:px-6 rounded-lg sm:rounded-xl transform active:scale-95 transition-all text-[10px] sm:text-sm tracking-wide"
                                            >
                                                CODE NOW
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 sm:px-10 lg:px-16 pb-12">
                                    {/* Triple-State Hub Implementation */}
                                    {activeDashboardMaterial ? (
                                        /* State 1: Active Course Viewing */
                                        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex-1 flex flex-col min-h-0 border-2 border-emerald-500/30 rounded-none overflow-hidden bg-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.05)] relative">
                                                {/* Decorative code lines - fixed, don't scroll */}
                                                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none hidden lg:block z-0" aria-hidden="true">
                                                    <div className="absolute left-2 top-0 w-[140px] font-mono text-[9px] leading-[1.6] text-green-500/15 whitespace-pre">
                                                        {`import python_heroes
from flask import Flask
app = Flask(__name__)

def train_model():
    data = load_csv()
    model.fit(data)
    return predict()

class NeuralNetwork:
    def __init__(self):
        self.layers = []
        self.weights = {}

    def forward(self, x):
        for layer in self:
            x = layer(x)
        return x

@app.route("/api")
def api_handler():
    result = process()
    return jsonify(result)

while learning:
    keep_growing()
    level_up()

for i in range(100):
    train(epoch=i)
    validate(model)

print("Success!")
heroes.deploy()
db.connect(uri)
cache.invalidate()
session.commit()
logger.info("OK")
async def fetch():
    data = await get()
    return parse(data)
scheduler.start()
queue.enqueue(task)
redis.set(key, val)
os.environ["MODE"]
config.load_yaml()
utils.hash(token)
crypto.encrypt(msg)`}
                                                    </div>
                                                    <div className="absolute right-2 top-0 w-[140px] font-mono text-[9px] leading-[1.6] text-blue-400/10 whitespace-pre text-right">
                                                        {`# Python Heroes v3.11
# Learning Platform

SELECT * FROM users
WHERE active = true
ORDER BY progress;

>>> model.summary()
Layer: Dense(128)
Layer: Dropout(0.3)
Layer: Dense(64)
Output: Softmax(10)

git commit -m "feat"
git push origin main
npm run build
pip install flask

export FLASK_ENV=dev
export DB_URI=mongo
export SECRET_KEY=***

docker build -t app .
docker run -p 5000
kubectl apply -f pod

test_accuracy: 0.97
val_loss: 0.0234
epochs: 100/100

✓ All tests passed
✓ Coverage: 94.2%
✓ Build successful
✓ Deploy complete

[INFO] Server ready
[INFO] Port: 5000
[INFO] Mode: secure
[INFO] Status: live
[OK] Connected to DB
[OK] Cache warmed
[OK] Models loaded
[OK] Routes mapped
[OK] Auth enabled
[OK] CORS allowed
[OK] Rate limited
[OK] Logs active`}
                                                    </div>
                                                </div>

                                                <div ref={courseScrollRef} className="flex-1 overflow-hidden py-0 px-0 scrollbar-pro relative z-10">
                                                    {activeDashboardMaterial.raw_text ? (
                                                        <RichTextEditor
                                                            key={activeDashboardMaterial._id}
                                                            content={activeDashboardMaterial.raw_text}
                                                            readOnly={true}
                                                            onChange={() => { }}
                                                            isDocumentMode={true}
                                                            pageSize={activeDashboardMaterial.document_settings?.pageSize}
                                                            margins={activeDashboardMaterial.document_settings?.margins}
                                                            initialScrollPercentage={initialScrollPos}
                                                            onScrollProgress={(progress) => {
                                                                setReadingProgress(progress);
                                                                // Debounced save
                                                                if (scrollSaveTimerRef.current) {
                                                                    clearTimeout(scrollSaveTimerRef.current);
                                                                }
                                                                scrollSaveTimerRef.current = setTimeout(() => {
                                                                    saveScrollPosition(activeDashboardMaterial._id, progress);
                                                                }, 2000);
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="p-20 text-center text-muted-foreground italic flex flex-col items-center justify-center min-h-[40vh]">
                                                            <FileText className="w-16 h-16 mb-4 opacity-10" />
                                                            <p>Interactive content unavailable for this resource.</p>
                                                            <Button
                                                                variant="link"
                                                                onClick={() => activeDashboardMaterial.url && window.open(activeDashboardMaterial.url, "_blank")}
                                                                className="text-primary mt-2 font-black uppercase tracking-widest text-[10px]"
                                                            >
                                                                Open external source
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : registeredMaterials.length > 0 ? (
                                        /* State 2: Personal Library Grid */
                                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                                            <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm -mx-5 px-5 py-4 mb-6 border-b border-white/5">
                                                <div className="p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-emerald-500/20 relative overflow-hidden flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shadow-lg">
                                                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none text-emerald-500">
                                                        <CheckCircle2 className="w-24 h-24" />
                                                    </div>
                                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                                                        <Layout className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left z-10">
                                                        <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase italic">Your Personal Library</h2>
                                                        <div className="flex items-center gap-3 justify-center sm:justify-start mt-0.5">
                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{registeredMaterials.length} ENROLLED</span>
                                                            <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                                                            <span className="text-[8px] font-mono text-slate-500 opacity-60">SYSTEM_READY</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {registeredMaterials.map((material) => (
                                                    <div
                                                        key={`dash-${material._id}`}
                                                        onClick={() => setActiveDashboardMaterial(material)}
                                                        className="bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-700/30 hover:border-emerald-500/50 transition-all group cursor-pointer flex flex-col shadow-sm hover:shadow-xl relative overflow-hidden hover:-translate-y-1 duration-300"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className={cn(
                                                                "p-2.5 rounded-lg border transition-all group-hover:scale-110",
                                                                getTypeColor(material.type)
                                                            )}>
                                                                {getTypeIcon(material.type)}
                                                            </div>
                                                            <div className="text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                                                ACTIVE
                                                            </div>
                                                        </div>
                                                        <h3 className="font-black text-base text-white mb-1.5 group-hover:text-emerald-500 transition-colors line-clamp-1">
                                                            {material.title}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 mb-6 line-clamp-2 opacity-70 leading-relaxed font-medium">
                                                            {material.description || "Continue your progress in this track."}
                                                        </p>
                                                        <Button size="sm" className="w-full h-8 sm:h-9 text-[9px] font-black tracking-[0.2em] bg-slate-700/50 text-slate-300 hover:bg-emerald-600 hover:text-white border-slate-700 rounded-lg sm:rounded-xl uppercase transition-all">
                                                            RESUME COURSE
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div
                                                    onClick={handleOpenCourses}
                                                    className="bg-slate-800/50 rounded-xl p-4 border-dashed border-2 border-slate-700/30 hover:border-emerald-500/50 transition-all group cursor-pointer flex flex-col items-center justify-center text-center hover:bg-emerald-500/5 min-h-[160px]"
                                                >
                                                    <PlusCircle className="w-8 h-8 text-slate-500 opacity-30 group-hover:text-emerald-500 group-hover:opacity-100 mb-2 transition-all" />
                                                    <h4 className="font-black text-slate-400 group-hover:text-white text-xs">Explore More</h4>
                                                    <p className="text-[9px] text-slate-500 italic mt-0.5">Full catalog</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* State 3: Empty State (No Enrolments) */
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-800 rounded-[2rem] border-dashed border-2 border-slate-700/50 max-h-[60vh] my-auto animate-in fade-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-emerald-500/5 rounded-full flex items-center justify-center mb-8 border border-emerald-500/10 ring-8 ring-emerald-500/5">
                                                <BookOpen className="w-10 h-10 text-emerald-500 opacity-40" />
                                            </div>
                                            <h2 className="text-3xl font-black mb-3 italic tracking-tighter uppercase text-slate-500">Library Empty</h2>
                                            <p className="text-slate-400 font-mono text-sm max-w-sm leading-relaxed opacity-70">
                                                {"Your learning space is currently clear. Head over to Academy Courses or Resource Catalog to enroll in your first course."}
                                            </p>
                                            <div className="flex gap-4 mt-10">
                                                <Button
                                                    onClick={handleCodeNow}
                                                    className="bg-white text-slate-900 hover:bg-slate-200 px-8 font-black text-xs tracking-widest rounded-xl transition-all h-12 uppercase"
                                                >
                                                    OPEN IDE
                                                </Button>
                                                <Button
                                                    onClick={handleOpenCourses}
                                                    variant="outline"
                                                    className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5 px-8 font-black text-xs tracking-widest rounded-xl transition-all h-12 uppercase"
                                                >
                                                    BROWSE COURSES
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Courses Explorer View Container */}
                        <div className={cn(
                            "transition-all duration-500 ease-in-out flex flex-col h-full",
                            view === "courses" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
                        )}>
                            <div className="flex-1 flex flex-col min-h-0 px-6 pt-8 sm:pt-10 lg:px-10">
                                <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleBackToLearning}
                                            className="h-9 w-9 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                        <div>
                                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                                                {courseTab === 'courses' ? 'Academy Courses' : courseTab === 'catalog' ? 'Resource Catalog' : 'Registered Hub'}
                                                <span className="text-xs font-mono font-normal text-slate-500 opacity-50 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/50 uppercase tracking-widest">
                                                    {courseTab === 'courses' ? rawMaterials.length : courseTab === 'catalog' ? binaryMaterials.length : registeredIds.size} Items
                                                </span>
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full lg:w-auto">
                                        <div className="relative flex-1 lg:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                placeholder={`Search in ${courseTab}...`}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-10 bg-slate-800/50 border-slate-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl font-mono text-xs text-white"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex p-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50 self-start mb-8 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
                                    <Button
                                        variant={courseTab === 'courses' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCourseTab('courses')}
                                        className={cn(
                                            "h-8 px-6 text-[10px] font-black transition-all rounded-lg shrink-0",
                                            courseTab === 'courses' ? "shadow-md text-white bg-slate-700 border border-slate-600" : "text-slate-400"
                                        )}
                                    >
                                        COURSES
                                    </Button>
                                    <Button
                                        variant={courseTab === 'catalog' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCourseTab('catalog')}
                                        className={cn(
                                            "h-8 px-6 text-[10px] font-black transition-all rounded-lg shrink-0",
                                            courseTab === 'catalog' ? "shadow-md text-white bg-slate-700 border border-slate-600" : "text-slate-400"
                                        )}
                                    >
                                        CATALOG
                                    </Button>
                                    <Button
                                        variant={courseTab === 'registered' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCourseTab('registered')}
                                        className={cn(
                                            "h-8 px-6 text-[10px] font-black transition-all rounded-lg shrink-0",
                                            courseTab === 'registered' ? "shadow-md text-white bg-slate-800 border border-slate-700" : "text-slate-400"
                                        )}
                                    >
                                        REGISTERED
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto pb-12 scrollbar-hide">
                                    {courseTab === 'courses' || courseTab === 'catalog' ? (
                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 px-1 sm:px-0">
                                            {isLoadingMaterials ? (
                                                Array(6).fill(0).map((_, i) => (
                                                    <div key={i} className="h-48 sm:h-64 bg-slate-800 rounded-xl sm:rounded-2xl animate-pulse border border-slate-700/50" />
                                                ))
                                            ) : (courseTab === 'courses' ? activeRawList : activeBinaryList).length > 0 ? (
                                                (courseTab === 'courses' ? activeRawList : activeBinaryList).map((material) => (
                                                    <div
                                                        key={material._id}
                                                        onClick={() => {
                                                            if (courseTab === 'courses' || material.raw_text || material.type === 'document') {
                                                                setViewingMaterial(material);
                                                            } else if (material.url) {
                                                                window.open(material.url, "_blank");
                                                            }
                                                        }}
                                                        className="bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all group cursor-pointer flex flex-col shadow-sm hover:shadow-xl relative overflow-hidden"
                                                    >
                                                        <div className="flex justify-between items-start mb-2 sm:mb-5 relative z-10">
                                                            <div className={cn(
                                                                "p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all group-hover:scale-110 duration-300 shadow-sm",
                                                                getTypeColor(material.type)
                                                            )}>
                                                                <div className="scale-75 sm:scale-100">
                                                                    {getTypeIcon(material.type)}
                                                                </div>
                                                            </div>
                                                            <div className="text-[8px] sm:text-[10px] font-mono text-slate-400 uppercase opacity-60 bg-slate-700/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-600 truncate max-w-[50%]">
                                                                {material.category}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-black text-xs sm:text-lg text-white mb-1 sm:mb-2 group-hover:text-emerald-500 transition-colors line-clamp-1 relative z-10">
                                                            {material.title}
                                                        </h3>
                                                        <p className="text-[10px] sm:text-sm text-slate-400 mb-3 sm:mb-6 line-clamp-2 flex-1 relative z-10 opacity-80 leading-relaxed font-medium">
                                                            {material.description || "Access premium content."}
                                                        </p>
                                                        <Button variant="outline" size="sm" className="w-full h-7 sm:h-10 text-[8px] sm:text-[10px] font-black tracking-widest border-emerald-500/20 hover:bg-emerald-500/10 group-hover:border-emerald-500/50 relative z-10 rounded-lg sm:rounded-xl uppercase">
                                                            {material.type === 'document' ? 'CHECK DESCRIPTION' : `VIEW ${material.type}`}
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-20 sm:py-32 text-center bg-slate-800 rounded-2xl border-dashed border-2 border-slate-700/50 flex flex-col items-center mx-2">
                                                    <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 opacity-20 mb-4" />
                                                    <h3 className="text-lg sm:text-xl font-black mb-1 text-slate-300">No materials found</h3>
                                                    <p className="text-slate-500 font-mono text-[10px] sm:text-sm tracking-wide">{"// status_404: empty category."}</p>
                                                    {searchQuery && <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-emerald-500 font-bold text-xs">Clear Search</Button>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-8">

                                            {/* Dynamic Registered Items */}
                                            {activeRegisteredList.length > 0 ? (
                                                <div className="mt-4">
                                                    <h3 className="text-lg font-black mb-6 px-1 flex items-center gap-2 text-white">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        Active Enrolments
                                                    </h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                                        {activeRegisteredList.map((material) => (
                                                            <div
                                                                key={material._id}
                                                                onClick={() => {
                                                                    setActiveDashboardMaterial(material);
                                                                    setView('materials');
                                                                }}
                                                                className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30 hover:border-emerald-500 transition-all group cursor-pointer flex flex-col shadow-md hover:shadow-xl relative overflow-hidden"
                                                            >
                                                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                                                    <div className={cn(
                                                                        "p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all",
                                                                        getTypeColor(material.type)
                                                                    )}>
                                                                        {getTypeIcon(material.type)}
                                                                    </div>
                                                                    <div className="text-[8px] sm:text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                                        ENROLLED
                                                                    </div>
                                                                </div>
                                                                <h3 className="font-black text-sm sm:text-lg text-white mb-1 group-hover:text-emerald-500 line-clamp-1">
                                                                    {material.title}
                                                                </h3>
                                                                <p className="text-[10px] sm:text-sm text-slate-400 mb-4 sm:mb-8 line-clamp-2 flex-1">
                                                                    {material.description || "Continue where you left off."}
                                                                </p>
                                                                <Button size="sm" className="w-full h-8 sm:h-10 text-[10px] font-black tracking-[0.2em] bg-slate-700/50 text-slate-300 hover:bg-emerald-600 border border-slate-700 hover:text-white rounded-lg sm:rounded-xl uppercase">
                                                                    OPEN CONTENT
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-20 text-center bg-slate-800 rounded-[2rem] border-dashed border-2 border-slate-700/50 m-2">
                                                    <Library className="w-12 h-12 text-slate-500 opacity-10 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-mono text-sm leading-relaxed opacity-60">
                                                        {"// NO_ENROLMENTS_DETECTED\nRegister courses from Academy or Catalog to see them here."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* IDE View */}
                        <div className={cn(
                            "transition-all duration-500 ease-in-out h-full",
                            view === "ide" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
                        )}>
                            <IDEComponent onBackToLearning={handleBackToLearning} />
                        </div>
                    </div>
                </div>
            </main >

            {/* Viewing Modal */}
            < Dialog open={!!viewingMaterial} onOpenChange={(open) => !open && setViewingMaterial(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-3xl">
                    <DialogHeader className="p-5 px-8 border-b border-slate-800 bg-slate-800/20 shrink-0">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={cn(
                                    "p-2 rounded-lg border-2",
                                    viewingMaterial ? getTypeColor(viewingMaterial.type) : ""
                                )}>
                                    {viewingMaterial && getTypeIcon(viewingMaterial.type)}
                                </div>
                                <div className="min-w-0">
                                    <DialogTitle className="text-xl font-black tracking-tight line-clamp-1">{viewingMaterial?.title}</DialogTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                            {viewingMaterial?.type}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-400 opacity-50">
                                            {viewingMaterial ? formatDate(viewingMaterial.created_at) : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {viewingMaterial?.url && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 font-mono text-[9px] border-emerald-500/30 text-emerald-500 font-bold px-4 rounded-lg hidden sm:flex"
                                    onClick={() => window.open(viewingMaterial.url, "_blank")}
                                >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    SOURCE
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 font-mono text-sm leading-relaxed bg-slate-900/50">
                        {/* 1. Registration Flow (Not Registered Yet) */}
                        {viewingMaterial?.type === 'document' && !registeredIds.has(viewingMaterial._id) && courseTab !== 'registered' ? (
                            <div className="p-10 sm:p-20 max-w-3xl mx-auto flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                                    <Library className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black mb-6 tracking-tight text-white">Course Description</h2>
                                <p className="text-lg text-slate-400 italic leading-relaxed opacity-90 border-l-4 border-emerald-500/50 pl-6 text-left">
                                    {viewingMaterial?.description || "Enroll now to access full curriculum."}
                                </p>

                                <div className="mt-16 p-8 rounded-[2rem] bg-slate-800 border border-slate-700/50 shadow-xl w-full">
                                    <p className="text-xs font-mono text-slate-500 mb-8 uppercase tracking-[0.2em]">{"// ENROLMENT_PENDING"}</p>
                                    <Button
                                        disabled={isRegistering}
                                        onClick={() => handleRegister(viewingMaterial._id)}
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-[0.3em] rounded-2xl transform active:scale-95 transition-all shadow-lg"
                                    >
                                        {isRegistering ? "PROCESSING..." : "REGISTER COURSE NOW"}
                                    </Button>
                                    <p className="text-[10px] text-slate-500 mt-4 font-mono opacity-50 tracking-widest uppercase">Instant access unlocked upon registration</p>
                                </div>
                            </div>
                        ) : /* 2. Success View (Just Registered from Academy/Catalog) */
                            registeredIds.has(viewingMaterial?._id || "") && courseTab !== 'registered' ? (
                                <div className="p-10 sm:p-24 max-w-3xl mx-auto flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-10 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase italic text-emerald-500">Success!</h2>
                                    <p className="text-xl text-white font-bold mb-8">
                                        You have successfully enrolled for this course.
                                    </p>
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-12 w-full">
                                        <p className="text-slate-400 font-mono text-[10px] leading-relaxed uppercase tracking-widest mb-2">{"// enrolment_status: verified"}</p>
                                        <p className="text-sm text-slate-300 leading-relaxed italic">
                                            This course has been added to your personal hub. You can now access all materials and tracks from the Enrolled section.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                                        <Button
                                            onClick={() => setViewingMaterial(null)}
                                            variant="outline"
                                            className="flex-1 h-14 border-slate-700 font-black text-xs tracking-[0.2em] rounded-2xl uppercase hover:bg-slate-800 text-slate-300"
                                        >
                                            DONE
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setViewingMaterial(null);
                                                handleOpenRegistered();
                                            }}
                                            className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-[0.2em] rounded-2xl uppercase shadow-xl"
                                        >
                                            GO TO REGISTERED HUB
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* 3. Content View (Already Registered & in Enrolled Tab, or direct access) */
                                <div className="pb-16 pt-8 px-0 sm:px-4">
                                    <div className="max-w-4xl mx-auto font-sans">
                                        {viewingMaterial?.raw_text ? (
                                            <RichTextEditor
                                                key={viewingMaterial._id}
                                                content={viewingMaterial.raw_text}
                                                readOnly={true}
                                                onChange={() => { }}
                                                isDocumentMode={true}
                                                pageSize={viewingMaterial.document_settings?.pageSize}
                                                margins={viewingMaterial.document_settings?.margins}
                                            />
                                        ) : (
                                            <div className="p-20 text-center text-muted-foreground italic flex flex-col items-center">
                                                <FileText className="w-12 h-12 mb-4 opacity-10" />
                                                Interactive content unavailable.
                                                <Button variant="link" onClick={() => viewingMaterial?.url && window.open(viewingMaterial.url, "_blank")} className="text-primary mt-2">Open external source</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </ScrollArea>

                    <div className="p-4 px-8 border-t border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-slate-500 italic opacity-50 uppercase tracking-widest">{"// SECURE_LEARNING_ENV"}</span>
                            {registeredIds.has(viewingMaterial?._id || "") && (
                                <span className="flex items-center gap-2 text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3" />
                                    ENROLLED_SUCCESS
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-full hover:bg-emerald-500/10 text-emerald-500"
                            onClick={() => {
                                const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
                                if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <ArrowLeft className="w-3 h-3 rotate-90" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            <TypewriterFooter />
        </div >
    );
};

export default LearningSpace;
