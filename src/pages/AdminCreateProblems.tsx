import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Trash2,
    Save,
    FileText,
    ChevronLeft,
    Layers,
    GraduationCap,
    Send,
    Eye,
    BookCopy
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Problem {
    id: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
}

const AdminCreateProblems = () => {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const setId = searchParams.get('id');

    const [setName, setSetName] = useState("Untitled Problem Set");
    const [setDescription, setSetDescription] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [problems, setProblems] = useState<Problem[]>([
        {
            id: '1',
            difficulty: 'Beginner',
            description: ""
        }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isGlobalCheckLoading, setIsGlobalCheckLoading] = useState(true);
    const [globalUsedLevels, setGlobalUsedLevels] = useState<string[]>([]);

    const fetchGlobalUsage = async (currentSetId?: string) => {
        setIsGlobalCheckLoading(true);
        try {
            const res = await fetch("/api/admin/problem-sets", {
                headers: { 'X-Admin-Email': currentUser?.email || '' }
            });
            if (res.ok) {
                const data = await res.json();
                const allLevels = data.reduce((acc: string[], set: any) => {
                    const effectiveId = currentSetId || setId;
                    if (set.id === effectiveId) return acc;
                    const setLevels = set.problems?.map((p: any) => p.difficulty) || [];
                    return [...acc, ...setLevels];
                }, []);
                setGlobalUsedLevels(allLevels);
            }
        } catch (error) {
            console.error("Failed to fetch global level usage");
        } finally {
            setIsGlobalCheckLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'master1_vectors')) {
                navigate("/signin", { replace: true });
            } else if (setId) {
                // Load existing problem set
                const loadSet = async () => {
                    try {
                        const res = await fetch("/api/admin/problem-sets", {
                            headers: {
                                'X-Admin-Email': currentUser?.email || ''
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const currentSet = data.find((s: any) => s.id === setId);
                            if (currentSet) {
                                setSetName(currentSet.name);
                                setSetDescription(currentSet.description);
                                setProblems(currentSet.problems);
                            }
                        }
                    } catch (error) {
                        toast.error("Failed to load document");
                    }
                };
                loadSet();
            }
            fetchGlobalUsage();
        }
    }, [currentUser, authLoading, navigate, setId]);

    if (authLoading || !currentUser) {
        return <div className="h-screen bg-background flex items-center justify-center font-mono text-primary animate-pulse">Authenticating Admin...</div>;
    }

    const addProblem = async () => {
        const usedLevelsInSet = problems.map(p => p.difficulty);
        const availableLevels: Problem['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
        const firstAvailableLevel = availableLevels.find(l => !usedLevelsInSet.includes(l) && !globalUsedLevels.includes(l));

        if (!firstAvailableLevel) {
            toast.error("all levels (Beginner, Intermediate, Advanced) are either in this set or already exist in the database.");
            return;
        }

        setIsAdding(true);
        const newProblem: Problem = {
            id: Math.random().toString(36).substring(2, 9),
            difficulty: firstAvailableLevel,
            description: ""
        };
        const updatedProblems = [...problems, newProblem];
        setProblems(updatedProblems);
        // Automatically persist to database (silent)
        await handleSave(updatedProblems, true);
        setIsAdding(false);
    };

    const removeProblem = (id: string) => {
        if (problems.length === 1) {
            toast.error("Document must contain at least one problem");
            return;
        }
        setProblems(problems.filter(p => p.id !== id));
        toast.info("Problem removed");
    };

    const updateProblem = (id: string, field: keyof Problem, value: string) => {
        setProblems(problems.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleSave = async (updatedProblems?: Problem[], silent = false) => {
        if (!setName.trim()) {
            if (!silent) toast.error("Please enter a name for the problem set");
            return { success: false };
        }

        const problemsToSave = updatedProblems || problems;

        // Double check global uniqueness before saving (not silent)
        if (!silent) {
            await fetchGlobalUsage();
            const invalidLevels = problemsToSave.filter(p => globalUsedLevels.includes(p.difficulty));
            if (invalidLevels.length > 0) {
                toast.error(`Levels already exist in database: ${invalidLevels.map(l => l.difficulty).join(', ')}`);
                return { success: false };
            }
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/admin/problem-sets", {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                    'X-Admin-Email': currentUser?.email || ''
                },
                body: JSON.stringify({
                    id: setId,
                    name: setName,
                    description: setDescription,
                    problems: problemsToSave
                })
            });

            const data = await response.json();
            if (response.ok) {
                if (!silent) toast.success("Problem set saved successfully");
                if (!setId && data.id) {
                    // Update URL with new ID without reloading
                    navigate(`/admin/create-problems?id=${data.id}`, { replace: true });
                }
                return { success: true, id: data.id };
            } else {
                if (!silent) toast.error(`Error: ${data.error || "Failed to save"}`);
                return { success: false };
            }
        } catch (error) {
            if (!silent) toast.error("An error occurred while saving");
            return { success: false };
        } finally {
            setIsSaving(false);
        }
    };

    const resetEditor = () => {
        if (setName.trim() && !confirm("Current changes will be lost. Start a new document?")) return;
        setSetName("Untitled Problem Set");
        setSetDescription("");
        setProblems([
            {
                id: '1',
                difficulty: 'Beginner',
                description: ""
            }
        ]);
        navigate("/admin/create-problems", { replace: true });
        fetchGlobalUsage(""); // Reset global usage context for new set
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        const result = await handleSave(problems, true);
        if (result.success) {
            toast.success("Successfully published to Academy!");
            setIsPreviewOpen(false);
        }
        setIsPublishing(false);
    };

    return (
        <div className="h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground font-sans flex flex-col overflow-hidden">
            <Navbar />

            <main className="flex-1 flex overflow-hidden pt-16">
                {/* Sidebar Controls */}
                <aside className="w-80 border-r border-border bg-white dark:bg-[#0d0d0d] hidden lg:flex flex-col p-6 overflow-y-auto">
                    <div className="flex items-center gap-2 text-primary font-bold mb-8">
                        <FileText className="w-5 h-5" />
                        <span className="uppercase tracking-widest text-xs">Document Properties</span>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Set Name</label>
                            <Input
                                value={setName}
                                onChange={(e) => setSetName(e.target.value)}
                                className="h-9 font-mono text-sm bg-muted/20 border-border focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Global Description</label>
                            <Textarea
                                value={setDescription}
                                onChange={(e) => setSetDescription(e.target.value)}
                                placeholder="Describe the focus of this problem set..."
                                className="min-h-[100px] text-xs font-mono bg-muted/20 resize-none border-border"
                            />
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Actions</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetEditor}
                                        className="h-8 text-[10px] font-mono gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        New Document
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSave()}
                                        className="h-8 text-[10px] font-mono gap-1"
                                        disabled={isSaving || isPublishing}
                                    >
                                        {isSaving ? (
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        ) : (
                                            <Save className="w-3.5 h-3.5" />
                                        )}
                                        {setId ? "Update" : "Save Document"}
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 h-10 font-mono text-xs"
                                    onClick={handlePublish}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 text-primary" />
                                    )}
                                    Publish to Academy
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2 h-10 font-mono text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Document
                                </Button>
                            </div>
                        </div>

                        <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase">Pro Tip</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-muted-foreground italic font-mono">
                                {"// Structured problem sets improve student retention by 40%."}
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Canvas */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#050505] overflow-hidden">
                    {/* Canvas Toolbar */}
                    <div className="h-14 border-b border-border bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/missions" className="p-2 hover:bg-muted rounded-lg transition-colors group">
                                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                            <div className="h-4 w-px bg-border md:block hidden" />
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Layers className="w-4 h-4 text-primary" />
                                <span className="md:inline hidden">Problem Set Editor: </span>
                                <span className="font-mono text-xs text-primary">{setName || "Untitled"}</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px] font-mono gap-1"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                <Eye className="w-3 h-3" /> Preview
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px] font-mono gap-1 hover:text-primary transition-colors"
                                onClick={() => navigate("/admin/problem-sets")}
                            >
                                <BookCopy className="w-3.5 h-3.5" /> Library
                            </Button>
                            <Button
                                size="sm"
                                onClick={addProblem}
                                className="h-8 text-[10px] font-mono gap-1 bg-primary hover:bg-primary/90"
                                disabled={isAdding || isSaving || (problems.length + globalUsedLevels.filter(l => !problems.map(p => p.difficulty).includes(l as any)).length) >= 3}
                            >
                                {isAdding ? (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                )}
                                {problems.length + globalUsedLevels.length >= 3 ? "Database Levels Full" : "Add Problem"}
                            </Button>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                        <div className="max-w-4xl mx-auto space-y-8 pb-20">
                            {problems.map((problem, index) => (
                                <div
                                    key={problem.id}
                                    className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 relative group"
                                >
                                    <div className="absolute top-6 right-6 flex items-center gap-2">
                                        <div className="px-2 py-1 rounded bg-muted/50 text-[10px] font-mono text-muted-foreground opacity-50">
                                            #{index + 1}
                                        </div>
                                        <button
                                            onClick={() => removeProblem(problem.id)}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <div className="w-1/2 space-y-2">
                                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Complexity Level</label>
                                            <select
                                                value={problem.difficulty}
                                                onChange={(e) => updateProblem(problem.id, 'difficulty', e.target.value as Problem['difficulty'])}
                                                className="w-full h-9 px-3 bg-muted/30 border border-border rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                                            >
                                                {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                                                    const isUsedInSet = problems.some(p => p.difficulty === level && p.id !== problem.id);
                                                    const isUsedGlobally = globalUsedLevels.includes(level);
                                                    return (
                                                        <option key={level} value={level} disabled={isUsedInSet || isUsedGlobally}>
                                                            {level} {isUsedInSet ? "(In Set)" : isUsedGlobally ? "(Exists in DB)" : ""}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Problem Statement</label>
                                        <Textarea
                                            value={problem.description}
                                            onChange={(e) => updateProblem(problem.id, 'description', e.target.value)}
                                            placeholder="Clearly define the problem, input constraints, and expected output..."
                                            className="min-h-[150px] font-mono text-sm bg-white dark:bg-white text-black border-border leading-relaxed selection:bg-primary/30"
                                        />
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                problem.description ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                                            )} />
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                                {problem.description ? "VALID_INPUT" : "INCOMPLETE_DATA"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-mono text-muted-foreground">LOCAL_ID: {problem.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {problems.length < 3 && !isGlobalCheckLoading && (
                                <button
                                    onClick={addProblem}
                                    className="w-full h-24 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group"
                                >
                                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="font-mono text-xs uppercase tracking-[0.2em]">Add Missing Difficulty Level</span>
                                </button>
                            )}
                            {isGlobalCheckLoading && (
                                <div className="w-full h-24 border-2 border-border/10 rounded-2xl flex items-center justify-center gap-3 text-muted-foreground animate-pulse">
                                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                                    <span className="font-mono text-xs">Syncing Level Global State...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none bg-background rounded-3xl shadow-2xl">
                    <DialogHeader className="p-6 border-b border-border bg-white/50 backdrop-blur-md sticky top-0 z-10">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Eye className="w-6 h-6 text-primary" />
                            {setName}
                        </DialogTitle>
                        <DialogDescription className="font-mono text-xs uppercase tracking-widest mt-1">
                            PREVIEW_MODE: STUDENT_VIEW_SIMULATION
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-8">
                            {setDescription && (
                                <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                                    <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Overview</h4>
                                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{setDescription}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {problems.map((p, i) => (
                                    <div key={p.id} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">PROBLEM_{i + 1}</span>
                                            <span className={cn(
                                                "text-[10px] font-mono font-black uppercase tracking-widest px-2 py-1 rounded",
                                                p.difficulty === 'Beginner' ? "text-green-600 bg-green-50" :
                                                    p.difficulty === 'Intermediate' ? "text-orange-600 bg-orange-50" :
                                                        "text-red-600 bg-red-50"
                                            )}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <div className="p-8">
                                            <div className="prose prose-slate max-w-none">
                                                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                                                    {p.description || "No description provided for this problem."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-bold">
                            Close Preview
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || isSaving}
                            className="rounded-xl font-bold bg-primary hover:bg-primary/90 min-w-[120px]"
                        >
                            {isPublishing ? (
                                <>
                                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Now"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rainbow Footer Decor */}
            <div className="h-[20px] w-full bg-gradient-to-r from-[#ff0000] via-[#ff7f00] via-[#ffff00] via-[#00ff00] via-[#0000ff] via-[#4b0082] to-[#8b00ff] animate-gradient-x relative z-50 shrink-0"></div>
        </div>
    );
};

export default AdminCreateProblems;
